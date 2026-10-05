-- Force add IMAP/SMTP columns directly
-- Migration: 022_force_add_columns.sql

-- Add columns with IF NOT EXISTS
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS imap_host TEXT;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS imap_port INTEGER DEFAULT 993;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS smtp_host TEXT;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 465;

-- Verify columns exist
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'mailboxes'
  AND column_name IN ('imap_host', 'imap_port', 'smtp_host', 'smtp_port');
  
  RAISE NOTICE '✅ Found % of 4 IMAP/SMTP columns', col_count;
  
  IF col_count = 4 THEN
    RAISE NOTICE '✅ All columns created successfully!';
  ELSE
    RAISE WARNING '❌ Only % columns exist!', col_count;
  END IF;
END $$;
