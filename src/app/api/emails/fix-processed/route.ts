import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Fix emails that have processed=true but no drafts
 * Sets them to processed=false so they show in pending
 */
export async function POST() {
  try {
    // Find all emails with processed=true that don't have drafts
    const { data: emails } = await supabaseAdmin
      .from("emails")
      .select("id")
      .eq("processed", true);
    
    if (!emails || emails.length === 0) {
      return NextResponse.json({ fixed: 0, message: "No emails to fix" });
    }

    const emailIds = emails.map(e => e.id);
    
    // Check which ones have drafts
    const { data: drafts } = await supabaseAdmin
      .from("drafts")
      .select("email_id")
      .in("email_id", emailIds);
    
    const emailsWithDrafts = new Set(drafts?.map(d => d.email_id) || []);
    const emailsWithoutDrafts = emailIds.filter(id => !emailsWithDrafts.has(id));
    
    if (emailsWithoutDrafts.length === 0) {
      return NextResponse.json({ fixed: 0, message: "All processed emails have drafts" });
    }

    // Set processed=false for emails without drafts
    const { error } = await supabaseAdmin
      .from("emails")
      .update({ processed: false })
      .in("id", emailsWithoutDrafts);
    
    if (error) throw error;

    return NextResponse.json({ 
      fixed: emailsWithoutDrafts.length,
      message: `Fixed ${emailsWithoutDrafts.length} emails - they will now show in pending`
    });
  } catch (error) {
    console.error("Fix emails error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fix emails" },
      { status: 500 }
    );
  }
}
