import { NextResponse } from "next/server";
import { encryptMailboxPassword } from "@/lib/mailbox-crypto";
import { getMailboxes } from "@/lib/mail-db";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try { return NextResponse.json(await getMailboxes()); } catch { return NextResponse.json({ error: "Unable to load mailboxes" }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; ai_enabled?: boolean; prompt?: string };
    if (!body.email?.trim() || !body.password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    const { count, error: countError } = await supabaseAdmin.from("mailboxes").select("id", { count: "exact", head: true });
    if (countError) throw countError;
    if ((count || 0) >= 20) return NextResponse.json({ error: "The 20-mailbox limit has been reached" }, { status: 400 });
    const { error } = await supabaseAdmin.from("mailboxes").insert({ email: body.email.trim(), encrypted_password: encryptMailboxPassword(body.password), ai_enabled: body.ai_enabled ?? true, prompt: body.prompt?.trim() || null });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save mailbox" }, { status: 400 }); }
}
