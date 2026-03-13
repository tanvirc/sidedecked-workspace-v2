# S01: Voltage Design System Foundation

**Goal:** Shared nav, footer, card display, skeleton, and price tag components render with Voltage tokens on any page. Footer matches wireframe. PriceTag uses tabular figures. Typography and token consistency verified across all S01-produced shared components.
**Demo:** Footer renders as a minimal one-row bar (gradient logo, 5 links, 3 social icons, copyright) matching the wireframe. PriceTag digits align in columns. All 672+ existing tests pass plus new Footer tests. Zero hardcoded light-mode colors in S01-produced shared components.

## Must-Haves

- Footer rewritten to match `storefront-homepage.html` wireframe (lines 628–690, 995–1025): minimal bar with border-top separator, gradient logo text, 5 nav links (About, FAQ, Terms, Privacy, Contact), 3 social icons (Discord, X, GitHub), copyright line — no `bg-primary`, no 3-column grid
- PriceTag applies tabular figures (`font-feature-settings: 'tnum'`) and mono-stats font family so prices align in columns
- PriceTag JSDoc documents that `price` prop expects dollar values (not cents)
- All S01-produced shared components (Footer, CardDisplay, PriceTag, RarityBadge, GameBadge, CardGridSkeleton, ModernHeader, SideDeckedLogo) use Voltage CSS tokens exclusively — zero hardcoded `bg-white`, `bg-gray-*`, `text-gray-*`
- Toast migration confirmed: zero `window.alert()` / `window.confirm()` / `window.prompt()` calls in storefront/src/
- 672+ existing tests still pass, new Footer tests pass
- `footerLinks.ts` data updated to match wireframe link set

## Verification

- `cd storefront && npx vitest run` — 672+ tests pass (including new Footer tests)
- `cd storefront && npx vitest run src/components/organisms/Footer` — Footer tests pass
- `grep -rn "bg-white\|bg-gray-\|text-gray-" storefront/src/components/tcg/ storefront/src/components/organisms/Footer/ storefront/src/components/organisms/Header/ModernHeader.tsx storefront/src/components/cards/CardGridSkeleton.tsx storefront/src/components/atoms/SideDeckedLogo/` returns zero matches (no hardcoded light-mode colors in shared components)

## Tasks

- [x] **T01: Rewrite Footer, fix PriceTag tabular figures, and audit shared components** `est:2h`
  - Why: The Footer is completely wrong vs the wireframe (3-column `bg-primary` grid vs minimal one-row bar). PriceTag doesn't use tabular figures despite a `.price` CSS class existing for exactly that. These are the two real code changes in S01; the rest is verification.
  - Files: `storefront/src/components/organisms/Footer/Footer.tsx`, `storefront/src/data/footerLinks.ts`, `storefront/src/components/tcg/PriceTag.tsx`
  - Do: (1) Rewrite Footer.tsx to match wireframe: border-top separator, no bg-primary, single row with gradient logo text (SideDeckedLogo), 5 inline links, 3 social icon links (Discord/X/GitHub using Lucide icons), copyright. Use Voltage tokens exclusively. (2) Update footerLinks.ts to export the wireframe's 5 links + 3 social links. (3) Add tabular-nums styling to PriceTag's price display spans — either apply `.price` CSS class or add inline `font-family: var(--font-mono-stats)` + `font-feature-settings: 'tnum'`. (4) Add JSDoc to PriceTag documenting that `price` expects dollar values. (5) Scan all S01 shared components for hardcoded light-mode colors; fix any found.
  - Verify: `cd storefront && npx vitest run` passes 672+ tests. Visual inspection of Footer structure in code matches wireframe spec. `grep -rn "bg-white\|bg-gray-\|text-gray-"` on shared component files returns zero.
  - Done when: Footer matches wireframe spec, PriceTag uses tabular figures, zero hardcoded colors in shared components.

- [x] **T02: Add Footer tests and run full verification** `est:1h`
  - Why: The Footer rewrite needs test coverage. Full suite run confirms nothing broke. Token/typography audit needs explicit sign-off.
  - Files: `storefront/src/components/organisms/Footer/__tests__/Footer.test.tsx`
  - Do: (1) Write Footer tests: renders gradient logo, renders all 5 nav links with correct hrefs, renders 3 social icons with correct external hrefs + `target="_blank"`, renders copyright with current year, has no `bg-primary` class, has border-top separator. (2) Run full test suite. (3) Verify colors.css token completeness: `.dark` block has no gaps vs `:root`. (4) Verify globals.css typography classes are present (display, heading, label scales). (5) Confirm zero `window.alert()`/`confirm()`/`prompt()` calls via grep.
  - Verify: `cd storefront && npx vitest run` — all tests pass including new Footer tests. Token audit grep confirms dark mode parity. Alert grep confirms zero calls.
  - Done when: Footer test file exists with passing assertions. Full suite green. Token/typography audit documented. R023 confirmed satisfied.

## Observability / Diagnostics

No runtime observability surfaces needed. All S01 components are purely presentational — no async data fetching, no state machines, no error boundaries. Verification is structural (grep for hardcoded colors, test assertions on rendered output). The `.price` CSS class is the only behavioral surface and is covered by visual inspection of tabular figure alignment.

## Files Likely Touched

- `storefront/src/components/organisms/Footer/Footer.tsx`
- `storefront/src/data/footerLinks.ts`
- `storefront/src/components/tcg/PriceTag.tsx`
- `storefront/src/components/organisms/Footer/__tests__/Footer.test.tsx`
