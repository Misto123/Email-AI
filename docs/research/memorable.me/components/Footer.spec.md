# Footer Component Specification

## Overview
- **Target file:** `src/components/memorable/Footer.tsx`
- **Screenshot:** `docs/design-references/memorable.me/desktop-1440.png` (bottom section)
- **Interaction model:** Static links

## DOM Structure
```
<footer class="site-footer">
  <div class="footer-container">
    <div class="footer-brand">
      - Memorable logo
      - Tagline or description
    </div>
    <div class="footer-links">
      - Navigation columns
      - Legal links
      - Social links
    </div>
    <div class="footer-bottom">
      - Copyright text
    </div>
  </div>
</footer>
```

## Computed Styles

### Footer Container
- backgroundColor: rgb(250, 250, 250) OR light gray
- padding: 64px 24px 32px
- borderTop: 1px solid rgb(231, 231, 231)

### Footer Brand
- Logo: `public/memorable.me/images/memorable-logo.png` (width: 160px, smaller than header)
- marginBottom: 16px

### Footer Links
- display: grid
- gridTemplateColumns: repeat(auto-fit, minmax(200px, 1fr))
- gap: 32px
- fontSize: 14px
- color: rgb(69, 71, 69)

### Link Columns
- Heading: fontWeight: 600, fontSize: 14px, marginBottom: 16px, color: rgb(34, 34, 34)
- Links: marginBottom: 12px, hover: underline

### Footer Bottom
- marginTop: 48px
- paddingTop: 24px
- borderTop: 1px solid rgb(231, 231, 231)
- fontSize: 14px
- color: rgb(106, 108, 106)
- textAlign: center

## Content Structure (Estimated)

### Column 1: Product
- Pricing
- Features
- Examples
- How it works

### Column 2: Company
- About
- Blog
- Contact
- Press

### Column 3: Legal
- Terms of Service
- Privacy Policy
- Cookie Policy

### Column 4: Social
- Twitter
- Facebook
- Instagram

### Copyright
"© 2026 Memorable. All rights reserved."

## Responsive Behavior
- **Desktop:** 4 columns grid
- **Tablet:** 2 columns grid
- **Mobile:** Single column stack

## Assets
- Logo: `public/memorable.me/images/memorable-logo.png`

## Notes for Builder
- Simple static component, no interactions beyond link hovers
- Use Next.js Link for internal navigation
- Standard footer pattern
