import { NextResponse } from "next/server";
import { testMailboxConnection } from "@/lib/mail";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const type = ((await request.json()) as { type?: string }).type;
    if (type !== "imap" && type !== "smtp") return NextResponse.json({ error: "Invalid test type" }, { status: 400 });
    const { data, error } = await supabaseAdmin.from("mailboxes").select("email,encrypted_password").eq("id", (await params).id).single();
    if (error || !data) throw error || new Error("Mailbox not found");
    await testMailboxConnection(data.email, data.encrypted_password, type);
    return NextResponse.json({ ok: true, message: `${type.toUpperCase()} connection successful` });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Connection failed" }, { status: 400 }); }
}
