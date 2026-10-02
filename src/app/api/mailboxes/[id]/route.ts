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
    
    console.log('[MAILBOX-UPDATE] Updating mailbox:', id);
    console.log('[MAILBOX-UPDATE] Request body keys:', Object.keys(body));
    
    // Build config object for SQL function
    const config: Record<string, any> = {};
    
    if (body.imap_host !== undefined) config.imap_host = body.imap_host;
    if (body.imap_port !== undefined) config.imap_port = body.imap_port;
    if (body.smtp_host !== undefined) config.smtp_host = body.smtp_host;
    if (body.smtp_port !== undefined) config.smtp_port = body.smtp_port;
    if (body.default_language) config.default_language = body.default_language;
    if (body.reply_language) config.reply_language = body.reply_language;
    if (typeof body.ai_enabled === "boolean") config.ai_enabled = body.ai_enabled;
    if (body.prompt !== undefined) config.prompt = body.prompt;
    
    // Handle password encryption
    if (body.password) {
      config.encrypted_password = encryptMailboxPassword(body.password);
    } else if (body.encrypted_password) {
      config.encrypted_password = encryptMailboxPassword(body.encrypted_password);
    }
    
    console.log('[MAILBOX-UPDATE] Config keys:', Object.keys(config));
    
    // Use SQL function to bypass PostgREST cache
    const { data, error } = await supabaseAdmin.rpc('update_mailbox_simple', {
      mailbox_id: id,
      config: config
    });
    
    if (error) {
      console.error('[MAILBOX-UPDATE] RPC error:', error);
      throw error;
    }
    
    console.log('[MAILBOX-UPDATE] Success via RPC function');
    return NextResponse.json({ ok: true, data });
    
  } catch (error) { 
    console.error('[MAILBOX-UPDATE] Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unable to update mailbox",
      details: error 
    }, { status: 400 }); 
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try { const { error } = await supabaseAdmin.from("mailboxes").delete().eq("id", (await params).id); if (error) throw error; return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Unable to delete mailbox" }, { status: 400 }); }
}
