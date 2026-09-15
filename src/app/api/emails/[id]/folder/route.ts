import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as { folder_id: string };
    
    // Assign email to folder
    const { error } = await supabaseAdmin
      .from("email_folders")
      .insert({
        email_id: id,
        folder_id: body.folder_id
      });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Assign folder error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to assign folder" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folder_id");
    
    if (!folderId) {
      return NextResponse.json({ error: "folder_id required" }, { status: 400 });
    }
    
    // Remove email from folder
    const { error } = await supabaseAdmin
      .from("email_folders")
      .delete()
      .eq("email_id", id)
      .eq("folder_id", folderId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Remove folder error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove folder" },
      { status: 500 }
    );
  }
}
