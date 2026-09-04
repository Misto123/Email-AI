# Component Inventory - Memorable.me Design System

## Component Catalog

This document catalogs every reusable component observed in memorable.me's design system, documenting their structure, variants, and specifications for original recreation.

---

## NAVIGATION COMPONENTS

### 1. Header / Navigation Bar

**Structure:**
- Container: max-w-7xl, horizontal padding
- Logo area: left-aligned, 32-40px height
- Navigation links: center or right-aligned
- CTA button: right-aligned
- Mobile: hamburger menu

**Variants:**
- Desktop: full horizontal layout
- Mobile: collapsed with hamburger
- Sticky: fixed position on scroll

**Specifications:**
```
Height: 64px (mobile), 72px (desktop)
Padding: 16px 24px (mobile), 20px 40px (desktop)
Background: white with border-bottom or transparent
Shadow: sm on scroll
Z-index: 50
```

### 2. Breadcrumb

**Structure:**
- Horizontal list with separators
- Current page highlighted
- Clickable previous pages

**Specifications:**
```
Font: 14px regular
Color: gray-600 (links), gray-900 (current)
Separator: "/" or ">" gray-400
Gap: 8px
Hover: gray-900, underline
```

### 3. Search Bar

**Structure:**
- Input field with icon
- Optional autocomplete dropdown
- Clear button when typing

**Specifications:**
```
Height: 44px
Padding: 0 40px 0 12px (with icons)
Border-radius: 8px
Icon size: 20px
Focus ring: primary-100
```

---

## CONTENT DISPLAY COMPONENTS

### 4. Hero Section

**Structure:**
- Large headline
- Subheading/description
- Primary CTA button
- Optional secondary CTA
- Optional hero image/graphic

**Variants:**
- Full-width background
- Centered content
- Split (text + image)

**Specifications:**
```
Padding: 48px 24px (mobile), 80px 40px (desktop)
Headline: text-4xl/5xl font-bold
Description: text-lg/xl gray-600
CTA spacing: 24px gap
Max-width: 1200px
```

### 5. Merchant/Store Card

**Structure:**
- Logo container (square or circle)
- Merchant name (heading)
- Description/category
- Stats (if applicable)
- CTA button

**Specifications:**
```
Padding: 20px
Border-radius: 12px
Border: 1px gray-200
Logo size: 64px-80px circle/square
Shadow: sm, hover: md
Transition: 200ms
Hover: translate-y(-2px)
```

### 6. Coupon/Deal Card

**Structure:**
- Discount badge (prominent)
- Deal title
- Description
- Expiry date
- CTA button (reveal/copy)
- Optional: Success rate, usage count

**Variants:**
- Featured: larger, colored background
- Standard: white background, border
- Compact: reduced padding, smaller text

**Specifications:**
```
Padding: 20px (mobile), 24px (desktop)
Border-radius: 12px
Badge: 32-40px circle or pill
Title: text-lg/xl font-semibold
Border: 1px gray-200
Shadow: sm
Gap: 12px (internal spacing)
```

### 7. Promo Code Display

**Structure:**
- Code container (dashed border)
- Code text (monospace, large)
- Copy button
- Optional: Auto-copy indicator

**Specifications:**
```
Code padding: 16px 20px
Code font: 24-32px monospace bold
Letter-spacing: 0.2em
Border: 2px dashed gray-300
Border-radius: 8px
Background: gray-50
Copy button: full-width or inline
Success state: green-500 bg, check icon
```

### 8. Stats/Metrics Display

**Structure:**
- Icon or emoji
- Large number/percentage
- Label/description

**Layout:**
- Horizontal row (3-4 items)
- Grid (2×2, 3×3)
- Individual cards

**Specifications:**
```
Icon container: 36-44px circle
Icon size: 20-24px
Number: text-2xl/3xl font-bold
Label: text-sm gray-600
Gap: 12px vertical
Background: gradient or solid
Border-radius: 12px
```

### 9. Review/Rating Widget

**Structure:**
- Star rating (visual)
- Numerical score
- Review count
- Optional: Trust badge

**Specifications:**
```
Star size: 16-20px
Star color: warning-400 (filled), gray-300 (empty)
Score: text-lg font-semibold
Count: text-sm gray-600
Gap: 8px
```

### 10. Review Card/Testimonial

**Structure:**
- User info (avatar, name, date)
- Star rating
- Review text
- Optional: Verified badge

**Specifications:**
```
Padding: 20px
Border-radius: 12px
Border: 1px gray-200 or none
Avatar: 40-48px circle
Name: text-sm font-medium
Date: text-xs gray-500
Stars: 16px
Text: text-base gray-700
Line-height: 1.6
```

---

## INTERACTIVE COMPONENTS

### 11. Button System

**Primary Button:**
```
Padding: 10px 20px (sm), 12px 24px (md), 14px 28px (lg)
Font: 14px semibold (sm), 16px semibold (md), 18px semibold (lg)
Border-radius: 8px
Background: primary-500
Text: white
Hover: primary-600, scale(0.98)
Active: primary-700, scale(0.96)
Shadow: sm, hover: md
Transition: 150ms ease
```

**Secondary Button:**
```
Same sizing as primary
Background: white
Border: 1px gray-300
Text: gray-700
Hover: gray-50, border-gray-400
```

**Tertiary/Ghost Button:**
```
Same sizing as primary
Background: transparent
Text: primary-600
Hover: primary-50
```

**Variants:**
- Icon-only: 36-44px square, icon 20px
- With icon: icon 16-20px, gap 8px
- Full-width: w-full
- Loading: spinner 20px, disabled state

### 12. Badge/Label System

**Status Badge:**
```
Padding: 4px 12px
Border-radius: full
Font: 12px medium
Variants:
  - success: green-100 bg, green-700 text
  - warning: yellow-100 bg, yellow-700 text
  - danger: red-100 bg, red-700 text
  - info: blue-100 bg, blue-700 text
  - neutral: gray-100 bg, gray-700 text
```

**Count Badge:**
```
Size: 20-24px circle
Background: primary-500
Text: 11-12px white bold
Position: absolute top-right -2px
Border: 2px white (if on colored bg)
```

**Discount Badge:**
```
Size: 48-64px circle (prominent)
Background: primary-500 or gradient
Text: 18-24px white bold
Shadow: lg with color glow
```

### 13. Accordion/FAQ

**Structure:**
- Question/header (clickable)
- Expand/collapse icon
- Answer content (collapsible)

**Specifications:**
```
Header padding: 16px 20px
Font: 16px font-medium
Icon: 20px, transition rotate
Content padding: 0 20px 16px
Border-bottom: 1px gray-200
Hover: background gray-50
Transition: 200ms ease
```

### 14. Modal/Dialog

**Structure:**
- Backdrop (semi-transparent)
- Modal container (centered)
- Header with close button
- Content area
- Footer with actions

**Specifications:**
```
Backdrop: bg-black/50
Container: max-w-lg, bg-white, rounded-2xl
Padding: 24px (mobile), 32px (desktop)
Header: text-xl font-semibold
Close: 32px icon button, top-right
Shadow: 2xl
Animation: scale + fade, 200ms
```

### 15. Toast/Notification

**Structure:**
- Icon (status indicator)
- Message text
- Close button
- Optional: Action button

**Specifications:**
```
Width: 320-400px
Padding: 16px
Border-radius: 12px
Background: white
Border-left: 4px (status color)
Shadow: lg
Position: fixed top-right or bottom-right
Gap: 12px
Animation: slide-in from right, 300ms
Auto-dismiss: 3-5 seconds
```

### 16. Pagination

**Structure:**
- Previous button
- Page numbers (current highlighted)
- Next button
- Optional: Total pages/items

**Specifications:**
```
Button size: 36px square
Font: 14px medium
Border-radius: 8px
Current: primary-500 bg, white text
Others: gray-100 bg, gray-700 text
Hover: gray-200
Gap: 4px
Disabled: gray-300 bg, gray-400 text
```

---

## FORM COMPONENTS

### 17. Text Input

**Specifications:**
```
Height: 40px (sm), 44px (md), 48px (lg)
Padding: 0 12px
Border: 1px gray-300
Border-radius: 8px
Font: 14-16px
Placeholder: gray-400
Focus: border-primary-500, ring-4 primary-100
Error: border-red-500, ring-4 red-100
Disabled: bg-gray-50, text-gray-400
```

### 18. Select/Dropdown

**Specifications:**
```
Same as text input
Icon: 16px chevron-down, right-aligned
Padding-right: 36px (for icon)
Dropdown: absolute, w-full, max-h-64
Option padding: 8px 12px
Option hover: gray-100
Selected: primary-50 bg
```

### 19. Checkbox/Radio

**Specifications:**
```
Size: 20px square (checkbox), 20px circle (radio)
Border: 2px gray-300
Checked: primary-500 bg
Icon: 12px white checkmark
Label: 14px, gap 8px
Hover: border-gray-400
Focus: ring-4 primary-100
```

### 20. Toggle/Switch

**Specifications:**
```
Width: 44px
Height: 24px
Border-radius: full
Background: gray-300 (off), primary-500 (on)
Knob: 18px circle, 3px offset
Transition: 200ms ease
```

---

## LAYOUT COMPONENTS

### 21. Container/Wrapper

**Specifications:**
```
Max-width: 1200px (default), 1400px (wide), 800px (narrow)
Padding: 24px (mobile), 40px (tablet), 60px (desktop)
Margin: 0 auto (centered)
```

### 22. Grid System

**2-Column:**
```
Desktop: grid-cols-2, gap-24
Tablet: grid-cols-2, gap-16
Mobile: grid-cols-1, gap-12
```

**3-Column:**
```
Desktop: grid-cols-3, gap-24
Tablet: grid-cols-2, gap-16
Mobile: grid-cols-1, gap-12
```

**4-Column:**
```
Desktop: grid-cols-4, gap-20
Tablet: grid-cols-2, gap-16
Mobile: grid-cols-1, gap-12
```

### 23. Sidebar Layout

**Structure:**
- Main content area (flex-1)
- Sidebar (fixed width)
- Responsive: sidebar collapses on mobile

**Specifications:**
```
Desktop: main + sidebar (300px)
Tablet: stacked or collapsed
Mobile: stacked
Gap: 32px
Sidebar: sticky top-24 (desktop)
```

### 24. Card Grid

**Structure:**
- Grid of cards (responsive columns)
- Equal height cards
- Consistent spacing

**Specifications:**
```
Desktop: 3-4 columns
Tablet: 2 columns
Mobile: 1 column
Gap: 24px
Card height: auto or min-height
```

---

## LOADING & EMPTY STATES

### 25. Skeleton Loader

**Structure:**
- Placeholder shapes matching content
- Animated gradient (shimmer effect)

**Specifications:**
```
Background: gray-200
Animation: shimmer 1.5s infinite
Border-radius: match content
Heights: match expected content
```

### 26. Spinner/Loading Indicator

**Specifications:**
```
Size: 20px (sm), 24px (md), 32px (lg)
Border: 3px
Border-color: primary-200 (base), primary-500 (top)
Animation: spin 600ms linear infinite
```

### 27. Empty State

**Structure:**
- Icon or illustration
- Heading
- Description
- Optional CTA button

**Specifications:**
```
Padding: 48px 24px
Icon: 64-80px gray-400
Heading: text-xl gray-900
Description: text-base gray-600
Max-width: 400px
Text-align: center
```

---

## FOOTER COMPONENTS

### 28. Site Footer

**Structure:**
- Multi-column layout (links, info, social)
- Logo/branding
- Copyright notice
- Optional: Newsletter signup

**Specifications:**
```
Padding: 48px 24px (mobile), 64px 40px (desktop)
Background: gray-900 or gray-50
Columns: 4 (desktop), 2 (tablet), 1 (mobile)
Gap: 32px (columns), 16px (links)
Link font: 14px gray-400
Link hover: white or gray-900
Border-top: 1px gray-200 (light theme)
```

---

## IMPLEMENTATION PRIORITIES

### Phase 1 - Core Components (Week 1)
- Button system
- Card components
- Form inputs
- Typography system

### Phase 2 - Interactive Components (Week 2)
- Navigation
- Modals/dialogs
- Badges/labels
- Accordions

### Phase 3 - Complex Components (Week 3)
- Coupon/deal cards
- Review widgets
- Stats displays
- Grid systems

### Phase 4 - Polish (Week 4)
- Loading states
- Animations
- Empty states
- Refinements

---

## NOTES

All components should:
- Use completely original visual design
- Follow the established spacing scale
- Maintain the documented interaction patterns
- Be fully accessible (WCAG 2.1 AA)
- Support responsive breakpoints
- Include proper TypeScript types
- Have comprehensive props/variants
