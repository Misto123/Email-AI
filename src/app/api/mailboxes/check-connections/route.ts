import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createImapClient, createSmtpTransport } from "@/lib/mail";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  // Optional: add authorization check
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: mailboxes, error } = await supabaseAdmin
      .from("mailboxes")
      .select("id,email,encrypted_password");

    if (error) throw error;

    const results: Array<{
      mailbox: string;
      imap_status: "online" | "offline";
      smtp_status: "online" | "offline";
      imap_error?: string;
      smtp_error?: string;
    }> = [];

    for (const mailbox of mailboxes || []) {
      let imapStatus: "online" | "offline" = "offline";
      let smtpStatus: "online" | "offline" = "offline";
      let imapError: string | undefined;
      let smtpError: string | undefined;

      // Test IMAP
      try {
        const imapClient = createImapClient(mailbox.email, mailbox.encrypted_password);
        await imapClient.connect();
        await imapClient.logout();
        imapStatus = "online";
      } catch (err) {
        imapError = err instanceof Error ? err.message : "Connection failed";
      }

      // Test SMTP
      try {
        const smtpTransport = createSmtpTransport(mailbox.email, mailbox.encrypted_password);
        await smtpTransport.verify();
        smtpTransport.close();
        smtpStatus = "online";
      } catch (err) {
        smtpError = err instanceof Error ? err.message : "Connection failed";
      }

      // Update database
      await supabaseAdmin
        .from("mailboxes")
        .update({
          last_imap_check: new Date().toISOString(),
          last_smtp_check: new Date().toISOString(),
          imap_status: imapStatus,
          smtp_status: smtpStatus,
          last_imap_error: imapError || null,
          last_smtp_error: smtpError || null,
        })
        .eq("id", mailbox.id);

      results.push({
        mailbox: mailbox.email,
        imap_status: imapStatus,
        smtp_status: smtpStatus,
        imap_error: imapError,
        smtp_error: smtpError,
      });
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("Connection check error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to check connections" },
      { status: 500 }
    );
  }
}
