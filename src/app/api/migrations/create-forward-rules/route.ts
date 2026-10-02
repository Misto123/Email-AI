import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST() {
  try {
    console.log("[MIGRATION] Creating forward_rules table...");

    // Create forward_rules table
    const { error } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS forward_rules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          subject_contains TEXT NOT NULL,
          forward_to TEXT NOT NULL,
          enabled BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_forward_rules_enabled 
        ON forward_rules(enabled) 
        WHERE enabled = true;
      `
    });

    if (error) throw error;

    console.log("[MIGRATION] forward_rules table created successfully");

    return NextResponse.json({ 
      ok: true, 
      message: "forward_rules table created" 
    });
  } catch (err) {
    console.error("[MIGRATION] Error:", err);
    
    // Fallback: try direct SQL execution
    try {
      const { error: sqlError } = await supabaseAdmin.from("forward_rules").select("id").limit(1);
      
      if (sqlError && sqlError.message.includes("does not exist")) {
        return NextResponse.json(
          { 
            error: "Table does not exist. Please run this SQL in Supabase SQL Editor:",
            sql: `
CREATE TABLE forward_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_contains TEXT NOT NULL,
  forward_to TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forward_rules_enabled 
ON forward_rules(enabled) 
WHERE enabled = true;
            `
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ ok: true, message: "Table already exists" });
    } catch (fallbackErr) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Migration failed" },
        { status: 500 }
      );
    }
  }
}
