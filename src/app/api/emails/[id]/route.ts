import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// DELETE - Permanently delete an email and all associated drafts
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`[DELETE-EMAIL] Deleting email: ${id}`);

    // First delete all drafts associated with this email
    const { error: draftsError } = await supabaseAdmin
      .from("drafts")
      .delete()
      .eq("email_id", id);

    if (draftsError) {
      console.error("[DELETE-EMAIL] Failed to delete drafts:", draftsError);
      throw new Error("Failed to delete drafts");
    }

    // Then delete the email itself
    const { error: emailError } = await supabaseAdmin
      .from("emails")
      .delete()
      .eq("id", id);

    if (emailError) {
      console.error("[DELETE-EMAIL] Failed to delete email:", emailError);
      throw new Error("Failed to delete email");
    }

    console.log(`[DELETE-EMAIL] Successfully deleted email and drafts: ${id}`);

    return NextResponse.json({ 
      ok: true, 
      message: "Email permanently deleted" 
    });
  } catch (err) {
    console.error("[DELETE-EMAIL] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete email" },
      { status: 500 }
    );
  }
}
