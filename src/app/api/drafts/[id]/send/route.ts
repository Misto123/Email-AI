import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { decryptMailboxPassword } from "@/lib/mailbox-crypto";
import nodemailer from "nodemailer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    console.log(`[SEND] Starting send for draft ${id}`);

    // Get the draft with email and mailbox info
    const { data: draft, error: draftError } = await supabaseAdmin
      .from("drafts")
      .select(`
        id,
        draft_body,
        email_id,
        mailbox_id,
        emails!inner(
          id,
          from_email,
          from_name,
          subject,
          message_id
        ),
        mailboxes!inner(
          email,
          encrypted_password
        )
      `)
      .eq("id", id)
      .single();

    if (draftError || !draft) {
      console.error("[SEND] Draft not found:", draftError);
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    console.log(`[SEND] Draft found, sending from ${draft.mailboxes.email} to ${draft.emails.from_email}`);

    // Decrypt mailbox password
    const password = decryptMailboxPassword(draft.mailboxes.encrypted_password);

    // Create SMTP transporter for Purelymail
    const transporter = nodemailer.createTransport({
      host: "smtp.purelymail.com",
      port: 587,
      secure: false,
      auth: {
        user: draft.mailboxes.email,
        pass: password,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: draft.mailboxes.email,
      to: draft.emails.from_email,
      subject: `Re: ${draft.emails.subject}`,
      text: draft.draft_body,
      inReplyTo: draft.emails.message_id || undefined,
      references: draft.emails.message_id || undefined,
    });

    console.log(`[SEND] Email sent successfully:`, info.messageId);

    // Mark draft as sent
    const { error: updateError } = await supabaseAdmin
      .from("drafts")
      .update({ status: "sent" })
      .eq("id", id);

    if (updateError) {
      console.error("[SEND] Failed to update draft status:", updateError);
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Email sent successfully",
      messageId: info.messageId 
    });
  } catch (err) {
    console.error("[SEND] Failed to send email:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
