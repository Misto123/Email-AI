-- Force PostgREST reload by altering a comment
-- Migration: 013_force_postgrest_reload.sql

-- Change a comment to force schema change detection
COMMENT ON TABLE mailboxes IS 'User mailboxes with IMAP/SMTP configuration - Updated 2026-09-29';

-- Alter a column default to trigger reload (harmless change)
ALTER TABLE mailboxes ALTER COLUMN imap_port SET DEFAULT 993;
ALTER TABLE mailboxes ALTER COLUMN smtp_port SET DEFAULT 465;

-- Send reload signal
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Verify all our columns
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'mailboxes'
  AND column_name IN ('imap_host', 'imap_port', 'smtp_host', 'smtp_port');
  
  IF col_count != 4 THEN
    RAISE EXCEPTION 'Missing IMAP/SMTP columns! Found only % of 4', col_count;
  END IF;
  
  RAISE NOTICE 'All 4 IMAP/SMTP columns verified. PostgREST reload triggered.';
END $$;
