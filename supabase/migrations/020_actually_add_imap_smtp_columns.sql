-- ACTUALLY create the IMAP/SMTP columns (previous migrations failed)
-- Migration: 020_actually_add_imap_smtp_columns.sql

-- Check if columns exist first
DO $$
BEGIN
  -- Add imap_host if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mailboxes' AND column_name = 'imap_host'
  ) THEN
    ALTER TABLE mailboxes ADD COLUMN imap_host TEXT;
    RAISE NOTICE '✅ Added imap_host column';
  ELSE
    RAISE NOTICE 'ℹ️ imap_host already exists';
  END IF;

  -- Add imap_port if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mailboxes' AND column_name = 'imap_port'
  ) THEN
    ALTER TABLE mailboxes ADD COLUMN imap_port INTEGER DEFAULT 993;
    RAISE NOTICE '✅ Added imap_port column';
  ELSE
    RAISE NOTICE 'ℹ️ imap_port already exists';
  END IF;

  -- Add smtp_host if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mailboxes' AND column_name = 'smtp_host'
  ) THEN
    ALTER TABLE mailboxes ADD COLUMN smtp_host TEXT;
    RAISE NOTICE '✅ Added smtp_host column';
  ELSE
    RAISE NOTICE 'ℹ️ smtp_host already exists';
  END IF;

  -- Add smtp_port if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mailboxes' AND column_name = 'smtp_port'
  ) THEN
    ALTER TABLE mailboxes ADD COLUMN smtp_port INTEGER DEFAULT 465;
    RAISE NOTICE '✅ Added smtp_port column';
  ELSE
    RAISE NOTICE 'ℹ️ smtp_port already exists';
  END IF;
END $$;

-- Verify all columns exist
SELECT 
  'Verification: ' || COUNT(*) || ' of 4 IMAP/SMTP columns exist' as result
FROM information_schema.columns
WHERE table_name = 'mailboxes'
AND column_name IN ('imap_host', 'imap_port', 'smtp_host', 'smtp_port');

-- Show all mailbox columns
SELECT 'All mailboxes columns: ' || STRING_AGG(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_name = 'mailboxes';
