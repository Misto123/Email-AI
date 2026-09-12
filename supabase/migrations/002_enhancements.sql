-- Add spam score, language, and conversation tracking
-- Migration: 002_enhancements.sql

-- Add spam_score to emails table
ALTER TABLE emails ADD COLUMN IF NOT EXISTS spam_score INTEGER DEFAULT 0 CHECK (spam_score >= 0 AND spam_score <= 100);

-- Add reply_language to mailboxes table
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS reply_language TEXT DEFAULT 'en';

-- Add In-Reply-To and References for threading
ALTER TABLE emails ADD COLUMN IF NOT EXISTS in_reply_to TEXT;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS references TEXT;

-- Add sent_at timestamp to drafts
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Add index for faster spam filtering
CREATE INDEX IF NOT EXISTS idx_emails_spam_score ON emails(spam_score DESC);

-- Add index for thread lookup
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_in_reply_to ON emails(in_reply_to);
