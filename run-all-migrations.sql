-- ============================================
-- EMAIL AI - ALL MIGRATIONS (001-005)
-- Run this entire file in Supabase SQL Editor
-- Project: xecxfqdhqjiwngblekgf
-- ============================================

-- MIGRATION 001: Initial Schema
-- ============================================
create extension if not exists pgcrypto;

create table if not exists mailboxes (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  encrypted_password text not null,
  ai_enabled boolean not null default true,
  prompt text,
  created_at timestamptz not null default now()
);

create table if not exists emails (
  id uuid primary key default gen_random_uuid(),
  mailbox_id uuid not null references mailboxes(id) on delete cascade,
  message_id text not null,
  thread_id text,
  from_email text,
  from_name text,
  subject text,
  body text,
  received_at timestamptz,
  processed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (mailbox_id, message_id)
);

create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  email_id uuid not null references emails(id) on delete cascade,
  mailbox_id uuid not null references mailboxes(id) on delete cascade,
  draft_body text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email_id)
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  openrouter_model text not null default 'openai/gpt-5.6-luna',
  created_at timestamptz not null default now()
);

insert into settings (openrouter_model)
select 'openai/gpt-5.6-luna'
where not exists (select 1 from settings);

alter table mailboxes enable row level security;
alter table emails enable row level security;
alter table drafts enable row level security;
alter table settings enable row level security;

-- MIGRATION 002: Enhancements
-- ============================================
ALTER TABLE emails ADD COLUMN IF NOT EXISTS spam_score INTEGER DEFAULT 0 CHECK (spam_score >= 0 AND spam_score <= 100);
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS reply_language TEXT DEFAULT 'en';
ALTER TABLE emails ADD COLUMN IF NOT EXISTS in_reply_to TEXT;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS "references" TEXT;
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_emails_spam_score ON emails(spam_score DESC);
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_in_reply_to ON emails(in_reply_to);

-- MIGRATION 003: Folders & Spam Learning
-- ============================================
ALTER TABLE emails ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'inbox';
ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT FALSE;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mailbox_id, name)
);

CREATE TABLE IF NOT EXISTS email_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email_id, folder_id)
);

CREATE TABLE IF NOT EXISTS spam_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  is_spam BOOLEAN NOT NULL,
  marked_by TEXT DEFAULT 'user',
  marked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emails_folder ON emails(folder);
CREATE INDEX IF NOT EXISTS idx_emails_is_spam ON emails(is_spam);
CREATE INDEX IF NOT EXISTS idx_emails_is_archived ON emails(is_archived);
CREATE INDEX IF NOT EXISTS idx_email_folders_email_id ON email_folders(email_id);
CREATE INDEX IF NOT EXISTS idx_email_folders_folder_id ON email_folders(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_mailbox_id ON folders(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_spam_training_email_id ON spam_training(email_id);

INSERT INTO folders (mailbox_id, name, color)
SELECT id, 'Order Complete', 'green' FROM mailboxes
WHERE NOT EXISTS (SELECT 1 FROM folders WHERE mailbox_id = mailboxes.id AND name = 'Order Complete')
ON CONFLICT DO NOTHING;

INSERT INTO folders (mailbox_id, name, color)
SELECT id, 'Cancellation Request', 'red' FROM mailboxes
WHERE NOT EXISTS (SELECT 1 FROM folders WHERE mailbox_id = mailboxes.id AND name = 'Cancellation Request')
ON CONFLICT DO NOTHING;

INSERT INTO folders (mailbox_id, name, color)
SELECT id, 'Support', 'blue' FROM mailboxes
WHERE NOT EXISTS (SELECT 1 FROM folders WHERE mailbox_id = mailboxes.id AND name = 'Support')
ON CONFLICT DO NOTHING;

INSERT INTO folders (mailbox_id, name, color)
SELECT id, 'Refund', 'orange' FROM mailboxes
WHERE NOT EXISTS (SELECT 1 FROM folders WHERE mailbox_id = mailboxes.id AND name = 'Refund')
ON CONFLICT DO NOTHING;

-- MIGRATION 004: Spam Settings
-- ============================================
ALTER TABLE settings ADD COLUMN IF NOT EXISTS spam_threshold INTEGER DEFAULT 80 CHECK (spam_threshold >= 0 AND spam_threshold <= 100);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS spam_keywords TEXT DEFAULT '';

COMMENT ON COLUMN settings.spam_threshold IS 'Spam score threshold (0-100). Emails with score >= this value will be auto-hidden. Default: 80';
COMMENT ON COLUMN settings.spam_keywords IS 'Custom spam keywords, one per line. Used to calculate spam scores.';

-- MIGRATION 005: Connection Status
-- ============================================
ALTER TABLE mailboxes
  ADD COLUMN IF NOT EXISTS last_imap_check TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_smtp_check TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS imap_status TEXT CHECK (imap_status IN ('online', 'offline', 'unknown')),
  ADD COLUMN IF NOT EXISTS smtp_status TEXT CHECK (smtp_status IN ('online', 'offline', 'unknown')),
  ADD COLUMN IF NOT EXISTS last_imap_error TEXT,
  ADD COLUMN IF NOT EXISTS last_smtp_error TEXT;

UPDATE mailboxes
SET 
  imap_status = COALESCE(imap_status, 'unknown'),
  smtp_status = COALESCE(smtp_status, 'unknown')
WHERE imap_status IS NULL OR smtp_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_mailboxes_imap_status ON mailboxes(imap_status);
CREATE INDEX IF NOT EXISTS idx_mailboxes_smtp_status ON mailboxes(smtp_status);
CREATE INDEX IF NOT EXISTS idx_mailboxes_last_imap_check ON mailboxes(last_imap_check);
CREATE INDEX IF NOT EXISTS idx_mailboxes_last_smtp_check ON mailboxes(last_smtp_check);

-- ============================================
-- ✅ DONE! All 5 migrations applied.
-- ============================================
