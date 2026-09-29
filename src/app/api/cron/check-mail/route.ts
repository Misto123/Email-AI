import { NextResponse } from "next/server";
import { createImapClient } from "@/lib/mail";
import { generateReply } from "@/lib/email-ai";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateSpamScore, decodeEmailBody } from "@/lib/spam-detection";

export const runtime = "nodejs";
export const maxDuration = 60;

function textFromSource(source: Buffer) {
  const raw = source.toString("utf8");
  const split = raw.search(/\r?\n\r?\n/);
  const header = split >= 0 ? raw.slice(0, split) : raw;
  const body = split >= 0 ? raw.slice(split).replace(/^\r?\n\r?\n/, "") : "";
  const get = (name: string) => header.match(new RegExp(`^${name}:\\s*(.*)$`, "im"))?.[1]?.trim() || null;
  
  // Decode MIME encoded-words in headers (subject, from, etc.)
  const decodeMimeWord = (str: string | null): string | null => {
    if (!str) return null;
    // Decode =?UTF-8?Q?...?= or =?UTF-8?B?...?=
    return str.replace(/=\?([^?]+)\?([QB])\?([^?]+)\?=/gi, (match, charset, encoding, text) => {
      try {
        if (encoding.toUpperCase() === 'Q') {
          // Quoted-printable
          text = text.replace(/_/g, ' ');
          text = text.replace(/=([0-9A-F]{2})/gi, (_match: string, hex: string) => String.fromCharCode(parseInt(hex, 16)));
          return text;
        } else if (encoding.toUpperCase() === 'B') {
          // Base64
          return Buffer.from(text, 'base64').toString('utf-8');
        }
      } catch {
        return match;
      }
      return match;
    });
  };
  
  // Decode email body
  const decodedBody = decodeEmailBody(body);
  
  return { 
    messageId: get("Message-ID") || `source-${Buffer.from(raw.slice(0, 200)).toString("base64").slice(0, 32)}`,
    inReplyTo: get("In-Reply-To"),
    from: decodeMimeWord(get("From")),
    subject: decodeMimeWord(get("Subject")),
    body: decodedBody
  };
}

function parseFrom(value: string | null) {
  const match = value?.match(/^(?:"?([^"<]*)"?\s*)?<([^>]+)>$/);
  return { name: match?.[1]?.trim() || null, email: match?.[2] || value?.trim() || null };
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  // Load spam settings
  const { data: settings } = await supabaseAdmin
    .from("settings")
    .select("spam_threshold,spam_keywords")
    .limit(1)
    .maybeSingle();
  
  const spamThreshold = settings?.spam_threshold || 80;
  const customKeywords = settings?.spam_keywords?.split("\n").filter((k: string) => k.trim()) || [];
  
  const { data: mailboxes, error } = await supabaseAdmin.from("mailboxes").select("id,email,encrypted_password,ai_enabled,prompt");
  if (error) return NextResponse.json({ error: "Unable to load mailboxes" }, { status: 500 });
  const results: Array<{ mailbox: string; imported: number; error?: string }> = [];
  for (const mailbox of mailboxes || []) {
    let imported = 0;
    const now = new Date().toISOString();
    let imapStatus: "online" | "offline" = "offline";
    let smtpStatus: "online" | "offline" = "offline";
    let imapError: string | null = null;
    
    try {
      const client = createImapClient(mailbox.email, mailbox.encrypted_password);
      await client.connect();
      imapStatus = "online"; // Connection successful
      
      const lock = await client.getMailboxLock("INBOX");
      try {
        const messages = await client.fetchAll("1:*", { source: true, envelope: true, internalDate: true }, { uid: false });
        console.log(`[${mailbox.email}] Found ${messages.length} total messages in INBOX`);
        for (const message of messages) {
          const parsed = textFromSource(message.source as Buffer);
          const { data: existing } = await supabaseAdmin.from("emails").select("id").eq("mailbox_id", mailbox.id).eq("message_id", parsed.messageId).maybeSingle();
          if (existing) {
            console.log(`[${mailbox.email}] Skipping existing: ${parsed.messageId}`);
            continue;
          }
          console.log(`[${mailbox.email}] Processing new email: ${parsed.messageId} from ${parsed.from}`);
          const sender = parseFrom(parsed.from);
          const receivedAt = message.internalDate instanceof Date ? message.internalDate.toISOString() : message.internalDate || new Date().toISOString();
          
          // Calculate spam score with custom keywords
          const spamScore = await calculateSpamScore({
            from_email: sender.email,
            from_name: sender.name,
            subject: parsed.subject,
            body: parsed.body
          }, undefined, customKeywords);
          
          const { data: saved, error: saveError } = await supabaseAdmin.from("emails").insert({ 
            mailbox_id: mailbox.id, 
            message_id: parsed.messageId, 
            thread_id: parsed.inReplyTo || parsed.messageId, 
            from_email: sender.email, 
            from_name: sender.name, 
            subject: parsed.subject, 
            body: parsed.body, 
            received_at: receivedAt, 
            spam_score: spamScore,
            processed: false // Always false - user generates drafts manually
          }).select("id,from_email,from_name,subject,body").single();
          
          if (saveError || !saved) {
            console.error(`[${mailbox.email}] Save error:`, saveError);
            throw saveError || new Error("Could not save email");
          }
          
          console.log(`[${mailbox.email}] Saved email ${parsed.messageId} (spam: ${spamScore})`);
          
          // DON'T auto-generate AI drafts anymore - user will click "Generate Reply" button
          // Just import emails and let user generate on-demand
          
          imported += 1;
        }
      } finally { lock.release(); await client.logout(); }
      
      // SMTP test not implemented yet - assume online if IMAP works
      smtpStatus = "online";
      
      // Update connection status in database
      await supabaseAdmin
        .from("mailboxes")
        .update({
          imap_status: imapStatus,
          smtp_status: smtpStatus,
          last_imap_check: now,
          last_smtp_check: now,
          last_imap_error: null
        })
        .eq("id", mailbox.id);
      
      results.push({ mailbox: mailbox.email, imported });
    } catch (mailError) {
      imapError = mailError instanceof Error ? mailError.message : "Polling failed";
      
      // Update failed connection status
      await supabaseAdmin
        .from("mailboxes")
        .update({
          imap_status: "offline",
          smtp_status: "unknown",
          last_imap_check: now,
          last_imap_error: imapError
        })
        .eq("id", mailbox.id);
      
      results.push({ mailbox: mailbox.email, imported, error: imapError });
    }
  }
  return NextResponse.json({ ok: true, results });
}
