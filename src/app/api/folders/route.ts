import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // Get all folders with email counts
    const { data: folders, error } = await supabaseAdmin
      .from("folders")
      .select("id,mailbox_id,name,color,created_at");

    if (error) throw error;

    // Get email counts for each folder
    const foldersWithCounts = await Promise.all(
      (folders || []).map(async (folder) => {
        const { count } = await supabaseAdmin
          .from("email_folders")
          .select("*", { count: "exact", head: true })
          .eq("folder_id", folder.id);

        return { ...folder, email_count: count || 0 };
      })
    );

    return NextResponse.json(foldersWithCounts);
  } catch (error) {
    console.error("Get folders error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load folders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { mailbox_id: string; name: string; color?: string };
    
    const { data, error } = await supabaseAdmin
      .from("folders")
      .insert({
        mailbox_id: body.mailbox_id,
        name: body.name,
        color: body.color || "blue"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, folder: data });
  } catch (error) {
    console.error("Create folder error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create folder" },
      { status: 500 }
    );
  }
}
