-- Create forward_rules table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS forward_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_contains TEXT NOT NULL,
  forward_to TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups of enabled rules
CREATE INDEX IF NOT EXISTS idx_forward_rules_enabled 
ON forward_rules(enabled) 
WHERE enabled = true;

-- Insert default rule for monitoring orders
INSERT INTO forward_rules (subject_contains, forward_to, enabled)
VALUES ('New Order', 'bram@rebelinternet.nl', true);

-- Verify
SELECT * FROM forward_rules;
