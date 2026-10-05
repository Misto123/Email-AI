import "server-only";

import { supabaseAdmin } from "@/lib/supabase";
import type { Draft, Mailbox } from "@/lib/mail-types";

export async function getMailboxes() {
  // Try with new columns first, fallback to old columns if schema cache not refreshed
  let { data, error } = await supabaseAdmin.from("mailboxes").select("id,email,ai_enabled,prompt,created_at,last_imap_check,last_smtp_check,imap_status,smtp_status,last_imap_error,last_smtp_error,website_url,knowledge_base,imap_host,imap_port,smtp_host,smtp_port").order("created_at", { ascending: true });
  
  // If error due to missing columns in cache, try without them
  if (error && error.code === 'PGRST204') {
    console.warn('[MAIL-DB] PostgREST cache issue, falling back to old columns');
    const fallback = await supabaseAdmin.from("mailboxes").select("id,email,ai_enabled,prompt,created_at,last_imap_check,last_smtp_check,imap_status,smtp_status,last_imap_error,last_smtp_error,website_url,knowledge_base").order("created_at", { ascending: true });
    if (fallback.error) throw fallback.error;
    // Add null values for missing fields
    return (fallback.data || []).map(m => ({
      ...m,
      imap_host: null,
      imap_port: null,
      smtp_host: null,
      smtp_port: null
    })) as Mailbox[];
  }
  
  if (error) throw error;
  return (data || []) as Mailbox[];
}

export async function getDrafts() {
  const { data, error } = await supabaseAdmin.from("drafts").select("id,email_id,mailbox_id,draft_body,status,created_at,updated_at,emails(id,mailbox_id,message_id,thread_id,from_email,from_name,subject,body,received_at,spam_score,is_spam,mailboxes(email))").neq("status", "deleted").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Draft[];
}
