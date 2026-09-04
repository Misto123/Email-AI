# StepRow Component Specification

## Overview
- **Target file:** `src/components/memorable/StepRow.tsx`
- **Screenshot:** See full page screenshots for Step 1, 2, 3 sections
- **Interaction model:** Static - reusable component with `reverse` variant
- **Usage:** Used 3 times on page (Steps 1, 2, 3)

## DOM Structure
```
<section class="section step-row [step-row--reverse]">
  <div class="container">
    <div class="step-content">
      - Step label ("Step 1", "Step 2", "Step 3")
      - Heading
      - Description paragraph
    </div>
    <div class="step-visual">
      - Image or visual element
    </div>
  </div>
</section>
```

## Computed Styles (exact values from getComputedStyle)

### Section Container
- padding: 80px 24px (estimated)
- backgroundColor: rgb(255, 255, 255)
- minHeight: Variable (Step 1: 624px, Step 2: 609px, Step 3: 352px)

### Container
- maxWidth: 1200px
- margin: 0 auto
- display: grid OR flex
- gridTemplateColumns: 1fr 1fr (two equal columns)
- gap: 64px (estimated spacing between columns)
- alignItems: center

### Reverse Variant (.step-row--reverse)
- Same styles but visual order swapped
- Implementation: `flex-direction: row-reverse` OR grid column placement

### Step Label
- fontSize: 14px (estimated)
- fontWeight: 600
- color: rgb(22, 51, 0) - brand green
- textTransform: uppercase
- letterSpacing: 0.05em
- marginBottom: 16px

### Step Heading
- fontSize: 36-40px (estimated)
- fontWeight: 700
- lineHeight: 1.2
- color: rgb(22, 51, 0) - brand green
- font-family: var(--font-bricolage)
- marginBottom: 24px

### Description Paragraph
- fontSize: 18px
- fontWeight: 400
- lineHeight: 1.6
- color: rgb(69, 71, 69) - secondary text
- maxWidth: 500px

### Visual Container
- width: 100% (of grid column)
- display: flex
- justifyContent: center
- alignItems: center

## Props Interface

```typescript
interface StepRowProps {
  step: number;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
}
```

## Content for Each Step

### Step 1: Create and share
- **Step:** 1
- **Title:** "Create and share"
- **Description:** "In 2 minutes your pot is created: add a goal, a countdown and a description. Share it everywhere via link and QR code."
- **Image:** Visual element showing pot creation interface (needs extraction)
- **Reverse:** false (image on right)

### Step 2: Collect
- **Step:** 2
- **Title:** "Collect"
- **Description:** "Online payments are handled and secured by Stripe, the largest payment platform in the world. Every contributor is notified at the moment of withdrawal."
- **Image:** `public/memorable.me/images/payer-avatar.jpg` (pay preview component)
- **Reverse:** true (image on left)

### Step 3: Give
- **Step:** 3
- **Title:** "Give"
- **Description:** "An album of messages and photos is created from every contribution. You can decide to print it as a book."
- **Image:** `public/memorable.me/images/album.png`
- **Reverse:** false (image on right)

## States & Behaviors

### Static Component
- No animations
- No hover effects on the component itself
- **Implementation:** Pure presentational component

## Assets
- Step 2 image: `payer-avatar.jpg`
- Step 3 image: `album.png`
- Step 1: Needs extraction or mockup creation

## Responsive Behavior
- **Desktop (1024px+):** Two-column grid layout as specified
- **Tablet (768px-1023px):** Maintain two columns OR start stacking, reduce heading size
- **Mobile (< 768px):** 
  - Single column stack
  - heading: 28-32px
  - description: 16px
  - Both visual and reverse variants stack in same order (content first, image second)
- **Breakpoint:** 768px

## Layout Implementation
```tsx
<section className="section-padding">
  <div className={cn(
    "container-memorable grid gap-16 items-center",
    "md:grid-cols-2",
    reverse && "md:flex-row-reverse"
  )}>
    <div className="step-content">
      <div className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--brand-green-dark))] mb-4">
        Step {step}
      </div>
      <h2 className="text-4xl font-bold mb-6 text-[rgb(var(--brand-green-dark))]">
        {title}
      </h2>
      <p className="text-lg text-[rgb(var(--text-secondary))] leading-relaxed max-w-lg">
        {description}
      </p>
    </div>
    
    <div className="step-visual flex justify-center">
      <Image 
        src={image} 
        alt={imageAlt}
        width={400}
        height={400}
        className="w-full max-w-md"
      />
    </div>
  </div>
</section>
```

## Notes for Builder
- This is a **reusable component** - build once, use 3 times
- The `reverse` prop should flip the grid column order on desktop only
- Mobile should always show content → image regardless of reverse prop
- Use CSS Grid for easier column swapping
- All 3 instances use identical styling, only content differs
