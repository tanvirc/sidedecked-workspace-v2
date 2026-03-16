---
story_key: s01
title: Design Foundation + Cart Optimizer Algorithm
status: planned
requirement_ids: [R001, R018, R019, R023]
affected_repos: [storefront]
story_type: feature
ui_story: true
split_brain_risk: false
needs_deploy: false
party_gates:
  readiness: passed
  design_plan: passed
approvals:
  selected: false
  plan_frozen: true
  external_actions: false
review:
  spec_pass: pending
  quality_pass: pending
links:
  context: S01-CONTEXT.md
  research: S01-RESEARCH.md
  plan: S01-PLAN.md
  uat: S01-UAT.md
  summary: S01-SUMMARY.md
---

## Story

Lock the shared UI surface and prove the cart optimizer before any dependent slice builds on top of them.

S01 covers four UI components and two BFF+algorithm pairs:

**UI Components (storefront)**
- `ModernHeader` — glassmorphic sticky nav matching the `sd-nav.js` wireframe spec: 5 nav links (Cards / Decks / Marketplace / Sell / Community), icon row (search, wishlist, cart badge, auth avatar), mobile hamburger + bottom bar. All colors via Voltage CSS custom properties.
- `Footer` — gradient wordmark (`--brand-primary` → `#A78BFA`), nav link columns with `/en/`-prefixed hrefs, social icons (Discord, Twitter, GitHub), copyright year. No light-mode classes.
- `PriceTag` — three display variants (compact / inline / detailed) using the `.price` CSS class from `globals.css` for tabular DM Mono figures and `--text-price` colour. Null price renders "No sellers". Trend indicators (up/down arrows).
- `CardGridSkeleton` — configurable count of card-shaped skeleton tiles with dashed border and shimmer animation. Used for grid loading states before data arrives.

**Services (storefront BFF)**
- `GET /api/cards/[id]` — BFF aggregating catalog data from `customer-backend` and listings from `backend` via `Promise.allSettled`. Catalog failure → 404. Listings failure → 200 with `listings: []` and `listingsUnavailable: true`; never propagates a listings 500 to the client.
- `optimizeCart(listingsByCard, mode)` — pure greedy algorithm producing seller groupings for three modes: `cheapest`, `fewest-sellers`, `best-value`. Processes SKUs in scarcity order (fewest listings first), deduplicates shipping per seller, computes savings vs worst-case split. Verified < 1 ms for a 15-card × 10-seller fixture.
- `POST /api/optimizer/listings` — BFF wrapping `optimizeCart`: validates input (≤ 60 SKUs, valid mode), fetches listings in batches of 5 concurrent requests, merges seller trust scores, calls the optimizer, returns `{ result, partialFailures }`. Individual SKU failures produce partial results, not a 500.

All implementations were already present in the codebase. S01 delivered and verified the test layer (85 tests across 8 files) and confirmed Voltage token compliance by grep.

## Acceptance Criteria

1. `ModernHeader` renders exactly 5 nav links — Cards, Decks, Marketplace, Sell, Community — in that order, with correct hrefs.
2. `ModernHeader` renders a cart badge when `cart` prop has items; renders a sign-in button when `user` is null and a seller-state indicator when `user` has seller role; mobile hamburger toggle opens/closes the mobile menu.
3. `Footer` renders a gradient wordmark, 5 nav links with `/en/`-prefixed paths, 3 social icon links (Discord, X, GitHub) with correct `aria-label` attributes, and the current copyright year.
4. `PriceTag` applies the `.price` CSS class to the numeric price figure in all three variants (compact, inline, detailed). No inline `fontFamily` or `color` style override on the price figure itself.
5. `PriceTag` renders "No sellers" when `price` prop is `null`; `trend="down"` renders a green indicator; `trend="up"` renders a red indicator.
6. `CardGridSkeleton` renders 12 tiles by default; renders exactly N tiles when the `count` prop is provided; tiles have a dashed border and shimmer animation.
7. `GET /api/cards/[id]` returns 200 with `{ card, listings: [], listingsUnavailable: true }` when the backend listings endpoint returns a 5xx or times out. Returns 404 when the catalog endpoint returns 404.
8. `optimizeCart()` returns correct seller groupings for all three modes; shipping is charged once per seller regardless of how many cards are sourced from them; `unassignedCards` contains any SKU with no available listings.
9. `optimizeCart()` completes in < 1 ms for a 15-card × 10-seller fixture (verified by timing in tests).
10. `POST /api/optimizer/listings` caps concurrent listing fetches at ≤ 5 (batch size = 5); when one SKU's fetch fails, the remaining SKUs are still fetched and the failed SKU appears in `errors`; the response shape is `{ listings: Record<string, BackendListing[]>, errors: string[], timestamp: number }`; empty `skus` array or request body exceeding 100 SKUs returns 400. Note: optimization (mode selection) is deferred to the client; this route returns raw listings only.
11. `grep -rn "window\.alert\|window\.confirm\|window\.prompt" storefront/src/` returns zero matches.
12. `grep -rn "bg-white\|text-gray-900\|text-black\b\|bg-gray-" storefront/src/components/organisms/Header storefront/src/components/organisms/Footer storefront/src/components/tcg/PriceTag.tsx` returns zero matches.

## Constraints

- **Voltage tokens only.** New components must use CSS custom properties from `colors.css` (e.g. `--bg-surface-1`, `--text-primary`, `--brand-primary`). Light-mode Tailwind classes (`bg-white`, `text-gray-*`, `text-black`, `bg-gray-*`) are forbidden.
- **`.price` CSS class required.** PriceTag must apply the `.price` class from `globals.css` to all price figures — not `font-mono` or any inline style — so that tabular numeral alignment works across all usage contexts (grid, table, detail page).
- **Voltage tokens via inline style, not Tailwind utilities.** Tailwind has no Voltage utility classes; token colours must be applied as `style={{ color: 'var(--token)' }}` or via a CSS class that references the token.
- **BFF concurrency cap.** The listings BFF (`POST /api/optimizer/listings`) must not exceed 5 concurrent outbound requests (batch size = CONCURRENCY_LIMIT = 5).
- **Price unit consistency.** `PriceTag.price` prop is in dollars (e.g. `12.99`). `BackendListing.price` (used by the optimizer) is in cents. The BFF is responsible for the conversion; components must not mix units.
- **No catalog failures propagated as BFF 500s.** When the catalog endpoint responds 200, the card detail BFF must always return 200, even if listings fail.

## Definition of Done

All of the following must pass before the slice is considered done:

1. `npm test -- --run` in `storefront/` — all S01 test files pass (85 tests, 8 files).
2. `grep -rn "window\.alert\|window\.confirm\|window\.prompt" storefront/src/` — zero matches.
3. `grep -rn "bg-white\|text-gray-900\|text-black\b\|bg-gray-" storefront/src/components/organisms/Header storefront/src/components/organisms/Footer storefront/src/components/tcg/PriceTag.tsx` — zero matches.

**Status: all three checks passed as of 2026-03-16.**

## Open Questions

None. All questions raised during planning were resolved during implementation. See `S01-SUMMARY.md` for any deviations from the plan (primarily: all implementations pre-existed; S01 was a test and verification pass).

## Affected Repos

- `storefront` only. No changes to `backend`, `customer-backend`, `discord-bot`, or `vendorpanel`.

## UI Story

Yes. This slice includes four UI components: `ModernHeader`, `Footer`, `PriceTag`, and `CardGridSkeleton`. The BFF routes and optimizer algorithm are also in the `storefront` repo (Next.js API routes and a `lib/` pure function) but have no visual surface of their own — they support future UI slices (S02–S05).
