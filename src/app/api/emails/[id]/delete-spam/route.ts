import { NextResponse } from "next/server";
import { createImapClient } from "@/lib/mail";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get email details
    const { data: email, error: emailError } = await supabaseAdmin
      .from("emails")
      .select("id,mailbox_id,message_id,mailboxes(email,encrypted_password)")
      .eq("id", id)
      .single();

    if (emailError || !email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const mailboxValue = email.mailboxes as unknown as { email: string; encrypted_password: string } | Array<{ email: string; encrypted_password: string }>;
    const mailbox = Array.isArray(mailboxValue) ? mailboxValue[0] : mailboxValue;

    // Delete from IMAP server
    try {
      const client = createImapClient(mailbox.email, mailbox.encrypted_password);
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");
      
      try {
        // Search for all messages first (simple approach)
        const messages = await client.fetchAll("1:*", { envelope: true }, { uid: true });
        
        // Find the message with matching Message-ID
        const targetMessage = messages.find((msg) => {
          const msgId = msg.envelope?.messageId;
          return msgId === email.message_id;
        });
        
        if (targetMessage && targetMessage.uid) {
          // Delete the message by UID
          await client.messageDelete([targetMessage.uid], { uid: true });
        }
      } finally {
        lock.release();
        await client.logout();
      }
    } catch (imapError) {
      console.error("IMAP delete error:", imapError);
      // Continue even if IMAP delete fails
    }

    // Delete from database (cascade will delete related drafts)
    const { error: deleteError } = await supabaseAdmin
      .from("emails")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete spam error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete spam" },
      { status: 500 }
    );
  }
}
