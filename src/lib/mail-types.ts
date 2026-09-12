export interface Mailbox {
  id: string;
  email: string;
  ai_enabled: boolean;
  prompt: string | null;
  reply_language: string;
  created_at: string;
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
  spam_score: number;
  in_reply_to: string | null;
  references: string | null;
}

export interface Draft {
  id: string;
  email_id: string;
  mailbox_id: string;
  draft_body: string;
  status: "draft" | "sent" | "deleted";
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  emails: EmailRecord & { mailboxes: Pick<Mailbox, "email"> };
}
