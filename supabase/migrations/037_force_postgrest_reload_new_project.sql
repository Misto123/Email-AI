-- Force PostgREST cache refresh on new project
-- Migration: 037_force_postgrest_reload_new_project.sql

-- Official Supabase fix
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(2);
SELECT pg_notification_queue_usage();
SELECT pg_sleep(2);
NOTIFY pgrst, 'reload schema';

-- Verify table exists
SELECT 
  'Table exists: ' || EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'mailboxes'
  )::TEXT as status;

-- Verify data exists
SELECT 
  'Mailboxes count: ' || COUNT(*)::TEXT as count
FROM mailboxes;

-- Show sample data
SELECT email, imap_host, smtp_host
FROM mailboxes
WHERE email IN ('support@maxvisits.com', 'contact@kaufrank.com')
LIMIT 2;

COMMENT ON TABLE mailboxes IS 'PostgREST reload triggered at ' || NOW()::TEXT;
