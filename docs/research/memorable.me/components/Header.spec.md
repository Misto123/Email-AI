# Header Component Specification

## Overview
- **Target file:** `src/components/memorable/Header.tsx`
- **Screenshot:** `docs/design-references/memorable.me/desktop-1440.png` (top section)
- **Interaction model:** Static - no scroll-triggered changes

## DOM Structure
```
<header>
  <nav>
    - Logo link (with image)
    - Pricing link
    - Language selector button (with dropdown)
    - Sign in link
    - Create a pot CTA link
  </nav>
</header>
```

## Computed Styles (exact values from getComputedStyle)

### Header Container
- display: block
- padding: 0px
- backgroundColor: rgb(255, 255, 255)
- height: 72px
- position: static (no sticky/fixed behavior)

### Nav Container
- display: flex
- justifyContent: space-between
- alignItems: center
- gap: normal (browser default flex gap)
- padding: 16px 24px
- width: 100% (1152px on desktop)
- height: 72px

### Logo
- src: `public/memorable.me/images/memorable-logo.png`
- Natural dimensions: 1140x204px
- Display dimensions: 190x34px (scaled down)
- Parent link: padding: 0px, no background

### Pricing Link
- text: "Pricing"
- fontSize: 16px
- fontWeight: 500
- color: rgb(34, 34, 34)
- padding: 0px
- backgroundColor: transparent
- hover: likely underline or color shift

### Language Selector Button
- text: "English" (with flag icon)
- fontSize: 16px
- fontWeight: 600
- color: rgb(22, 51, 0) - brand green
- padding: 0px
- backgroundColor: transparent
- borderRadius: 9999px (fully rounded when has background)
- Flag icon: `public/memorable.me/images/flags/en.svg` (24x24px display)

### Sign In Link
- text: "Sign in"
- fontSize: 16px
- fontWeight: 600
- color: rgb(22, 51, 0) - brand green
- padding: 8px 20px
- backgroundColor: rgba(22, 51, 0, 0.07) - light green tint
- borderRadius: 9999px (pill shape)

### Create a Pot CTA (Primary Button)
- text: "Create a pot"
- fontSize: 16px
- fontWeight: 600
- color: rgb(255, 255, 255) - white text
- padding: 8px 20px
- backgroundColor: rgb(22, 51, 0) - brand green
- borderRadius: 9999px (pill shape)
- transition: background-color 0.2s ease (estimated)

## States & Behaviors

### Language Selector Dropdown
- **Trigger:** Click on language button
- **Behavior:** Dropdown menu appears with language options (English, Français visible)
- **Implementation:** Modal/dropdown component with absolute positioning
- **Dropdown items:**
  - fontSize: 16px
  - fontWeight: 400
  - padding: 12px 16px
  - hover: background change

### Hover States
- **Links (Pricing, Sign in):** Subtle hover effect (likely slight background darkening or underline)
- **CTA Button:** Background darkens slightly (rgba(22, 51, 0, 0.9) estimated)
- **Transition:** 0.2s ease

### No Scroll Behaviors
- Header remains static throughout page scroll
- No position changes, no shadow additions, no background changes

## Assets
- Logo: `public/memorable.me/images/memorable-logo.png`
- Flag icon: `public/memorable.me/images/flags/en.svg`
- Icons: ChevronDown (for language selector dropdown indicator) from `icons.tsx`

## Text Content (verbatim)
- Logo alt: "Memorable"
- Pricing link: "Pricing"
- Language button: "English"
- Sign in link: "Sign in"
- CTA link: "Create a pot"
- Dropdown options: "English", "Français"

## Responsive Behavior
- **Desktop (1024px+):** All items visible in horizontal layout, logo full size
- **Tablet (768px-1023px):** Slightly reduced padding, logo may scale down
- **Mobile (< 768px):** Likely collapses to hamburger menu OR shows only logo + CTA with menu button
- **Implementation:** Use CSS media queries or responsive utility classes

## Layout Implementation
```tsx
<header className="bg-white">
  <nav className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
    <Link href="/">
      <Image src="/memorable.me/images/memorable-logo.png" width={190} height={34} alt="Memorable" />
    </Link>
    
    <div className="flex items-center gap-8">
      <Link href="/pricing">Pricing</Link>
      <LanguageSelector current="en" />
      <Link href="/signin" className="btn-sign-in">Sign in</Link>
      <Link href="/create" className="btn-primary">Create a pot</Link>
    </div>
  </nav>
</header>
```

## Notes for Builder
- Use Next.js Link for all navigation
- Use Next.js Image for logo with proper dimensions
- Language selector needs dropdown state management (useState for isOpen)
- All button/link styles should use Tailwind classes matching the exact pixel values
- No scroll listeners needed - this is a completely static header
- Focus states should be added for accessibility (ring on focus)
