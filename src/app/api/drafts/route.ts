import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { Draft } from "@/lib/mail-types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabaseAdmin
      .from("drafts")
      .select("id,email_id,mailbox_id,draft_body,status,created_at,updated_at,emails(id,mailbox_id,message_id,thread_id,from_email,from_name,subject,body,received_at,spam_score,is_spam,mailboxes(email))", { count: 'exact' })
      .neq("status", "deleted")
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return NextResponse.json({
      data: (data || []) as unknown as Draft[],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch {
    return NextResponse.json({ error: "Unable to load drafts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email_id, draft_body } = body;

    if (!email_id) {
      return NextResponse.json({ error: "email_id is required" }, { status: 400 });
    }

    console.log('[MANUAL-DRAFT] Creating manual draft for email:', email_id);

    // Get email to find mailbox_id
    const { data: email, error: emailError } = await supabaseAdmin
      .from("emails")
      .select("id,mailbox_id")
      .eq("id", email_id)
      .single();

    if (emailError || !email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Delete existing draft if any
    await supabaseAdmin
      .from("drafts")
      .delete()
      .eq("email_id", email_id);

    // Create new draft
    const { data: draft, error: draftError } = await supabaseAdmin
      .from("drafts")
      .insert({
        email_id: email.id,
        mailbox_id: email.mailbox_id,
        draft_body: draft_body || "Write your reply here...",
      })
      .select()
      .single();

    if (draftError || !draft) {
      throw draftError || new Error("Failed to create draft");
    }

    console.log('[MANUAL-DRAFT] Draft created:', draft.id);

    return NextResponse.json({ ok: true, draft_id: draft.id });
  } catch (err) {
    console.error('[MANUAL-DRAFT] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create draft" },
      { status: 500 }
    );
  }
}
