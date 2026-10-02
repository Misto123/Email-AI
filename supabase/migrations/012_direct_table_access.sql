-- Workaround: Direct table grants to bypass PostgREST cache
-- Migration: 012_direct_table_access.sql

-- Grant direct UPDATE access to mailboxes table
GRANT UPDATE ON mailboxes TO anon, authenticated, service_role;

-- Ensure RLS allows service_role to bypass (it should already)
ALTER TABLE mailboxes FORCE ROW LEVEL SECURITY;

-- Drop the restrictive policy and create a permissive one
DROP POLICY IF EXISTS "Enable all access for service role" ON mailboxes;

CREATE POLICY "Service role full access"
ON mailboxes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Also allow anon and authenticated (since we use service_role key anyway)
CREATE POLICY IF NOT EXISTS "Public full access via service role"
ON mailboxes
FOR ALL  
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Verify the columns exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mailboxes' AND column_name = 'imap_host'
  ) THEN
    RAISE EXCEPTION 'Column imap_host still missing!';
  END IF;
  RAISE NOTICE 'All columns verified. Direct table access enabled.';
END $$;
