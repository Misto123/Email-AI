import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PATCH update forward rule (toggle enabled)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { enabled } = body;

    console.log("[FORWARD-RULES] Updating rule:", id, { enabled });

    const { data, error } = await supabaseAdmin
      .from("forward_rules")
      .update({ enabled })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("[FORWARD-RULES] Rule updated:", id);

    return NextResponse.json(data);
  } catch (err) {
    console.error("[FORWARD-RULES] PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to update rule" },
      { status: 500 }
    );
  }
}

// DELETE forward rule
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("[FORWARD-RULES] Deleting rule:", id);

    const { error } = await supabaseAdmin
      .from("forward_rules")
      .delete()
      .eq("id", id);

    if (error) throw error;

    console.log("[FORWARD-RULES] Rule deleted:", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[FORWARD-RULES] DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete rule" },
      { status: 500 }
    );
  }
}
