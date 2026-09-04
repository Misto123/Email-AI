-- Create coupons table for admin panel management

CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  discount_amount VARCHAR(50) NOT NULL,
  discount_type VARCHAR(20) DEFAULT 'fixed', -- 'fixed' or 'percentage'
  min_order VARCHAR(50),
  affiliate_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active' or 'inactive'
  expiration_date TIMESTAMP,
  clicks INTEGER DEFAULT 0,
  copies INTEGER DEFAULT 0,
  worked_votes INTEGER DEFAULT 0,
  failed_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on code for fast lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);

-- Insert sample coupon for testing
INSERT INTO coupons (
  title, 
  code, 
  description, 
  discount_amount, 
  min_order, 
  affiliate_url
) VALUES (
  'Exclusive DICloak Discount',
  'DICLOAK50',
  'On any order above $500 USD you get $50 off with our coupon. Click to activate.',
  '$50',
  '$500 USD',
  'https://dicloak.com?ref=partner'
) ON CONFLICT (code) DO NOTHING;
