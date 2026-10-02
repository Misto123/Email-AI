-- Add RLS policies for forward_rules table
-- Migration: 007_forward_rules_rls.sql

-- Enable RLS if not already enabled
ALTER TABLE forward_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable all access for service role" ON forward_rules;

-- Allow all operations for service role (which is what the app uses)
CREATE POLICY "Enable all access for service role"
ON forward_rules
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Alternatively, allow all access (since we use service_role key server-side anyway)
ALTER TABLE forward_rules FORCE ROW LEVEL SECURITY;
