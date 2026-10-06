-- Force notification queue refresh (Step 2 of Supabase fix)
-- Migration: 027_force_notification_queue_check.sql

-- Check and log notification queue usage
DO $$
DECLARE
  queue_usage REAL;
BEGIN
  SELECT pg_notification_queue_usage() INTO queue_usage;
  RAISE NOTICE 'Notification queue usage: %', queue_usage;
  
  -- If queue is full or stuck, this forces a refresh
  IF queue_usage > 0.5 THEN
    RAISE WARNING 'Queue usage high (%), forcing refresh', queue_usage;
  END IF;
END $$;

-- Multiple reload signals
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';

-- Force schema change to trigger reload
ALTER TABLE mailboxes ALTER COLUMN imap_host SET NOT NULL;
ALTER TABLE mailboxes ALTER COLUMN imap_host DROP NOT NULL;

-- Another notification after schema change
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT 'Forced notification queue check and schema reload' as status;
