import { NextResponse } from "next/server";
import { createSmtpTransport } from "@/lib/mail";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const { data: draft, error } = await supabaseAdmin.from("drafts").select("id,draft_body,status,emails(from_email,from_name,subject,message_id,thread_id),mailboxes(email,encrypted_password)").eq("id", id).single();
    if (error || !draft) throw error || new Error("Draft not found");
    if (draft.status !== "draft") throw new Error("Only draft messages can be sent");
    const emailValue = draft.emails as unknown as { from_email: string; from_name: string | null; subject: string; message_id: string; thread_id: string | null } | Array<{ from_email: string; from_name: string | null; subject: string; message_id: string; thread_id: string | null }>;
    const mailboxValue = draft.mailboxes as unknown as { email: string; encrypted_password: string } | Array<{ email: string; encrypted_password: string }>;
    const email = Array.isArray(emailValue) ? emailValue[0] : emailValue;
    const mailbox = Array.isArray(mailboxValue) ? mailboxValue[0] : mailboxValue;
    const transport = createSmtpTransport(mailbox.email, mailbox.encrypted_password);
    await transport.sendMail({ from: mailbox.email, to: email.from_email, subject: email.subject?.startsWith("Re:") ? email.subject : `Re: ${email.subject || ""}`, text: draft.draft_body, headers: { "In-Reply-To": email.message_id, References: email.thread_id || email.message_id } });
    transport.close();
    const { error: updateError } = await supabaseAdmin.from("drafts").update({ status: "sent", updated_at: new Date().toISOString() }).eq("id", id);
    if (updateError) throw updateError;
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send draft" }, { status: 400 }); }
}
