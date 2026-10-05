import { NextResponse } from "next/server";
import { encryptMailboxPassword } from "@/lib/mailbox-crypto";
import { supabaseAdmin } from "@/lib/supabase";

interface Context {
  params: Promise<{ id: string }>;
}

// Direct update using service_role (bypasses RLS, not PostgREST cache but worth trying)
// The key is that writes might work even if schema cache is stale for reads
export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { 
      imap_host?: string;
      imap_port?: number;
      smtp_host?: string;
      smtp_port?: number;
      encrypted_password?: string;
      password?: string;
    };
    
    console.log('[MAILBOX-DIRECT] Updating mailbox:', id);
    console.log('[MAILBOX-DIRECT] Fields:', Object.keys(body));
    
    // Build update object with proper types
    const updates: Record<string, string | number> = {};
    
    if (body.imap_host !== undefined) updates.imap_host = body.imap_host;
    if (body.imap_port !== undefined) updates.imap_port = body.imap_port;
    if (body.smtp_host !== undefined) updates.smtp_host = body.smtp_host;
    if (body.smtp_port !== undefined) updates.smtp_port = body.smtp_port;
    
    // Encrypt password on server side
    if (body.password) {
      updates.encrypted_password = encryptMailboxPassword(body.password);
    } else if (body.encrypted_password) {
      updates.encrypted_password = encryptMailboxPassword(body.encrypted_password);
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    
    console.log('[MAILBOX-DIRECT] Attempting update with service_role...');
    
    // Try direct update - service_role should bypass most restrictions
    const { data, error } = await supabaseAdmin
      .from("mailboxes")
      .update(updates)
      .eq("id", id)
      .select("id, email, imap_host, imap_port, smtp_host, smtp_port")
      .single();
    
    if (error) {
      console.error('[MAILBOX-DIRECT] Supabase error:', error);
      // If this fails due to schema cache, return a helpful message
      if (error.code === 'PGRST204') {
        return NextResponse.json({
          error: "PostgREST schema cache issue - please wait 10 minutes or use SQL workaround",
          details: error,
          workaround: "Go to Supabase SQL Editor and run: UPDATE mailboxes SET imap_host='...', imap_port=993, smtp_host='...', smtp_port=465, encrypted_password=encode(digest('password', 'sha256'), 'hex') WHERE id='" + id + "';"
        }, { status: 500 });
      }
      throw error;
    }
    
    console.log('[MAILBOX-DIRECT] Success!');
    
    return NextResponse.json({ ok: true, data });
    
  } catch (error) {
    console.error('[MAILBOX-DIRECT] Exception:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unable to update mailbox",
      details: error 
    }, { status: 500 });
  }
}
