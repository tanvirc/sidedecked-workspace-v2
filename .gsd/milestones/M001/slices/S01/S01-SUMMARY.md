---
id: S01
parent: M001
milestone: M001
provides:
  - Wireframe-matching Footer component (minimal bar with gradient logo, 5 nav links, 3 social icons, copyright)
  - PriceTag with tabular figures via `.price` CSS class
  - Updated footerLinks.ts with named exports (navLinks, socialLinks)
  - Footer test coverage (6 assertions)
  - Confirmed zero alert()/confirm()/prompt() calls (R023)
  - Confirmed zero hardcoded light-mode colors in S01 shared components (R024 partial)
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
  - Used `.price` CSS class from globals.css for tabular figures instead of inline styles — single source of truth for price typography
  - Custom inline SVG for Discord icon since lucide-react doesn't include Discord; Twitter and Github use Lucide
  - Footer uses inline styles for CSS custom properties (--text-tertiary, --bg-surface-2) since Tailwind doesn't have utility classes for custom Voltage tokens
  - footerLinks.ts changed from default export to named exports (navLinks, socialLinks) — only consumer is Footer.tsx
  - Used getAttribute('class') instead of .className in Footer tests to handle SVG elements returning SVGAnimatedString
patterns_established:
  - Social icons in footer use iconMap lookup from footerLinks icon identifier to component
  - Price-displaying spans use the `.price` CSS class for consistent tabular figures across all PriceTag variants
  - Footer tests mock next/navigation useParams and use within() scoping for nav link assertions
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M001/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S01/tasks/T02-SUMMARY.md
duration: short
verification_result: passed
completed_at: 2026-03-13
---

# S01: Voltage Design System Foundation

**Footer rewritten to wireframe spec, PriceTag tabular figures applied, design system foundation audited and locked — 678 tests passing, zero alert() calls, zero hardcoded light-mode colors in shared components.**

## What Happened

The Footer was a 3-column grid with `bg-primary` violet background — completely wrong versus the wireframe. Rewrote it as a single-row minimal bar: `border-t` separator, gradient logo text ("SideDecked" via SideDeckedLogo), 5 inline nav links (About, FAQ, Terms, Privacy, Contact), 3 social icon buttons (Discord custom SVG, X and GitHub via Lucide) with `target="_blank" rel="noopener noreferrer"`, and centered copyright with dynamic year. All styling uses Voltage CSS custom properties exclusively.

`footerLinks.ts` restructured from a default export with 3 groups to named exports `navLinks` (5 items) and `socialLinks` (3 items with icon identifiers).

PriceTag had inline color styles but wasn't using the `.price` CSS class from globals.css that provides `font-family: var(--font-mono-stats)` and `font-feature-settings: 'tnum'`. Applied `.price` to all three variant spans (compact, inline, detailed), replacing inline color since `.price` already sets `color: var(--text-price)`. Added JSDoc documenting dollar-value contract.

Footer tests added: 6 test cases covering gradient logo, nav links with hrefs, social links with external attributes, copyright year, absence of bg-primary, and border-top separator.

Full design system audit confirmed: colors.css dark token coverage is complete (primitives intentionally root-only, semantics have dark overrides), all 16 typography scale classes present in globals.css, `.price` class correct, zero `window.alert/confirm/prompt` calls remaining.

## Verification

- `cd storefront && npx vitest run` — 678 tests passed across 68 files
- `cd storefront && npx vitest run src/components/organisms/Footer` — 6/6 passed
- `grep -rn "bg-white\|bg-gray-\|text-gray-"` across S01 shared components — zero matches
- `grep -rn "window\.alert\|window\.confirm\|window\.prompt" storefront/src/` — zero matches
- colors.css dark mode parity confirmed (primitives root-only by design, semantics covered)
- globals.css typography scale: all 16 classes present, `.price` class correct

## Requirements Advanced

- R001 — Footer, PriceTag, and shared component token consistency verified. Nav/footer match wireframe. Typography scale locked.
- R023 — Zero alert()/confirm()/prompt() calls confirmed via grep.
- R024 — Zero hardcoded light-mode colors in S01-produced shared components. Dark token parity audited.

## Requirements Validated

- R023 — `grep -rn "window\.alert\|window\.confirm\|window\.prompt" storefront/src/` returns zero matches. All replaced with sonner toasts.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

none

## Known Limitations

- R001 and R024 are advanced but not fully validated — downstream slices will add pages that consume these tokens, and consistency across the full storefront can only be validated after all pages are built (S07/S10).
- Footer uses inline styles for Voltage CSS custom properties since Tailwind doesn't have utilities for them. This is a pattern choice, not a limitation, but downstream components will face the same tradeoff.

## Follow-ups

- none

## Files Created/Modified

- `storefront/src/components/organisms/Footer/Footer.tsx` — Rewritten from 3-column grid to wireframe-matching minimal bar
- `storefront/src/data/footerLinks.ts` — Restructured to named exports matching wireframe links
- `storefront/src/components/tcg/PriceTag.tsx` — Applied `.price` CSS class for tabular figures, added JSDoc
- `storefront/src/components/organisms/Footer/__tests__/Footer.test.tsx` — New test file with 6 assertions

## Forward Intelligence

### What the next slice should know
- All S01 shared components (ModernHeader, Footer, CardDisplay, PriceTag, RarityBadge, GameBadge, CardGridSkeleton, SideDeckedLogo) are clean of hardcoded light-mode colors and use Voltage tokens. Downstream slices should follow the same pattern.
- The `.price` CSS class in globals.css is the single source of truth for price typography — use it on any span displaying a price, don't add inline font-feature-settings.

### What's fragile
- Footer uses inline `style` for Voltage CSS custom properties — if Tailwind is extended with Voltage utility classes later, these should be migrated for consistency.
- `footerLinks.ts` uses named exports (`navLinks`, `socialLinks`) — the old default export shape is gone, any code importing the default will break (only Footer.tsx consumes it currently).

### Authoritative diagnostics
- `npx vitest run` in storefront — 678 tests across 68 files is the baseline. If this count drops, something was deleted.
- `grep -rn "bg-white\|bg-gray-\|text-gray-"` on shared component paths — should stay at zero.

### What assumptions changed
- colors.css has ~78 tokens only in `:root` not in `.dark` — these are primitive scale values (ramps, fonts, spacing) that are intentionally theme-invariant, not gaps. Semantic tokens that reference them all have dark overrides.
