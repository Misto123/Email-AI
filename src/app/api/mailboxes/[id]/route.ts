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
    console.log('[MAILBOX-UPDATE] Request body:', Object.keys(body));
    
    // Handle IMAP/SMTP config separately using SQL function to bypass PostgREST cache issues
    if (body.imap_host !== undefined || body.imap_port !== undefined || 
        body.smtp_host !== undefined || body.smtp_port !== undefined || 
        body.encrypted_password || body.password) {
      
      const encryptedPass = body.password ? encryptMailboxPassword(body.password) 
                          : body.encrypted_password ? encryptMailboxPassword(body.encrypted_password) 
                          : null;
      
      const { data, error } = await supabaseAdmin.rpc('update_mailbox_config', {
        p_mailbox_id: id,
        p_imap_host: body.imap_host || null,
        p_imap_port: body.imap_port || null,
        p_smtp_host: body.smtp_host || null,
        p_smtp_port: body.smtp_port || null,
        p_encrypted_password: encryptedPass
      });
      
      if (error) {
        console.error('[MAILBOX-UPDATE] RPC error:', error);
        throw error;
      }
      
      console.log('[MAILBOX-UPDATE] IMAP/SMTP config updated via RPC');
      
      // If there are other fields, update them too
      const otherUpdates: Record<string, string | boolean> = {};
      if (body.email?.trim()) otherUpdates.email = body.email.trim();
      if (typeof body.ai_enabled === "boolean") otherUpdates.ai_enabled = body.ai_enabled;
      if (body.prompt !== undefined) otherUpdates.prompt = body.prompt.trim();
      if (body.reply_language) otherUpdates.reply_language = body.reply_language;
      if (body.default_language) otherUpdates.default_language = body.default_language;
      
      if (Object.keys(otherUpdates).length > 0) {
        const { error: updateError } = await supabaseAdmin.from("mailboxes").update(otherUpdates).eq("id", id);
        if (updateError) {
          console.error('[MAILBOX-UPDATE] Other fields error:', updateError);
        }
      }
      
      return NextResponse.json({ ok: true, data });
    }
    
    // Handle non-IMAP/SMTP updates normally
    const updates: Record<string, string | boolean> = {};
    if (body.email?.trim()) updates.email = body.email.trim();
    if (typeof body.ai_enabled === "boolean") updates.ai_enabled = body.ai_enabled;
    if (body.prompt !== undefined) updates.prompt = body.prompt.trim();
    if (body.reply_language) updates.reply_language = body.reply_language;
    if (body.default_language) updates.default_language = body.default_language;
    
    console.log('[MAILBOX-UPDATE] Non-IMAP updates:', updates);
    
    const { data, error } = await supabaseAdmin.from("mailboxes").update(updates).eq("id", id).select();
    
    if (error) {
      console.error('[MAILBOX-UPDATE] Supabase error:', error);
      throw error;
    }
    
    console.log('[MAILBOX-UPDATE] Success');
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
