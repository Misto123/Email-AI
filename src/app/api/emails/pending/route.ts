import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Get email IDs that already have drafts
    const { data: draftEmails } = await supabaseAdmin
      .from("drafts")
      .select("email_id")
      .neq("status", "deleted");
    
    const draftEmailIds = (draftEmails || []).map(d => d.email_id);
    
    // Get all emails that don't have drafts yet, aren't processed, and aren't archived
    let query = supabaseAdmin
      .from("emails")
      .select(`
        id,
        mailbox_id,
        from_email,
        from_name,
        subject,
        body,
        received_at,
        spam_score,
        is_spam,
        is_archived,
        processed,
        mailboxes(email)
      `, { count: 'exact' })
      .eq("processed", false)
      .eq("is_archived", false)
      .order("received_at", { ascending: false });
    
    // Exclude emails that have drafts
    if (draftEmailIds.length > 0) {
      query = query.not("id", "in", `(${draftEmailIds.join(",")})`);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (err) {
    console.error("Get pending emails error:", err);
    return NextResponse.json(
      { error: "Unable to load pending emails" },
      { status: 500 }
    );
  }
}
