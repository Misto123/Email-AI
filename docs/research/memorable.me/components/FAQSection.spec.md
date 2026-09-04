# FAQ Section Specification

## Overview
- **Target file:** `src/components/memorable/FAQSection.tsx`
- **Screenshot:** See full page screenshot - FAQ section near bottom
- **Interaction model:** Click-driven accordions (expand/collapse)

## DOM Structure
```
<section class="section faq-section">
  <div class="container">
    <h2 class="section__title section__title--left">
      Frequently asked questions
    </h2>
    <div class="faq-list">
      - Multiple FAQ items (accordion pattern)
      - Each item: question button + answer panel
    </div>
  </div>
</section>
```

## Computed Styles (exact values from getComputedStyle)

### Section Container
- padding: 80px 24px
- backgroundColor: rgb(255, 255, 255)
- height: 646px (desktop, expands with open accordions)

### Container
- maxWidth: 1200px
- margin: 0 auto

### Section Title
- fontSize: 36-40px
- fontWeight: 700
- lineHeight: 1.2
- color: rgb(22, 51, 0) - brand green
- font-family: var(--font-bricolage)
- textAlign: left
- marginBottom: 48px

### FAQ List
- display: flex
- flexDirection: column
- gap: 16px (between FAQ items)

### FAQ Item (Accordion)
- backgroundColor: rgb(250, 250, 250) OR white
- border: 1px solid rgb(231, 231, 231)
- borderRadius: 12px
- overflow: hidden

### Question Button
- width: 100%
- display: flex
- justifyContent: space-between
- alignItems: center
- padding: 20px 24px
- fontSize: 18px
- fontWeight: 600
- color: rgb(34, 34, 34)
- backgroundColor: transparent
- textAlign: left
- cursor: pointer
- transition: background-color 0.2s ease

### Question Button Hover
- backgroundColor: rgb(247, 247, 247)

### Question Button (Expanded State)
- fontWeight: 600 (same)
- Icon rotates 180deg (ChevronDown → ChevronUp)

### Chevron Icon
- size: 24x24px
- color: rgb(106, 108, 106) - muted gray
- transition: transform 0.3s ease
- transform: rotate(0deg) when collapsed
- transform: rotate(180deg) when expanded

### Answer Panel (Collapsed)
- maxHeight: 0
- overflow: hidden
- opacity: 0
- transition: max-height 0.3s ease, opacity 0.3s ease

### Answer Panel (Expanded)
- maxHeight: 500px (or auto with JS)
- overflow: visible
- opacity: 1
- padding: 0 24px 20px 24px
- fontSize: 16px
- lineHeight: 1.6
- color: rgb(69, 71, 69) - secondary text

## FAQ Content

### Questions (extracted from page)
1. "What is Memorable and how does it work?"
2. (Additional questions need extraction - click to reveal)
3. (Additional questions need extraction)
4. (Additional questions need extraction)
5. (Additional questions need extraction)
6. (Additional questions need extraction)

*Note: Need to click each FAQ item to extract full Q&A pairs*

## States & Behaviors

### Accordion Interaction
- **Trigger:** Click on question button
- **Behavior:** 
  - Toggle answer panel visibility
  - Rotate chevron icon 180deg
  - Animate max-height from 0 to content height (or vice versa)
  - Only one accordion open at a time (optional) OR multiple can be open
- **State A (collapsed):**
  - maxHeight: 0
  - opacity: 0
  - chevron: rotate(0deg)
- **State B (expanded):**
  - maxHeight: 500px (or calculated height)
  - opacity: 1
  - chevron: rotate(180deg)
- **Transition:** 0.3s ease for both height and opacity

### Implementation Approach
- React useState for tracking open/closed state
- Each accordion item maintains its own open state OR
- Parent component tracks which index is open (accordion pattern)
- CSS transitions for smooth animations
- Use `max-height` trick OR `height: auto` with JS measurement

## Assets
- Icons: `ChevronDownIcon` from `icons.tsx`

## TypeScript Interface

```typescript
interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQ[];
}
```

## Responsive Behavior
- **Desktop (1024px+):** Full width accordion items, padding as specified
- **Tablet (768px-1023px):** Maintain layout, slightly reduce padding
- **Mobile (< 768px):** 
  - Title: 28-32px
  - Question button: padding 16px
  - Answer: padding 0 16px 16px 16px
  - fontSize reduces to 16px for questions, 15px for answers

## Accessibility Requirements
- Question buttons should be `<button>` elements
- Use `aria-expanded` attribute (true/false)
- Use `aria-controls` pointing to answer panel ID
- Answer panel should have unique `id`
- Focus states on buttons (ring on focus)
- Keyboard navigation: Enter/Space to toggle

## Layout Implementation
```tsx
<section className="section-padding">
  <div className="container-memorable">
    <h2 className="text-4xl font-bold mb-12 text-[rgb(var(--brand-green-dark))]">
      Frequently asked questions
    </h2>
    
    <div className="flex flex-col gap-4 max-w-3xl">
      {faqs.map((faq, index) => (
        <FAQItem key={index} {...faq} />
      ))}
    </div>
  </div>
</section>
```

## FAQItem Component Implementation
```tsx
function FAQItem({ question, answer }: FAQ) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg font-semibold pr-4">{question}</span>
        <ChevronDownIcon 
          className={cn(
            "w-6 h-6 text-gray-500 transition-transform duration-300 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 pb-6 text-gray-700 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}
```

## Notes for Builder
- This is the **only interactive component** on the page (besides navigation)
- Must implement proper state management for open/closed
- Consider single-open vs multi-open accordion pattern (recommend multi-open for better UX)
- CSS transitions are critical for smooth animation
- Ensure keyboard accessibility (Enter/Space keys)
- Use semantic HTML with proper ARIA attributes
- FAQ content needs to be extracted by clicking each item on the live site
