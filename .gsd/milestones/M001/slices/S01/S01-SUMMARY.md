---
id: S01
parent: M001
milestone: M001
provides:
  - Wireframe-matching Footer component (minimal bar with gradient logo, 5 nav links, 3 social icons, copyright)
  - PriceTag with tabular figures via `.price` CSS class across all three variants
  - Updated footerLinks.ts with named exports (navLinks, socialLinks) matching wireframe
  - Footer test coverage (6 assertions)
  - Verified Voltage token consistency across all S01 shared components
  - Confirmed R023 (zero alert/confirm/prompt calls)
requires:
  - slice: none
    provides: first slice — no dependencies
affects:
  - S02
  - S03
  - S04
  - S05
  - S06
  - S07
  - S08
  - S09
  - S10
key_files:
  - storefront/src/components/organisms/Footer/Footer.tsx
  - storefront/src/data/footerLinks.ts
  - storefront/src/components/tcg/PriceTag.tsx
  - storefront/src/components/organisms/Footer/__tests__/Footer.test.tsx
key_decisions:
  - D008 — Price typography via `.price` CSS class (single source of truth for tabular figures)
  - D009 — Voltage tokens applied via inline `style` for CSS custom properties (Tailwind lacks utilities for custom Voltage tokens)
  - D010 — footerLinks changed from default export to named exports (navLinks, socialLinks)
patterns_established:
  - Social icons in footer use iconMap lookup from footerLinks icon identifier to component
  - Price-displaying spans use the `.price` CSS class for consistent tabular figures
  - S01 shared components use Voltage CSS custom properties exclusively — no hardcoded light-mode Tailwind classes
observability_surfaces:
  - none (purely presentational components)
drill_down_paths:
  - .gsd/milestones/M001/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S01/tasks/T02-SUMMARY.md
duration: short
verification_result: passed
completed_at: 2026-03-14
---

# S01: Voltage Design System Foundation

**Footer rewritten to wireframe spec, PriceTag uses tabular figures, zero hardcoded light-mode colors in shared components, R023 toast migration confirmed, 794 tests pass.**

## What Happened

The Footer was a 3-column grid with `bg-primary` violet background — completely wrong versus the wireframe's minimal one-row bar. Rewrote it: `border-t` separator, gradient logo text via SideDeckedLogo, 5 inline nav links (About, FAQ, Terms, Privacy, Contact), 3 social icon buttons (Discord via custom SVG, X and GitHub via Lucide) with `target="_blank"`, centered copyright with dynamic year. All styling uses Voltage CSS custom properties via inline styles.

`footerLinks.ts` restructured from a default export with 3 groups to named exports `navLinks` (5 items) and `socialLinks` (3 items with icon identifiers).

PriceTag had inline `style={{ color: 'var(--text-price)' }}` on price spans but wasn't using the `.price` CSS class that provides `font-family: var(--font-mono-stats)` + `font-feature-settings: 'tnum'`. Applied `.price` to all three variants' price spans (compact, inline, detailed), replacing inline color since `.price` already sets it. Added JSDoc documenting the dollar-value contract.

Added 6 Footer tests covering structure, links, social icons, copyright, no-bg-primary, and border separator. Required `getAttribute('class')` instead of `.className` for SVG elements (returns SVGAnimatedString).

Audited colors.css dark-mode parity: 78 tokens "missing" from `.dark` are primitive scale values (color ramps, neutrals, fonts, spacing) — intentionally theme-invariant. All semantic tokens have dark overrides. No gaps.

Audited globals.css: all 16 typography scale classes present. `.price` class confirmed correct.

## Verification

- `cd storefront && npx vitest run` — 794 tests pass across 76 files (threshold: 672+)
- `cd storefront && npx vitest run src/components/organisms/Footer` — 6/6 pass
- `grep -rn "bg-white\|bg-gray-\|text-gray-"` across S01 shared components — zero matches
- `grep -rn "window\.alert\|window\.confirm\|window\.prompt" storefront/src/` — zero matches (R023 ✓)
- colors.css dark mode parity — confirmed (primitives intentionally root-only)
- globals.css typography scale — all 16 classes present, `.price` correct

## Requirements Advanced

- R001 — Footer and PriceTag now render correctly with Voltage tokens. Shared component token consistency verified. Foundation locked for downstream slices.
- R024 — Zero hardcoded light-mode colors confirmed across all S01 shared components (Footer, CardDisplay, PriceTag, RarityBadge, GameBadge, CardGridSkeleton, ModernHeader, SideDeckedLogo).

## Requirements Validated

- R023 — Zero `window.alert()`/`window.confirm()`/`window.prompt()` calls in storefront/src/. Confirmed via grep.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

none

## Known Limitations

- Discord icon is a custom inline SVG since lucide-react doesn't include a Discord icon. If lucide adds one, the custom SVG can be replaced.
- Tailwind doesn't have utility classes for custom Voltage CSS tokens, so S01 components use inline `style` attributes. Downstream slices follow this same pattern unless Tailwind config is extended (D009).

## Follow-ups

- none

## Files Created/Modified

- `storefront/src/components/organisms/Footer/Footer.tsx` — Rewritten from 3-column grid to wireframe-matching minimal bar
- `storefront/src/data/footerLinks.ts` — Restructured to named exports matching wireframe links
- `storefront/src/components/tcg/PriceTag.tsx` — Applied `.price` CSS class for tabular figures, added JSDoc
- `storefront/src/components/organisms/Footer/__tests__/Footer.test.tsx` — New test file with 6 assertions

## Forward Intelligence

### What the next slice should know
- All S01 shared components are clean — no hardcoded light-mode colors. Downstream slices should maintain this pattern.
- PriceTag uses the `.price` CSS class for tabular figures. Any new price-displaying component should use this class too.
- Footer uses inline `style` for Voltage CSS custom properties. This is the established pattern (D009) until Tailwind is extended.

### What's fragile
- Discord icon is a hand-rolled SVG — if the footer icon rendering breaks, check the SVG viewBox and fill attributes first.

### Authoritative diagnostics
- `grep -rn "bg-white\|bg-gray-\|text-gray-"` across shared component paths — this is the canonical check for hardcoded light-mode colors. Run it after any shared component modification.

### What assumptions changed
- Test count grew from 672 baseline to 794 — downstream slices should use 794+ as the new passing threshold, though the plan's 672+ floor still applies.
