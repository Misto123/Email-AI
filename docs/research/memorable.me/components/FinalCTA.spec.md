# Final CTA Section Specification

## Overview
- **Target file:** `src/components/memorable/FinalCTA.tsx`
- **Screenshot:** See full page screenshot - section before footer
- **Interaction model:** Static

## DOM Structure
```
<section class="section final-cta">
  <div class="container">
    - Two decorative face images (reused from hero)
    - Motivational text
    - CTA button
  </div>
</section>
```

## Computed Styles

### Section Container
- padding: 80px 24px
- backgroundColor: Likely tinted or gradient background
- height: 508px (desktop)
- textAlign: center

### Container
- maxWidth: 800px
- margin: 0 auto
- position: relative (for face positioning)

### Motivational Text
- **Content:** "For the moments that matter, the causes that bring us together and the gestures that last."
- fontSize: 32-36px
- fontWeight: 600-700
- lineHeight: 1.3
- color: rgb(22, 51, 0) - brand green
- font-family: var(--font-bricolage)
- marginBottom: 40px
- textAlign: center

### CTA Button
- text: "Create a pot"
- fontSize: 18px (larger than header)
- fontWeight: 600
- color: rgb(255, 255, 255)
- padding: 16px 40px (larger padding)
- backgroundColor: rgb(22, 51, 0)
- borderRadius: 9999px
- hover: background darkens

### Decorative Faces
- **Face 1:** `public/memorable.me/images/face-1.png`
- **Face 2:** `public/memorable.me/images/face-2.png`
- Same images as hero section (reuse component)
- position: absolute
- z-index: -1 or low (behind text)
- opacity: possibly reduced
- Placement: one on left, one on right

## Content

### Text
"For the moments that matter, the causes that bring us together and the gestures that last."

### CTA
"Create a pot"

## States & Behaviors

### Static Section
- No animations
- Button hover: background darkens

## Assets
- Face decorations: `face-1.png`, `face-2.png` (reused)

## Responsive Behavior
- **Desktop:** Full size, faces visible
- **Tablet:** Slightly smaller text
- **Mobile:** 
  - Text: 24-28px
  - Faces smaller or hidden
  - Button: full width or large centered

## Layout Implementation
```tsx
<section className="section-padding bg-[rgb(var(--background-tinted))] relative overflow-hidden">
  <div className="container-memorable text-center relative z-10">
    {/* Decorative faces - absolute positioned */}
    <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-30 hidden lg:block">
      <Image src="/memorable.me/images/face-1.png" width={120} height={120} alt="" />
    </div>
    <div className="absolute -right-20 top-1/2 -translate-y-1/2 opacity-30 hidden lg:block">
      <Image src="/memorable.me/images/face-2.png" width={120} height={120} alt="" />
    </div>
    
    <h2 className="text-3xl md:text-4xl font-bold text-[rgb(var(--brand-green-dark))] mb-10 max-w-2xl mx-auto">
      For the moments that matter, the causes that bring us together and the gestures that last.
    </h2>
    
    <Link href="/create" className="btn-primary text-lg px-10 py-4">
      Create a pot
    </Link>
  </div>
</section>
```

## Notes for Builder
- Reuse face images from hero (same assets)
- Center-aligned, simple layout
- Decorative faces are optional on mobile (can hide)
- Focus on the motivational copy and prominent CTA
