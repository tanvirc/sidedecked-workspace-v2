# S01: Infrastructure & Design System

## Goal
Establish the Voltage design system tokens, shared component library, and test/quality infrastructure that every downstream slice depends on. No feature work ships until tokens are locked, shared components pass tests, and quality gates are green in storefront and customer-backend.

## Tasks

- [ ] **T01: Voltage token definitions & globals** `est:2h`
  - Define all CSS custom properties in `storefront/src/app/globals.css`: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-price`, `--text-muted`; `--bg-primary`, `--bg-surface-1`, `--bg-surface-2`, `--bg-surface-3`, `--bg-overlay`; `--border-subtle`, `--border-default`, `--border-strong`; `--brand-primary` (`#8B5CF6`), `--brand-accent` (`#FF7849`); `--status-success`, `--status-warning`, `--status-error`, `--status-info`
  - Define `@font-face` for Barlow Condensed (display headings), Inter (body copy), DM Mono (mono-stats / prices)
  - Add `.price` CSS class: `font-feature-settings: "tnum"`, `font-family: var(--font-mono-stats)`, `color: var(--text-price)`, `font-variant-numeric: tabular-nums`
  - Force dark mode globally via `html { color-scheme: dark }` — no light mode variant
  - Acceptance: `grep -r "bg-white\|text-black\|text-gray-[0-9]" storefront/src/` returns zero matches in any new file created during this task

- [ ] **T02: Shared component library** `est:4h`
  - `<Nav />` — logo (links to `/`), game selector tabs (MTG / Pokémon / Yu-Gi-Oh! / One Piece), search bar (links to `/search`), auth state (guest: Sign In button; signed-in: avatar + dropdown), cart count badge, mobile hamburger with slide-out drawer
  - `<Footer />` — 4-column layout (About / Games / Sell / Community columns) + bottom bar with legal links (Privacy Policy, Terms of Service, Cookie Policy) + social icons (Twitter/X, Discord, Instagram)
  - `<CardGrid />` — responsive CSS grid wrapper (`auto-fill`, `minmax(160px, 1fr)`), accepts `isLoading` prop to render skeletons instead of children
  - `<CardTile />` — card image with aspect-ratio lock, name, game badge, `<PriceTag />`, condition chips; links to `/cards/[id]`
  - `<PriceTag />` — renders price with `.price` class applied; variants: `display` (large, full price), `compact` (inline), `muted` (greyed secondary price)
  - `<SkeletonCard />` — pulse-animated placeholder matching `<CardTile />` dimensions using `--bg-surface-2` / `--bg-surface-3` tokens
  - `<SkeletonText />` — pulse-animated text line placeholder; accepts `width` and `lines` props
  - `<PageShell />` — wraps `<Nav />` + `<main>` + `<Footer />` with `min-height: 100dvh` and flex column layout
  - All components: zero bare Tailwind color classes (`bg-white`, `text-gray-*`, `bg-gray-*`, `border-gray-*`); use Voltage CSS custom properties via `style` prop or CSS modules per D009
  - Acceptance: 20+ component tests pass (render smoke tests + key prop/state assertions); `grep -r "bg-white\|text-gray-500\|bg-gray-" storefront/src/components/shared/` returns zero matches

- [ ] **T03: storefront test infrastructure** `est:1h`
  - Configure Vitest with `jsdom` environment in `storefront/vitest.config.ts`; set coverage thresholds: statements 80%, branches 80%, lines 80%, functions 80%
  - Install and configure `@testing-library/react` + `@testing-library/user-event` + `@testing-library/jest-dom`
  - Create `storefront/src/test/setup.ts` with `@testing-library/jest-dom` import and any global mocks (e.g. `next/navigation`, `next/image`)
  - Create `storefront/src/test/render.tsx` — custom render helper wrapping components with `ThemeProvider` (if applicable) + `QueryClientProvider` with a fresh `QueryClient` per test
  - Acceptance: `cd storefront && npm run test` exits 0; coverage report generates without errors; empty test suite passes

- [ ] **T04: Quality gate scripts** `est:1h`
  - Run `npm run lint && npm run typecheck && npm run build && npm test` in `storefront/` — fix any pre-existing type errors or lint violations in files touched by T01–T03
  - Run `npm run lint && npm run typecheck && npm run build && npm test` in `customer-backend/` — verify baseline passes
  - Confirm all quality gate commands are present in each repo's `package.json`; add missing scripts if absent (e.g. `"typecheck": "tsc --noEmit"`)
  - Acceptance: quality gate exits 0 in both `storefront/` and `customer-backend/`; any pre-existing failures that are out of scope are documented in S01-SUMMARY
