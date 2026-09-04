-- Compatibility hardening for the existing EMD schema in Supabase.
-- Additive only. Does not drop or overwrite existing records.
-- Use this file for the current project. The project already has the EMD
-- tables; this migration adds missing fields, views, and RLS hardening.

ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  domain_id BIGINT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  category_id BIGINT,
  author_persona_id BIGINT REFERENCES author_personas(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(domain_id, slug)
);

CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  domain_id BIGINT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  UNIQUE(domain_id, slug)
);

CREATE TABLE IF NOT EXISTS tags (
  id BIGSERIAL PRIMARY KEY,
  domain_id BIGINT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  UNIQUE(domain_id, slug)
);

CREATE TABLE IF NOT EXISTS domain_content (
  id BIGSERIAL PRIMARY KEY,
  domain_id BIGINT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  locale TEXT NOT NULL DEFAULT 'en',
  page_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(domain_id, locale, page_key)
);

CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  domain_id BIGINT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  blog_post_id BIGINT REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_seeded_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS homepage_description TEXT;
ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS discount_amount TEXT;
ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'fixed';
ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS minimum_order TEXT;
ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS affiliate_url TEXT;
ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS is_main_offer BOOLEAN DEFAULT false;
ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS copies INTEGER DEFAULT 0;
ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS worked_votes INTEGER DEFAULT 0;
ALTER TABLE coupon_codes ADD COLUMN IF NOT EXISTS failed_votes INTEGER DEFAULT 0;

ALTER TABLE offers ADD COLUMN IF NOT EXISTS homepage_description TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_amount TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS affiliate_url TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS is_main_offer BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS worked_votes INTEGER DEFAULT 0;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS failed_votes INTEGER DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_codes_one_main_per_domain
  ON coupon_codes(domain_id) WHERE is_main_offer = true AND status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS idx_offers_one_main_per_domain
  ON offers(domain_id) WHERE is_main_offer = true AND status = 'active';

CREATE OR REPLACE VIEW domains_overview AS
SELECT
  d.id,
  d.domain_name,
  d.display_name,
  d.status,
  d.primary_language,
  d.active_languages,
  d.seo_flow_shared,
  d.seo_flow_shared_date,
  d.settings,
  COUNT(DISTINCT cc.id) FILTER (WHERE cc.status = 'active') AS active_coupon_codes,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'active') AS active_offers,
  d.created_at,
  d.updated_at
FROM domains d
LEFT JOIN coupon_codes cc ON cc.domain_id = d.id
LEFT JOIN offers o ON o.domain_id = d.id
GROUP BY d.id;

CREATE OR REPLACE VIEW domain_seo_summary AS
SELECT
  d.id AS domain_id,
  d.domain_name,
  COALESCE((d.settings->>'has_privacy_policy')::boolean, false) AS has_privacy_policy,
  COALESCE((d.settings->>'has_terms_of_service')::boolean, false) AS has_terms_of_service,
  COALESCE((d.settings->>'has_about_us')::boolean, false) AS has_about_us,
  COALESCE((d.settings->>'has_contact_us')::boolean, false) AS has_contact_us,
  COALESCE((d.settings->>'has_ads_txt')::boolean, false) AS has_ads_txt,
  COALESCE((d.settings->>'has_favicon')::boolean, false) AS has_favicon,
  COALESCE((d.settings->>'enable_aria_tags')::boolean, true) AS enable_aria_tags,
  COALESCE((d.settings->>'enable_audible_text')::boolean, true) AS enable_audible_text,
  COALESCE((d.settings->>'gdpr_notice_enabled')::boolean, true) AS gdpr_notice_enabled
FROM domains d;

REVOKE ALL ON domains_overview FROM PUBLIC, anon, authenticated;
REVOKE ALL ON domain_seo_summary FROM PUBLIC, anon, authenticated;
GRANT SELECT ON domains_overview, domain_seo_summary TO service_role;
