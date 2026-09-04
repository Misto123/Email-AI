# Hero Section Specification

## Overview
- **Target file:** `src/components/memorable/HeroSection.tsx`
- **Screenshot:** `docs/design-references/memorable.me/section-hero.png`
- **Interaction model:** Static - no animations or scroll-driven behaviors

## DOM Structure
```
<section class="hero">
  <div class="hero-container">
    <div class="hero-content">
      - Two decorative face images (positioned absolutely or in grid)
      - H1 heading
      - Subtitle paragraph
      - Feature list (4 items with checkmark icons)
      - CTA button
      - Payment method logos (Visa, Mastercard, Apple Pay)
    </div>
    <div class="hero-visual">
      - Phone mockup image
    </div>
  </div>
</section>
```

## Computed Styles (exact values from getComputedStyle)

### Section Container (.hero)
- height: 695px (desktop)
- padding: Likely 80px 24px (needs extraction)
- backgroundColor: rgb(255, 255, 255)
- display: flex or grid (two-column layout)

### Hero Layout
- **Desktop:** Two-column grid (text left ~50%, visual right ~50%)
- **Layout type:** CSS Grid or Flexbox
- **Alignment:** Center-aligned vertically
- **Max-width:** ~1200px container, centered

### Heading (H1)
- **Text:** "The online money pot, festive and supportive"
- fontSize: Estimated 48-56px (large display size)
- fontWeight: 700-800 (bold, Bricolage Grotesque)
- lineHeight: 1.1-1.2 (tight)
- color: rgb(22, 51, 0) - brand green
- marginBottom: 24px (estimated)
- font-family: var(--font-bricolage)
- text-wrap: balance (for better line breaks)

### Subtitle Paragraph
- **Text:** "To celebrate, help or support, gather your circle around a shared gesture that truly means something."
- fontSize: 18-20px (estimated)
- fontWeight: 400
- lineHeight: 1.6
- color: rgb(69, 71, 69) - secondary text
- marginBottom: 32px (estimated)
- maxWidth: 600px (to prevent overly long lines)

### Feature List (ul/li)
- marginBottom: 40px (estimated)
- List items with checkmark icons
- **Bullet items:**
  1. "**Free.** 0 commission, support us if you want to"
  2. "**Accessible.** No account needed, join via link and QR code"
  3. "**Global.** Bank cards from all over the world accepted"
  4. "**Secure.** Of course!"

### List Item Styles
- display: flex
- alignItems: flex-start OR center
- gap: 12px (between icon and text)
- marginBottom: 16px (between list items)
- fontSize: 16px
- color: rgb(34, 34, 34)
- **Strong text:** fontWeight: 600

### Checkmark Icon
- size: 24x24px
- color: rgb(22, 51, 0) - brand green
- Component: `<CheckIcon />` from icons.tsx

### CTA Button
- text: "Create a pot"
- Same styles as header CTA:
  - fontSize: 16px
  - fontWeight: 600
  - color: rgb(255, 255, 255)
  - padding: 12px 32px (larger padding than header)
  - backgroundColor: rgb(22, 51, 0)
  - borderRadius: 9999px
- marginBottom: 40px (estimated)
- Icon: <ArrowRightIcon /> after text (optional, check visual)

### Payment Logos Container
- display: flex
- gap: 16px
- alignItems: center

### Payment Logos
- **Visa:** `public/memorable.me/images/pay-visa.png` (height: ~32px)
- **Mastercard:** `public/memorable.me/images/pay-mastercard.png` (height: ~32px)
- **Apple Pay:** `public/memorable.me/images/pay-applepay.png` (height: ~32px)
- filter: grayscale(100%) opacity(60%) (muted appearance)
- hover: grayscale(0%) opacity(100%) (restore color on hover)

### Decorative Face Images
- **Face 1:** `public/memorable.me/images/face-1.png` (555x528px)
- **Face 2:** `public/memorable.me/images/face-2.png` (1110x1110px)
- **Positioning:** Absolute positioned behind or beside content
- **z-index:** -1 or low value (background decoration)
- Display sizes: ~80-120px diameter (scaled down)
- Opacity: possibly slightly reduced for subtle effect

### Phone Mockup (Right Visual)
- **Image:** `public/memorable.me/images/hero-phone.png` (666x1240px)
- Display height: ~500-600px (scaled proportionally)
- **Positioning:** Right side of hero, possibly overflowing bottom slightly

## States & Behaviors

### Static Section
- No fade-in animations
- No scroll-triggered effects
- No parallax
- **Implementation:** Pure CSS layout, no JavaScript needed

### Hover States
- **CTA Button:** Background darkens (same as header CTA)
- **Payment logos:** Color restoration on hover (optional enhancement)

## Assets
- Face decorations: `face-1.png`, `face-2.png`
- Phone mockup: `hero-phone.png`
- Payment logos: `pay-visa.png`, `pay-mastercard.png`, `pay-applepay.png`
- Icons: `CheckIcon` from `icons.tsx`

## Text Content (verbatim)

### Heading
"The online money pot, festive and supportive"

### Subtitle
"To celebrate, help or support, gather your circle around a shared gesture that truly means something."

### Features
1. "**Free.** 0 commission, support us if you want to"
2. "**Accessible.** No account needed, join via link and QR code"
3. "**Global.** Bank cards from all over the world accepted"
4. "**Secure.** Of course!"

### CTA
"Create a pot"

## Responsive Behavior
- **Desktop (1024px+):** Two-column layout, phone visible full size
- **Tablet (768px-1023px):** Two-column maintained OR start stacking, phone smaller
- **Mobile (< 768px):** Single column, heading smaller (32-36px), phone hidden or very small at bottom
- **Breakpoint:** Around 768px for major layout shift

## Layout Implementation Notes
- Use CSS Grid with `grid-template-columns: 1fr 1fr` on desktop
- Or Flexbox with `flex: 1` on each column
- Face images: `position: absolute` with careful placement, or CSS Grid area overlays
- Phone mockup: `position: relative` or grid placement, may need `overflow: visible` on container
- Content max-width: ~600px to prevent text being too wide

## Complexity Assessment
This is a **medium complexity** component due to:
- Two-column responsive layout
- Decorative images with positioning
- Multiple sub-elements with specific spacing
- **Recommendation:** Single builder agent can handle this
