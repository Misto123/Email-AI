-- Create sites table for multi-site deployment
-- This is the complete schema including deployment fields

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  site_id TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL UNIQUE,
  worker_name TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'maintenance')),
  
  -- Deployment fields
  deployment_status TEXT DEFAULT 'never_deployed' CHECK (deployment_status IN ('never_deployed', 'deploying', 'deployed', 'failed')),
  deployed_at TIMESTAMPTZ,
  worker_id TEXT,
  route_id TEXT,
  zone_id TEXT,
  
  -- Preview deployment fields
  preview_url TEXT,
  preview_worker_id TEXT,
  preview_deployed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sites_site_id ON sites(site_id);
CREATE INDEX IF NOT EXISTS idx_sites_domain ON sites(domain);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_deployment_status ON sites(deployment_status);
CREATE INDEX IF NOT EXISTS idx_sites_zone_id ON sites(zone_id);

-- Enable RLS (Row Level Security)
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sites_updated_at ON sites;
CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE sites IS 'Multi-site platform sites configuration';
COMMENT ON COLUMN sites.site_id IS 'Human-readable slug (e.g., anwb-energie)';
COMMENT ON COLUMN sites.domain IS 'Primary domain for the site';
COMMENT ON COLUMN sites.worker_name IS 'Cloudflare Worker name';
COMMENT ON COLUMN sites.deployment_status IS 'Deployment status: never_deployed, deploying, deployed, failed';
COMMENT ON COLUMN sites.deployed_at IS 'Timestamp when site was last deployed to production';
COMMENT ON COLUMN sites.worker_id IS 'Cloudflare Worker ID for production';
COMMENT ON COLUMN sites.route_id IS 'Cloudflare Route ID for production domain';
COMMENT ON COLUMN sites.preview_url IS 'Preview URL (e.g., preview-{site_id}.nasdaq-signals.com)';
COMMENT ON COLUMN sites.preview_worker_id IS 'Cloudflare Worker ID for preview';
COMMENT ON COLUMN sites.zone_id IS 'Cloudflare Zone ID for this domain';
