import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { Draft } from "@/lib/mail-types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabaseAdmin
      .from("drafts")
      .select("id,email_id,mailbox_id,draft_body,status,created_at,updated_at,emails(id,mailbox_id,message_id,thread_id,from_email,from_name,subject,body,received_at,spam_score,is_spam,mailboxes(email))", { count: 'exact' })
      .neq("status", "deleted")
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return NextResponse.json({
      data: (data || []) as unknown as Draft[],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch {
    return NextResponse.json({ error: "Unable to load drafts" }, { status: 500 });
  }
}
