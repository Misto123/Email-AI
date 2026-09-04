-- Shared-source, multi-site deployment metadata.
-- Additive and safe to run against the existing Supabase project.

CREATE TABLE IF NOT EXISTS sites (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_config (
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

CREATE TABLE IF NOT EXISTS deployments (
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

CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_deployment_status ON sites(deployment_status);
CREATE INDEX IF NOT EXISTS idx_deployments_site_created ON deployments(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_commit ON deployments(commit_sha);

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- The application accesses these tables only through the server-side service role.
-- No anon/authenticated policies are intentionally created.
