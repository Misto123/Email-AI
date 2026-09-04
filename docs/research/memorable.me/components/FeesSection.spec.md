# Fees Section Specification

## Overview
- **Target file:** `src/components/memorable/FeesSection.tsx`
- **Screenshot:** See full page screenshot - second section after hero
- **Interaction model:** Static

## DOM Structure
```
<section class="section section--tinted fees" id="fees">
  <div class="container">
    <div class="section__head">
      <h2 class="section__title">0 mandatory fees</h2>
      <div class="section__subtitle">
        We chose a supportive model that makes raising money accessible to everyone. There is no mandatory commission on contributions or withdrawals.
      </div>
    </div>
    <div class="fees-content">
      - Fee comparison or explanation
      - Visual elements showing pricing structure
    </div>
  </div>
</section>
```

## Computed Styles

### Section Container
- id: "fees"
- padding: 80px 24px
- backgroundColor: rgb(250, 250, 250) - tinted background
- height: 810px (desktop)

### Section Head
- textAlign: center
- maxWidth: 800px
- margin: 0 auto 64px

### Section Title
- fontSize: 40-48px
- fontWeight: 700
- lineHeight: 1.2
- color: rgb(22, 51, 0) - brand green
- font-family: var(--font-bricolage)
- marginBottom: 24px

### Section Subtitle
- fontSize: 18-20px
- lineHeight: 1.6
- color: rgb(69, 71, 69) - secondary text
- maxWidth: 700px
- margin: 0 auto

### Fees Content
- Likely contains pricing tiers or comparison cards
- Display: grid or flex
- gap: 32px

## Content

### Heading
"0 mandatory fees"

### Subtitle
"We chose a supportive model that makes raising money accessible to everyone. There is no mandatory commission on contributions or withdrawals."

### Additional Content
(Needs extraction from visual inspection - likely shows optional tip structure)

## Responsive Behavior
- **Desktop:** Centered content, full width up to max-width
- **Tablet:** Reduce heading size
- **Mobile:** Heading 32px, reduce padding

## Assets
- None (text-based section)

## Notes for Builder
- Center-aligned text section
- Tinted background distinguishes from white sections
- Simple layout, focus on typography hierarchy
