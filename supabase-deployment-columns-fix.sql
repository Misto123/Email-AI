-- Add columns used by the deployment API.
-- Supabase project: gmsrnnwaripxnkfyiydi
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS worker_id TEXT,
  ADD COLUMN IF NOT EXISTS route_id TEXT,
  ADD COLUMN IF NOT EXISTS preview_url TEXT,
  ADD COLUMN IF NOT EXISTS preview_worker_id TEXT,
  ADD COLUMN IF NOT EXISTS preview_deployed_at TIMESTAMPTZ;
