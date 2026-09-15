import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get the current email to find the sender
    const { data: currentEmail, error: emailError } = await supabaseAdmin
      .from("emails")
      .select("from_email,mailbox_id")
      .eq("id", id)
      .single();

    if (emailError || !currentEmail) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    // Get all emails from the same sender in this mailbox, excluding the current one
    const { data: history, error: historyError } = await supabaseAdmin
      .from("emails")
      .select("id,from_email,from_name,subject,body,received_at,spam_score")
      .eq("mailbox_id", currentEmail.mailbox_id)
      .eq("from_email", currentEmail.from_email)
      .neq("id", id)
      .order("received_at", { ascending: false })
      .limit(20);

    if (historyError) throw historyError;

    return NextResponse.json(history || []);
  } catch (err) {
    console.error("Get email history error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load history" },
      { status: 500 }
    );
  }
}
