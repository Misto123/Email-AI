-- Complete schema for EMD multi-site Cloudflare deployment platform
-- Run this on Supabase project: gmsrnnwaripxnkfyiydi
-- Login: amens1953@yepmail.net

-- Drop existing sites table (it has wrong schema)
DROP TABLE IF EXISTS sites CASCADE;

-- Create sites table with correct schema
CREATE TABLE sites (
  id BIGSERIAL PRIMARY KEY,
  site_key TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL UNIQUE,
  site_name TEXT NOT NULL,
  cloudflare_worker_name TEXT NOT NULL UNIQUE,
  language TEXT NOT NULL DEFAULT 'en',
  locale TEXT NOT NULL DEFAULT 'en-US',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'provisioning', 'error')),
  deployment_status TEXT NOT NULL DEFAULT 'never_deployed' CHECK (deployment_status IN ('never_deployed', 'queued', 'building', 'deploying', 'ready', 'failed')),
  current_commit_sha TEXT,
  last_deployed_at TIMESTAMPTZ,
  
  -- Cloudflare deployment fields
  zone_id TEXT,
  worker_id TEXT,
  route_id TEXT,
  preview_url TEXT,
  preview_worker_id TEXT,
  preview_deployed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create site_config table
CREATE TABLE site_config (
  id BIGSERIAL PRIMARY KEY,
  site_id BIGINT NOT NULL UNIQUE REFERENCES sites(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  affiliate JSONB NOT NULL DEFAULT '{}'::jsonb,
  branding JSONB NOT NULL DEFAULT '{}'::jsonb,
  tracking JSONB NOT NULL DEFAULT '{}'::jsonb,
  feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create site_domains table (if needed for multi-domain per site)
CREATE TABLE IF NOT EXISTS site_domains (
  id BIGSERIAL PRIMARY KEY,
  site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create deployments tracking table
CREATE TABLE deployments (
  id BIGSERIAL PRIMARY KEY,
  site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  cloudflare_worker_name TEXT NOT NULL,
  commit_sha TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'building', 'deploying', 'ready', 'failed', 'cancelled')),
  cloudflare_deployment_id TEXT,
  error_message TEXT,
  logs_url TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_deployment_status ON sites(deployment_status);
CREATE INDEX idx_sites_zone_id ON sites(zone_id);
CREATE INDEX idx_sites_site_key ON sites(site_key);
CREATE INDEX idx_deployments_site_created ON deployments(site_id, created_at DESC);
CREATE INDEX idx_deployments_commit ON deployments(commit_sha);
CREATE INDEX idx_site_domains_site ON site_domains(site_id);

-- Enable RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (service role access)
CREATE POLICY "Allow all operations on sites" 
ON sites FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on site_config" 
ON site_config FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on site_domains" 
ON site_domains FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on deployments" 
ON deployments FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
DROP TRIGGER IF EXISTS update_sites_updated_at ON sites;
CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_config_updated_at ON site_config;
CREATE TRIGGER update_site_config_updated_at
  BEFORE UPDATE ON site_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_domains_updated_at ON site_domains;
CREATE TRIGGER update_site_domains_updated_at
  BEFORE UPDATE ON site_domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
