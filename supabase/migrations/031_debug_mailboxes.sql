-- Debug: Check if mailboxes table exists and has data
-- Migration: 031_debug_mailboxes.sql

-- Check if table exists
SELECT 
  'mailboxes table exists: ' || EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'mailboxes'
  )::TEXT as table_status;

-- Count rows
SELECT 
  'Total mailboxes: ' || COUNT(*)::TEXT as row_count
FROM mailboxes;

-- Show all mailboxes
SELECT 
  email,
  imap_host,
  smtp_host,
  CASE WHEN encrypted_password IS NOT NULL THEN 'HAS_PASSWORD' ELSE 'NO_PASSWORD' END as password_status
FROM mailboxes
ORDER BY email;

-- Check columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'mailboxes'
AND column_name IN ('imap_host', 'imap_port', 'smtp_host', 'smtp_port')
ORDER BY column_name;
