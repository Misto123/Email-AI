import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as { is_spam: boolean };
    
    // Mark email as spam/not spam
    const { error: updateError } = await supabaseAdmin
      .from("emails")
      .update({ is_spam: body.is_spam, folder: body.is_spam ? "spam" : "inbox" })
      .eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
      // Check if columns don't exist
      if (updateError.message.includes("column") && updateError.message.includes("does not exist")) {
        throw new Error("Database migration required. Please run migration 003 in Supabase.");
      }
      throw updateError;
    }

    // Record spam training data
    const { error: trainingError } = await supabaseAdmin
      .from("spam_training")
      .insert({
        email_id: id,
        is_spam: body.is_spam,
        marked_by: "user"
      });

    if (trainingError) {
      console.error("Training data error:", trainingError);
      // Don't fail the main operation if training insert fails
      if (trainingError.message.includes("does not exist")) {
        console.warn("spam_training table doesn't exist - migration 003 needed");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Mark spam error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark spam" },
      { status: 500 }
    );
  }
}
