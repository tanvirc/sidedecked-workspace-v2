---
estimated_steps: 5
estimated_files: 4
---

# T01: Rewrite Footer, fix PriceTag tabular figures, and audit shared components

**Slice:** S01 — Voltage Design System Foundation
**Milestone:** M001

## Description

The Footer component is completely wrong versus the wireframe — it's a 3-column grid with jarring `bg-primary` (violet) background. The wireframe specifies a minimal one-row bar: gradient logo text, 5 inline links, 3 social icons, copyright. PriceTag doesn't use tabular figures despite a `.price` CSS class in globals.css built for exactly that, so prices misalign in columns. This task fixes both and audits all S01-produced shared components for hardcoded light-mode colors.

## Steps

1. Read the wireframe footer spec from `docs/plans/wireframes/storefront-homepage.html` (lines 628–690 and 995–1025) to extract exact structure, classes, and link targets.
2. Rewrite `storefront/src/components/organisms/Footer/Footer.tsx`: single-row minimal bar layout with `border-t border-[var(--surface-border)]` separator (no `bg-primary`), SideDeckedLogo with gradient, 5 inline nav links (About, FAQ, Terms, Privacy, Contact), 3 social icon links (Discord, X, GitHub) using Lucide icons with `target="_blank" rel="noopener noreferrer"`, copyright line with dynamic year. All styling via Voltage CSS tokens.
3. Update `storefront/src/data/footerLinks.ts` to export the wireframe's link structure: `navLinks` array (5 items with label + path) and `socialLinks` array (3 items with label + href + icon identifier).
4. Fix `storefront/src/components/tcg/PriceTag.tsx`: add `font-family: var(--font-mono-stats)` and `font-feature-settings: 'tnum'` (or the `price` CSS class) to price display spans across all three variants (inline, detailed, compact). Add JSDoc to the component documenting that the `price` prop expects dollar values, not smallest currency unit (cents).
5. Grep all S01 shared components for hardcoded light-mode colors (`bg-white`, `bg-gray-*`, `text-gray-*`). Fix any found by replacing with Voltage token equivalents. Components to scan: Footer, CardDisplay, PriceTag, RarityBadge, GameBadge, CardGridSkeleton, ModernHeader, SideDeckedLogo.

## Must-Haves

- [ ] Footer renders as single-row minimal bar matching wireframe, no `bg-primary`
- [ ] Footer shows gradient logo text, 5 nav links, 3 social icons, copyright
- [ ] footerLinks.ts exports wireframe-matching link data
- [ ] PriceTag uses tabular figures across all variants
- [ ] PriceTag has JSDoc documenting dollar-value contract
- [ ] Zero hardcoded light-mode colors in S01 shared components

## Verification

- `cd storefront && npx vitest run` — existing 672+ tests still pass
- `grep -rn "bg-primary" storefront/src/components/organisms/Footer/` returns zero (no violet background)
- `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/tcg/ storefront/src/components/organisms/Footer/ storefront/src/components/organisms/Header/ModernHeader.tsx storefront/src/components/cards/CardGridSkeleton.tsx storefront/src/components/atoms/SideDeckedLogo/` returns zero

## Inputs

- `docs/plans/wireframes/storefront-homepage.html` — authoritative footer design (lines 628–690, 995–1025)
- `storefront/src/components/organisms/Footer/Footer.tsx` — current Footer to rewrite
- `storefront/src/data/footerLinks.ts` — current link data to update
- `storefront/src/components/tcg/PriceTag.tsx` — current PriceTag missing tabular figures
- `storefront/src/app/globals.css` — `.price` CSS class with tabular figure styles (line 256–259)

## Expected Output

- `storefront/src/components/organisms/Footer/Footer.tsx` — rewritten to match wireframe: minimal bar, gradient logo, 5 links, 3 social icons, copyright, Voltage tokens only
- `storefront/src/data/footerLinks.ts` — updated with wireframe link structure
- `storefront/src/components/tcg/PriceTag.tsx` — tabular figures applied, JSDoc added
