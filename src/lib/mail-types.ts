export interface Mailbox {
  id: string;
  email: string;
  ai_enabled: boolean;
  prompt: string | null;
  reply_language?: string;
  created_at: string;
  last_imap_check?: string | null;
  last_smtp_check?: string | null;
  imap_status?: "online" | "offline" | "unknown";
  smtp_status?: "online" | "offline" | "unknown";
  last_imap_error?: string | null;
  last_smtp_error?: string | null;
}

export interface EmailRecord {
  id: string;
  mailbox_id: string;
  message_id: string;
  thread_id: string | null;
  from_email: string | null;
  from_name: string | null;
  subject: string | null;
  body: string | null;
  received_at: string | null;
  spam_score?: number;
  in_reply_to?: string | null;
  references?: string | null;
  folder?: string;
  is_spam?: boolean;
  is_archived?: boolean;
}

export interface Folder {
  id: string;
  mailbox_id: string;
  name: string;
  color: string;
  created_at: string;
  email_count?: number;
}

export interface SpamTraining {
  id: string;
  email_id: string;
  is_spam: boolean;
  marked_by: string;
  marked_at: string;
}

export interface Draft {
  id: string;
  email_id: string;
  mailbox_id: string;
  draft_body: string;
  status: "draft" | "sent" | "deleted";
  created_at: string;
  updated_at: string;
  sent_at?: string | null;
  emails: EmailRecord & { mailboxes: Pick<Mailbox, "email"> };
}

export interface PendingEmail {
  id: string;
  mailbox_id: string;
  from_email: string | null;
  from_name: string | null;
  subject: string | null;
  body: string | null;
  received_at: string | null;
  spam_score?: number;
  mailboxes: Pick<Mailbox, "email">;
}

