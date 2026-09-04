# memorable.me Page Topology

**URL:** https://memorable.me  
**Date:** 2026-05-08  
**Viewport surveyed:** 1280x800 (desktop)

## Overall Page Structure

The page is a single-page marketing site with a clean, modern design. Layout is a standard vertical flow with full-width sections.

## Section Inventory (Top to Bottom)

### 1. Header / Navigation
- **Type:** Fixed/sticky overlay (appears to stay at top on scroll)
- **Position:** Top of page, overlays content
- **Z-index:** High (stays above all content)
- **Components:** Logo (left), Navigation links (center/right), CTA button
- **Interaction model:** Static positioning, possible scroll behavior (needs verification)
- **Key elements:**
  - memorable.me logo/wordmark
  - Navigation: Features, Pricing, About, etc.
  - "Get Started" or similar CTA button

### 2. Hero Section
- **Type:** Full-width banner with centered content
- **Position:** Top of page flow, immediately below header
- **Visual composition:**
  - Large heading text
  - Subheading/description text
  - CTA button(s)
  - Background: Light/neutral color
- **Interaction model:** Static display
- **Key text:** Main value proposition headline

### 3. Features/Benefits Section (Cards)
- **Type:** Grid or flex layout with multiple cards
- **Position:** Below hero
- **Visual composition:**
  - Multiple feature cards (appears to be 3-4 cards)
  - Each card has icon/illustration, title, description
  - Consistent spacing and styling
- **Interaction model:** Static cards, possible hover states
- **Layout:** Responsive grid (likely 3 columns desktop → 1-2 columns mobile)

### 4. "How It Works" or Process Section
- **Type:** Numbered steps or timeline
- **Position:** Mid-page
- **Visual composition:**
  - Step indicators (numbers or icons)
  - Titles and descriptions for each step
  - Possible illustrations/screenshots
- **Interaction model:** Static display

### 5. Social Proof / Testimonials Section
- **Type:** Quote cards or testimonial display
- **Position:** Mid-page
- **Visual composition:**
  - User quotes/testimonials
  - Possible avatar images
  - Names and titles
- **Interaction model:** Static or carousel (needs verification)

### 6. "Collect" Section
- **Type:** Feature showcase with image/mockup
- **Position:** Lower mid-page
- **Visual composition:**
  - Heading "Collect"
  - Description text
  - Visual mockup or illustration
  - Split layout (text + image)
- **Interaction model:** Static display

### 7. "Give" Section
- **Type:** Feature showcase with image/mockup
- **Position:** Lower mid-page, after Collect
- **Visual composition:**
  - Heading "Give"
  - Description text
  - Visual mockup or illustration
  - Split layout (text + image, possibly reversed from Collect)
- **Interaction model:** Static display

### 8. Final CTA Section
- **Type:** Full-width banner with centered CTA
- **Position:** Near bottom, before footer
- **Visual composition:**
  - Large heading
  - Subtext
  - Primary CTA button
  - Possibly colored background (accent color)
- **Interaction model:** Static display with button link

### 9. Footer
- **Type:** Multi-column footer
- **Position:** Bottom of page
- **Visual composition:**
  - Logo/branding
  - Navigation links (columns: Product, Company, Legal, etc.)
  - Social media links
  - Copyright text
  - Possible newsletter signup
- **Interaction model:** Static links

## Behavioral Notes

### Scroll Behaviors Observed:
- Smooth scrolling feel (possibly using smooth scroll library or CSS)
- No obvious parallax effects detected
- No scroll-snap behavior observed
- Header may have scroll-triggered behavior (needs verification with scroll test)

### Interactive Elements:
- All buttons likely have hover states
- Links have hover effects
- Cards may have subtle hover animations
- No modals or overlays observed on initial load

### Responsive Breakpoints (Estimated):
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

## Z-Index Layers:
1. Header/Navigation (highest)
2. Page content (normal flow)
3. Background elements (lowest)

## Dependencies:
- Each section is independent
- Header overlays all content
- No complex component dependencies observed

## Next Steps:
1. Extract exact CSS values for each section
2. Download all images and assets
3. Extract color palette and typography
4. Create component specifications for each section
5. Build components following this topology
