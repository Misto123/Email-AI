import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as { is_spam: boolean };
    
    // Mark email as spam/not spam
    // Try with folder first, fallback to just is_spam if schema cache not updated
    let updateError = null;
    const updateData: any = { is_spam: body.is_spam };
    
    // Try updating with folder column
    const { error: fullUpdateError } = await supabaseAdmin
      .from("emails")
      .update({ ...updateData, folder: body.is_spam ? "spam" : "inbox" })
      .eq("id", id);

    if (fullUpdateError && fullUpdateError.code === 'PGRST204') {
      // Schema cache issue - try without folder column
      console.warn("Schema cache outdated, updating without folder column");
      const { error: fallbackError } = await supabaseAdmin
        .from("emails")
        .update(updateData)
        .eq("id", id);
      updateError = fallbackError;
    } else {
      updateError = fullUpdateError;
    }

    if (updateError) {
      console.error("Update error:", updateError);
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
