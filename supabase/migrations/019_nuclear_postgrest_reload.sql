-- Nuclear option: Force complete PostgREST reload
-- Migration: 019_nuclear_postgrest_reload.sql

-- Kill all PostgREST connections to force full restart
DO $$
DECLARE
  conn_count INTEGER;
BEGIN
  RAISE NOTICE '🔥 NUCLEAR OPTION: Terminating PostgREST connections...';
  
  -- Count PostgREST connections
  SELECT COUNT(*) INTO conn_count
  FROM pg_stat_activity
  WHERE application_name LIKE '%postgrest%' OR usename = 'authenticator';
  
  RAISE NOTICE 'Found % PostgREST connections', conn_count;
  
  -- Terminate them
  PERFORM pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE application_name LIKE '%postgrest%' OR usename = 'authenticator';
  
  RAISE NOTICE '✅ Terminated PostgREST connections';
  
  -- Force schema change
  COMMENT ON TABLE mailboxes IS 'Mailboxes table - RELOADED ' || NOW()::TEXT;
  
  -- Send all possible reload signals
  NOTIFY pgrst, 'reload schema';
  NOTIFY pgrst, 'reload config';
  PERFORM pg_sleep(0.5);
  NOTIFY pgrst, 'reload schema';
  
  RAISE NOTICE '✅ PostgREST should reconnect with fresh cache';
END $$;

-- Verify columns one more time
SELECT 
  'imap_host exists: ' || EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mailboxes' AND column_name = 'imap_host'
  )::TEXT as check_result;
