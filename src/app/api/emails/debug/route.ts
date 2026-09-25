import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Debug endpoint to query emails table directly
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    
    let query = supabaseAdmin
      .from("emails")
      .select("id,mailbox_id,message_id,from_email,subject,received_at,processed,spam_score")
      .order("received_at", { ascending: false })
      .limit(50);
    
    if (from) {
      query = query.ilike("from_email", `%${from}%`);
    }
    
    const { data: emails, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      count: emails?.length || 0,
      emails: emails || [] 
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to query emails" },
      { status: 500 }
    );
  }
}
