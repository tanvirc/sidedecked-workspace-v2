---
estimated_steps: 5
estimated_files: 6
---

# T01: Add "I own this" state to DeckBuilderContext and build BFF batch listings endpoint

**Slice:** S09 — Cart Optimizer & Deck-to-Cart Flow
**Milestone:** M001

## Description

Two infrastructure pieces the optimizer depends on. The "I own this" state management adds `ownedCards` to DeckBuilderContext so the deck builder can track which cards a user already owns, and `getMissingCards()` computes the input for the optimizer. The BFF batch endpoint parallelizes listing fetches for multiple catalog SKUs so the optimizer can get all listing data in one call within the 2s budget.

## Steps

1. Define shared optimizer types in `storefront/src/lib/optimizer/types.ts` — `MissingCard`, `OptimizationMode`, `OptimizationResult`, `SellerAssignment`, `SellerGroup`, and the BFF request/response shapes (`OptimizerListingsRequest`, `OptimizerListingsResponse`).

2. Add owned-cards state to `DeckBuilderContext.tsx`:
   - Add `ownedCards` as `Set<string>` (keyed by `catalogSku`) using `useRef` for the set + `useState` for a version counter to trigger re-renders only when needed (avoids re-render storms per research pitfall).
   - Add `toggleOwned(catalogSku: string)`, `isOwned(catalogSku: string)`, and `getMissingCards(): MissingCard[]` to the context value interface and implementation.
   - `getMissingCards()` iterates all zones, collects cards where `!isOwned(card.catalogSku)`, deduplicates by catalogSku summing quantities, returns `{ catalogSku, cardName, quantity }[]`.
   - Persist `ownedCards` per-deck in localStorage keyed as `sd-owned-${deckId}`. Load on `loadDeck`/`loadDeckForEdit`, save on every toggle. Handle missing/corrupt localStorage gracefully.
   - Export updated context value interface.

3. Write `DeckBuilderOwnership.test.tsx` tests:
   - Toggle owned state on/off for a card
   - `getMissingCards()` excludes owned cards
   - `getMissingCards()` deduplicates by catalogSku and sums quantities across zones
   - localStorage persistence: toggle, remount, state restored
   - Empty deck returns empty missing list
   - All cards owned returns empty missing list

4. Create `POST /api/optimizer/listings` route in `storefront/src/app/api/optimizer/listings/route.ts`:
   - Accept `{ catalogSkus: string[] }` in request body
   - Validate input: array of strings, max 100 items, non-empty
   - Deduplicate input SKUs
   - Parallel-fetch `GET /store/cards/listings?catalog_sku=X` for each unique SKU with concurrency limit of 5 (implement with a simple batch loop using `Promise.all` on chunks of 5 — no external dependency needed)
   - Collect all unique seller IDs from results, fetch trust batch in one call
   - Merge listings with trust data following `mergeListingsWithTrust` pattern from `cardDetailBFF.ts`
   - Return `{ listings: Record<string, BackendListing[]>, errors: string[], timestamp: number }`
   - `errors` contains SKUs that failed to fetch (non-fatal — partial results are valid)
   - Log errors with `[cart-optimizer]` prefix

5. Write BFF endpoint tests in `storefront/src/app/api/optimizer/__tests__/listings.test.ts`:
   - Successful fetch for 3 SKUs returns grouped listings
   - Concurrency: 10 SKUs fetched in batches of 5 (verify via mock call timing)
   - Partial failure: 1 of 3 SKUs fails, other 2 still returned with error reported
   - Trust data merged onto listings
   - Input validation: empty array rejected, non-array rejected, >100 items rejected
   - Deduplication: duplicate SKUs in input only fetched once

## Must-Haves

- [ ] `ownedCards` state in DeckBuilderContext with toggle, isOwned, getMissingCards
- [ ] Per-deck localStorage persistence for owned cards
- [ ] `POST /api/optimizer/listings` endpoint with concurrency-limited parallel fetches
- [ ] Trust data merged onto listing results
- [ ] Partial failure handling — failed SKUs reported in `errors`, successful ones still returned
- [ ] Shared optimizer types defined in `types.ts`
- [ ] Tests for both ownership and BFF endpoint

## Verification

- `npx vitest run src/contexts/__tests__/DeckBuilderOwnership.test.tsx` — all tests pass
- `npx vitest run src/app/api/optimizer/__tests__/listings.test.ts` — all tests pass
- `cd storefront && npx vitest run` — all 854+ tests pass (no regressions)

## Observability Impact

- Signals added: `console.error("[cart-optimizer] Listing fetch failed for SKU:")` on per-SKU fetch failure in BFF endpoint
- How a future agent inspects this: check `errors` array in BFF response to see which SKUs failed; localStorage `sd-owned-${deckId}` shows persisted owned state
- Failure state exposed: BFF returns partial results with explicit error list; localStorage corruption handled gracefully (falls back to empty set)

## Inputs

- `storefront/src/contexts/DeckBuilderContext.tsx` — existing deck state management, zone iteration patterns
- `storefront/src/lib/services/cardDetailBFF.ts` — `fetchListingsWithFallback()` and `fetchTrustBatch()` patterns to replicate
- `storefront/src/types/bff.ts` — `BackendListing` interface
- `storefront/src/types/deck.ts` — `DeckCard` with `catalogSku`
- S09 Research — constraints on concurrency (≤5), shipping cost derivation, performance budget

## Expected Output

- `storefront/src/lib/optimizer/types.ts` — shared type definitions for optimizer pipeline
- `storefront/src/contexts/DeckBuilderContext.tsx` — extended with ownedCards state + 3 new methods
- `storefront/src/app/api/optimizer/listings/route.ts` — BFF batch endpoint
- `storefront/src/contexts/__tests__/DeckBuilderOwnership.test.tsx` — ownership state tests
- `storefront/src/app/api/optimizer/__tests__/listings.test.ts` — BFF endpoint tests
