---
id: T01
parent: S09
milestone: M001
provides:
  - ownedCards state in DeckBuilderContext with toggle/isOwned/getMissingCards
  - Per-deck localStorage persistence for owned cards
  - POST /api/optimizer/listings BFF endpoint with concurrency-limited parallel fetches
  - Shared optimizer types (MissingCard, OptimizationMode, OptimizationResult, etc.)
key_files:
  - storefront/src/lib/optimizer/types.ts
  - storefront/src/contexts/DeckBuilderContext.tsx
  - storefront/src/app/api/optimizer/listings/route.ts
  - storefront/src/contexts/__tests__/DeckBuilderOwnership.test.tsx
  - storefront/src/app/api/optimizer/__tests__/listings.test.ts
key_decisions:
  - "D031: Owned cards state uses useRef + version counter to avoid re-render storms"
patterns_established:
  - "useRef<Set> + useState version counter pattern for high-frequency mutable state in React context"
  - "Promise.all on chunks of 5 for concurrency-limited parallel fetch in BFF routes"
  - "localStorage keyed as sd-owned-${deckId} for per-deck state persistence"
observability_surfaces:
  - "console.error('[cart-optimizer] Listing fetch failed for SKU:') on per-SKU fetch failure"
  - "console.error('[cart-optimizer] Trust batch fetch failed') on trust API failure"
  - "BFF response includes errors[] array listing SKUs that failed to fetch"
  - "localStorage sd-owned-${deckId} shows persisted owned state"
duration: 25m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Add "I own this" state to DeckBuilderContext and build BFF batch listings endpoint

**Extended DeckBuilderContext with owned-cards tracking (useRef+version pattern) and created POST /api/optimizer/listings BFF endpoint with concurrency-limited parallel fetches and trust merge.**

## What Happened

1. Created `storefront/src/lib/optimizer/types.ts` with shared types: `MissingCard`, `OptimizationMode`, `OptimizationResult`, `SellerAssignment`, `SellerGroup`, `OptimizerListingsRequest`, `OptimizerListingsResponse`.

2. Extended `DeckBuilderContext.tsx` with owned-cards state:
   - `useRef<Set<string>>` + `useState` version counter to avoid re-render storms per D031
   - Three new context methods: `toggleOwned()`, `isOwned()`, `getMissingCards()`
   - `getMissingCards()` iterates all 7 zone types, deduplicates by catalogSku, sums quantities
   - localStorage persistence keyed as `sd-owned-${deckId}`, loaded in both `loadDeck` and `loadDeckForEdit`, saved on every toggle
   - Corrupt localStorage handled gracefully (falls back to empty set)

3. Created `POST /api/optimizer/listings` route:
   - Validates input: array of strings, non-empty, max 100 items
   - Deduplicates input SKUs
   - Fetches listings in batches of 5 using `Promise.all` on chunks (no external deps)
   - Collects all unique seller IDs, fetches trust batch in one call
   - Merges listings with trust data following `mergeListingsWithTrust` pattern from `cardDetailBFF.ts`
   - Returns `{ listings: Record<string, BackendListing[]>, errors: string[], timestamp: number }`
   - Failed SKUs reported in `errors` array (non-fatal — partial results valid)
   - All error paths logged with `[cart-optimizer]` prefix

## Verification

- `npx vitest run src/contexts/__tests__/DeckBuilderOwnership.test.tsx` — **7 tests pass** (toggle, getMissingCards exclusion, deduplication/quantity summing, localStorage persistence/restore, empty deck, all owned, corrupt localStorage)
- `npx vitest run src/app/api/optimizer/__tests__/listings.test.ts` — **8 tests pass** (3-SKU fetch, concurrency batching, partial failure, trust merge, empty array rejection, non-array rejection, >100 rejection, deduplication)
- `cd storefront && npx vitest run` — **869 tests pass** (up from 854+ baseline, zero regressions)

### Slice verification status (T01 of 3):
- ✅ `npx vitest run src/contexts/__tests__/DeckBuilderOwnership.test.tsx` — pass
- ✅ `npx vitest run src/app/api/optimizer/__tests__/listings.test.ts` — pass
- ⬜ `npx vitest run src/lib/optimizer/__tests__/optimizeCart.test.ts` — not yet created (T02)
- ⬜ `npx vitest run src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx` — not yet created (T03)
- ✅ `cd storefront && npx vitest run` — 869 pass
- ⬜ `cd storefront && npm run build` — not run (final task gate)

## Diagnostics

- Check `errors` array in BFF response to see which SKUs failed
- localStorage `sd-owned-${deckId}` shows persisted owned-cards state as JSON array
- `[cart-optimizer]` prefix in console.error for all BFF error paths

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/lib/optimizer/types.ts` — new: shared optimizer type definitions (MissingCard, OptimizationResult, BFF request/response shapes)
- `storefront/src/contexts/DeckBuilderContext.tsx` — modified: added ownedCards state (useRef+version), toggleOwned/isOwned/getMissingCards methods, localStorage persistence wired into loadDeck/loadDeckForEdit
- `storefront/src/app/api/optimizer/listings/route.ts` — new: BFF batch listings endpoint with concurrency-limited parallel fetches and trust merge
- `storefront/src/contexts/__tests__/DeckBuilderOwnership.test.tsx` — new: 7 tests for ownership state management
- `storefront/src/app/api/optimizer/__tests__/listings.test.ts` — new: 8 tests for BFF endpoint
