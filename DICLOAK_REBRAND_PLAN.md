# DICloak Coupon Code Website - Rebrand Implementation Plan

## Project Overview
Transform the current memorable.me group gifting clone into **dicloakcouponcode.com** - a single-brand, exact-match-domain (EMD) coupon site focused on DICloak antidetect browser discount codes.

## Core Architecture Changes

### 1. Site Structure (13 Routes)
```
/ (pillar - home)
/best-dicloak-coupon-code-promo-codes (hub)
/dicloak-promo-code (money spoke)
/dicloak-referral-code (money spoke)
/dicloak-bonus-code (money spoke)
/dicloak-free-money-code (money spoke)
+ 7 supporting articles
```

### 2. Design System Updates

**Color Palette:**
- Primary: Professional blue/purple (trust, tech)
- Accent: Orange/coral (urgency, savings)
- Success: Green (verified, active codes)
- Neutral: Clean grays for readability

**Typography:**
- Headlines: Inter/Plus Jakarta Sans (modern, clean)
- Body: Libre Franklin (readable, professional)
- Accent: Lora for emphasis

**Remove:**
- All group gifting imagery
- Celebration/party animations
- Heart/gift emojis
- Social proof about "pots" and contributions

**Add:**
- Discount percentage badges
- "Verified" checkmarks
- Urgency timers (code expiration)
- Before/after pricing comparisons
- Trust signals (tested, active, official)

### 3. Component Replacements

| Old Component | New Component | Purpose |
|--------------|---------------|---------|
| Hero (group gifting) | Hero (coupon code) | Primary CTA: reveal code |
| ActivityTicker (contributions) | CodeActivityTicker | Real-time code claims |
| PotShowcase | CodeVariantsShowcase | Promo/referral/bonus comparison |
| Testimonials (pots) | Testimonials (savings) | User testimonials about discounts |
| Stats (contributions) | Stats (savings) | Total $ saved, active codes, users |
| Features (create pot) | Features (how to apply) | Step-by-step code application |

### 4. SEO Implementation Requirements

**Freshness Token System:**
```javascript
// Replace {{monthYear}} at render time
const currentMonth = new Date().toLocaleDateString('en-US', { 
  month: 'long', 
  year: 'numeric' 
});
// "August 2026"
```

**Code Reveal Pattern:**
```javascript
// NEVER print code as text
<button onClick={() => revealCodeInDialog()}>
  Reveal Code & Visit DICloak
</button>
```

**Internal Linking (30/30/40 Rule):**
- 30% links → Homepage (pillar)
- 30% links → Hub page
- 40% links → Sibling pages (contextual)

**Schema Types to Implement:**
- Blog (homepage with blogPost list)
- Article (all content pages)
- WebPage
- Organization (DICloak brand)
- Person (author)
- FAQPage (with Question/Answer)

### 5. Content Strategy

**Pillar Page (/):**
- H1: "DICloak Coupon Code"
- Primary CTA: "Get Code" (reveals in dialog)
- Current month verification badge
- FAQ block
- Plan comparison table
- Quick claim steps

**Hub Page:**
- Compare all code variants side-by-side
- Table: Type | Discount | Valid Until | Terms
- Links to all 4 money spokes
- "Which code is right for you?" decision tree

**Money Spokes (4 pages):**
1. **Promo Code** - focus on checkout process
2. **Referral Code** - focus on dual-sided benefits
3. **Bonus Code** - focus on terms and limits
4. **Free Money Code** - focus on legitimate vs fake offers

**Supporting Articles (7+ pages):**
- How to apply guide
- DICloak pricing breakdown
- Comparison vs competitors (AdsPower, Multilogin, GoLogin)
- Is DICloak legit/safe?
- Fake code warnings
- Subscription savings tips
- Best deal timing

### 6. Conversion Architecture

**Click-to-Reveal Dialog:**
```
[Button: Get DICloak Code]
  ↓ (onClick)
[Modal appears]
  - Code: DICLOAK20 (now visible)
  - "Copy Code" button
  - "Visit DICloak & Apply" CTA
  - Link: https://dicloak.com/?ref=... (affiliate)
```

**Benefits:**
- Keeps user on site (no code scraping)
- Tracks conversion intent
- Protects affiliate commission
- Prevents code syndication

### 7. Technical Implementation Checklist

- [ ] Update site metadata (title, description, OG tags)
- [ ] Implement month/year token replacement
- [ ] Build code reveal dialog component
- [ ] Create 13 route pages with unique content
- [ ] Add structured data (Blog, Article, FAQPage, etc.)
- [ ] Implement 30/30/40 internal linking
- [ ] Build comparison tables
- [ ] Add trust badges and verification signals
- [ ] Create urgency elements (expiration timers)
- [ ] Remove all memorable.me branding
- [ ] Update color scheme to coupon site palette
- [ ] Add before/after pricing displays
- [ ] Implement "tested today" freshness badges
- [ ] Build competitor comparison components
- [ ] Add FAQ accordion with schema markup

### 8. Animations to Keep/Modify

**Keep (with modification):**
- ScrollReveal (professional fade-ins)
- Number counters ($ saved stats)
- Hover effects on cards (subtle)

**Remove:**
- Confetti celebrations
- Floating party emojis
- Bouncing gift animations
- Playful microinteractions

**Add:**
- Progress bars (savings potential)
- Countdown timers (code expiration)
- Badge pulses (verified, new, expiring soon)
- Copy-to-clipboard success feedback

### 9. Key Differences from Memorable.me

| Aspect | Memorable.me | DICloak Coupon |
|--------|--------------|----------------|
| Tone | Joyful, celebratory | Professional, helpful |
| CTA | Create a pot | Reveal code |
| Social Proof | Contributions | Savings achieved |
| Urgency | None | Expiration dates |
| Content Type | Features | How-to + comparison |
| Conversion | Start using | Click affiliate link |
| Brand Voice | Warm, friendly | Trustworthy, expert |

### 10. Phase 1 Priority (MVP)

1. Homepage with code reveal
2. Hub page with variant comparison
3. 4 money spoke pages (promo/referral/bonus/free)
4. Basic FAQ section
5. Header + Footer
6. Code reveal dialog
7. Month/year token system
8. Proper schema markup

### 11. Phase 2 Expansion

1. 7 supporting articles
2. Competitor comparison pages
3. Advanced FAQ pages
4. Comment system for social proof
5. Email capture for code updates
6. Multi-site template system

## Next Steps

Ready to start implementation? I will:

1. Create new color scheme and design tokens
2. Build Hero component with code reveal CTA
3. Create code reveal dialog
4. Build comparison table components
5. Implement 13 routes with proper metadata
6. Add schema markup
7. Build internal linking system
8. Test and verify SEO compliance

This transformation maintains the high-quality animations and interactions but pivots completely to the coupon code business model with proper SEO architecture for ranking commercial-intent queries.
