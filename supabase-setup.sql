-- Clean database and create all tables for coupon system
-- Run on Supabase PostgreSQL

-- Drop existing tables (clean slate)
DROP TABLE IF EXISTS admin_activity_log CASCADE;
DROP TABLE IF EXISTS domain_coupons CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;

-- Create coupons table with all features
CREATE TABLE coupons (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  homepage_description TEXT,
  discount_amount VARCHAR(50) NOT NULL,
  discount_type VARCHAR(20) DEFAULT 'fixed',
  min_order VARCHAR(50),
  affiliate_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  expiration_date TIMESTAMP,
  
  -- New fields
  requires_code BOOLEAN DEFAULT true,
  is_main_offer BOOLEAN DEFAULT false,
  target_screenshot_url TEXT,
  
  -- Tracking
  clicks INTEGER DEFAULT 0,
  copies INTEGER DEFAULT 0,
  worked_votes INTEGER DEFAULT 0,
  failed_votes INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create domains table
CREATE TABLE domains (
  id SERIAL PRIMARY KEY,
  domain_name VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  primary_language VARCHAR(10) DEFAULT 'en',
  active_languages TEXT[],
  seo_flow_shared BOOLEAN DEFAULT false,
  seo_flow_shared_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create domain_coupons junction table
CREATE TABLE domain_coupons (
  id SERIAL PRIMARY KEY,
  domain_id INTEGER REFERENCES domains(id) ON DELETE CASCADE,
  coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(domain_id, coupon_id)
);

-- Create admin_users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_activity_log
CREATE TABLE admin_activity_log (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_expiration ON coupons(expiration_date);
CREATE UNIQUE INDEX idx_coupons_main_offer ON coupons(is_main_offer) WHERE is_main_offer = true AND status = 'active';
CREATE INDEX idx_domains_status ON domains(status);
CREATE INDEX idx_domain_coupons_domain_id ON domain_coupons(domain_id);
CREATE INDEX idx_admin_activity_log_admin_user_id ON admin_activity_log(admin_user_id);
CREATE INDEX idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);

-- Insert sample data
INSERT INTO domains (
  domain_name,
  display_name,
  primary_language,
  active_languages,
  status
) VALUES (
  'my-clone-phi-silk.vercel.app',
  'Memorable Clone',
  'en',
  ARRAY['en'],
  'active'
);

UPDATE domains
SET settings = '{"site_path":"/memorable","site_type":"coupon"}'::jsonb
WHERE domain_name = 'my-clone-phi-silk.vercel.app';

-- Insert sample coupon
INSERT INTO coupons (
  title,
  code,
  description,
  homepage_description,
  discount_amount,
  discount_type,
  min_order,
  affiliate_url,
  status,
  requires_code,
  is_main_offer,
  target_screenshot_url,
  expiration_date
) VALUES (
  'Exclusive DICloak Discount',
  'DICLOAK50',
  'Get exclusive discount on DICloak antidetect browser. Perfect for managing multiple accounts securely.',
  'On any order above $500 USD you get $50 off with our coupon. Click to activate.',
  '$50',
  'fixed',
  '$500 USD',
  'https://dicloak.com?ref=partner',
  'active',
  true,
  true,
  '/memorable.me/images/target-domain.png',
  NOW() + INTERVAL '30 days'
);

INSERT INTO domain_coupons (domain_id, coupon_id, is_active)
SELECT d.id, c.id, true
FROM domains d
JOIN coupons c ON c.code = 'DICLOAK50'
WHERE d.domain_name = 'my-clone-phi-silk.vercel.app';

-- Verify tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Create RPC function for incrementing counters safely
CREATE OR REPLACE FUNCTION increment_copies(coupon_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons SET copies = copies + 1 WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_clicks(coupon_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons SET clicks = clicks + 1 WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS blocks all direct anon/authenticated table access. The application uses
-- the server-only service role and returns explicit, minimal DTOs.
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

ALTER FUNCTION increment_copies(INTEGER) SET search_path = public, pg_temp;
ALTER FUNCTION increment_clicks(INTEGER) SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION increment_copies(INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION increment_clicks(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_copies(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION increment_clicks(INTEGER) TO service_role;
