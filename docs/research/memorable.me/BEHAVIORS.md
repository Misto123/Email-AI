# Behavioral Analysis - memorable.me/en

## Summary

This is a **mostly static landing page** with minimal interactive behaviors. No scroll-driven animations, no sticky navigation, no parallax effects. The primary interactivity is limited to:
- Click-driven FAQ accordions
- Hover states on buttons and links
- Language selector dropdown

## Scroll Behaviors

### Header
- **Trigger:** None
- **Behavior:** Header remains static (position: static) throughout scroll
- **State A (scroll = 0):** background: rgb(255,255,255), boxShadow: none, padding: 0px
- **State B (scroll > 500px):** IDENTICAL - no changes detected
- **Implementation:** Static CSS, no JavaScript scroll listeners needed

### Page Scroll
- **Type:** Native browser scroll
- **No smooth scroll library detected** (no Lenis, Locomotive Scroll, or custom scroll containers)
- **No scroll-snap detected**
- **Implementation:** Use browser default, no custom scroll setup needed

### Sections
- **No fade-in animations** on scroll into view
- **No slide-up/slide-in effects** as sections enter viewport
- **No intersection observers** detected (no data-aos, data-scroll, or animation triggers)
- **Implementation:** Static sections, no IntersectionObserver needed

## Click Behaviors

### FAQ Accordions
- **Location:** `.faq-section`
- **Trigger:** Click on FAQ question
- **Behavior:** Expand/collapse answer panel
- **Animation:** Likely height transition with ease timing
- **State A (collapsed):** Answer hidden (display: none or max-height: 0)
- **State B (expanded):** Answer visible (display: block or max-height: auto)
- **Transition estimate:** 0.3s ease or similar
- **Implementation:** React state toggle with CSS transition on max-height or display

### Language Selector
- **Element:** Button with "English" text + flag icon (@e3)
- **Trigger:** Click
- **Behavior:** Dropdown menu appears with language options
- **Implementation:** Modal/dropdown component, likely with fade-in transition

### CTA Buttons
- **Elements:** "Create a pot" buttons in header, hero, final CTA
- **Trigger:** Click
- **Behavior:** Navigate to pot creation flow
- **No special animations detected** - standard link/button behavior

### Navigation Links
- **Elements:** "Pricing", "Sign in"
- **Trigger:** Click
- **Behavior:** Standard navigation
- **Implementation:** Next.js Link components

## Hover Behaviors

### Buttons
- **Primary buttons** (green "Create a pot"):
  - **Before:** Solid green background (likely rgb(22, 51, 0))
  - **After:** Likely slightly darker or lighter shade
  - **Transition estimate:** 0.2s ease
  - **Implementation:** CSS hover state with background-color transition

### Links
- **Text links** ("Pricing", "Sign in"):
  - **Before:** Default text color
  - **After:** Likely underline appears or color shift
  - **Transition estimate:** 0.2s ease
  - **Implementation:** CSS hover with text-decoration or color transition

### Cards/Sections
- **No hover effects detected** on section containers
- **No card lift/shadow effects** on hover

## Animations Present

### Toast/Notice
- **Element:** `.notice_group`
- **Animation:** `slideUpNotice` - 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) with 0.1s delay
- **Behavior:** Slides up from bottom (likely for notifications/alerts)
- **Implementation:** CSS keyframe animation, triggered by class addition

### No Other Animations Detected
- No element fade-ins
- No text reveal animations
- No number counters
- No parallax layers
- No scroll progress indicators

## Form Interactions

No forms detected on this landing page. All interactions are navigation-based (CTAs lead to pot creation flow elsewhere).

## Responsive Behaviors

### Viewport Changes
- **Desktop → Tablet (1024px → 768px):**
  - Two-column layouts likely maintain or adjust column widths
  - Spacing/padding reduces
  
- **Tablet → Mobile (768px → 390px):**
  - Two-column layouts stack to single column
  - Hero phone mockup may hide or reduce size
  - Header likely collapses to hamburger menu
  - Font sizes likely reduce slightly

### No Dynamic Viewport Listeners
- No detected JavaScript listening to resize events
- Responsive behavior handled purely by CSS media queries

## Media & Assets

### Lazy Loading
- Album image in Step 3 reported as 0x0 dimensions, suggesting lazy loading
- **Implementation:** Use Next.js Image component with default lazy loading

### Videos
- **None detected** on the page

### Background Images
- Three elements use **blue gradient** background-image
- **Implementation:** CSS background: linear-gradient(...)

## Accessibility Behaviors

### Keyboard Navigation
- Standard tab order expected
- FAQ accordions should be keyboard-accessible (Enter/Space to toggle)
- All links and buttons should receive focus styles

### Screen Readers
- Semantic HTML structure detected (header, nav, section, footer)
- Images should have alt text (some currently empty)

## Performance Notes

- Page height: 5175px (relatively short landing page)
- Total SVG icons: 25 (lightweight)
- Images: 14 total (several reused)
- No heavy JavaScript libraries detected
- Fast, simple page - minimal behavior to implement

## Implementation Checklist

### Must Have:
- [x] FAQ accordion click-to-expand
- [x] Button hover states (subtle color change)
- [x] Link hover states (underline or color)
- [x] Language selector dropdown (click)
- [x] Toast/notice slide-up animation (for system notifications)

### Don't Implement (Not Present):
- [ ] Scroll-triggered header changes
- [ ] Fade-in on scroll animations
- [ ] Parallax effects
- [ ] Smooth scroll library
- [ ] Scroll progress indicators
- [ ] Number counter animations
- [ ] Card hover lift effects
- [ ] Any IntersectionObserver animations

## Summary for Builders

This is a **static landing page** that relies on clean design and strong copy rather than flashy animations. The only significant interactive element is the FAQ accordion. Everything else is standard link/button behavior with simple hover states. 

**Don't over-engineer it.** No scroll listeners, no intersection observers, no animation libraries. Just clean CSS transitions on hover and a simple accordion state toggle.
