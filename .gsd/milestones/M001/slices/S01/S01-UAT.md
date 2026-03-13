# S01: Voltage Design System Foundation — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S01 is purely presentational component work — no runtime data fetching, no state machines, no user flows. Structural correctness is fully verifiable via tests, grep, and code inspection.

## Preconditions

- `storefront/` dependencies installed (`npm install`)
- Node.js available

## Smoke Test

Run `cd storefront && npx vitest run src/components/organisms/Footer` — 6 tests pass confirming Footer renders with correct structure.

## Test Cases

### 1. Footer renders wireframe-matching structure

1. Run `cd storefront && npx vitest run src/components/organisms/Footer`
2. **Expected:** 6/6 tests pass — gradient logo, 5 nav links, 3 social icons, copyright year, no bg-primary, border-top separator.

### 2. PriceTag uses tabular figures

1. Open `storefront/src/components/tcg/PriceTag.tsx`
2. Check that all price-displaying `<span>` elements have `className="price"`
3. Open `storefront/src/app/globals.css` and verify `.price` class includes `font-feature-settings: 'tnum'` and `font-family: var(--font-mono-stats)`
4. **Expected:** All three PriceTag variants (compact, inline, detailed) apply the `.price` class. The CSS class provides tabular figures and mono-stats font.

### 3. Zero hardcoded light-mode colors in shared components

1. Run `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/tcg/ storefront/src/components/organisms/Footer/ storefront/src/components/organisms/Header/ModernHeader.tsx storefront/src/components/cards/CardGridSkeleton.tsx storefront/src/components/atoms/SideDeckedLogo/`
2. **Expected:** Zero matches.

### 4. Toast migration complete (R023)

1. Run `grep -rn "window\.alert\|window\.confirm\|window\.prompt" storefront/src/`
2. **Expected:** Zero matches.

### 5. Full test suite passes

1. Run `cd storefront && npx vitest run`
2. **Expected:** 794+ tests pass, 0 failures.

## Edge Cases

### Footer copyright year is dynamic

1. Check Footer.tsx uses `new Date().getFullYear()` for copyright
2. **Expected:** Copyright line shows current year (2026), will auto-update annually.

## Failure Signals

- Any `bg-primary` class in Footer output
- PriceTag digits not aligning in columns when rendered (indicates `.price` class not applied)
- Any `window.alert()` / `window.confirm()` / `window.prompt()` match in storefront/src/
- Test count below 672

## Requirements Proved By This UAT

- R001 — Footer and PriceTag render with Voltage tokens. Shared component foundation verified.
- R023 — Zero alert/confirm/prompt calls remain in storefront.
- R024 — Zero hardcoded light-mode colors in S01 shared components (partial — full storefront coverage is progressive across all slices).

## Not Proven By This UAT

- Visual pixel-perfect alignment of Footer against wireframe at 1440px and 390px (requires running app + human visual comparison)
- ModernHeader (nav) wireframe alignment — pre-existed and was not modified in S01
- CardDisplay, RarityBadge, GameBadge visual accuracy — pre-existed and were not modified in S01 (token compliance verified via grep only)

## Notes for Tester

- Footer visual alignment should be checked against `storefront-homepage.html` wireframe lines 628–690. The structural tests cover content and classes but not pixel measurements.
- The test count (794) exceeds the plan's 672+ threshold because prior slices (S02–S06) already completed on a parallel branch. The floor of 672+ from the plan is still the contractual minimum.
