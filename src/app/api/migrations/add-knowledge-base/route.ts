import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Run migration to add knowledge_base columns
 * One-time migration endpoint
 */
export async function POST() {
  try {
    // Add website_url column
    await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS website_url TEXT'
    }).throwOnError();

    // Add knowledge_base column
    await supabaseAdmin.rpc('exec_sql', {
      sql: "ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS knowledge_base JSONB DEFAULT '{}'"
    }).throwOnError();

    // Create index
    await supabaseAdmin.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_mailboxes_knowledge_base ON mailboxes USING GIN (knowledge_base)'
    }).throwOnError();

    return NextResponse.json({ 
      success: true, 
      message: "Migration completed: added website_url and knowledge_base columns" 
    });
  } catch (error) {
    console.error("Migration error:", error);
    
    // If exec_sql doesn't exist, try direct SQL
    try {
      const { error: err1 } = await supabaseAdmin.from('mailboxes').select('website_url').limit(1);
      const { error: err2 } = await supabaseAdmin.from('mailboxes').select('knowledge_base').limit(1);
      
      if (!err1 && !err2) {
        return NextResponse.json({ 
          success: true, 
          message: "Columns already exist" 
        });
      }
    } catch (checkError) {
      // Columns don't exist
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Migration failed",
        instructions: "Please run the SQL migration manually in Supabase SQL Editor:\n\nALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS website_url TEXT;\nALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS knowledge_base JSONB DEFAULT '{}';\nCREATE INDEX IF NOT EXISTS idx_mailboxes_knowledge_base ON mailboxes USING GIN (knowledge_base);"
      },
      { status: 500 }
    );
  }
}
