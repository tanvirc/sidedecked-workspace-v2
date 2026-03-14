---
id: T03
parent: S09
milestone: M001
provides:
  - CartOptimizerPanel component with Sheet-based mobile/desktop rendering
  - OptimizerModeToggle component with three optimization modes
  - SellerGroupCard component with per-card swap-seller override
  - "Buy Missing Cards" button wired in DeckViewerHeader and DeckBuilderLayout
key_files:
  - storefront/src/components/optimizer/CartOptimizerPanel.tsx
  - storefront/src/components/optimizer/OptimizerModeToggle.tsx
  - storefront/src/components/optimizer/SellerGroupCard.tsx
  - storefront/src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx
  - storefront/src/components/decks/DeckViewerHeader.tsx
  - storefront/src/components/deck-builder/DeckBuilderLayout.tsx
key_decisions:
  - "D032: Override logic mutates optimizer result in-place rather than re-running full optimizer — keeps swap instant while preserving group totals"
  - "D033: Add-to-cart resolves catalogSku→variant via Medusa product lookup, matching existing CardDetailPage pattern"
  - "D034: Toast feedback uses shared useToast() from ToastProvider — success/warning/error types for full/partial/no success"
patterns_established:
  - "Per-card override via OverrideMap applied post-optimization — avoids re-fetch, swaps assignment between seller groups"
  - "Staleness timer pattern — setTimeout for remaining time until 5min threshold, then show refresh button"
  - "Sequential add-to-cart with per-item error accumulation and aggregate toast reporting"
observability_surfaces:
  - "console.error('[cart-optimizer] Add to cart failed for variant:') on per-item cart failure"
  - "console.warn('[cart-optimizer] Results stale, timestamp:') when panel detects staleness"
  - "data-testid attributes: optimizer-panel, mode-toggle, seller-group-{id}, add-to-cart-btn, staleness-indicator, buy-missing-btn, unavailable-cards"
duration: 1 task
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T03: Build CartOptimizerPanel UI and wire deck-to-cart flow end-to-end

**Built optimizer panel UI with mode toggle, seller group cards, per-card swap override, add-to-cart with partial failure reporting, staleness indicator, and wired "Buy Missing Cards" buttons in both DeckViewerHeader and DeckBuilderLayout.**

## What Happened

Built three new components in `storefront/src/components/optimizer/`:

1. **OptimizerModeToggle** — Three-button toggle (Cheapest/Fewest Sellers/Best Value) with brand-primary active state and Voltage-compliant inline styles.

2. **SellerGroupCard** — Renders one seller group with seller name, star rating, review count, per-card rows with condition badges (reusing CONDITION_STYLES pattern from AlgoliaCardHit), price, and a swap button that opens an inline dropdown showing alternative sellers for that card. Footer shows subtotal + shipping.

3. **CartOptimizerPanel** — Main panel component using Sheet (right side). On open, fetches listings via `POST /api/optimizer/listings`, runs `optimizeCart()` client-side, renders loading skeleton → mode toggle → seller groups → unavailable cards section → total with savings callout → staleness indicator → "Add to Cart" button. Mode changes re-run optimizer without re-fetching. Per-card overrides mutate the result to swap assignments between seller groups. Add-to-cart resolves catalogSku→Medusa variant (matching CardDetailPage pattern), then calls `addToCart()` sequentially. Reports full/partial/no success via toast.

Wired "Buy Missing Cards" button in:
- **DeckViewerHeader**: Shows when deck has cards. In viewer context, all cards are "missing" since there's no owned-state.
- **DeckBuilderLayout**: Uses `getMissingCards()` from DeckBuilderContext. Button in toolbar area, disabled when no missing cards.

## Verification

- `npx vitest run src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx` — 18 tests pass (mode toggle, seller groups, card override, add-to-cart, partial failure, staleness, unavailable cards, panel close, Voltage compliance)
- `npx vitest run src/lib/optimizer/__tests__/optimizeCart.test.ts` — 22 tests pass
- `npx vitest run src/contexts/__tests__/DeckBuilderOwnership.test.tsx` — 7 tests pass
- `npx vitest run src/app/api/optimizer/__tests__/listings.test.ts` — 8 tests pass
- `cd storefront && npx vitest run` — 909 tests pass (all, 55 above baseline)
- `grep -rn "bg-white\|bg-gray-\|text-gray-\|border-gray-" storefront/src/components/optimizer/` — zero matches in component files
- `cd storefront && npm run build` — fails with pre-existing type error in `CardSearchInput.tsx:63` (unrelated, confirmed identical failure on base branch without any S09 changes)

## Diagnostics

- `data-testid="optimizer-panel"` — the Sheet container, queryable in browser devtools
- `data-testid="mode-toggle"` — mode toggle buttons
- `data-testid="seller-group-{sellerId}"` — each seller group card
- `data-testid="add-to-cart-btn"` — the add-to-cart button
- `data-testid="staleness-indicator"` — shows fetch age and refresh button when stale
- `data-testid="buy-missing-btn"` — the trigger buttons in both DeckViewerHeader and DeckBuilderLayout
- Console: `[cart-optimizer] Add to cart failed for variant:` on per-item failure
- Console: `[cart-optimizer] Results stale, timestamp:` when staleness threshold exceeded

## Deviations

None.

## Known Issues

- Pre-existing build failure in `storefront/src/components/seller/wizard/CardSearchInput.tsx:63` — type error on `.map()` of `{}`. Not introduced by S09 changes. Identical failure confirmed on base branch.

## Files Created/Modified

- `storefront/src/components/optimizer/CartOptimizerPanel.tsx` — main optimizer panel with Sheet, fetch, optimize, override, add-to-cart, staleness
- `storefront/src/components/optimizer/OptimizerModeToggle.tsx` — three-mode toggle (cheapest, fewest-sellers, best-value)
- `storefront/src/components/optimizer/SellerGroupCard.tsx` — seller group card with per-card swap dropdown
- `storefront/src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx` — 18 comprehensive tests
- `storefront/src/components/decks/DeckViewerHeader.tsx` — added "Buy Missing Cards" button and CartOptimizerPanel
- `storefront/src/components/deck-builder/DeckBuilderLayout.tsx` — added "Buy Missing" button in toolbar and CartOptimizerPanel
