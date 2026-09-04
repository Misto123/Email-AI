-- Coupon System Database Schema
-- Extends existing schema with coupon/offer functionality

-- Coupons/Offers table
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Merchant info
  merchant_name VARCHAR(255) NOT NULL,
  merchant_logo VARCHAR(500),
  merchant_url VARCHAR(500),
  
  -- Coupon details
  code VARCHAR(100), -- NULL if no code needed
  code_hidden BOOLEAN DEFAULT false,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed', 'special')),
  discount_value INTEGER, -- e.g., 20 for 20%, 30 for $30
  discount_label VARCHAR(100) NOT NULL, -- e.g., "20% OFF", "$30 Credit"
  
  -- Affiliate tracking
  affiliate_url TEXT NOT NULL,
  
  -- Metadata
  expires_at TIMESTAMP,
  category VARCHAR(100),
  terms TEXT,
  
  -- Stats
  success_rate INTEGER CHECK (success_rate >= 0 AND success_rate <= 100),
  times_used INTEGER DEFAULT 0,
  last_verified TIMESTAMP,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupon analytics events
CREATE TABLE IF NOT EXISTS coupon_analytics (
  id SERIAL PRIMARY KEY,
  coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupon page settings (single row config)
CREATE TABLE IF NOT EXISTS coupon_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  auto_redirect BOOLEAN DEFAULT false,
  auto_redirect_delay INTEGER DEFAULT 0 CHECK (auto_redirect_delay IN (0, 3, 5, 10)),
  auto_copy_code BOOLEAN DEFAULT false,
  show_success_rate BOOLEAN DEFAULT true,
  show_usage_stats BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupon_slug ON coupons(slug);
CREATE INDEX IF NOT EXISTS idx_coupon_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_expires ON coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_analytics_coupon ON coupon_analytics(coupon_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON coupon_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON coupon_analytics(created_at DESC);

-- Insert default settings
INSERT INTO coupon_settings (id, auto_redirect, auto_redirect_delay) 
VALUES (1, false, 0) 
ON CONFLICT (id) DO NOTHING;

-- Sample coupons for testing
INSERT INTO coupons (
  slug, title, description, 
  merchant_name, merchant_logo, merchant_url,
  code, code_hidden, discount_type, discount_value, discount_label,
  affiliate_url, expires_at, category, terms,
  success_rate, times_used, last_verified, is_active
) VALUES 
(
  'dicloak-25-off',
  'Get 25% OFF DICloak Antidetect Browser',
  'Exclusive discount on all DICloak plans. Save big on the most advanced antidetect browser for multi-accounting professionals.',
  'DICloak',
  'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=200',
  'https://dicloak.com',
  'DICLOAK25',
  false,
  'percentage',
  25,
  '25% OFF',
  'https://dicloak.com/?ref=exclusive25',
  CURRENT_TIMESTAMP + INTERVAL '30 days',
  'Antidetect Browser',
  'Valid on all plans. Cannot be combined with other offers. New users only.',
  95,
  327,
  CURRENT_TIMESTAMP,
  true
),
(
  'dicloak-20-promo',
  'DICloak Promo Code - 20% Discount',
  'Save 20% on your DICloak subscription with this verified promo code. Perfect for digital marketers and e-commerce professionals.',
  'DICloak',
  'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=200',
  'https://dicloak.com',
  'PROMO20',
  false,
  'percentage',
  20,
  '20% OFF',
  'https://dicloak.com/?ref=promo20',
  CURRENT_TIMESTAMP + INTERVAL '60 days',
  'Antidetect Browser',
  'Valid for monthly and annual plans.',
  92,
  589,
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  true
),
(
  'dicloak-free-trial',
  'DICloak Free 30-Day Trial + $30 Bonus',
  'No code required! Automatically activated special offer - start your free trial and get $30 in credits.',
  'DICloak',
  'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=200',
  'https://dicloak.com',
  NULL, -- No code needed
  false,
  'special',
  30,
  '$30 Free Credit',
  'https://dicloak.com/trial?ref=free30',
  NULL, -- No expiration
  'Free Trial',
  'New users only. Credit applied automatically after signup. No payment method required.',
  98,
  1243,
  CURRENT_TIMESTAMP - INTERVAL '1 hour',
  true
),
(
  'dicloak-referral',
  'Refer a Friend - Get 15% OFF',
  'Share DICloak with friends and both save! You get 15% off, they get 10% off their first purchase.',
  'DICloak',
  'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=200',
  'https://dicloak.com',
  'REFER15',
  true, -- Hidden until revealed
  'percentage',
  15,
  '15% OFF',
  'https://dicloak.com/referral?code=REFER15',
  CURRENT_TIMESTAMP + INTERVAL '90 days',
  'Referral',
  'Both referrer and referee must complete purchase to receive discounts.',
  88,
  156,
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  true
)
ON CONFLICT (slug) DO NOTHING;
