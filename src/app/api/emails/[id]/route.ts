import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    
    // Permanently delete the email
    const { error } = await supabaseAdmin
      .from("emails")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete email error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete email" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json() as { status?: string };
    
    // Update email status (for unarchive)
    const updates: Record<string, boolean> = {};
    
    if (body.status === "pending") {
      updates.archived = false;
    }
    
    const { error } = await supabaseAdmin
      .from("emails")
      .update(updates)
      .eq("id", id);
    
    if (error) throw error;
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update email error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update email" },
      { status: 500 }
    );
  }
}
