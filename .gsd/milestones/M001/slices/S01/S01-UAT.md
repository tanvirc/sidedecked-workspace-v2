# S01: Voltage Design System Foundation — UAT

**Milestone:** M001
**Written:** 2026-03-13

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S01 is a design system foundation slice — all outputs are component structure, CSS tokens, and test results. No live runtime behavior to verify beyond what automated tests cover. Visual fidelity of Footer is verified structurally against the wireframe spec (elements, layout, classes) rather than pixel-diffing a running app.

## Preconditions

- storefront repo has dependencies installed (`npm install` completed)
- Node.js 18+ available

## Smoke Test

Run `cd storefront && npx vitest run src/components/organisms/Footer` — 6 tests pass confirming Footer renders with correct structure.

## Test Cases

### 1. Footer matches wireframe structure

1. Open `storefront/src/components/organisms/Footer/Footer.tsx`
2. Confirm: single-row layout with `border-t` separator, no `bg-primary`
3. Confirm: gradient logo text ("SideDecked") present
4. Confirm: 5 nav links (About, FAQ, Terms, Privacy, Contact)
5. Confirm: 3 social icons (Discord, X, GitHub) with `target="_blank"`
6. Confirm: copyright line with dynamic year
7. **Expected:** Structure matches `storefront-homepage.html` wireframe lines 628–690

### 2. PriceTag uses tabular figures

1. Open `storefront/src/components/tcg/PriceTag.tsx`
2. Confirm: price display spans have `className="price"` applied
3. Open `storefront/src/app/globals.css`, find `.price` class
4. Confirm: `.price` includes `font-family: var(--font-mono-stats)` and `font-feature-settings: 'tnum'`
5. **Expected:** Prices render with tabular (monospaced) figures so digits align in columns

### 3. No hardcoded light-mode colors in shared components

1. Run: `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/tcg/ storefront/src/components/organisms/Footer/ storefront/src/components/organisms/Header/ModernHeader.tsx storefront/src/components/cards/CardGridSkeleton.tsx storefront/src/components/atoms/SideDeckedLogo/`
2. **Expected:** Zero matches

### 4. No alert/confirm/prompt calls remaining

1. Run: `grep -rn "window\.alert\|window\.confirm\|window\.prompt" storefront/src/`
2. **Expected:** Zero matches (R023 satisfied)

### 5. Full test suite passes

1. Run: `cd storefront && npx vitest run`
2. **Expected:** 678+ tests pass across 68 files, 0 failures

## Edge Cases

### Dark mode token parity

1. Open `storefront/src/app/colors.css`
2. Compare `:root` and `.dark` blocks
3. **Expected:** All semantic tokens (--bg-*, --text-*, --border-*, --surface-*) have dark overrides. Primitive scale values (color ramps, fonts, spacing) are intentionally root-only.

## Failure Signals

- Footer test count drops below 6
- Total test count drops below 672 (the original baseline)
- `grep` for hardcoded colors returns matches in shared component files
- `grep` for `window.alert` returns matches in storefront/src/

## Requirements Proved By This UAT

- R023 — Zero alert()/confirm()/prompt() calls, confirmed by grep
- R024 (partial) — Zero hardcoded light-mode colors in S01 shared components, confirmed by grep. Full storefront consistency deferred to S07/S10.
- R001 (partial) — Footer and PriceTag match wireframe spec. Typography scale and token set audited. Full validation requires all downstream pages consuming these tokens (S02–S10).

## Not Proven By This UAT

- Visual pixel-perfect rendering in a browser — verified structurally, not via screenshot comparison
- Footer responsiveness at 390px mobile breakpoint — structure verified, not visual layout
- R001 full validation — requires downstream slices to consume tokens and maintain consistency
- R024 full validation — requires all storefront pages to be checked, not just S01 shared components

## Notes for Tester

The Footer previously used a 3-column grid layout with violet `bg-primary` background. If you see any remnant of that old design in the rendered page, something regressed. The new Footer is intentionally minimal — a single horizontal bar with border-top separator.
