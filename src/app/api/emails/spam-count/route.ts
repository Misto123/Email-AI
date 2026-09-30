import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from("emails")
      .select("*", { count: "exact", head: true })
      .or("is_spam.eq.true,spam_score.gte.50");

    if (error) throw error;

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Failed to get spam count:", error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
