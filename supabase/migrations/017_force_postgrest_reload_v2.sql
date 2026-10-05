-- Force PostgREST schema reload via NOTIFY
-- Migration: 017_force_postgrest_reload_v2.sql

-- Send multiple reload signals
DO $$
BEGIN
  RAISE NOTICE '🔄 Sending PostgREST reload signals...';
  
  -- Signal PostgREST to reload schema
  NOTIFY pgrst, 'reload schema';
  NOTIFY pgrst, 'reload config';
  
  -- Wait a moment
  PERFORM pg_sleep(1);
  
  -- Send again
  NOTIFY pgrst, 'reload schema';
  
  RAISE NOTICE '✅ Reload signals sent';
  
  -- Force a schema change that PostgREST must detect
  -- Add a harmless comment change
  COMMENT ON TABLE mailboxes IS 'User mailboxes - Schema updated ' || NOW()::TEXT;
  
  RAISE NOTICE '✅ Schema modified to trigger cache invalidation';
END $$;

-- Verify columns exist
DO $$
DECLARE
  col_count INTEGER;
  rec RECORD;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'COLUMN VERIFICATION';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'mailboxes'
  AND column_name IN ('imap_host', 'imap_port', 'smtp_host', 'smtp_port');
  
  RAISE NOTICE 'Found % of 4 IMAP/SMTP columns', col_count;
  
  IF col_count = 4 THEN
    RAISE NOTICE '✅ All columns exist in database';
    
    -- Show sample data
    RAISE NOTICE '';
    RAISE NOTICE 'SAMPLE MAILBOX DATA:';
    
    FOR rec IN 
      SELECT 
        email,
        imap_host,
        imap_port,
        smtp_host,
        smtp_port
      FROM mailboxes
      WHERE email IN ('support@maxvisits.com', 'contact@kaufrank.com')
      LIMIT 2
    LOOP
      RAISE NOTICE 'Email: %', rec.email;
      RAISE NOTICE '  IMAP: %:%', rec.imap_host, rec.imap_port;
      RAISE NOTICE '  SMTP: %:%', rec.smtp_host, rec.smtp_port;
    END LOOP;
  ELSE
    RAISE WARNING '❌ Missing columns!';
  END IF;
END $$;
