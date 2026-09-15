-- Add connection status tracking to mailboxes
-- Migration: 005_connection_status.sql

-- Add connection status fields
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS last_imap_check TIMESTAMPTZ;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS last_smtp_check TIMESTAMPTZ;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS imap_status TEXT DEFAULT 'unknown' CHECK (imap_status IN ('online', 'offline', 'unknown'));
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS smtp_status TEXT DEFAULT 'unknown' CHECK (smtp_status IN ('online', 'offline', 'unknown'));
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS last_imap_error TEXT;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS last_smtp_error TEXT;

-- Add comments
COMMENT ON COLUMN mailboxes.last_imap_check IS 'Timestamp of last IMAP connection check';
COMMENT ON COLUMN mailboxes.last_smtp_check IS 'Timestamp of last SMTP connection check';
COMMENT ON COLUMN mailboxes.imap_status IS 'Current IMAP connection status: online, offline, or unknown';
COMMENT ON COLUMN mailboxes.smtp_status IS 'Current SMTP connection status: online, offline, or unknown';
COMMENT ON COLUMN mailboxes.last_imap_error IS 'Last IMAP connection error message (if any)';
COMMENT ON COLUMN mailboxes.last_smtp_error IS 'Last SMTP connection error message (if any)';
