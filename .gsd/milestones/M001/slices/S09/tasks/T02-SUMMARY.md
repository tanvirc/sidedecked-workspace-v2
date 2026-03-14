---
id: T02
parent: S09
milestone: M001
provides:
  - "optimizeCart() pure function with cheapest, fewest-sellers, and best-value modes"
  - "deriveShippingCost() helper for shipping cost derivation from method string"
  - "formatOptimizationSummary() diagnostic helper for logging optimizer results"
  - "totalWithoutOptimization and savings fields on OptimizationResult type"
key_files:
  - storefront/src/lib/optimizer/optimizeCart.ts
  - storefront/src/lib/optimizer/types.ts
  - storefront/src/lib/optimizer/__tests__/optimizeCart.test.ts
key_decisions: []
patterns_established:
  - "Greedy heuristic with scarcity-first card ordering and per-seller shipping amortization"
  - "Remaining-quantity tracking via Map<listingId, number> for quantity-aware splitting"
  - "Best-value mode: run both cheapest and fewest-sellers, pick fewest-sellers if cost increase < 15%, else weighted score (0.7 cost + 0.3 sellers)"
  - "Naive cost baseline: cheapest-per-card with per-card shipping (no amortization) for savings calculation"
observability_surfaces:
  - "formatOptimizationSummary() outputs [cart-optimizer] prefixed diagnostic line with mode, card count, seller count, total, savings"
  - "unassignedCards array in result surfaces cards with zero listings"
duration: 15m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Implement greedy cart optimizer algorithm with three modes

**Built pure `optimizeCart()` function with greedy heuristic implementing cheapest, fewest-sellers, and best-value modes, with shipping amortization, scarcity-first ordering, quantity splitting, and exhaustive test coverage.**

## What Happened

1. Added `totalWithoutOptimization` and `savings` fields to `OptimizationResult` in `types.ts` — needed for the savings callout in the UI panel (T03).

2. Implemented `optimizeCart()` in `storefront/src/lib/optimizer/optimizeCart.ts`:
   - **Pre-processing:** Deduplicates `missingCards` by `catalogSku` (summing quantities), separates cards with no listings into `unassignedCards`, sorts remaining by listing count ascending (scarcity-first per D004).
   - **Cheapest mode:** For each card in scarcity order, evaluates all available listings. Computes marginal cost = `price * quantity` + shipping (only if seller not yet in result). Picks lowest marginal cost, tiebreaker by sellerId for determinism.
   - **Fewest-sellers mode:** Two-pass per card — first tries existing sellers (no shipping increment), then new sellers (with shipping). Ensures maximum consolidation.
   - **Best-value mode:** Runs both cheapest and fewest-sellers internally. If fewest-sellers cost increase ≤ 15%, uses it. Otherwise computes weighted score (0.7 × normalized cost + 0.3 × normalized seller count) and picks the winner.
   - **Quantity splitting:** Tracks remaining stock per listing ID via `Map<string, number>`. When a listing can't fulfill full demand, takes what's available and continues to next-best listing.
   - **Savings calculation:** Computes naive baseline (cheapest per-card + per-card shipping without amortization) and subtracts optimized total.

3. Implemented helpers:
   - `deriveShippingCost(shippingMethod, shippingCost?)` — exported for reuse in T03 UI
   - `formatOptimizationSummary(result)` — diagnostic output with `[cart-optimizer]` prefix

4. Wrote 22 tests covering all modes and edge cases.

## Verification

- `npx vitest run src/lib/optimizer/__tests__/optimizeCart.test.ts` — **22 tests pass** (deriveShippingCost: 5 tests, optimizeCart: 15 tests, formatOptimizationSummary: 2 tests)
- `cd storefront && npx vitest run` — **890 tests pass** (1 pre-existing failure in deferred-intent TTL boundary test, unrelated)
- Performance: 15 cards × 10 sellers per card completes in < 50ms for all 3 modes (actual ~1ms)

### Slice verification status (T02 of 3):
- ✅ `npx vitest run src/lib/optimizer/__tests__/optimizeCart.test.ts` — pass (22 tests)
- ✅ `npx vitest run src/contexts/__tests__/DeckBuilderOwnership.test.tsx` — pass (from T01)
- ⬜ `npx vitest run src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx` — not yet created (T03)
- ✅ `npx vitest run src/app/api/optimizer/__tests__/listings.test.ts` — pass (from T01)
- ✅ `cd storefront && npx vitest run` — 890 pass
- ⬜ `cd storefront && npm run build` — not run (final task gate)

## Diagnostics

- `formatOptimizationSummary(result)` logs mode, card count, seller count, total cost, savings, and unavailable cards with `[cart-optimizer]` prefix
- `result.unassignedCards` surfaces any cards with zero available listings
- `result.savings` and `result.totalWithoutOptimization` show optimization benefit vs naive approach

## Deviations

- Task plan called the field `unavailableCards` but T01 already established the type as `unassignedCards` — kept the existing type name for consistency.
- Scarcity ordering test redesigned: original test assumed listings from the same seller compete for quantity across different SKUs, but each SKU has independent listings. Test now validates that scarcity sort order is applied correctly.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/lib/optimizer/optimizeCart.ts` — new: pure optimizer function with 3 modes, shipping derivation, diagnostic summary helper
- `storefront/src/lib/optimizer/types.ts` — modified: added `totalWithoutOptimization` and `savings` fields to `OptimizationResult`
- `storefront/src/lib/optimizer/__tests__/optimizeCart.test.ts` — new: 22 tests covering all modes, edge cases, shipping, dedup, performance
