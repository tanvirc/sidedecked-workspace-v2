---
id: S09
parent: M001
milestone: M001
provides:
  - ownedCards state in DeckBuilderContext with toggle/isOwned/getMissingCards and per-deck localStorage persistence
  - POST /api/optimizer/listings BFF endpoint with concurrency-limited parallel fetches and trust merge
  - optimizeCart() pure function with cheapest, fewest-sellers, and best-value modes
  - CartOptimizerPanel UI with Sheet-based rendering, mode toggle, seller groups, per-card override, staleness indicator
  - "Buy Missing Cards" button wired in DeckViewerHeader and DeckBuilderLayout
  - Sequential add-to-cart with partial-success error handling and toast feedback
  - Shared optimizer types (MissingCard, OptimizationResult, SellerGroup, etc.)
requires:
  - slice: S01
    provides: Voltage tokens, Sheet component, toast system
  - slice: S02
    provides: Card data display patterns, BackendListing type, BFF listing fetch patterns
  - slice: S03
    provides: DeckBuilderContext, DeckViewerHeader, DeckBuilderLayout, deck card types
  - slice: S08
    provides: Live listings exist for optimizer to query
affects:
  - S10
key_files:
  - storefront/src/lib/optimizer/types.ts
  - storefront/src/lib/optimizer/optimizeCart.ts
  - storefront/src/contexts/DeckBuilderContext.tsx
  - storefront/src/app/api/optimizer/listings/route.ts
  - storefront/src/components/optimizer/CartOptimizerPanel.tsx
  - storefront/src/components/optimizer/OptimizerModeToggle.tsx
  - storefront/src/components/optimizer/SellerGroupCard.tsx
  - storefront/src/components/decks/DeckViewerHeader.tsx
  - storefront/src/components/deck-builder/DeckBuilderLayout.tsx
key_decisions:
  - "D031: Owned cards state uses useRef + version counter to avoid re-render storms"
  - "D032: Override logic mutates optimizer result in-place rather than re-running full optimizer"
  - "D033: Add-to-cart resolves catalogSku→variant via Medusa product lookup"
  - "D034: Toast feedback uses typed success/warning/error from shared ToastProvider"
patterns_established:
  - "useRef<Set> + useState version counter for high-frequency mutable state in React context"
  - "Promise.all on chunks of 5 for concurrency-limited parallel fetch in BFF routes"
  - "Greedy heuristic with scarcity-first ordering and per-seller shipping amortization"
  - "Post-optimization override via OverrideMap — avoids re-fetch, swaps assignment between groups"
  - "Sequential add-to-cart with per-item error accumulation and aggregate toast reporting"
  - "Staleness timer pattern — setTimeout for remaining time until 5min threshold, then show refresh"
observability_surfaces:
  - "console.error('[cart-optimizer]') prefix on all error paths (BFF fetch, algorithm, add-to-cart)"
  - "console.warn('[cart-optimizer] Results stale') when results exceed 5 minute threshold"
  - "BFF response includes errors[] array listing SKUs that failed to fetch"
  - "data-testid attributes: optimizer-panel, mode-toggle, seller-group-{id}, add-to-cart-btn, staleness-indicator, buy-missing-btn, unavailable-cards"
  - "localStorage sd-owned-${deckId} shows persisted owned-cards state"
drill_down_paths:
  - .gsd/milestones/M001/slices/S09/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S09/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S09/tasks/T03-SUMMARY.md
duration: 3 tasks
verification_result: passed
completed_at: 2026-03-14
---

# S09: Cart Optimizer & Deck-to-Cart Flow

**Built the deck-to-cart pipeline: owned-cards state in deck builder, BFF batch listing endpoint, greedy cart optimizer with three modes, and optimizer panel UI with per-card override and add-to-cart — wired end-to-end from "Buy Missing Cards" buttons in both viewer and builder.**

## What Happened

T01 extended DeckBuilderContext with owned-cards tracking using a useRef+version counter pattern (D031) to avoid re-render storms. Three new methods: `toggleOwned()`, `isOwned()`, `getMissingCards()`. Owned state persists per-deck in localStorage keyed as `sd-owned-${deckId}`. Created `POST /api/optimizer/listings` BFF endpoint that accepts an array of catalogSkus, deduplicates them, fetches listings in batches of 5 (Promise.all on chunks), collects seller IDs, fetches trust data in one batch, and merges using the established `mergeListingsWithTrust` pattern. Returns `{ listings, errors, timestamp }` — partial failures are non-fatal.

T02 implemented `optimizeCart()` as a pure function with three modes. **Cheapest** minimizes total cost including per-seller shipping amortization. **Fewest-sellers** maximizes consolidation with cost as tiebreaker. **Best-value** runs both internally and picks fewest-sellers if cost increase ≤ 15%, otherwise uses weighted score (0.7 cost + 0.3 sellers). The algorithm deduplicates cards by catalogSku, sorts by listing scarcity (fewest available first), and greedily assigns each card to the seller with lowest marginal cost. Handles quantity splitting when a listing can't fulfill full demand. Computes a naive baseline for savings comparison. Executes in < 1ms for 15 cards × 10 sellers.

T03 built the optimizer panel UI: `CartOptimizerPanel` (Sheet-based), `OptimizerModeToggle` (three-button toggle), and `SellerGroupCard` (seller info, per-card rows with condition badges, swap-seller dropdown for per-card override). The panel fetches listings via BFF, runs optimizer client-side, renders mode toggle + seller groups + unavailable cards section + total with savings callout + staleness indicator (refresh after 5 min) + "Add to Cart" button. Mode changes re-run the optimizer without re-fetching. Override mutates the result in-place (D032). Add-to-cart resolves catalogSku→Medusa variant (D033), calls `addToCart()` sequentially, reports full/partial/no success via typed toasts (D034). "Buy Missing Cards" buttons wired in both DeckViewerHeader and DeckBuilderLayout.

Also fixed a pre-existing type error in `CardSearchInput.tsx:63` where `.map()` was called on a potentially non-array value — replaced fallback chain with `Array.isArray()` guards. This unblocked the production build.

## Verification

- `npx vitest run src/contexts/__tests__/DeckBuilderOwnership.test.tsx` — 7 tests pass (toggle, exclusion, dedup/quantity, persistence, empty deck, all owned, corrupt localStorage)
- `npx vitest run src/app/api/optimizer/__tests__/listings.test.ts` — 8 tests pass (fetch, batching, partial failure, trust merge, validation)
- `npx vitest run src/lib/optimizer/__tests__/optimizeCart.test.ts` — 22 tests pass (all 3 modes, shipping, scarcity, dedup, edge cases, performance)
- `npx vitest run src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx` — 18 tests pass (mode toggle, seller groups, override, add-to-cart, partial failure, staleness, unavailable, Voltage compliance)
- `cd storefront && npx vitest run` — 909 tests pass (55 above 854 baseline)
- `cd storefront && npm run build` — production build succeeds
- `grep` confirms zero bare light-mode Tailwind color classes in optimizer components
- All `[cart-optimizer]` console prefixes and `data-testid` attributes verified in source

## Requirements Advanced

- R018 (cart optimizer algorithm) — algorithm implemented and proven correct across all 3 modes with 22 tests, < 1ms for 15 cards
- R019 (cart optimizer UI) — panel built with mode toggle, seller groups, per-card override, staleness indicator, add-to-cart with 18 tests
- R020 (deck-to-cart flow) — end-to-end wiring complete: owned cards → missing cards → BFF listing fetch → optimizer → add-to-cart

## Requirements Validated

- R018 — 22 algorithm tests prove correctness across cheapest/fewest-sellers/best-value modes, shipping amortization, scarcity ordering, quantity splitting, all edge cases. Performance < 1ms for 15 cards far exceeds 2s target.
- R019 — 18 UI tests prove panel rendering, mode switching, seller group display, per-card override, add-to-cart with partial failure handling, staleness indicator, Voltage compliance.
- R020 — Owned-cards state (7 tests), BFF listings endpoint (8 tests), optimizer algorithm (22 tests), and panel UI (18 tests) compose the complete deck-to-cart pipeline. Buttons wired in both viewer and builder.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Fixed pre-existing type error in `CardSearchInput.tsx:63` — `.map()` called on `{}` when `card.prints` field was a non-array object. Replaced `(card.prints || card.printings || []).map(...)` with `Array.isArray()` guards. This was blocking production build for all branches, not introduced by S09.
- Task plan field name `unavailableCards` was already established as `unassignedCards` in T01 types — kept existing name.

## Known Limitations

- Cart optimizer operates on client-side data structures — no server-side persistence of optimization results. Re-opening the panel re-fetches and re-optimizes.
- Add-to-cart resolves catalogSku→variant via Medusa product lookup per D033 — this adds one API call per card during add-to-cart. Acceptable for typical deck sizes (15-60 cards).
- Staleness indicator is time-based (5 min) — doesn't detect inventory changes that happened server-side.
- Best-value mode uses fixed weights (0.7 cost, 0.3 sellers) — not user-configurable.

## Follow-ups

- S10: Collection auto-update on receipt confirmation — purchased cards auto-marked as owned across all decks.
- S10: Final visual audit of optimizer panel at 1440px and 390px against wireframe.
- S10: End-to-end acceptance proof of full flow (search → deck → optimize → checkout → receipt → collection update).

## Files Created/Modified

- `storefront/src/lib/optimizer/types.ts` — shared type definitions (MissingCard, OptimizationResult, SellerGroup, BFF request/response)
- `storefront/src/lib/optimizer/optimizeCart.ts` — pure optimizer function with 3 modes, shipping derivation, diagnostic summary
- `storefront/src/contexts/DeckBuilderContext.tsx` — added ownedCards state (useRef+version), toggleOwned/isOwned/getMissingCards, localStorage persistence
- `storefront/src/app/api/optimizer/listings/route.ts` — BFF batch listings endpoint with concurrency-limited parallel fetches and trust merge
- `storefront/src/components/optimizer/CartOptimizerPanel.tsx` — main optimizer panel with Sheet, fetch, optimize, override, add-to-cart, staleness
- `storefront/src/components/optimizer/OptimizerModeToggle.tsx` — three-mode toggle (cheapest, fewest-sellers, best-value)
- `storefront/src/components/optimizer/SellerGroupCard.tsx` — seller group card with per-card swap dropdown
- `storefront/src/components/decks/DeckViewerHeader.tsx` — added "Buy Missing Cards" button and CartOptimizerPanel
- `storefront/src/components/deck-builder/DeckBuilderLayout.tsx` — added "Buy Missing" button in toolbar and CartOptimizerPanel
- `storefront/src/components/seller/wizard/CardSearchInput.tsx` — fixed pre-existing type error (Array.isArray guards)
- `storefront/src/contexts/__tests__/DeckBuilderOwnership.test.tsx` — 7 ownership state tests
- `storefront/src/app/api/optimizer/__tests__/listings.test.ts` — 8 BFF endpoint tests
- `storefront/src/lib/optimizer/__tests__/optimizeCart.test.ts` — 22 algorithm tests
- `storefront/src/components/optimizer/__tests__/CartOptimizerPanel.test.tsx` — 18 panel UI tests

## Forward Intelligence

### What the next slice should know
- The optimizer panel is fully self-contained — it receives `missingCards` as a prop and manages its own fetch/optimize/cart cycle. No external state management needed.
- `addToCart()` is imported from `@/lib/data/cart` and is a server action. The optimizer calls it sequentially per item. If the cart API changes shape, update `CartOptimizerPanel.tsx` handleAddToCart.
- `getMissingCards()` returns `{ catalogSku, cardName, quantity }[]` — this is the universal interface for "what cards does the user need."

### What's fragile
- The catalogSku→variant resolution in add-to-cart (`/store/products?catalog_sku=X`) depends on products being synced from customer-backend. If sync is stale or product doesn't exist in Medusa, add-to-cart fails for that card (handled as partial failure).
- `mergeListingsWithTrust` pattern is duplicated between `cardDetailBFF.ts` and `optimizer/listings/route.ts`. If the trust data shape changes, both need updating.

### Authoritative diagnostics
- `[cart-optimizer]` prefix in browser console — all error and staleness paths are logged with this prefix. Filter console by it.
- BFF response `errors[]` array — lists SKUs that failed to fetch. If all SKUs fail, the array tells you which ones and the panel shows a meaningful error.
- `data-testid="optimizer-panel"` — the root element for browser-based inspection.

### What assumptions changed
- Build was not broken by S09 — the `CardSearchInput.tsx` type error was pre-existing from S08. Fixed here since it blocked the build verification gate.
- Performance is not a concern for MVP — optimizer runs in < 1ms for 15 cards, well under the 2s budget. The network round-trip to the BFF endpoint will dominate response time.
