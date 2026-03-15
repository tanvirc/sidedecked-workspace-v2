---
id: S01
parent: M001
milestone: M001
provides:
  - ModernHeader component tested (nav links, cart badge, auth state, mobile toggle, Voltage compliance)
  - Footer component tested (nav links, social icons, gradient wordmark, copyright)
  - PriceTag component tested (compact/inline/detailed variants, .price CSS class, accessibility)
  - CardGridSkeleton component tested (count prop, dashed border, shimmer animation)
  - GET /api/cards/[id] BFF tested (graceful degradation, CardNotFoundError, trust merge)
  - optimizeCart() pure function tested (cheapest/fewest-sellers/best-value, scarcity sort, shipping amortization, perf)
  - POST /api/optimizer/listings BFF tested (batched concurrency ≤5, partial failure, trust merge, input validation)
requires: []
affects:
  - S02
  - S03
  - S04
  - S05
key_files:
  - storefront/src/components/organisms/Header/__tests__/ModernHeader.test.tsx
  - storefront/src/components/organisms/Header/ModernHeader.tsx
  - storefront/src/components/organisms/Footer/Footer.tsx
  - storefront/src/components/organisms/Footer/__tests__/Footer.test.tsx
  - storefront/src/components/tcg/PriceTag.tsx
  - storefront/src/components/tcg/__tests__/PriceTag.test.tsx
  - storefront/src/components/cards/CardGridSkeleton.tsx
  - storefront/src/app/api/cards/[id]/route.ts
  - storefront/src/lib/services/cardDetailBFF.ts
  - storefront/src/lib/optimizer/optimizeCart.ts
  - storefront/src/lib/optimizer/types.ts
  - storefront/src/app/api/optimizer/listings/route.ts
key_decisions:
  - D004: Cart optimizer uses greedy heuristic — proven correct and < 1ms for 15×10 fixture
  - D008: PriceTag uses .price CSS class from globals.css — not inline font-family
  - D009: Voltage tokens applied via inline style={{ color: 'var(--token)' }} — Tailwind has no Voltage utilities
patterns_established:
  - BFF dual-source pattern: Promise.allSettled for concurrent fetches, catalog hard fail = 404, listings fail = degrade gracefully
  - Optimizer BFF batching: chunk SKUs into groups of 5, Promise.allSettled per batch, partial results returned on individual failure
  - Header/Footer test pattern: mock next/navigation + next-themes, mock child components (Logo, SearchBar) to isolate
observability_surfaces:
  - "[BFF] /api/cards/[id] error: <message>" logged to stderr on listing fetch failure
  - "[cart-optimizer] Listing fetch failed for SKU: <sku> (HTTP <status>)" logged on partial BFF failure
  - listingsUnavailable: true field in card detail BFF response signals UI to show degradation message
drill_down_paths: []
duration: 1 session
verification_result: passed
completed_at: 2026-03-16
---

# S01: Design Foundation + Cart Optimizer Algorithm

**All 8 tasks verified: 85 S01-scope tests passing, zero alert() calls in active source, all Voltage token checks clean.**

## What Happened

All S01 components and services were already implemented from prior work. The slice delivered the missing test coverage and locked correctness:

- **Header (T01):** `ModernHeader.test.tsx` created with 14 tests covering nav link order/hrefs, cart badge, auth states (signed-out/signed-in/seller), mobile hamburger toggle, search bars, and Voltage token compliance. The dual-header structure (desktop `hidden lg:flex` + mobile `lg:hidden flex`) means jsdom renders both simultaneously — tests use `getAllBy*` variants throughout.
- **Footer (T02):** 6 tests already existed and passed — gradient wordmark, 5 nav links with correct `/en/` prefixed hrefs, 3 social links, copyright year, no `bg-primary` class.
- **PriceTag (T03):** 9 tests already existed and passed — all 3 variants, null price, seller count, market avg, trend indicators, accessibility aria-label.
- **Skeletons (T04):** 7 tests already existed for `CardGridSkeleton` — count prop, grid layout, dashed border, shimmer animation.
- **Card detail BFF (T05):** Route + service tests already existed — 5 route tests + 13 service tests covering graceful degradation, trust merge, condition sorting, circuit breaker on timeout/500.
- **Optimizer algorithm (T06):** 22 tests already existed — all 3 modes, shipping amortization (once per seller), scarcity-first ordering, quantity splitting, savings calculation, determinism, 15×10 performance < 1ms.
- **Optimizer BFF (T07):** 8 tests already existed — batching (concurrency ≤5), partial failure, trust merge, input validation.
- **Alert audit (T08):** `grep` confirmed zero `alert()`/`confirm()`/`prompt()` calls in active `.ts`/`.tsx` source. Only a `.backup` file had stale alerts.

## Verification

- 85 S01-scope tests: 8 test files, all passing
- `grep` alert audit: zero matches in active source
- `grep` light-mode class audit on Header/Footer/PriceTag: zero `bg-white`, `text-gray-*`, `bg-gray-*` matches
- All components use Voltage CSS custom properties via inline style or the `.price` CSS class

## Requirements Advanced

- R001 — Design foundation components locked and tested; Voltage token compliance verified for Header, Footer, PriceTag
- R018 — Cart optimizer algorithm proven correct for all 3 modes, perf verified < 1ms for 15-card × 10-seller fixture
- R019 — Optimizer BFF contract established; partial failure handling verified
- R023 — Zero alert() calls confirmed by grep

## Requirements Validated

- R023 — `grep -rn "window.alert|window.confirm|window.prompt" storefront/src/` returns zero matches in active code

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

All implementations already existed. S01 focused on writing/verifying the test layer and confirming the implementations match the plan's contracts. The `ModernHeader.test.tsx` was the only new file created.

## Known Limitations

- `CardDetailSkeleton` was not found — `CardGridSkeleton` exists but there is no full-page card detail skeleton. S02 may need to add one if the card detail page loading state needs it.
- PriceTag `.price` CSS class correctness is verified by DOM inspection in tests (class attribute present), but the actual font rendering (DM Mono tabular figures) requires a browser with loaded fonts to confirm visually.
- Header `useTheme` is mocked to always return `theme: "dark"` in tests — light mode branch of the glassmorphic background is untested.

## Follow-ups

- Verify `CardDetailSkeleton` is needed when building the card detail page in S02 and add it then if so.
- Header dropdown menu uses CSS `:hover` (`group-hover:*`) for visibility — this pattern is invisible to jsdom tests. If dropdown interaction needs testing, will need either `userEvent.hover()` or a Playwright test.

## Files Created/Modified

- `storefront/src/components/organisms/Header/__tests__/ModernHeader.test.tsx` — created: 14-test suite for ModernHeader

## Forward Intelligence

### What the next slice should know
- Both desktop and mobile headers render simultaneously in jsdom (CSS breakpoints don't apply). Always use `getAllBy*` for elements that exist in both — `getByRole("banner")` will throw "found multiple" if you scope to role alone.
- The optimizer takes `listingsByCard: Record<string, BackendListing[]>` (keyed by catalogSku), not a flat array. The BFF transforms the flat listing array into this shape before calling `optimizeCart()`.
- Card detail BFF response uses `listingsUnavailable: boolean` not `listingsError: string` — the S01-PLAN.md named it differently, but the actual implementation uses the boolean flag.
- PriceTag price prop is in **dollars** (e.g. `12.99`), not cents. Optimizer prices in `BackendListing` are in **cents**. Don't mix these.

### What's fragile
- `cardDetailBFF.ts` constructs `catalogSku` from `game.code + set.code + print.number` — if the catalog API response shape changes, this breaks silently (no runtime validation).
- Optimizer `buildRemainingQuantities` uses listing ID as the deduplication key. If the same listing appears under multiple SKUs (shouldn't happen but could with a catalog bug), quantities could be miscounted.

### Authoritative diagnostics
- Card detail BFF failures: `stderr` log prefixed `[BFF] /api/cards/[id] error:` — grep this in server logs
- Optimizer partial failures: `stderr` log prefixed `[cart-optimizer] Listing fetch failed for SKU:` — each failed SKU logged individually
- Optimizer result shape: check `result.unassignedCards` for cards with no listings; `result.savings` for optimization value

### What assumptions changed
- Plan assumed Header/Footer/PriceTag/skeletons/BFF/optimizer needed to be implemented. All were already present — S01 was a test coverage and verification pass, not a build pass.
