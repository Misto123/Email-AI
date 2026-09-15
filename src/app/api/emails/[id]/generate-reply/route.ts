import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateReply } from "@/lib/email-ai";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get the email
    const { data: email, error: emailError } = await supabaseAdmin
      .from("emails")
      .select("id,from_email,from_name,subject,body,mailbox_id,mailboxes(prompt,reply_language)")
      .eq("id", id)
      .single();

    if (emailError || !email) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    // Check if draft already exists
    const { data: existingDraft } = await supabaseAdmin
      .from("drafts")
      .select("id")
      .eq("email_id", id)
      .maybeSingle();

    if (existingDraft) {
      return NextResponse.json(
        { error: "Draft already exists for this email" },
        { status: 400 }
      );
    }

    // Generate AI reply
    const mailboxPrompt = (email.mailboxes as { prompt?: string; reply_language?: string })?.prompt || null;
    const language = (email.mailboxes as { prompt?: string; reply_language?: string })?.reply_language || "en";
    
    const draftBody = await generateReply(
      {
        from_email: email.from_email,
        from_name: email.from_name,
        subject: email.subject,
        body: email.body,
      },
      mailboxPrompt,
      language
    );

    // Create draft
    const { data: draft, error: draftError } = await supabaseAdmin
      .from("drafts")
      .insert({
        email_id: email.id,
        mailbox_id: email.mailbox_id,
        draft_body: draftBody,
      })
      .select()
      .single();

    if (draftError || !draft) {
      throw draftError || new Error("Failed to create draft");
    }

    return NextResponse.json({ ok: true, draft_id: draft.id, draft_body: draftBody });
  } catch (err) {
    console.error("Generate reply error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate reply" },
      { status: 500 }
    );
  }
}
