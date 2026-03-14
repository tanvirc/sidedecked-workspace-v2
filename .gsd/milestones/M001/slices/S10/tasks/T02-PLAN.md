---
estimated_steps: 5
estimated_files: 4
---

# T02: Storefront collection sync BFF + deck builder integration

**Slice:** S10 — Integration & Polish
**Milestone:** M001

## Description

Create the storefront side of the collection auto-update pipeline. A BFF endpoint fetches the authenticated user's collection catalogSkus from customer-backend. The DeckBuilderContext gains a `syncServerOwnedCards()` function that fetches this endpoint on deck load and additively merges server-owned SKUs into the local owned-cards set. This makes purchased cards (auto-added by T01's pipeline) visible as "owned" in the deck builder without manual toggling.

Server data is additive only — it adds to the owned set, never removes. If a user manually toggled a card as owned locally, server sync doesn't un-toggle it. If the server says a card is owned (from a purchase), it appears owned even if the user never toggled it.

## Steps

1. **Create `GET /api/collection/owned` BFF endpoint**
   - File: `storefront/src/app/api/collection/owned/route.ts`
   - Read auth cookie/header to get the authenticated user ID. Follow the pattern from existing BFF routes (e.g., `api/customer/me/route.ts`).
   - Fetch user's collections from customer-backend: `GET ${CUSTOMER_BACKEND_URL}/api/collections/user/${userId}`.
   - Filter to `type === 'personal'` collections.
   - Extract all `catalogSku` values from all CollectionCards across personal collections.
   - Return `NextResponse.json({ catalogSkus: [...] })`.
   - If user is unauthenticated, return `{ catalogSkus: [] }` (not an error — unauthenticated users simply have no server collection).
   - If customer-backend is unreachable, return `{ catalogSkus: [], error: 'Collection service unavailable' }` and log with `[collection-sync]` prefix.

2. **Add `syncServerOwnedCards()` to DeckBuilderContext**
   - In `DeckBuilderContext.tsx`, add a function that:
     - Fetches `/api/collection/owned`
     - For each returned catalogSku, adds it to `ownedCardsRef.current` (the existing `Set<string>`)
     - Bumps the version counter to trigger re-renders
     - Persists updated set to localStorage
   - Call `syncServerOwnedCards()` in the deck load effect (where localStorage is restored), after localStorage restoration. Only call if user is authenticated (check for auth cookie or session — follow existing auth patterns in the storefront).
   - Gate behind a `useEffect` with appropriate deps to avoid re-fetching on every render. Fetch once per deck load.
   - Additive merge: `serverSkus.forEach(sku => ownedCardsRef.current.add(sku))`. Never delete.

3. **Write BFF endpoint tests**
   - File: `storefront/src/app/api/collection/__tests__/owned.test.ts`
   - Mock `fetch` to simulate customer-backend responses.
   - Test: returns catalogSkus from personal collections
   - Test: returns empty array when user has no collections
   - Test: returns empty array when unauthenticated
   - Test: returns empty array with error message when customer-backend is unreachable
   - Test: filters to personal collections only (ignores wishlist/trading/showcase)

4. **Write collection sync integration tests**
   - File: `storefront/src/contexts/__tests__/DeckBuilderCollectionSync.test.tsx`
   - Mock `/api/collection/owned` fetch response.
   - Test: server-owned SKUs are merged into ownedCardsRef on deck load
   - Test: manually toggled local SKUs are preserved after server sync (additive)
   - Test: sync failure (fetch error) doesn't crash — local state preserved
   - Test: duplicate SKUs between server and local don't cause issues

5. **Verify full test suite and build**
   - Run `cd storefront && npx vitest run` — all 907+ tests pass (plus new tests)
   - Run `cd storefront && npm run build` — production build succeeds
   - Grep for any new bare light-mode Tailwind classes in new files (should be zero)

## Must-Haves

- [ ] `GET /api/collection/owned` BFF endpoint returns `{ catalogSkus: string[] }` for authenticated users
- [ ] Endpoint gracefully handles unauthenticated users (empty array, no error)
- [ ] Endpoint gracefully handles customer-backend unavailability (empty array + error field)
- [ ] `syncServerOwnedCards()` additively merges server SKUs into ownedCardsRef
- [ ] Sync runs once on deck load, not on every render
- [ ] Manually toggled local owned-cards are never removed by server sync
- [ ] 5+ BFF endpoint tests pass
- [ ] 4+ collection sync tests pass
- [ ] Full storefront test suite passes (907+) and build succeeds

## Verification

- `cd storefront && npx vitest run src/app/api/collection/__tests__/owned.test.ts` — 5+ tests pass
- `cd storefront && npx vitest run src/contexts/__tests__/DeckBuilderCollectionSync.test.tsx` — 4+ tests pass
- `cd storefront && npx vitest run` — 907+ tests pass
- `cd storefront && npm run build` — succeeds

## Inputs

- `storefront/src/contexts/DeckBuilderContext.tsx` — existing ownedCardsRef, toggleOwned, isOwned, localStorage persistence (lines 87-120, 1169-1252)
- `storefront/src/app/api/customer/me/route.ts` — BFF auth pattern to follow
- `customer-backend/src/routes/collections.ts` — `GET /user/:userId` response shape
- T01 output — Redis subscriber writes CollectionCard rows that this endpoint reads back

## Expected Output

- `storefront/src/app/api/collection/owned/route.ts` — BFF endpoint fetching user's owned catalogSkus
- `storefront/src/app/api/collection/__tests__/owned.test.ts` — 5+ tests
- `storefront/src/contexts/DeckBuilderContext.tsx` — `syncServerOwnedCards()` added + called on deck load
- `storefront/src/contexts/__tests__/DeckBuilderCollectionSync.test.tsx` — 4+ tests

## Observability Impact

- **New BFF endpoint log prefix:** `[collection-sync]` — logged on customer-backend fetch failures (includes error message). Silent on success to avoid noise.
- **New inspection surface:** `GET /api/collection/owned` returns `{ catalogSkus: string[] }` on success, `{ catalogSkus: [], error: string }` on failure. A future agent can call this endpoint to verify which catalogSkus are visible to a user.
- **Client-side sync signal:** `syncServerOwnedCards()` runs once per deck load when user is authenticated. No runtime logs emitted on success; fetch failures are caught silently to preserve local state. To verify sync ran, compare `ownedCardsRef.current` size before/after deck load.
- **Failure visibility:** BFF returns empty array (never errors) — unauthenticated or failed states are distinguishable by presence/absence of `error` field in response JSON.
