---
id: T01
parent: S01
milestone: M001
provides:
  - Wireframe-matching Footer component (minimal bar layout)
  - PriceTag with tabular figures via `.price` CSS class
  - Updated footerLinks.ts with named exports for nav and social links
key_files:
  - storefront/src/components/organisms/Footer/Footer.tsx
  - storefront/src/data/footerLinks.ts
  - storefront/src/components/tcg/PriceTag.tsx
key_decisions:
  - Used `.price` CSS class from globals.css for tabular figures instead of inline styles — single source of truth for price typography
  - Custom inline SVG for Discord icon since lucide-react doesn't include a Discord icon; Twitter and Github use Lucide
  - Footer uses inline styles for CSS custom properties (--text-tertiary, --bg-surface-2, etc.) since Tailwind doesn't have utility classes for custom Voltage tokens
  - footerLinks.ts changed from default export to named exports (navLinks, socialLinks) — only consumer is Footer.tsx
patterns_established:
  - Social icons in footer use iconMap lookup from footerLinks icon identifier to component
  - Price-displaying spans use the `.price` CSS class for consistent tabular figures
observability_surfaces:
  - none
duration: short
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T01: Rewrite Footer, fix PriceTag tabular figures, and audit shared components

**Rewrote Footer to wireframe spec (minimal bar, gradient logo, 5 links, 3 social icons), applied `.price` CSS class to PriceTag for tabular figures, confirmed zero hardcoded light-mode colors.**

## What Happened

The Footer component was a 3-column grid with `bg-primary` violet background — completely wrong versus the wireframe. Rewrote it as a single-row minimal bar: `border-t` separator, gradient logo text ("SideDecked"), 5 inline nav links (About, FAQ, Terms, Privacy, Contact), 3 social icon buttons (Discord, X, GitHub with `target="_blank" rel="noopener noreferrer"`), and a centered copyright line with dynamic year. All styling uses Voltage CSS custom properties.

`footerLinks.ts` was restructured from a default export with `customerServices`/`about`/`connect` groups to named exports `navLinks` (5 items) and `socialLinks` (3 items with icon identifiers) matching the wireframe.

PriceTag had inline `style={{ color: 'var(--text-price)' }}` on price spans but wasn't using the `.price` CSS class from globals.css that provides `font-family: var(--font-mono-stats)` and `font-feature-settings: 'tnum'`. Applied the `.price` class to all three variants' price spans (compact, inline, detailed), replacing the inline color style since `.price` already sets `color: var(--text-price)`. Added JSDoc documenting the dollar-value contract.

Grepped all S01 shared components for `bg-white`, `bg-gray-*`, `text-gray-*` — zero matches found. Already clean.

## Verification

- `cd storefront && npx vitest run` — **67 test files, 672 tests passed**
- `grep -rn "bg-primary" storefront/src/components/organisms/Footer/` — **zero matches** (no violet background)
- `grep -rn "bg-white\|bg-gray-\|text-gray-"` across all S01 shared component paths — **zero matches** (no hardcoded light-mode colors)

### Slice-level verification status (partial — T01 of 2)

- ✅ `cd storefront && npx vitest run` — 672 tests pass
- ⬜ `cd storefront && npx vitest run src/components/organisms/Footer` — Footer tests not yet written (T02)
- ✅ Hardcoded light-mode color grep — zero matches

## Diagnostics

None — purely presentational component changes with no runtime state.

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/components/organisms/Footer/Footer.tsx` — Rewritten from 3-column grid to wireframe-matching minimal bar
- `storefront/src/data/footerLinks.ts` — Restructured to named exports matching wireframe links
- `storefront/src/components/tcg/PriceTag.tsx` — Applied `.price` CSS class for tabular figures, added JSDoc
