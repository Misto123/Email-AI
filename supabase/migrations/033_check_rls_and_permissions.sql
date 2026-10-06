-- Check if RLS is blocking IMAP/SMTP columns
-- Migration: 033_check_rls_and_permissions.sql

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'mailboxes';

-- Grant explicit column permissions
GRANT SELECT, UPDATE (imap_host, imap_port, smtp_host, smtp_port) 
ON mailboxes 
TO authenticated, anon, service_role;

-- Verify column permissions
SELECT 
  grantee,
  privilege_type,
  column_name
FROM information_schema.column_privileges
WHERE table_name = 'mailboxes'
AND column_name IN ('imap_host', 'imap_port', 'smtp_host', 'smtp_port');

-- Force schema refresh
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

COMMENT ON TABLE mailboxes IS 'Permissions granted at ' || NOW()::TEXT;
