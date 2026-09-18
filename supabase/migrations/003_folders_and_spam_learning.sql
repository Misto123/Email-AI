-- Email folders and spam learning system
-- Migration: 003_folders_and_spam_learning.sql

-- Add folder column to emails
ALTER TABLE emails ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'inbox';

-- Add is_spam flag (user-marked spam for learning)
ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT FALSE;

-- Add is_archived flag for self-sent emails
ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Create folders table for custom categories
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mailbox_id, name)
);

-- Create email folder assignments (many-to-many)
CREATE TABLE IF NOT EXISTS email_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email_id, folder_id)
);

-- Create spam training data table
CREATE TABLE IF NOT EXISTS spam_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  is_spam BOOLEAN NOT NULL,
  marked_by TEXT DEFAULT 'user',
  marked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_emails_folder ON emails(folder);
CREATE INDEX IF NOT EXISTS idx_emails_is_spam ON emails(is_spam);
CREATE INDEX IF NOT EXISTS idx_emails_is_archived ON emails(is_archived);
CREATE INDEX IF NOT EXISTS idx_email_folders_email_id ON email_folders(email_id);
CREATE INDEX IF NOT EXISTS idx_email_folders_folder_id ON email_folders(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_mailbox_id ON folders(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_spam_training_email_id ON spam_training(email_id);

-- Create default folders for existing mailboxes
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
