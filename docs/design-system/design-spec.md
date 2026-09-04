# Memorable.me Design System Analysis

## Executive Summary

This document reverse-engineers the design language of memorable.me to create an original implementation that captures the same visual hierarchy, spacing, and interaction patterns while using completely unique assets.

---

## 1. LAYOUT SYSTEM

### Container System
- **Max Width**: 1200px (desktop)
- **Container Padding**: 24px (mobile), 40px (tablet), 60px (desktop)
- **Gutter Width**: 16px (mobile), 20px (tablet), 24px (desktop)
- **Content Width**: Constrained to ~800px for readability

### Spacing Scale (8px base)
```
4px   - xs   (tight inline spacing)
8px   - sm   (compact spacing)
12px  - md   (component internal)
16px  - base (default spacing)
20px  - lg   (between elements)
24px  - xl   (section internal)
32px  - 2xl  (between components)
40px  - 3xl  (section separation)
48px  - 4xl  (major sections)
64px  - 5xl  (page sections)
80px  - 6xl  (hero sections)
```

### Vertical Rhythm
- Line height ratio: 1.5 for body, 1.2 for headings
- Paragraph spacing: 16px
- Section spacing: 48-64px
- Inter-component gap: 24-32px

### Responsive Breakpoints
```
sm:  640px  (mobile landscape)
md:  768px  (tablet)
lg:  1024px (desktop)
xl:  1280px (large desktop)
2xl: 1536px (wide desktop)
```

### Grid System
- **Desktop**: 12-column grid, 24px gutters
- **Tablet**: 8-column grid, 20px gutters  
- **Mobile**: 4-column grid, 16px gutters

---

## 2. TYPOGRAPHY SYSTEM

### Font Stack (System Fonts - No Custom Fonts)
```css
Primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
Monospace: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
```

### Type Scale
```
text-xs:   12px / 1.5   (captions, labels)
text-sm:   14px / 1.5   (body small, metadata)
text-base: 16px / 1.5   (body text)
text-lg:   18px / 1.5   (emphasized body)
text-xl:   20px / 1.4   (subheadings)
text-2xl:  24px / 1.3   (section titles)
text-3xl:  30px / 1.2   (page titles)
text-4xl:  36px / 1.2   (hero headlines)
text-5xl:  48px / 1.1   (major headlines)
```

### Font Weights
```
regular:   400 (body text)
medium:    500 (emphasis, labels)
semibold:  600 (subheadings, buttons)
bold:      700 (headings, strong emphasis)
```

### Letter Spacing
```
tight:   -0.025em (large headings)
normal:   0em     (body text)
wide:     0.025em (buttons, labels)
wider:    0.05em  (all-caps labels)
widest:   0.2em   (coupon codes)
```

---

## 3. COLOR SYSTEM (ORIGINAL PALETTE)

### Primary Colors (Blue-based - different from memorable's coral)
```
primary-50:   #EFF6FF  (lightest tint)
primary-100:  #DBEAFE  
primary-200:  #BFDBFE  
primary-300:  #93C5FD  
primary-400:  #60A5FA  (hover states)
primary-500:  #3B82F6  (primary brand)
primary-600:  #2563EB  (active states)
primary-700:  #1D4ED8  
primary-800:  #1E40AF  
primary-900:  #1E3A8A  (darkest shade)
```

### Accent Colors
```
success-400: #4ADE80  (success states)
success-500: #22C55E  (success primary)
success-600: #16A34A  

warning-400: #FBBF24  (warning states)
warning-500: #F59E0B  (warning primary)
warning-600: #D97706  

danger-400:  #F87171  (error states)
danger-500:  #EF4444  (error primary)
danger-600:  #DC2626  

purple-400:  #A78BFA  (accent highlights)
purple-500:  #8B5CF6  
purple-600:  #7C3AED  
```

### Neutral Palette
```
white:     #FFFFFF  (pure white)
gray-50:   #F9FAFB  (lightest background)
gray-100:  #F3F4F6  (subtle background)
gray-200:  #E5E7EB  (borders light)
gray-300:  #D1D5DB  (borders default)
gray-400:  #9CA3AF  (disabled text)
gray-500:  #6B7280  (secondary text)
gray-600:  #4B5563  (body text secondary)
gray-700:  #374151  (body text)
gray-800:  #1F2937  (headings)
gray-900:  #111827  (primary text)
black:     #000000  (pure black)
```

### Semantic Colors
```
background:       gray-50
surface:          white
border:           gray-200
border-hover:     gray-300
text-primary:     gray-900
text-secondary:   gray-600
text-muted:       gray-500
text-disabled:    gray-400
```

---

## 4. SHADOWS & ELEVATION

```css
shadow-sm:   0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:      0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
shadow-2xl:  0 25px 50px -12px rgb(0 0 0 / 0.25)
```

### Colored Shadows (for primary CTAs)
```css
primary-glow: 0 10px 20px -5px rgb(59 130 246 / 0.2)
success-glow: 0 10px 20px -5px rgb(34 197 94 / 0.2)
```

---

## 5. BORDER RADIUS

```
none:    0px      (reset)
sm:      4px      (subtle rounding)
base:    6px      (default)
md:      8px      (cards, inputs)
lg:      12px     (prominent cards)
xl:      16px     (large cards)
2xl:     20px     (hero elements)
3xl:     24px     (special features)
full:    9999px   (pills, circles)
```

---

## 6. COMPONENT SPECIFICATIONS

### Buttons

**Primary Button**
- Padding: 12px 24px (medium), 10px 20px (small), 14px 28px (large)
- Border Radius: 8px
- Font: 14px semibold (small), 16px semibold (medium), 18px semibold (large)
- Background: primary-500
- Hover: primary-600, scale(0.98)
- Active: primary-700
- Shadow: shadow-sm, hover: shadow-md
- Transition: all 150ms ease

**Secondary Button**
- Same padding as primary
- Background: white
- Border: 1px solid gray-300
- Text: gray-700
- Hover: gray-50, border-gray-400

**Icon Button**
- Size: 36px × 36px (small), 40px × 40px (medium), 44px × 44px (large)
- Border Radius: 8px
- Icon: 16px (small), 20px (medium), 24px (large)

### Cards

**Standard Card**
- Padding: 20px (mobile), 24px (desktop)
- Border Radius: 12px
- Border: 1px solid gray-200
- Background: white
- Shadow: shadow-sm
- Hover: shadow-md, translate -2px

**Feature Card**
- Padding: 24px (mobile), 32px (desktop)
- Border Radius: 16px
- Shadow: shadow-lg
- Hover: shadow-xl

### Coupon/Code Display

**Code Container**
- Padding: 16px 20px
- Border: 2px dashed gray-300
- Border Radius: 8px
- Background: gray-50
- Font: 24px-32px monospace bold
- Letter Spacing: 0.2em
- Hover: border-gray-400, background-gray-100

**Copy Button** 
- Full width or icon-only
- Primary or secondary style
- Success state: green-500 background
- Icon: 16px-20px

### Badge/Pill

**Status Badge**
- Padding: 4px 12px
- Border Radius: full (pill)
- Font: 12px medium
- Text Transform: none
- Variants: primary, success, warning, danger

**Count Badge**
- Size: 20px-24px circle
- Font: 11px-12px bold
- Position: absolute top-right

### Input Fields

**Text Input**
- Height: 40px (small), 44px (medium), 48px (large)
- Padding: 0 12px (horizontal)
- Border: 1px solid gray-300
- Border Radius: 8px
- Font: 14px-16px
- Focus: border-primary-500, ring-4 primary-100

**Search Input**
- Same as text input
- Icon: 20px left-aligned
- Padding Left: 40px

---

## 7. INTERACTION PATTERNS

### Hover States
- Scale: 0.98-0.99 (buttons)
- Translate: -2px (cards)
- Shadow: increase one level
- Border: darken one shade
- Duration: 150ms-200ms
- Easing: ease-out

### Active States
- Scale: 0.95-0.97
- Shadow: decrease one level
- Background: darken two shades
- Duration: 100ms
- Easing: ease-in

### Focus States
- Outline: 2px solid primary-500
- Outline Offset: 2px
- Ring: 4px primary-100
- Remove default outline

### Loading States
- Spinner: 20px-24px
- Border: 2px-3px
- Animation: spin 600ms linear infinite
- Overlay: semi-transparent backdrop

### Transitions
```
fast:   100ms-150ms (interactions)
base:   200ms-250ms (state changes)
slow:   300ms-400ms (layout shifts)
easing: ease-out (enter), ease-in (exit)
```

---

## 8. ANIMATION LIBRARY

### Micro-interactions
```
pulse:      scale 1-1.05, 2s infinite
bounce:     translate-y with bounce easing
shake:      rotate ±5deg, 500ms
fade-in:    opacity 0→1, 300ms
slide-up:   translate-y 20px→0, 300ms
```

### Page Transitions
```
enter:      opacity 0→1 + translate-y 10px→0, 400ms
exit:       opacity 1→0 + translate-y 0→-10px, 300ms
```

---

## 9. RESPONSIVE BEHAVIOR

### Mobile (<640px)
- Single column layout
- Full-width cards
- Sticky CTAs at bottom
- Larger touch targets (44px min)
- Hide secondary navigation
- Stack all grids

### Tablet (640px-1024px)
- 2-column grid
- Reduced spacing (75% of desktop)
- Collapsible sidebar
- Mixed layout patterns

### Desktop (>1024px)
- Full grid system
- Maximum spacing
- Hover states active
- Multi-column layouts
- Fixed sidebar

---

## 10. ACCESSIBILITY

### Color Contrast
- Body text: 4.5:1 minimum (WCAG AA)
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Focus Indicators
- Visible on all interactive elements
- 2px minimum outline width
- Sufficient contrast (3:1)

### Touch Targets
- Minimum 44×44px
- 8px spacing between targets

### Motion
- Respect prefers-reduced-motion
- Disable animations when requested
- Alternative feedback methods

---

## IMPLEMENTATION NOTES

This design system provides the foundation for creating an original coupon/deals website that captures memorable.me's design language while being completely unique in:

✅ Color palette (blue-based vs. coral)
✅ Typography (system fonts)
✅ Component styling
✅ Content and copy
✅ Icons and imagery
✅ Brand identity

❌ Layout rhythm (preserved)
❌ Spacing scale (preserved)
❌ Visual hierarchy (preserved)
❌ Component patterns (preserved)
❌ Interaction model (preserved)
❌ Responsive behavior (preserved)
