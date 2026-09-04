# Memorable.me Build Plan

## Component Dependencies

### Foundation (Already Complete ✓)
- [x] Fonts configured (Bricolage Grotesque, Schibsted Grotesk)
- [x] Global CSS with design tokens
- [x] Icons component (CheckIcon, ArrowRightIcon, etc.)
- [x] TypeScript types
- [x] Assets downloaded to `public/memorable.me/`

### Components to Build (7 total)

#### No Dependencies (Can build in parallel)
1. **Header** - `Header.spec.md`
2. **HeroSection** - `HeroSection.spec.md`
3. **FeesSection** - `FeesSection.spec.md`
4. **StepRow** (reusable) - `StepRow.spec.md`
5. **FAQSection** - `FAQSection.spec.md`
6. **FinalCTA** - `FinalCTA.spec.md`
7. **Footer** - `Footer.spec.md`

### Page Assembly (After all components)
8. **HomePage** - Wire all components together in `src/app/memorable/page.tsx`

## Build Order

### Round 1: Dispatch All Component Builders (Parallel)
All 7 components can be built simultaneously since they have no dependencies on each other.

**Agent assignments:**
- Agent 1: Header
- Agent 2: HeroSection  
- Agent 3: FeesSection
- Agent 4: StepRow
- Agent 5: FAQSection
- Agent 6: FinalCTA
- Agent 7: Footer

### Round 2: Page Assembly
After all components are merged, assemble the home page.

## Worktree Strategy

Each agent gets its own worktree branch:
- `build/header`
- `build/hero`
- `build/fees`
- `build/steprow`
- `build/faq`
- `build/finalcta`
- `build/footer`

After each completes, merge to main and verify build passes.

## Verification Points

After each merge:
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes

Final verification:
- [ ] All sections visible in browser
- [ ] Responsive behavior works (test at 390px, 768px, 1440px)
- [ ] FAQ accordions work
- [ ] All images load
- [ ] Hover states work on buttons/links

## Complexity Assessment

**Simple components (30-45 min each):**
- Header
- FeesSection
- FinalCTA
- Footer

**Medium components (45-60 min each):**
- StepRow (reusable with variants)
- FAQSection (state management for accordions)

**Complex components (60-90 min):**
- HeroSection (two-column layout, decorative positioning, multiple sub-elements)

**Total estimated time:** 4-6 hours with parallel execution, ~20-30 hours sequential

## Next Steps

1. ✅ Create worktree branches
2. ✅ Dispatch all 7 builder agents with their spec files
3. ⏳ Monitor progress and merge as agents complete
4. ⏳ Assemble home page
5. ⏳ Visual QA and adjustments
