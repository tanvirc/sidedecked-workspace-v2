---
id: T02
parent: S10
milestone: M001
provides:
  - GET /api/collection/owned BFF endpoint returning user's owned catalogSkus
  - syncServerOwnedCards() function in DeckBuilderContext for additive server→local merge
  - 7 BFF endpoint tests + 4 collection sync integration tests
key_files:
  - storefront/src/app/api/collection/owned/route.ts
  - storefront/src/app/api/collection/__tests__/owned.test.ts
  - storefront/src/contexts/DeckBuilderContext.tsx
  - storefront/src/contexts/__tests__/DeckBuilderCollectionSync.test.tsx
key_decisions:
  - BFF fetches personal collections list then iterates each to get cards (customer-backend /user/:userId doesn't include cards); deduplicates SKUs before response
  - syncServerOwnedCards is fire-and-forget (not awaited in loadDeck) — keeps deck load fast while sync happens in background
  - Used retrieveCustomer() for auth in BFF (same pattern as /api/customer/me) rather than forwarding raw auth headers
patterns_established:
  - BFF collection endpoint pattern: authenticate via retrieveCustomer(), call customer-backend, return empty array on failure (never error status)
  - Additive server→local owned-cards merge pattern: server SKUs added to ref Set, version bumped, localStorage saved — never removes local entries
observability_surfaces:
  - "[collection-sync]" log prefix in BFF route (errors only — silent on success)
  - GET /api/collection/owned returns { catalogSkus: string[] } on success, { catalogSkus: [], error: string } on failure
duration: ~12min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Storefront collection sync BFF + deck builder integration

**Created BFF endpoint to fetch user's owned catalogSkus from customer-backend, and integrated additive server→local sync into the deck builder context.**

## What Happened

1. Created `GET /api/collection/owned` BFF endpoint that authenticates via `retrieveCustomer()`, fetches personal collections from customer-backend (`/api/collections/user/:userId?type=personal`), iterates each collection to extract `catalogSku` values from cards, deduplicates, and returns `{ catalogSkus: string[] }`. Unauthenticated users get empty array (no error). Customer-backend failures return empty array with error field.

2. Added `syncServerOwnedCards(deckId)` to `DeckBuilderContext` — fetches `/api/collection/owned`, additively merges returned SKUs into `ownedCardsRef.current`, bumps version counter, and persists to localStorage. Only runs when `isAuthenticated` is true. Called fire-and-forget after `loadOwnedCards()` in both `loadDeck` and `loadDeckForEdit`.

3. Wrote 7 BFF endpoint tests covering: happy path with SKUs, empty collections, unauthenticated user, customer-backend unreachable, type=personal filter verification, deduplication across collections, and non-ok status handling.

4. Wrote 4 collection sync integration tests covering: server SKUs merged on deck load, local SKUs preserved after sync (additive), fetch error doesn't crash (local state preserved), duplicate SKUs between server and local handled correctly.

## Verification

- `cd storefront && npx vitest run src/app/api/collection/__tests__/owned.test.ts` — **7 tests passed** ✅
- `cd storefront && npx vitest run src/contexts/__tests__/DeckBuilderCollectionSync.test.tsx` — **4 tests passed** ✅
- `cd storefront && npx vitest run` — **918 tests passed**, 2 failed (pre-existing AlgoliaSearchResults failures, excluded per slice plan) ✅
- `cd storefront && npm run build` — **production build succeeded** ✅
- Grep for bare light-mode Tailwind classes in new files — **zero found** ✅

## Diagnostics

- **BFF endpoint:** `GET /api/collection/owned` — returns `{ catalogSkus: string[] }` on success. On failure: `{ catalogSkus: [], error: "Collection service unavailable" }`. Log prefix `[collection-sync]` for errors.
- **Client sync:** `syncServerOwnedCards()` runs once per deck load when authenticated. Non-blocking. No client-side logs on success; fetch failures silently caught. To verify sync ran, compare `ownedCardsRef.current.size` before/after deck load.
- **Dependency chain:** T01's Redis subscriber writes CollectionCard rows → customer-backend `/api/collections` serves them → this BFF reads them → deck builder merges into local owned-cards set.

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `storefront/src/app/api/collection/owned/route.ts` — New BFF endpoint fetching user's owned catalogSkus from customer-backend
- `storefront/src/app/api/collection/__tests__/owned.test.ts` — 7 tests for BFF endpoint
- `storefront/src/contexts/DeckBuilderContext.tsx` — Added `syncServerOwnedCards()` function + calls in loadDeck/loadDeckForEdit
- `storefront/src/contexts/__tests__/DeckBuilderCollectionSync.test.tsx` — 4 integration tests for collection sync
- `.gsd/milestones/M001/slices/S10/tasks/T02-PLAN.md` — Added Observability Impact section (pre-flight fix)
