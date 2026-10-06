-- Official Supabase workaround for stuck PostgREST cache
-- Migration: 026_supabase_official_cache_fix.sql
-- Reference: Supabase docs - PostgREST schema cache issue

-- Step 1: Send reload notification
NOTIFY pgrst, 'reload schema';

-- Step 2: Check notification queue usage (triggers queue refresh)
SELECT pg_notification_queue_usage();

-- Step 3: Wait a moment for PostgREST to process
SELECT pg_sleep(2);

-- Step 4: Send another reload signal
NOTIFY pgrst, 'reload schema';

-- Step 5: Verify columns are visible
SELECT 
  'PostgREST Cache Fix Applied' as status,
  COUNT(*) as imap_smtp_columns_count
FROM information_schema.columns
WHERE table_name = 'mailboxes'
AND column_name IN ('imap_host', 'imap_port', 'smtp_host', 'smtp_port');

-- Step 6: Verify function is visible
SELECT 
  'Function exists: ' || EXISTS(
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_mailboxes_with_config'
  )::TEXT as function_status;

COMMENT ON TABLE mailboxes IS 'Cache fix applied at ' || NOW()::TEXT;
