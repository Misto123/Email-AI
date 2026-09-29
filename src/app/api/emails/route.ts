import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    if (status === 'archived') {
      // Get archived emails
      const { data, error } = await supabaseAdmin
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
        .eq("archived", true)
        .order("received_at", { ascending: false });
      
      if (error) throw error;
      
      return NextResponse.json(data || []);
    }
    
    return NextResponse.json({ error: "Invalid status parameter" }, { status: 400 });
  } catch (err) {
    console.error("Get emails error:", err);
    return NextResponse.json(
      { error: "Unable to load emails" },
      { status: 500 }
    );
  }
}
