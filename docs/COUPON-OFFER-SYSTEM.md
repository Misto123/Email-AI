# Multi-Site Coupon/Offer System - Implementation Guide

## Overview

The multi-site platform now includes a flexible coupon and offer system that supports:

1. **Dynamic site branding** (custom logos, titles, colors)
2. **Two offer types**:
   - **Unique Code**: Shows coupon code immediately (for affiliate programs that track copy-paste)
   - **Regular Offer**: Requires click to activate (opens affiliate link in current window)
3. **Comprehensive tracking** (clicks, conversions, revenue)
4. **Admin dashboard** for managing offers

---

## Offer Types Explained

### 1. Unique Code Offers (`unique_code`)

**Use Case:** When affiliate commissions are awarded even if the user copy-pastes the coupon code directly.

**Behavior:**
- Coupon code is displayed immediately on the page
- User can click "Copy code securely" to copy to clipboard
- Clicking "Activate offer" tracks the activation and opens affiliate link
- Best for: Discount codes, promo codes, referral codes

**Example:**
```
Title: Get $50 off Memorable
Discount: $50
Coupon Code: SAVE50NOW
Affiliate URL: https://memorable.me/en?ref=affiliate
```

**User Flow:**
1. User sees "$50 off with this coupon"
2. User clicks "Get $50 off" button
3. Modal shows coupon code "SAVE50NOW"
4. User clicks "Copy code securely" → code copied
5. User clicks "Activate offer" → opens affiliate link in same window

### 2. Regular Offers (`regular`)

**Use Case:** When you need users to click through your affiliate link first for proper tracking.

**Behavior:**
- No coupon code shown upfront
- Clicking "Activate offer" immediately opens affiliate link
- Tracks click and redirects in current window
- Best for: Direct discounts, automatic promos, free shipping

**Example:**
```
Title: Free Shipping on All Orders
Discount: Free Shipping
Affiliate URL: https://memorable.me/en?ref=affiliate-freeship
```

**User Flow:**
1. User sees "Free Shipping with this offer"
2. User clicks "Activate offer" button
3. Activation tracked → immediately redirects to affiliate URL

---

## Database Schema

### New Tables

#### `site_offers`
Main offers configuration for each site.

```sql
CREATE TABLE site_offers (
  id UUID PRIMARY KEY,
  site_id UUID REFERENCES sites(id),
  
  -- Offer Details
  title TEXT NOT NULL,
  description TEXT,
  modal_description TEXT,
  discount_amount TEXT NOT NULL,
  
  -- Offer Type
  offer_type TEXT NOT NULL,           -- 'unique_code' | 'regular'
  coupon_code TEXT,                   -- Required for unique_code type
  
  -- URLs
  affiliate_url TEXT NOT NULL,
  target_screenshot_url TEXT,
  
  -- Conditions
  min_order TEXT,
  expiration_date TIMESTAMPTZ,
  
  -- Display
  is_main_offer BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Tracking
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### `offer_activations`
Tracks when users click/activate offers.

```sql
CREATE TABLE offer_activations (
  id UUID PRIMARY KEY,
  offer_id UUID REFERENCES site_offers(id),
  activated_at TIMESTAMPTZ,
  user_ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  session_id TEXT,
  converted BOOLEAN DEFAULT false,
  conversion_amount DECIMAL(10,2),
  converted_at TIMESTAMPTZ
);
```

### Extended `site_config`

Added columns for dynamic branding:

```sql
ALTER TABLE site_config ADD COLUMN
  title_template TEXT DEFAULT '{shop_name}',
  title_suffix TEXT,
  logo_text TEXT,
  logo_style JSONB DEFAULT '{}';
```

---

## API Endpoints

### Public Endpoints (Frontend)

#### `POST /api/offers/activate`
Track offer activation/click.

**Request:**
```json
{
  "offerId": "uuid",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "activationId": "uuid",
  "offerType": "unique_code",
  "couponCode": "SAVE50NOW",      // Only for unique_code
  "affiliateUrl": "https://..."    // For both types
}
```

#### `POST /api/offers/reveal`
Reveal coupon code (for unique_code offers only).

**Request:**
```json
{
  "offerId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "code": "SAVE50NOW"
}
```

### Admin Endpoints

All admin endpoints require `x-admin-key` header.

#### `GET /api/admin/sites/:siteId/offers`
List all offers for a site.

**Query params:**
- `includeInactive=true` - Include paused/expired offers
- `includeStats=true` - Include click/conversion stats

#### `POST /api/admin/sites/:siteId/offers`
Create new offer.

**Request:**
```json
{
  "title": "Get $50 off Memorable",
  "description": "Save $50 on your first order",
  "modalDescription": "Use code SAVE50NOW at checkout",
  "discountAmount": "$50",
  "offerType": "unique_code",
  "couponCode": "SAVE50NOW",
  "affiliateUrl": "https://memorable.me/en?ref=affiliate",
  "targetScreenshotUrl": "/images/screenshot.png",
  "minOrder": "$100",
  "expirationDate": "2024-12-31T23:59:59Z",
  "isMainOffer": true,
  "displayOrder": 0
}
```

#### `GET /api/admin/offers/:offerId`
Get offer details.

#### `PUT /api/admin/offers/:offerId`
Update offer.

#### `DELETE /api/admin/offers/:offerId`
Delete offer.

---

## Frontend Components

### `<MainOffer />`
Main offer display component that handles both offer types.

**Usage:**
```tsx
import { MainOffer } from '@/components/memorable/MainOffer';
import { getMainOffer } from '@/lib/offers/db';

const offer = await getMainOffer(siteId);
if (offer) {
  <MainOffer offer={offer} />
}
```

### `<DynamicHeader />`
Header with configurable logo and title.

**Usage:**
```tsx
import { DynamicHeader } from '@/components/memorable/DynamicHeader';
import { getSiteBranding } from '@/lib/sites/branding';

const siteInfo = await getSiteBranding(siteId);
<DynamicHeader 
  branding={siteInfo?.branding}
  siteName={siteInfo?.siteName}
/>
```

---

## Database Functions

### `get_main_offer(site_id)`
Get the main active offer for a site.

```sql
SELECT * FROM get_main_offer('uuid');
```

### `track_offer_activation(offer_id, user_ip, user_agent, referrer, session_id)`
Track offer click/activation.

```sql
SELECT track_offer_activation(
  'offer-uuid',
  '192.168.1.1',
  'Mozilla/5.0...',
  'https://google.com',
  'session-123'
);
```

---

## Configuration Examples

### Example 1: Unique Code Offer

Perfect for when affiliate programs track coupon codes even when copy-pasted.

```json
{
  "title": "Get $50 off Memorable",
  "description": "Create unforgettable group gifts with a $50 discount",
  "modalDescription": "Use this code at checkout to save $50",
  "discountAmount": "$50",
  "offerType": "unique_code",
  "couponCode": "FRIEND50",
  "affiliateUrl": "https://memorable.me/en?ref=youraffid",
  "minOrder": "$100",
  "isMainOffer": true
}
```

### Example 2: Regular Offer

Perfect for click-tracking or automatic discounts.

```json
{
  "title": "Free Shipping on All Orders",
  "description": "No coupon needed - discount applied automatically",
  "modalDescription": "Click to activate free shipping",
  "discountAmount": "Free Shipping",
  "offerType": "regular",
  "affiliateUrl": "https://memorable.me/en?ref=freeship",
  "isMainOffer": false,
  "displayOrder": 1
}
```

### Example 3: Dynamic Branding

Configure custom logo and title for each site.

```json
{
  "titleTemplate": "{shop_name} - Exclusive Discount",
  "titleSuffix": "Coupon Code",
  "logoText": "M",
  "logoStyle": {
    "bgColor": "#163300",
    "textColor": "#fff",
    "fontSize": 32,
    "fontWeight": "bold",
    "borderRadius": "12px"
  }
}
```

---

## Setup Instructions

### 1. Apply Database Migration

```bash
# Apply the coupon/offer system migration
node scripts/apply-migrations.mjs
```

This creates:
- `site_offers` table
- `offer_activations` table
- Updates to `site_config`
- Helper functions

### 2. Create Your First Offer

Via API:

```bash
curl -X POST http://localhost:3000/api/admin/sites/memorable-me/offers \
  -H "x-admin-key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Get $50 off Memorable",
    "description": "Save $50 on your first Memorable gift",
    "modalDescription": "Use code SAVE50NOW at checkout",
    "discountAmount": "$50",
    "offerType": "unique_code",
    "couponCode": "SAVE50NOW",
    "affiliateUrl": "https://memorable.me/en?ref=affiliate",
    "isMainOffer": true
  }'
```

### 3. Configure Site Branding

Update site config to customize logo and title:

```bash
curl -X PUT http://localhost:3000/api/admin/sites/memorable-me/config \
  -H "x-admin-key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "titleTemplate": "Memorable - {coupon_amount} Discount",
    "logoText": "M"
  }'
```

### 4. Test the Offer

1. Start dev server: `npm run dev`
2. Visit site: `http://localhost:3000`
3. You should see the main offer displayed
4. Click "Get $50 off" to test the flow

---

## Tracking & Analytics

### View Offer Statistics

```bash
# Get stats for a specific offer
curl http://localhost:3000/api/admin/offers/uuid?includeStats=true \
  -H "x-admin-key: your-key"

# Get all offers for a site with stats
curl http://localhost:3000/api/admin/sites/site-id/offers?includeStats=true \
  -H "x-admin-key: your-key"
```

### Metrics Tracked

- **Clicks**: Total activations
- **Conversions**: Successful purchases (requires webhook integration)
- **Conversion Rate**: conversions / clicks
- **Revenue**: Total conversion value
- **Average Order Value**: revenue / conversions

---

## Migration from Old System

If you have an existing offer system (like `memorable_coupons` table):

1. Apply new migration: `003_coupon_offer_system.sql`
2. Migrate data:

```sql
INSERT INTO site_offers (
  site_id, title, description, discount_amount,
  offer_type, coupon_code, affiliate_url,
  is_main_offer, status
)
SELECT 
  (SELECT id FROM sites WHERE site_id = 'memorable-me'),
  title,
  homepage_description,
  discount_amount,
  CASE WHEN requires_code THEN 'unique_code' ELSE 'regular' END,
  code,
  affiliate_url,
  is_main_offer,
  'active'
FROM memorable_coupons;
```

3. Update imports in your code:
   - `from '@/lib/memorable-offers'` → `from '@/types/offer'`
   - `getMemorableMainOffer()` → `getMainOffer(siteId)`

---

## Best Practices

### Security

- ✅ Never expose admin API key to frontend
- ✅ Use server-side data fetching for offers
- ✅ Validate offer type before revealing codes
- ✅ Hash user IPs for privacy

### Performance

- ✅ Cache offers in Redis for high traffic
- ✅ Use database indexes on `site_id`, `status`, `is_main_offer`
- ✅ Lazy-load offer statistics

### UX

- ✅ Show coupon code immediately for `unique_code` type
- ✅ Use clear CTAs: "Copy code" vs "Activate offer"
- ✅ Display expiration countdown prominently
- ✅ Track activations for analytics

---

## Troubleshooting

### Offer not showing

```bash
# Check if offer exists and is active
SELECT * FROM site_offers 
WHERE site_id = (SELECT id FROM sites WHERE site_id = 'memorable-me')
AND status = 'active';
```

### Code not copying

- Check browser clipboard permissions
- Ensure HTTPS in production
- Test with different browsers

### Tracking not working

- Verify API endpoint is accessible
- Check network tab for errors
- Ensure `keepalive: true` in fetch options

---

## Next Steps

1. ✅ Apply migration
2. ✅ Create test offers via API
3. ✅ Configure site branding
4. ✅ Test both offer types
5. 🔄 Build admin dashboard UI
6. 🔄 Add conversion tracking webhooks
7. 🔄 Implement A/B testing

---

## Files Created/Modified

**New Files:**
- `supabase/migrations/003_coupon_offer_system.sql`
- `src/types/offer.ts`
- `src/lib/offers/db.ts`
- `src/lib/sites/branding.ts`
- `src/app/api/offers/activate/route.ts`
- `src/app/api/offers/reveal/route.ts`
- `src/app/api/admin/sites/[siteId]/offers/route.ts`
- `src/app/api/admin/offers/[offerId]/route.ts`
- `src/components/memorable/DynamicHeader.tsx`

**Modified Files:**
- `src/components/memorable/MainOffer.tsx`
- `src/app/memorable/page.tsx`

---

**Status:** ✅ Core system complete, ready for testing and admin UI development
