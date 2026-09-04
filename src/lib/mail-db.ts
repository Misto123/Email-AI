import "server-only";

import { supabaseAdmin } from "@/lib/supabase";
import type { Draft, Mailbox } from "@/lib/mail-types";

export async function getMailboxes() {
  const { data, error } = await supabaseAdmin.from("mailboxes").select("id,email,ai_enabled,prompt,created_at").order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as Mailbox[];
}

export async function getDrafts() {
  const { data, error } = await supabaseAdmin.from("drafts").select("id,email_id,mailbox_id,draft_body,status,created_at,updated_at,emails(id,mailbox_id,message_id,thread_id,from_email,from_name,subject,body,received_at,mailboxes(email))").neq("status", "deleted").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Draft[];
}
