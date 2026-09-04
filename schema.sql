-- DICloak Blog Database Schema
-- Run this in your Neon/Vercel Postgres database console

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_name VARCHAR(100) DEFAULT 'DICloak Team',
  cover_image VARCHAR(500),
  published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  meta_description VARCHAR(160),
  meta_keywords VARCHAR(255)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_created_at ON blog_posts(created_at DESC);

-- Sample blog post (optional - for testing)
INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, published, meta_description) 
VALUES (
  'How to Save Money on DICloak: Complete Guide',
  'how-to-save-money-on-dicloak',
  'Discover proven strategies to get the best deals on DICloak antidetect browser. Learn about discount codes, seasonal sales, and exclusive offers.',
  '# How to Save Money on DICloak: Complete Guide

## Introduction

DICloak is a powerful antidetect browser, but it doesn''t have to break the bank. In this comprehensive guide, we''ll show you exactly how to maximize your savings.

## 1. Use Verified Coupon Codes

The easiest way to save is by using verified coupon codes. Our site always features the latest working codes:

- **DICLOAK20**: Get 20% off all plans
- **NEWYEAR2026**: Special New Year discount
- **AFFILIATE15**: 15% off for new users

## 2. Choose Annual Billing

Annual billing can save you up to 30% compared to monthly plans:

- Monthly: $49/month = $588/year
- Annual: $420/year = **$168 saved!**

## 3. Take Advantage of Seasonal Sales

DICloak typically offers special discounts during:

- Black Friday / Cyber Monday (up to 50% off)
- New Year (20-30% off)
- Summer Sale (15-25% off)

## 4. Referral Program

Earn credits by referring friends:

- You get: 20% commission
- Friend gets: 10% discount
- Win-win situation!

## 5. Bundle with Team Plans

If you''re working with a team, bundle plans for additional savings:

- 3-5 users: 10% off
- 6-10 users: 15% off
- 11+ users: 20% off

## Conclusion

By combining these strategies, you can save hundreds of dollars on your DICloak subscription. Start by using our verified coupon codes above!

*Last updated: January 2026*',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
  true,
  'Learn how to save money on DICloak antidetect browser with our complete guide featuring discount codes, tips, and exclusive offers.'
) ON CONFLICT (slug) DO NOTHING;
