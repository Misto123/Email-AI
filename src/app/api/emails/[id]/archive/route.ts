import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    console.log("[ARCHIVE] Starting archive request for email ID:", id);
    
    // Check if email exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("emails")
      .select("id, archived")
      .eq("id", id)
      .single();
    
    if (checkError) {
      console.error("[ARCHIVE] Email not found:", checkError);
      throw new Error(`Email not found: ${checkError.message}`);
    }
    
    console.log("[ARCHIVE] Email found:", existing);
    
    // Archive the email
    const { data: updated, error } = await supabaseAdmin
      .from("emails")
      .update({ archived: true })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[ARCHIVE] Update failed:", error);
      throw error;
    }
    
    console.log("[ARCHIVE] Successfully archived:", updated);

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("[ARCHIVE] Fatal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to archive email" },
      { status: 500 }
    );
  }
}
