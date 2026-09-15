import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("openrouter_model,spam_threshold,spam_keywords")
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    
    return NextResponse.json({
      openrouter_model: data?.openrouter_model || "openai/gpt-5.6-luna",
      spam_threshold: data?.spam_threshold || 80,
      spam_keywords: data?.spam_keywords || "",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      openrouter_model?: string;
      spam_threshold?: number;
      spam_keywords?: string;
    };

    if (body.openrouter_model && !body.openrouter_model.trim()) {
      return NextResponse.json(
        { error: "Model is required" },
        { status: 400 }
      );
    }

    const { data: setting } = await supabaseAdmin
      .from("settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    const updateData: Record<string, string | number> = {};
    if (body.openrouter_model !== undefined) {
      updateData.openrouter_model = body.openrouter_model.trim();
    }
    if (body.spam_threshold !== undefined) {
      updateData.spam_threshold = body.spam_threshold;
    }
    if (body.spam_keywords !== undefined) {
      updateData.spam_keywords = body.spam_keywords.trim();
    }

    const query = setting?.id
      ? supabaseAdmin.from("settings").update(updateData).eq("id", setting.id)
      : supabaseAdmin.from("settings").insert(updateData);

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to save settings" },
      { status: 400 }
    );
  }
}
