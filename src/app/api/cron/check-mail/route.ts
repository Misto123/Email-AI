import { NextResponse } from "next/server";
import { createImapClient } from "@/lib/mail";
import { generateReply } from "@/lib/email-ai";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

function textFromSource(source: Buffer) {
  const raw = source.toString("utf8");
  const split = raw.search(/\r?\n\r?\n/);
  const header = split >= 0 ? raw.slice(0, split) : raw;
  const body = split >= 0 ? raw.slice(split).replace(/^\r?\n\r?\n/, "") : "";
  const get = (name: string) => header.match(new RegExp(`^${name}:\\s*(.*)$`, "im"))?.[1]?.trim() || null;
  return { messageId: get("Message-ID") || `source-${Buffer.from(raw).toString("base64url").slice(0, 40)}`, subject: get("Subject"), from: get("From"), body };
}

function parseFrom(value: string | null) {
  const match = value?.match(/^(?:"?([^"<]*)"?\s*)?<([^>]+)>$/);
  return { name: match?.[1]?.trim() || null, email: match?.[2] || value?.trim() || null };
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: mailboxes, error } = await supabaseAdmin.from("mailboxes").select("id,email,encrypted_password,ai_enabled,prompt");
  if (error) return NextResponse.json({ error: "Unable to load mailboxes" }, { status: 500 });
  const results: Array<{ mailbox: string; imported: number; error?: string }> = [];
  for (const mailbox of mailboxes || []) {
    let imported = 0;
    try {
      const client = createImapClient(mailbox.email, mailbox.encrypted_password);
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");
      try {
        const messages = await client.fetchAll("1:*", { source: true, envelope: true, internalDate: true }, { uid: false });
        for (const message of messages) {
          const parsed = textFromSource(message.source as Buffer);
          const { data: existing } = await supabaseAdmin.from("emails").select("id").eq("mailbox_id", mailbox.id).eq("message_id", parsed.messageId).maybeSingle();
          if (existing) continue;
          const sender = parseFrom(parsed.from);
          const receivedAt = message.internalDate instanceof Date ? message.internalDate.toISOString() : message.internalDate || new Date().toISOString();
          const { data: saved, error: saveError } = await supabaseAdmin.from("emails").insert({ mailbox_id: mailbox.id, message_id: parsed.messageId, thread_id: parsed.messageId, from_email: sender.email, from_name: sender.name, subject: parsed.subject, body: parsed.body, received_at: receivedAt, processed: mailbox.ai_enabled }).select("id,from_email,from_name,subject,body").single();
          if (saveError || !saved) throw saveError || new Error("Could not save email");
          if (mailbox.ai_enabled) {
            const draft = await generateReply(saved, mailbox.prompt);
            await supabaseAdmin.from("drafts").insert({ email_id: saved.id, mailbox_id: mailbox.id, draft_body: draft });
          }
          imported += 1;
        }
      } finally { lock.release(); await client.logout(); }
      results.push({ mailbox: mailbox.email, imported });
    } catch (mailError) { results.push({ mailbox: mailbox.email, imported, error: mailError instanceof Error ? mailError.message : "Polling failed" }); }
  }
  return NextResponse.json({ ok: true, results });
}
