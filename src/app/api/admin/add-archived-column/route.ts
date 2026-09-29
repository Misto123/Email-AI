import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    instruction: "Go to Supabase SQL Editor and run this SQL",
    url: "https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/sql/new",
    sql: "ALTER TABLE public.emails ADD COLUMN archived BOOLEAN DEFAULT FALSE NOT NULL; CREATE INDEX idx_emails_archived ON public.emails(archived) WHERE archived = false;"
  });
}
