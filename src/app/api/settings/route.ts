import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try { const { data, error } = await supabaseAdmin.from("settings").select("openrouter_model").limit(1).maybeSingle(); if (error) throw error; return NextResponse.json({ openrouter_model: data?.openrouter_model || "openai/gpt-5.6-luna" }); }
  catch { return NextResponse.json({ error: "Unable to load settings" }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { openrouter_model?: string };
    if (!body.openrouter_model?.trim()) return NextResponse.json({ error: "Model is required" }, { status: 400 });
    const { data: setting } = await supabaseAdmin.from("settings").select("id").limit(1).maybeSingle();
    const query = setting?.id ? supabaseAdmin.from("settings").update({ openrouter_model: body.openrouter_model.trim() }).eq("id", setting.id) : supabaseAdmin.from("settings").insert({ openrouter_model: body.openrouter_model.trim() });
    const { error } = await query;
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to save settings" }, { status: 400 }); }
}
