# Page Topology - memorable.me/en

## Overview
Single-page landing site with static header, scrolling content sections, and footer. No sticky navigation, no scroll-driven animations detected. Simple, clean layout focused on converting visitors to create a money pot.

## Page Structure (Top to Bottom)

### 1. Header (Static)
- **Position:** Static (not sticky/fixed)
- **Background:** White (#FFFFFF)
- **Height:** ~72px
- **Layout:** Horizontal flex container
- **Components:**
  - Logo (left) - links to home
  - Pricing link (center-left)
  - Language selector button with flag icon (right)
  - "Sign in" link (right)
  - "Create a pot" CTA button - primary green (right)
- **Responsive:** Likely collapses to hamburger menu on mobile
- **Z-index:** Normal flow, no overlay behavior
- **Interaction model:** Static - no state changes on scroll

### 2. Hero Section
- **Classes:** `.hero`
- **Height:** ~695px
- **Background:** White
- **Layout:** Two-column split (text left, visual right on desktop)
- **Components:**
  - Two decorative face emojis/illustrations (gradient circles with faces)
  - Main heading: "The online money pot, festive and supportive"
  - Subheading paragraph
  - 4-item bullet list with checkmarks (Free, Accessible, Global, Secure)
  - "Create a pot" CTA button
  - Payment method logos (Visa, Mastercard, Apple Pay)
  - Phone mockup showing the pot interface (right side)
- **Interaction model:** Static - no animations detected
- **Responsive:** Stacks to single column on mobile, phone mockup likely hidden or reduced

### 3. Fees Section
- **Classes:** `.section.section--tinted.fees`
- **ID:** `#fees`
- **Height:** ~810px
- **Background:** Tinted (light color, likely off-white or light blue)
- **Layout:** Centered content with comparison elements
- **Components:**
  - Section heading: "0 mandatory fees"
  - Subtitle paragraph explaining the supportive model
  - Likely fee comparison cards or pricing tiers
  - Visual elements showing the pricing structure
- **Interaction model:** Static
- **Responsive:** Content reflows on mobile

### 4. Share Row Section
- **Purpose:** Demonstrates sharing capabilities
- **Components:**
  - QR code image (400x400px)
  - Share buttons/options
  - Icons for social sharing
- **Interaction model:** Static display

### 5. Step 1 - Create and Share
- **Classes:** `.section.step-row`
- **Height:** ~624px
- **Background:** White
- **Layout:** Two-column (text + visual)
- **Content:**
  - "Step 1" label
  - Heading: "Create and share"
  - Description: "In 2 minutes your pot is created: add a goal, a countdown and a..."
  - Visual element (likely phone mockup or illustration)
- **Interaction model:** Static
- **Responsive:** Stacks vertically on mobile

### 6. Step 2 - Collect
- **Classes:** `.section.step-row.step-row--reverse`
- **Height:** ~609px
- **Background:** White
- **Layout:** Two-column REVERSED (visual left, text right)
- **Content:**
  - "Step 2" label
  - Heading: "Collect"
  - Description mentioning Stripe payment processing
  - Pay preview component with payer avatar
- **Interaction model:** Static
- **Responsive:** Stacks vertically on mobile (order may swap)

### 7. Step 3 - Give
- **Classes:** `.section.step-row`
- **Height:** ~352px
- **Background:** White
- **Layout:** Two-column (text + visual)
- **Content:**
  - "Step 3" label
  - Heading: "Give"
  - Description about album of messages and photos
  - Album image visual (currently 0x0, likely lazy-loaded)
- **Interaction model:** Static
- **Responsive:** Stacks vertically on mobile

### 8. Reviews/Social Proof Section
- **Classes:** `.section.section--tinted.reviews`
- **Height:** ~524px
- **Background:** Tinted
- **Layout:** Centered stats display
- **Content:**
  - Rating: "4.8"
  - "100+ reviews"
  - "8k+ Contributions"
  - "1k+" (another metric)
- **Interaction model:** Static
- **Responsive:** Stats may reflow or stack

### 9. FAQ Section
- **Classes:** `.section.faq-section`
- **Height:** ~646px
- **Background:** White
- **Layout:** Accordion-style FAQ list
- **Components:**
  - Section title: "Frequently asked questions" (left-aligned)
  - Multiple FAQ accordion items
  - Question: "What is Memorable and how does it wo..." (truncated)
- **Interaction model:** Click-driven accordions (expand/collapse)
- **Responsive:** Full-width accordion on mobile

### 10. Final CTA Section
- **Classes:** `.section.final-cta`
- **Height:** ~508px
- **Background:** Likely tinted or branded color
- **Layout:** Centered content with decorative elements
- **Components:**
  - Two decorative face illustrations (same as hero)
  - Motivational text: "For the moments that matter, the causes that bring us together..."
  - Final CTA button (likely "Create a pot")
- **Interaction model:** Static
- **Responsive:** Stacks content

### 11. Footer
- **Classes:** `.site-footer`
- **Background:** Likely dark or tinted
- **Layout:** Multi-column footer (typical site links structure)
- **Components:**
  - Memorable logo and brand
  - Footer navigation links
  - Legal links (privacy, terms, etc.)
  - Social media links
  - Copyright information
- **Interaction model:** Static
- **Responsive:** Stacks to single column on mobile

## Overall Page Layout

- **Container:** Full-width sections with centered content
- **Max-width:** Likely 1200-1400px for content
- **Scroll behavior:** Standard browser scroll (no smooth scroll library detected)
- **Z-index layers:** 
  - Base: All sections in normal flow
  - No fixed/sticky overlays detected
  - Possible modals for language selector dropdown
- **Animations:** Minimal - only notice/toast slide-up animation detected
- **Interactions:** 
  - Click: CTA buttons, links, FAQ accordions, language selector
  - Hover: Button states, link underlines
  - No scroll-driven behaviors detected

## Assets Distribution

### Images by Section:
- **Header:** Logo (1140x204px PNG), flag icon (800x800 SVG)
- **Hero:** Face-1 (555x528), Face-2 (1110x1110), Visa logo, Mastercard logo, Apple Pay logo, Phone mockup (666x1240)
- **Share Row:** QR code (400x400)
- **Step 3:** Album image (lazy-loaded)
- **Final CTA:** Face-1 and Face-2 (reused from hero)
- **Footer:** Logo (reused)

### SVG Icons:
- 25 inline SVGs total
- Checkmark icons (used in hero bullet list)
- Arrow right (used in CTAs)
- Plus circle, Edit, Link, Download, Shield
- All appear to be from Lucide or similar icon set

## Fonts

- **Primary:** "Bricolage Grotesque" (Google Fonts, variable weight 200-800)
- **Secondary:** "Schibsted Grotesk" (Google Fonts, weights 400-900, italic support)
- **Fallback:** Times (system)

## Color Palette (Extracted)

### Primary Colors:
- **Brand Green (Dark):** rgb(22, 51, 0) - primary CTAs, headings
- **Brand Green (Light/Tint):** rgba(22, 51, 0, 0.07) - light backgrounds
- **Background Cream:** rgb(252, 250, 247) - page background
- **White:** rgb(255, 255, 255) - section backgrounds
- **Black/Dark Gray:** rgb(34, 34, 34) - body text

### Accent Colors:
- **Blue (Light):** rgb(216, 236, 253), rgb(160, 223, 255) - accents, highlights
- **Orange:** rgb(213, 122, 14) - warnings/highlights
- **Green (Success):** rgb(31, 113, 56), rgb(159, 232, 112) - success states
- **Brown:** rgb(129, 83, 28) - secondary accents

### Gradients:
- **Blue gradient:** linear-gradient(90deg, rgb(238, 250, 255) 0%, rgb(211, 242, 255) 50%, rgb(232, 241, 255) 100%)

### UI Colors:
- **Borders:** rgba(13, 14, 11, 0.12), rgb(231, 231, 231)
- **Muted backgrounds:** rgb(250, 250, 250), rgb(243, 243, 243), rgb(247, 247, 247)
- **Gray text:** rgb(69, 71, 69), rgb(106, 108, 106)

## Responsive Breakpoints (Estimated)

- **Mobile:** 390px - 767px (single column, stacked layout)
- **Tablet:** 768px - 1023px (some two-column, condensed spacing)
- **Desktop:** 1024px+ (full two-column layouts, max-width containers)

## Dependencies & Libraries

- **Payment:** Stripe.js
- **Analytics:** Datafa.st script
- **Security:** Cloudflare Turnstile
- **No smooth scroll library detected**
- **No animation library (AOS, ScrollReveal, etc.) detected**

## Build Strategy

Since the page is mostly static with minimal interactivity, the build order is:

1. **Foundation:** Fonts, colors, global styles, icons
2. **Header component:** Simple navigation bar
3. **Hero section:** Two-column layout with decorative elements
4. **Fees section:** Content + pricing display
5. **Step sections (1, 2, 3):** Reusable StepRow component with variant for reverse layout
6. **Reviews section:** Stats display
7. **FAQ section:** Accordion component (only interactive section)
8. **Final CTA:** Similar to hero, reuses assets
9. **Footer:** Standard footer component
10. **Page assembly:** Wire all sections together with proper spacing

## Notes for Builders

- **No scroll animations:** Don't add intersection observers unless specifically for lazy loading
- **Reusable components:** StepRow can be one component with `reverse` prop
- **Asset optimization:** Face illustrations are reused - single component
- **Accordion state:** FAQ section needs click-to-expand state management
- **Mobile-first:** Start with mobile layout, progressively enhance to desktop
- **Simple hover states:** Buttons likely have subtle hover effects (slight color shift)
