import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // Get all emails that don't have drafts yet and aren't processed
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
        mailboxes(email)
      `)
      .eq("processed", false)
      .order("received_at", { ascending: false });

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
