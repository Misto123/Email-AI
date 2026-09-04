import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = (await request.json()) as { draft_body?: string; status?: "draft" | "deleted" };
    const updates: { draft_body?: string; status?: "draft" | "deleted"; updated_at: string } = { updated_at: new Date().toISOString() };
    if (body.draft_body !== undefined) updates.draft_body = body.draft_body;
    if (body.status) updates.status = body.status;
    const { error } = await supabaseAdmin.from("drafts").update(updates).eq("id", (await params).id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to update draft" }, { status: 400 }); }
}
