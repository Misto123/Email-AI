-- Force PostgREST cache refresh on new project
-- Migration: 030_new_project_cache_refresh.sql

-- Verify columns exist
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns 
  WHERE table_name = 'mailboxes' 
  AND column_name IN ('imap_host', 'imap_port', 'smtp_host', 'smtp_port');
  
  RAISE NOTICE 'Found % IMAP/SMTP columns', col_count;
END $$;

-- Verify data exists
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'MAILBOX DATA VERIFICATION';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  FOR rec IN 
    SELECT email, imap_host, imap_port, smtp_host, smtp_port
    FROM mailboxes
    WHERE email IN ('support@maxvisits.com', 'contact@kaufrank.com')
  LOOP
    RAISE NOTICE 'Email: %', rec.email;
    RAISE NOTICE '  IMAP: %:%', rec.imap_host, rec.imap_port;
    RAISE NOTICE '  SMTP: %:%', rec.smtp_host, rec.smtp_port;
  END LOOP;
END $$;

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
SELECT pg_notification_queue_usage();
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';

-- Touch table to trigger schema refresh
COMMENT ON TABLE mailboxes IS 'Fresh project - schema refreshed at ' || NOW()::TEXT;

SELECT 'PostgREST cache refresh triggered on fresh project' as status;
