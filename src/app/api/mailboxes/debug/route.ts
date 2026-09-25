import { NextResponse } from "next/server";
import { createImapClient } from "@/lib/mail";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Debug endpoint to check mailbox contents
 * Shows recent emails in INBOX without importing
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mailboxEmail = searchParams.get("mailbox");
    
    if (!mailboxEmail) {
      return NextResponse.json({ error: "mailbox parameter required" }, { status: 400 });
    }

    const { data: mailbox } = await supabaseAdmin
      .from("mailboxes")
      .select("id,email,encrypted_password")
      .eq("email", mailboxEmail)
      .single();

    if (!mailbox) {
      return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });
    }

    const client = createImapClient(mailbox.email, mailbox.encrypted_password);
    await client.connect();
    
    const lock = await client.getMailboxLock("INBOX");
    let result;
    
    try {
      // Get mailbox status
      const status = await client.status("INBOX", { messages: true, unseen: true });
      
      // Fetch last 20 messages (or all if less)
      const count = status.messages || 0;
      const start = Math.max(1, count - 19);
      const range = count > 0 ? `${start}:${count}` : "1:1";
      
      const messages = await client.fetchAll(range, { envelope: true, internalDate: true }, { uid: false });
      
      const emails = messages.map((msg) => ({
        from: msg.envelope?.from?.[0]?.address || "unknown",
        subject: msg.envelope?.subject || "(no subject)",
        date: msg.internalDate instanceof Date ? msg.internalDate.toISOString() : msg.internalDate,
        messageId: msg.envelope?.messageId || "unknown"
      }));
      
      result = {
        mailbox: mailbox.email,
        totalMessages: count,
        unseenMessages: status.unseen || 0,
        fetchedCount: emails.length,
        recentEmails: emails.reverse() // newest first
      };
    } finally {
      lock.release();
      await client.logout();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Mailbox debug error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check mailbox" },
      { status: 500 }
    );
  }
}
