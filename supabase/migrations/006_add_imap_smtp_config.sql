-- Add IMAP and SMTP configuration columns to mailboxes
-- Migration: 006_add_imap_smtp_config.sql

-- Add IMAP configuration
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS imap_host TEXT;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS imap_port INTEGER DEFAULT 993;

-- Add SMTP configuration  
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS smtp_host TEXT;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 465;

-- Add comments
COMMENT ON COLUMN mailboxes.imap_host IS 'IMAP server hostname (e.g., imap.gmail.com)';
COMMENT ON COLUMN mailboxes.imap_port IS 'IMAP server port (default: 993 for SSL)';
COMMENT ON COLUMN mailboxes.smtp_host IS 'SMTP server hostname (e.g., smtp.gmail.com)';
COMMENT ON COLUMN mailboxes.smtp_port IS 'SMTP server port (default: 465 for SSL)';
