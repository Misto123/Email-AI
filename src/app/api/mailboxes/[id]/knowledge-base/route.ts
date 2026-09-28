import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { KnowledgeBase } from "@/types/knowledge-base";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { website_url, knowledge_base } = body;

    const updateData: any = {};
    if (website_url !== undefined) updateData.website_url = website_url;
    if (knowledge_base !== undefined) updateData.knowledge_base = knowledge_base;

    const { data, error } = await supabaseAdmin
      .from("mailboxes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error("Update mailbox knowledge base error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update" },
      { status: 500 }
    );
  }
}
