-- Force PostgREST schema cache refresh
-- Migration: 009_refresh_schema_cache.sql

-- Send notification to PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Also do a dummy ALTER to trigger cache invalidation
ALTER TABLE mailboxes ALTER COLUMN imap_host SET DEFAULT NULL;
ALTER TABLE mailboxes ALTER COLUMN imap_host DROP DEFAULT;

-- Verify columns exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mailboxes' AND column_name = 'imap_host'
  ) THEN
    RAISE EXCEPTION 'Column imap_host does not exist!';
  END IF;
  
  RAISE NOTICE 'Schema cache refresh triggered. Columns verified.';
END $$;
