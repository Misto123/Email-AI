-- Add new fields to coupons table

-- Main offer feature
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS is_main_offer BOOLEAN DEFAULT false;

-- Regular offer vs coupon code
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS requires_code BOOLEAN DEFAULT true;

-- Target domain screenshot URL
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS target_screenshot_url TEXT;

-- Only one main offer at a time (create unique partial index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_main_offer 
ON coupons(is_main_offer) 
WHERE is_main_offer = true AND status = 'active';

-- Update sample coupon
UPDATE coupons 
SET 
  is_main_offer = true,
  requires_code = true,
  target_screenshot_url = '/memorable.me/images/dicloak-screenshot.png'
WHERE code = 'DICLOAK50';

COMMENT ON COLUMN coupons.is_main_offer IS 'Only one active coupon can be main offer at a time';
COMMENT ON COLUMN coupons.requires_code IS 'If false, show "Offer opened in new window" instead of code';
COMMENT ON COLUMN coupons.target_screenshot_url IS 'Screenshot of target domain to show instead of QR code';
