import { NextResponse } from "next/server";
import { encryptMailboxPassword } from "@/lib/mailbox-crypto";
import { supabaseAdmin } from "@/lib/supabase";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { 
      email?: string; 
      password?: string; 
      encrypted_password?: string;
      ai_enabled?: boolean; 
      prompt?: string; 
      reply_language?: string; 
      default_language?: string;
      imap_host?: string;
      imap_port?: number;
      smtp_host?: string;
      smtp_port?: number;
    };
    const updates: Record<string, string | boolean | number> = {};
    if (body.email?.trim()) updates.email = body.email.trim();
    if (body.password) updates.encrypted_password = encryptMailboxPassword(body.password);
    if (body.encrypted_password) updates.encrypted_password = encryptMailboxPassword(body.encrypted_password);
    if (typeof body.ai_enabled === "boolean") updates.ai_enabled = body.ai_enabled;
    if (body.prompt !== undefined) updates.prompt = body.prompt.trim();
    if (body.reply_language) updates.reply_language = body.reply_language;
    if (body.default_language) updates.default_language = body.default_language;
    if (body.imap_host) updates.imap_host = body.imap_host.trim();
    if (body.imap_port) updates.imap_port = body.imap_port;
    if (body.smtp_host) updates.smtp_host = body.smtp_host.trim();
    if (body.smtp_port) updates.smtp_port = body.smtp_port;
    
    console.log('[MAILBOX-UPDATE] Updating mailbox:', id, 'with fields:', Object.keys(updates));
    
    const { error } = await supabaseAdmin.from("mailboxes").update(updates).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { 
    console.error('[MAILBOX-UPDATE] Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update mailbox" }, { status: 400 }); 
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try { const { error } = await supabaseAdmin.from("mailboxes").delete().eq("id", (await params).id); if (error) throw error; return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Unable to delete mailbox" }, { status: 400 }); }
}
