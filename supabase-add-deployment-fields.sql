-- Add deployment fields to sites table
-- Run this migration in Supabase SQL editor

-- Add deployment tracking columns
ALTER TABLE sites ADD COLUMN IF NOT EXISTS deployment_status TEXT DEFAULT 'never_deployed' CHECK (deployment_status IN ('never_deployed', 'deploying', 'deployed', 'failed'));
ALTER TABLE sites ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMPTZ;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS worker_id TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS route_id TEXT;

-- Add preview deployment columns
ALTER TABLE sites ADD COLUMN IF NOT EXISTS preview_url TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS preview_worker_id TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS preview_deployed_at TIMESTAMPTZ;

-- Add zone_id for Cloudflare domain management
ALTER TABLE sites ADD COLUMN IF NOT EXISTS zone_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sites_deployment_status ON sites(deployment_status);
CREATE INDEX IF NOT EXISTS idx_sites_zone_id ON sites(zone_id);

-- Comment
COMMENT ON COLUMN sites.deployment_status IS 'Deployment status: never_deployed, deploying, deployed, failed';
COMMENT ON COLUMN sites.deployed_at IS 'Timestamp when site was last deployed to production';
COMMENT ON COLUMN sites.worker_id IS 'Cloudflare Worker ID for production';
COMMENT ON COLUMN sites.route_id IS 'Cloudflare Route ID for production domain';
COMMENT ON COLUMN sites.preview_url IS 'Preview URL (e.g., preview-{site_id}.nasdaq-signals.com)';
COMMENT ON COLUMN sites.preview_worker_id IS 'Cloudflare Worker ID for preview';
COMMENT ON COLUMN sites.zone_id IS 'Cloudflare Zone ID for this domain';
