import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET all forward rules
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("forward_rules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("[FORWARD-RULES] GET error:", err);
    return NextResponse.json(
      { error: "Failed to load forward rules" },
      { status: 500 }
    );
  }
}

// POST create new forward rule
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject_contains, forward_to } = body;

    if (!subject_contains || !forward_to) {
      return NextResponse.json(
        { error: "subject_contains and forward_to are required" },
        { status: 400 }
      );
    }

    console.log("[FORWARD-RULES] Creating rule:", { subject_contains, forward_to });

    const { data, error } = await supabaseAdmin
      .from("forward_rules")
      .insert({
        subject_contains: subject_contains.trim(),
        forward_to: forward_to.trim(),
        enabled: true,
      })
      .select()
      .single();

    if (error) throw error;

    console.log("[FORWARD-RULES] Rule created:", data.id);

    return NextResponse.json(data);
  } catch (err) {
    console.error("[FORWARD-RULES] POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create rule" },
      { status: 500 }
    );
  }
}
