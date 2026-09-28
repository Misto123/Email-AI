import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // Get email IDs that already have drafts
    const { data: draftEmails } = await supabaseAdmin
      .from("drafts")
      .select("email_id")
      .neq("status", "deleted");
    
    const draftEmailIds = (draftEmails || []).map(d => d.email_id);
    
    // Get all emails that don't have drafts yet and aren't processed
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
        mailboxes(email)
      `)
      .eq("processed", false)
      .order("received_at", { ascending: false });
    
    // Exclude emails that have drafts
    if (draftEmailIds.length > 0) {
      query = query.not("id", "in", `(${draftEmailIds.join(",")})`);
    }
    
    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Get pending emails error:", err);
    return NextResponse.json(
      { error: "Unable to load pending emails" },
      { status: 500 }
    );
  }
}
