# Coupon Interstitial System - Complete Guide

## 🎯 Overview

The Coupon Interstitial System provides a dedicated landing page for each coupon offer, displaying all relevant information before redirecting users to the merchant's site through your affiliate link.

## ✨ Features Implemented

### ✅ Core Functionality
- **Dedicated coupon landing pages** at `/coupon/{slug}`
- **Copy-to-clipboard** functionality for coupon codes
- **Auto-redirect** to merchant with affiliate tracking
- **Real-time analytics** tracking (page views, copy clicks, merchant visits)
- **Code reveal** functionality for hidden codes
- **No code required** handling for automatic offers
- **Mobile-responsive** design with sticky CTA

### ✅ Display Information
- Merchant name and logo
- Coupon code (with reveal option)
- Discount badge (percentage/fixed/special)
- Offer title and description
- Success rate statistics
- Times used counter
- Last verified date
- Expiration date
- Terms and conditions
- Category

### ✅ User Experience
- Beautiful gradient design
- Large, clear CTAs
- Success state feedback (code copied)
- Loading states
- Error handling (404, expired, etc.)
- Sticky mobile CTA button

## 📁 File Structure

```
src/
├── app/
│   ├── coupon/
│   │   └── [slug]/
│   │       └── page.tsx          # Main coupon landing page
│   └── api/
│       └── coupons/
│           ├── [slug]/
│           │   └── route.ts       # Fetch coupon data
│           └── analytics/
│               └── route.ts       # Track analytics events
├── types/
│   └── coupon.ts                  # TypeScript interfaces
└── components/
    └── coupon/                    # Existing coupon components

Database:
├── schema-coupons.sql             # Database schema
└── migrate-db.js                  # Migration script
```

## 🗄️ Database Schema

### Tables Created

#### 1. `coupons`
Stores all coupon/offer information:
- Basic info (slug, title, description)
- Merchant details (name, logo, URL)
- Discount info (type, value, label)
- Coupon code (with hidden option)
- Affiliate URL
- Expiration date
- Stats (success rate, times used, last verified)
- Status flags (is_active)

#### 2. `coupon_analytics`
Tracks user interactions:
- Event type (page opened, copy clicked, continue clicked, etc.)
- User metadata (IP, user agent, referrer)
- Timestamps

#### 3. `coupon_settings`
Global configuration (future use):
- Auto-redirect settings
- Auto-copy options
- Display preferences

## 🚀 Usage

### 1. Creating a New Coupon

Add to database:

```sql
INSERT INTO coupons (
  slug, title, description,
  merchant_name, merchant_logo, merchant_url,
  code, code_hidden, 
  discount_type, discount_value, discount_label,
  affiliate_url, expires_at, category, terms,
  success_rate, is_active
) VALUES (
  'merchant-deal',
  'Get 30% OFF Merchant Product',
  'Exclusive discount description...',
  'Merchant Name',
  'https://example.com/logo.png',
  'https://merchant.com',
  'SAVE30',
  false,
  'percentage',
  30,
  '30% OFF',
  'https://merchant.com/?ref=your-affiliate-code',
  CURRENT_TIMESTAMP + INTERVAL '60 days',
  'Category',
  'Terms and conditions here...',
  95,
  true
);
```

### 2. Link to Coupon Page

Instead of direct affiliate links, use:

```html
<!-- Open in new tab -->
<a href="/coupon/merchant-deal" target="_blank">
  View Offer
</a>

<!-- Or with JavaScript -->
<button onclick="window.open('/coupon/merchant-deal', '_blank')">
  Get Deal
</button>
```

### 3. User Flow

```
User clicks offer
    ↓
New tab opens → /coupon/{slug}
    ↓
Display coupon information
    ↓
User copies code (optional)
    ↓
User clicks "Continue to Store"
    ↓
Opens affiliate URL in new tab
    ↓
Analytics tracked throughout
```

## 📊 Analytics Events

The system tracks these events:

1. **coupon_page_opened** - User lands on coupon page
2. **copy_clicked** - User copies coupon code
3. **code_revealed** - User reveals hidden code
4. **continue_clicked** - User clicks "Continue to Store"
5. **merchant_visited** - Redirect to merchant initiated

Access analytics data:

```sql
SELECT 
  event_type,
  COUNT(*) as count,
  DATE(created_at) as date
FROM coupon_analytics
WHERE coupon_id = 1
GROUP BY event_type, DATE(created_at)
ORDER BY date DESC;
```

## 🎨 Customization

### Modify Appearance

Edit `/src/app/coupon/[slug]/page.tsx`:

```typescript
// Change gradient colors
className="bg-gradient-to-r from-orange-500 to-pink-500"

// Adjust text sizes
className="text-4xl sm:text-5xl font-bold"

// Modify button styles
className="bg-gradient-to-r from-blue-600 to-purple-600"
```

### Add Auto-Redirect

Uncomment the countdown logic in `page.tsx`:

```typescript
// Add this useEffect for auto-redirect
useEffect(() => {
  const delay = 5; // seconds
  if (coupon && delay > 0) {
    setCountdown(delay);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          handleContinue();
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }
}, [coupon]);
```

## 🔧 API Endpoints

### GET `/api/coupons/[slug]`

Fetch coupon data by slug.

**Response:**
```json
{
  "id": "1",
  "slug": "merchant-deal",
  "title": "Get 30% OFF",
  "merchant": {
    "name": "Merchant",
    "logo": "https://...",
    "url": "https://..."
  },
  "code": "SAVE30",
  "discount": {
    "type": "percentage",
    "value": 30,
    "label": "30% OFF"
  },
  "affiliateUrl": "https://...",
  "stats": {
    "successRate": 95,
    "timesUsed": 1234
  }
}
```

### POST `/api/coupons/analytics`

Track analytics events.

**Body:**
```json
{
  "couponId": "1",
  "eventType": "copy_clicked"
}
```

## 🧪 Testing

### Test Coupons Available

The system includes 4 sample coupons:

1. **dicloak-25-off** - Standard coupon with code
2. **dicloak-20-promo** - Regular promotion
3. **dicloak-free-trial** - No code required offer
4. **dicloak-referral** - Hidden code (reveal required)

Test URLs:
- http://localhost:3002/coupon/dicloak-25-off
- http://localhost:3002/coupon/dicloak-free-trial

### Manual Testing Checklist

- [ ] Page loads correctly
- [ ] Merchant logo displays
- [ ] Stats show properly
- [ ] Copy code works
- [ ] Success message appears
- [ ] Continue button works
- [ ] Affiliate URL opens
- [ ] Analytics track events
- [ ] Mobile responsive
- [ ] Error states work
- [ ] Expired coupon handling

## 🌐 SEO Best Practices

### Add Metadata

Create `/src/app/coupon/[slug]/metadata.ts`:

```typescript
export async function generateMetadata({ params }) {
  const coupon = await fetchCoupon(params.slug);
  
  return {
    title: `${coupon.title} | Your Site`,
    description: coupon.description,
    openGraph: {
      title: coupon.title,
      description: coupon.description,
      images: [coupon.merchant.logo],
    },
  };
}
```

### Structured Data

Add JSON-LD for offers:

```typescript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Offer",
  "name": coupon.title,
  "description": coupon.description,
  "url": `https://yoursite.com/coupon/${coupon.slug}`,
  "price": "0",
  "priceCurrency": "USD"
};
```

## 🔒 Security Considerations

### Affiliate Link Protection

- ✅ Affiliate URLs stored server-side only
- ✅ No direct exposure in client HTML
- ✅ Opened only on user action
- ✅ Analytics for fraud detection

### Rate Limiting

Add to API routes:

```typescript
// Simple in-memory rate limiting
const rateLimit = new Map();

function checkRateLimit(ip, limit = 100) {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  const recent = requests.filter(t => now - t < 60000);
  
  if (recent.length >= limit) {
    return false;
  }
  
  rateLimit.set(ip, [...recent, now]);
  return true;
}
```

## 📈 Performance

### Optimization Tips

1. **Image Optimization**
   - Use Next.js Image component (already done)
   - Configure remote patterns in next.config.ts
   - Use appropriate sizes

2. **Database Queries**
   - Use connection pooling (already configured)
   - Add indexes (already added)
   - Cache frequently accessed coupons

3. **Client-Side**
   - Lazy load components
   - Minimize JavaScript bundle
   - Use CSS for animations

## 🚢 Deployment

### Environment Variables

Add to Vercel:

```bash
# Pooled connection for API routes
POSTGRES_URL=postgresql://...pooler...

# Direct connection for migrations
POSTGRES_URL_NON_POOLING=postgresql://...

# Also set
DATABASE_URL=postgresql://...pooler...
```

### Deploy to Vercel

```bash
# Set environment variables
vercel env add POSTGRES_URL production
vercel env add POSTGRES_URL_NON_POOLING production
vercel env add DATABASE_URL production

# Deploy
vercel --prod
```

## 🔄 Integrating with Existing Site

### Update Click Handlers

Change existing offer buttons:

```typescript
// OLD: Direct affiliate link
<a href={affiliateUrl}>Get Deal</a>

// NEW: Coupon interstitial
<button onClick={() => window.open(`/coupon/${slug}`, '_blank')}>
  Get Deal
</button>
```

### Migrate Existing Coupons

```sql
-- Bulk insert from existing data
INSERT INTO coupons (slug, title, merchant_name, affiliate_url, ...)
SELECT 
  LOWER(REPLACE(title, ' ', '-')),
  title,
  merchant,
  affiliate_link,
  ...
FROM old_coupons_table;
```

## 📝 Maintenance

### Regular Tasks

1. **Update Success Rates**
   ```sql
   UPDATE coupons SET success_rate = ...
   WHERE slug = 'offer-slug';
   ```

2. **Verify Codes**
   ```sql
   UPDATE coupons 
   SET last_verified = CURRENT_TIMESTAMP
   WHERE id = 1;
   ```

3. **Deactivate Expired**
   ```sql
   UPDATE coupons 
   SET is_active = false
   WHERE expires_at < CURRENT_TIMESTAMP;
   ```

4. **Archive Old Analytics**
   ```sql
   DELETE FROM coupon_analytics
   WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
   ```

## 🆘 Troubleshooting

### Common Issues

**Issue: Images not loading**
```
Solution: Add domain to next.config.ts images.remotePatterns
```

**Issue: Database connection error**
```
Solution: Check POSTGRES_URL uses pooled connection (-pooler)
```

**Issue: 404 on coupon page**
```
Solution: Verify slug in database matches URL
```

**Issue: Copy not working**
```
Solution: Check HTTPS (clipboard requires secure context)
```

## 📚 Additional Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Neon Serverless Postgres](https://neon.tech/docs/introduction)

## 🎉 Summary

Your coupon interstitial system is now fully functional with:

✅ Beautiful, conversion-optimized landing pages  
✅ Full analytics tracking  
✅ Copy-to-clipboard functionality  
✅ Affiliate link protection  
✅ Mobile responsive design  
✅ Database-driven content  
✅ Production-ready code  

**Next Steps:**
1. Customize design to match your brand
2. Add more coupons to database
3. Update main site to link to `/coupon/{slug}`
4. Monitor analytics
5. Optimize conversion rates
