# S01: Voltage Design System Foundation — Research

**Date:** 2026-03-13

## Summary

The Voltage design system foundation is largely in place — tokens, typography, fonts, shared components, and shadcn/ui primitives all exist and are functional. The 672 existing tests pass. The primary work is **alignment and polish**, not greenfield construction. The ModernHeader closely matches the `sd-nav.js` wireframe spec. CardDisplay, PriceTag, RarityBadge, GameBadge, and CardGridSkeleton all exist with tests. The toast infrastructure (sonner) is mounted and working, and **zero alert/confirm/prompt calls remain** — R023 appears already satisfied.

The two real gaps are: (1) the Footer component is completely wrong vs the wireframe (3-column grid with `bg-primary` vs the wireframe's minimal one-row bar with gradient logo + links + social icons), and (2) PriceTag doesn't use tabular figures or the mono-stats font despite a `.price` CSS class being defined in globals.css for exactly that purpose. There are also 685 instances of hardcoded light-mode colors (`bg-white`, `bg-gray-*`, `text-gray-*`) across older components, but most are outside S01's direct scope — S01 should ensure the shared components it produces are clean, not audit every component.

## Recommendation

**Approach: Audit-and-Align, not Rebuild**

Most components exist. The work is:
1. **Footer rewrite** — replace the current 3-column `bg-primary` footer with a wireframe-matching minimal bar (gradient logo, links, social icons, copyright)
2. **PriceTag token alignment** — add `font-mono-stats` font family and `tabular-nums` / `tnum` feature settings so prices align in columns
3. **Token audit** — verify colors.css tokens are complete and locked, verify `.dark` block has no gaps vs `:root`
4. **Typography verification** — confirm all typography classes in globals.css match wireframe usage (display, heading, label scales)
5. **Nav verification** — compare ModernHeader against sd-nav.js for any remaining delta (minor — mostly icon consistency)
6. **Skeleton verification** — CardGridSkeleton uses `card-aspect` correctly, verify it renders with Voltage tokens
7. **Dark mode audit** — scan shared components for hardcoded colors; fix any in S01-produced components
8. **Toast migration verification** — confirm 0 alert/confirm/prompt calls remain (already confirmed by grep)
9. **Test maintenance** — ensure existing tcg/ tests still pass, add tests for Footer rewrite

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Toast notifications | `sonner` via `@/components/ui/sonner` + `@/lib/helpers/toast` | Already mounted in providers.tsx, styled with Voltage tokens, wrapper exists |
| Bottom sheets / mobile drawers | `@/components/ui/sheet.tsx` (shadcn/ui Sheet) | 140-line standard component, already imported by other features |
| Command palette / search | `@/components/search/EnhancedSearchBar` + `SearchCommandPalette` | Pill opens Cmd+K palette — matches wireframe pattern exactly |
| Image loading + blurhash | `@/components/common/BlurHashImage` | Already integrated into CardDisplay with fallback chain |
| Price formatting | `Intl.NumberFormat` in PriceTag + `@/lib/helpers/money.ts` | Two formatters exist — PriceTag for card prices (USD, expects dollar values), money.ts for Medusa amounts |

## Existing Code and Patterns

### Token System
- `storefront/src/app/colors.css` — Comprehensive Voltage token set with `:root` (light) and `.dark` blocks. ~300 lines. Includes core Tailwind tokens, brand palette (violet scale), Voltage surfaces, semantic colors, game brand colors, TCG rarity tokens per game, and full `@theme inline` block for Tailwind v4 integration. **Well-structured, complete.**
- `storefront/src/app/globals.css` — Typography scale (text-sm/md/lg/xl, label-sm/md/lg/xl, heading-xs/sm/md/lg/xl, display-sm/md/lg), responsive typography breakpoints, nav utilities (.nav-icon-action, .search-pill), `.price` class with tabular figures, `.card-aspect` for 2.5:3.5 ratio, animations (fadeIn, slideInLeft, bounceIn, brand-pulse, gradient-sweep, card-glow). ~320 lines.
- `storefront/tailwind.config.ts` — Extends Tailwind with Voltage color mappings, custom font families (sans, display, mono, barlow, heading, dm-mono), custom border radii, extended grid columns (7-10), screen breakpoints (3xl, 4xl). **All Voltage tokens accessible as Tailwind utilities.**

### Fonts
- `storefront/src/app/layout.tsx` — Loads Inter (sans), Barlow Condensed (display), Barlow (heading), DM Mono (stats), Geist Sans/Mono via CSS variables. All font vars applied to body.

### Shared Components (S01 produces)
- `storefront/src/components/organisms/Header/ModernHeader.tsx` (~280 lines) — Glass nav with sticky positioning, desktop + mobile variants, search pill, icon buttons, avatar dropdown, theme toggle, auth-gated actions. **Closely matches sd-nav.js spec.** Minor differences: uses Lucide icons vs wireframe's inline SVGs; has user dropdown on hover (wireframe doesn't spec this — acceptable enhancement).
- `storefront/src/components/organisms/Header/Header.tsx` — Server component wrapper that fetches cart, user, wishlist, categories, regions and passes to ModernHeader.
- `storefront/src/components/organisms/Footer/Footer.tsx` (~50 lines) — **NEEDS REWRITE.** Currently a 3-column grid (Customer Services / About / Connect) with `bg-primary` background. Wireframe specifies a minimal one-row bar: gradient logo text + 5 links (About, FAQ, Terms, Privacy, Contact) + 3 social icons (Discord, X, GitHub) + copyright line. Completely different layout and style.
- `storefront/src/components/tcg/CardDisplay.tsx` (~350 lines) — 4 variants (gallery, grid, list, compact) with image fallback chain (normal → small → thumbnail), blurhash, drag support, selection mode. Uses RarityBadge, PriceTag, GameBadge. **Well-built, uses Voltage tokens.**
- `storefront/src/components/tcg/PriceTag.tsx` (~130 lines) — 3 variants (inline, detailed, compact) with price formatting, seller count, trend arrows, market avg. Uses `var(--text-price)`. **Missing tabular figures and mono-stats font** — should use the `.price` class from globals.css or apply equivalent styles.
- `storefront/src/components/tcg/RarityBadge.tsx` (~80 lines) — Game-specific rarity colors using CSS var tokens. Uses `color-mix()` for backgrounds. Clean.
- `storefront/src/components/tcg/GameBadge.tsx` (~40 lines) — Game-specific brand colors in pill badges. Uses `color-mix()`. Clean.
- `storefront/src/components/cards/CardGridSkeleton.tsx` (~45 lines) — Grid/list skeleton with `card-aspect` ratio, pulse animation. Uses `useGridColumns` hook for responsive grid.
- `storefront/src/components/atoms/SideDeckedLogo/SideDeckedLogo.tsx` — Logo component with `text` and `full` (SVG) variants. Text variant uses `font-display`, `--brand-primary`.

### Toast Infrastructure
- `storefront/src/components/ui/sonner.tsx` — shadcn/ui Toaster wrapper with Voltage token styling
- `storefront/src/lib/helpers/toast.ts` — Convenience wrapper with `.info()`, `.success()`, `.error()` methods
- `storefront/src/app/providers.tsx` — Toaster mounted at `position="bottom-right" richColors`
- **Zero alert()/confirm()/prompt() calls found in storefront/src/** — R023 is satisfied

### shadcn/ui Components Available
- `alert-dialog.tsx`, `button.tsx`, `command.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `popover.tsx`, `progress.tsx`, `scroll-area.tsx`, `separator.tsx`, `sheet.tsx`, `sonner.tsx`, `tabs.tsx`, `tooltip.tsx`
- Plus custom: `MobileTouchActions.tsx`, `OptimizedImage.tsx`, `VirtualizedList.tsx`

### Layout Integration
- `storefront/src/app/[locale]/(main)/layout.tsx` — Wraps all main pages with `<Header />` + `{children}` + `<Footer />`

### Tests
- `storefront/src/components/tcg/__tests__/` — CardDisplay (259 lines), PriceTag (64 lines), RarityBadge (55 lines), GameBadge (53 lines) — 431 total test lines
- Vitest + jsdom + `@vitejs/plugin-react`, `@/` alias resolved, `server-only` mocked
- **672 tests pass across 67 test files** as of research date

## Constraints

- **Wireframe authority (D003):** HTML wireframes in `docs/plans/wireframes/` are the authoritative design source. sd-nav.js is the nav source of truth. Figma is export target, not source.
- **Import pattern:** `@/` path alias, double quotes, no semicolons (convention from codebase)
- **Dark mode first:** Voltage is dark-mode-primary. `.dark` class on `<html>` via next-themes. All new/modified components must work in both modes.
- **Font loading:** Fonts loaded in layout.tsx via `next/font/google` and `geist/font`. CSS variables (`--font-barlow-condensed`, `--font-barlow`, `--font-dm-mono`, `--font-geist-mono`) must be used, not direct font names.
- **Tailwind v4 compatibility:** colors.css uses `@theme inline` block for Tailwind v4 token registration. New tokens should follow this pattern.
- **672 tests must keep passing.** Footer rewrite may break footer-related tests if any exist (none found in tcg/ tests).
- **color-mix() browser support:** RarityBadge and GameBadge use `color-mix(in srgb, ...)` — supported in all modern browsers but not IE11. Acceptable for this project.

## Common Pitfalls

- **PriceTag not using tabular figures** — Prices in columns or tables will misalign because digits have proportional widths. Fix: apply `font-family: var(--font-mono-stats)` and `font-feature-settings: 'tnum'` to the price display span, or use the existing `.price` CSS class. The `tabular-nums` Tailwind utility is an alternative.
- **Footer `bg-primary` visual break** — Current footer uses `bg-primary` (violet `#7C3AED`) which is extremely jarring against the dark `#09090F` page background. The wireframe footer has no explicit background (inherits page background) with a `border-top` separator instead.
- **Hardcoded colors in old components** — 685 instances of `bg-white`, `bg-gray-*`, `text-gray-*` exist across storefront components. S01 should NOT attempt to fix these — only ensure S01-produced shared components use Voltage tokens exclusively. Downstream slices will handle page-level cleanup.
- **`--text-price` is violet, not gold** — The boundary map description says "gold color" for PriceTag, but both the CSS tokens (`--text-price: var(--primary)`) and wireframes (`color: var(--brand-primary)`) specify violet/purple. The wireframes are authoritative. Keep violet.
- **Theme toggle in nav** — ModernHeader has `Moon`/`Sun` toggle. sd-nav.js wireframe shows only `Moon` icon. Since the wireframe is static HTML, it can only show one state — the toggle behavior in ModernHeader is the correct implementation.

## Open Risks

- **Footer link destinations** — Wireframe shows About, FAQ, Terms, Privacy, Contact. Current `footerLinks.ts` has different categories (Customer Services, About, Connect). Need to decide whether to match wireframe links exactly or keep existing link structure. Recommend matching wireframe exactly since it's authoritative.
- **Scope creep into component fixes** — 685 hardcoded-color instances could tempt a broad cleanup. Must resist — S01's scope is shared components only. Other slices handle page-level alignment.
- **Typography class conflicts** — globals.css overrides Tailwind's `text-xl`, `text-lg`, `text-md`, `text-sm` with custom font-weight and tracking. This affects ALL components using these classes. Any downstream component that expects default Tailwind `text-sm` behavior gets `font-light` instead. This is intentional but surprising — document it.
- **PriceTag price unit ambiguity** — PriceTag accepts `price: number` and formats as USD dollars. Medusa stores amounts in smallest currency unit (cents). The contract is: callers must convert before passing. This is fine but undocumented — should add JSDoc.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| shadcn/ui | `shadcn/ui@shadcn` (14.1K installs) | available — not critical, components already installed |
| Next.js App Router | `wshobson/agents@nextjs-app-router-patterns` (8.1K installs) | available — useful for future slices but not needed for S01 |
| Tailwind CSS | `josiahsiegel/claude-plugin-marketplace@tailwindcss-advanced-layouts` (2.3K installs) | available — not needed for S01 scope |
| Frontend Design | `frontend-design` | installed (user skill) |

## Requirements Coverage

| Req | Role | Status | Notes |
|-----|------|--------|-------|
| R001 | Primary owner | Mostly exists | Nav ✓, CardDisplay ✓, PriceTag needs tabular-nums fix, Skeleton ✓, Footer needs rewrite. Token audit needed. |
| R023 | Primary owner | **Already satisfied** | Zero alert/confirm/prompt calls found in storefront/src/ |
| R024 | Primary owner | Partially exists | Shared components (tcg/) are clean. Footer needs rewrite. 685 hardcoded colors exist in older components but are outside S01 scope. |

## Sources

- `docs/plans/wireframes/sd-nav.js` — Authoritative nav design with embedded CSS, icon SVGs, desktop/mobile/workspace variants
- `docs/plans/wireframes/storefront-homepage.html` — Authoritative footer design (lines 628–690, 995–1025)
- `docs/plans/wireframes/storefront-card-detail.html` — Price display patterns confirming violet color for prices
- Codebase grep for alert/confirm/prompt — 0 results, confirming R023 completion
- Vitest run — 672 passed, 67 test files, 0 failures
