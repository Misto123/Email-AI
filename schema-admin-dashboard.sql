-- Extend coupons table for homepage description
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS homepage_description TEXT;

-- Create domains table for multi-domain management
CREATE TABLE IF NOT EXISTS domains (
  id SERIAL PRIMARY KEY,
  domain_name VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  primary_language VARCHAR(10) DEFAULT 'en',
  active_languages TEXT[], -- Array of active language codes
  seo_flow_shared BOOLEAN DEFAULT false,
  seo_flow_shared_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'maintenance'
  settings JSONB DEFAULT '{}', -- Flexible settings storage
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create domain_coupons junction table (many-to-many)
CREATE TABLE IF NOT EXISTS domain_coupons (
  id SERIAL PRIMARY KEY,
  domain_id INTEGER REFERENCES domains(id) ON DELETE CASCADE,
  coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(domain_id, coupon_id)
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin', -- 'super_admin', 'admin', 'editor'
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- 'coupon', 'domain', 'settings'
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample domain
INSERT INTO domains (
  domain_name,
  display_name,
  primary_language,
  active_languages,
  status
) VALUES (
  'my-clone-phi-silk.vercel.app',
  'DICloak Coupon Site',
  'en',
  ARRAY['en'],
  'active'
) ON CONFLICT (domain_name) DO NOTHING;

-- Update sample coupon with homepage description
UPDATE coupons 
SET homepage_description = 'On any order above $500 USD you get $50 off with our coupon. Click to activate.'
WHERE code = 'DICLOAK50';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);
CREATE INDEX IF NOT EXISTS idx_domain_coupons_domain_id ON domain_coupons(domain_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_user_id ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);
