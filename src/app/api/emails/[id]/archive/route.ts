import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Archive the email
    const { error } = await supabaseAdmin
      .from("emails")
      .update({ is_archived: true, folder: "archived" })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Archive error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to archive email" },
      { status: 500 }
    );
  }
}
