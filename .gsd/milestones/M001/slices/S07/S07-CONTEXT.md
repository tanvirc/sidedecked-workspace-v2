---
id: S07
milestone: M001
status: ready
---

# S07: Remaining Pages — Visual Alignment — Context

## Goal

Align all ~32 remaining storefront pages (commerce, seller, user-account, misc) to their S06-generated Voltage wireframes on both desktop (1440px) and mobile (390px), with per-page tests, shared layout extraction, and verified light + dark mode rendering.

## Why this Slice

S07 is the last visual alignment slice — after this, every page in the storefront renders consistently with Voltage tokens. Without S07, the ~32 remaining pages still use hardcoded light-mode Tailwind colors (121+ instances of bg-white, bg-gray-*, text-gray-* across 233 component files), creating a jarring inconsistency with the pixel-perfect pages delivered in S02, S03, S04, and S05. S07 is a leaf node (nothing depends on it directly), but milestone completion requires all pages to match their wireframes.

## Scope

### In Scope

- Visual restyling of all ~32 remaining pages to match their S06-generated wireframes at 1440px desktop and 390px mobile
- Light functional fixes where wireframes imply them: empty-state CTAs with working links, breadcrumbs, sidebar navigation wiring, proper loading skeletons. No new API integrations or backend work.
- Voltage token migration only on components that are actually rendered on the ~32 aligned pages — not a blanket migration of all component files
- Extraction of shared layout components where wireframes show common chrome across a page family (e.g. user-account sidebar+content shell, seller dashboard shell)
- Per-page structural tests: each of the ~32 pages gets at least 2-3 tests confirming key sections render and Voltage tokens are applied
- Both light and dark mode explicitly verified for every aligned page — Voltage semantic tokens have dark overrides, but both rendering modes must look correct
- Work grouped by page family: one task per family (commerce, seller, user-account, misc), approximately 4-5 tasks total

### Out of Scope

- Pages already aligned in prior slices: cards browse, card detail, search (S02), deck browser, deck builder, deck viewer (S03), homepage (S04), auth, profile (S05)
- New feature implementation — no new API endpoints, no new backend integrations, no new business logic
- Seller listing wizard functionality (S08 scope) — S07 only styles the sell/list-card page shell to match wireframe
- Cart optimizer UI (S09 scope) — S07 styles the cart page layout but not the optimizer panel
- Blanket token migration of components not visible on the ~32 target pages
- Vendor panel (vendorpanel/) — not in M001 scope
- Performance optimization beyond what's needed for visual correctness

## Constraints

- S06 must be complete before S07 starts — wireframes are the authoritative alignment targets
- Voltage tokens (colors.css, globals.css) are locked from S01 — use them as-is, do not modify the token set
- Inline `style` for CSS custom properties (D009) — Tailwind doesn't have utilities for Voltage tokens, so components use `style={{ color: 'var(--text-tertiary)' }}` pattern established in S01
- Existing page functionality must not break — cart, checkout, order flows, seller dashboard features all have working logic that must survive the restyle
- `.price` CSS class (D008) is the single source of truth for price typography — use it on any new price-displaying elements
- Shared layout extraction must not break Next.js App Router patterns — layouts must work with the `[locale]/(main)/` route group structure
- Both light and dark mode must render correctly — use Voltage semantic tokens (which have `.dark` overrides in colors.css) rather than hardcoding dark-only values

## Integration Points

### Consumes

- `docs/plans/wireframes/storefront-*.html` (S06 output) — authoritative visual targets for all ~32 pages
- `storefront/src/app/colors.css` — Voltage design tokens (S01 locked)
- `storefront/src/app/globals.css` — Typography scale classes (S01 locked)
- S01 shared components — ModernHeader, Footer, CardDisplay, PriceTag, RarityBadge, GameBadge, CardGridSkeleton, SideDeckedLogo
- S02/S03 patterns — glassmorphic card classes (card-detail.module.css), data-testid conventions, mobile tab patterns
- Existing page components in `storefront/src/components/sections/`, `storefront/src/components/seller/`, `storefront/src/components/molecules/`, `storefront/src/components/cells/`, `storefront/src/components/atoms/` — restyled in place

### Produces

- All ~32 remaining storefront pages visually aligned to wireframes at both breakpoints
- Shared layout components extracted where wireframes show common page family chrome (e.g. `UserAccountLayout`, `SellerDashboardLayout`)
- Per-page structural tests (2-3 per page, ~64-96 new tests total)
- Voltage token consistency across the entire storefront — zero hardcoded light-mode colors on any visible page
- Both light and dark mode verified on every aligned page

## Open Questions

- Shared layout component boundaries — the exact shape of shared layouts (user-account sidebar, seller dashboard shell) depends on what S06 wireframes show. Will be resolved during planning after S06 wireframes are reviewed. Current thinking: extract when 3+ pages share the same chrome.
- Test baseline impact — adding ~64-96 tests will raise the test count significantly. Need to confirm all existing tests still pass after the visual changes. Current thinking: run full suite after each page family task.
- Checkout page restyle depth — checkout has complex Stripe/payment integration in its components. Restyling it risks breaking payment flows. Current thinking: restyle outer layout/chrome to match wireframe, be surgical with payment-related component styling, test checkout flow manually.
- Light mode verification method — wireframes are dark-mode designs. Light mode "correct" is less well-defined since there are no light-mode wireframes. Current thinking: verify that Voltage semantic tokens produce a coherent light-mode rendering (readable text, appropriate contrast, no broken layouts) without requiring pixel-perfect light-mode wireframe matching.
