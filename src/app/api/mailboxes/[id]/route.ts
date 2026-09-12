import { NextResponse } from "next/server";
import { encryptMailboxPassword } from "@/lib/mailbox-crypto";
import { supabaseAdmin } from "@/lib/supabase";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { email?: string; password?: string; ai_enabled?: boolean; prompt?: string; reply_language?: string };
    const updates: Record<string, string | boolean> = {};
    if (body.email?.trim()) updates.email = body.email.trim();
    if (body.password) updates.encrypted_password = encryptMailboxPassword(body.password);
    if (typeof body.ai_enabled === "boolean") updates.ai_enabled = body.ai_enabled;
    if (body.prompt !== undefined) updates.prompt = body.prompt.trim();
    if (body.reply_language) updates.reply_language = body.reply_language;
    const { error } = await supabaseAdmin.from("mailboxes").update(updates).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update mailbox" }, { status: 400 }); }
}

export async function DELETE(_request: Request, { params }: Context) {
  try { const { error } = await supabaseAdmin.from("mailboxes").delete().eq("id", (await params).id); if (error) throw error; return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Unable to delete mailbox" }, { status: 400 }); }
}
