# S10: Integration & Polish — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven for pipeline logic, live-runtime for end-to-end flow)
- Why this mode is sufficient: The collection auto-update pipeline spans 3 services + Redis. Unit tests prove each segment independently. Full end-to-end requires all services running, so live-runtime tests cover the integration seams that unit tests cannot.

## Preconditions

- All 3 services running locally: backend (Medusa, port 9000), customer-backend (Express, port 3001), storefront (Next.js, port 8000)
- Redis running locally (default port 6379)
- A test user with a valid JWT (logged in via storefront)
- The test user has been upgraded to seller status
- At least one listing exists with `catalog_sku` in product/variant metadata
- A deck exists containing cards whose `catalogSku` matches available listings
- PostgreSQL databases (`mercur-db`, `sidedecked-db`) accessible

## Smoke Test

1. Run `cd storefront && npx vitest run src/app/api/collection/__tests__/owned.test.ts`
2. **Expected:** 7 tests pass — confirms the BFF endpoint logic works in isolation

## Test Cases

### 1. Backend subscriber extracts catalog_sku from delivered fulfillment

1. Create an order containing a product with `metadata.catalog_sku = "MTG-DOM-001-NM"` and variant `metadata.condition = "NM"`
2. Create a fulfillment for the order
3. Mark the fulfillment as delivered (trigger `delivery.created` event)
4. Monitor Redis channel `order.receipt.confirmed` (`redis-cli subscribe order.receipt.confirmed`)
5. **Expected:** Redis receives JSON message `{ userId: "<buyer_id>", items: [{ catalogSku: "MTG-DOM-001-NM", quantity: 1, condition: "NM" }] }`
6. **Expected:** Backend logs show `[collection-auto-update] Published 1 items to order.receipt.confirmed for fulfillment <id>`

### 2. Customer-backend subscriber creates collection and upserts card

1. Ensure the test buyer has no "My Collection" (delete if exists: `DELETE FROM collections WHERE user_id = '<buyer_id>' AND name = 'My Collection'`)
2. Publish test message to Redis: `redis-cli publish order.receipt.confirmed '{"userId":"<buyer_id>","items":[{"catalogSku":"MTG-DOM-001-NM","quantity":1,"condition":"NM"}]}'`
3. **Expected:** Customer-backend logs show `[collection-subscriber] Processing 1 items for user <buyer_id>`
4. Query DB: `SELECT * FROM collections WHERE user_id = '<buyer_id>' AND name = 'My Collection'`
5. **Expected:** One row exists with `type = 'personal'`
6. Query DB: `SELECT * FROM collection_cards WHERE collection_id = '<collection_id>'`
7. **Expected:** One row exists with the card resolved from catalogSku `MTG-DOM-001-NM`, quantity 1, condition "NM"

### 3. BFF endpoint returns owned catalogSkus for authenticated user

1. Log into storefront as the test buyer
2. Ensure the buyer has at least one personal collection with cards (from test case 2)
3. Open browser devtools, fetch `GET /api/collection/owned`
4. **Expected:** Response is `{ catalogSkus: ["MTG-DOM-001-NM"] }` (or includes the SKU from test case 2)
5. **Expected:** Response status is 200

### 4. BFF endpoint returns empty array for unauthenticated user

1. Open an incognito/private browser window (no auth cookies)
2. Navigate to `http://localhost:8000/api/collection/owned`
3. **Expected:** Response is `{ catalogSkus: [] }` with status 200 (no error)

### 5. Deck builder merges server-owned cards on load

1. Log in as the test buyer (who has server-owned cards from test case 2)
2. Open a deck that contains a card matching `catalogSku = "MTG-DOM-001-NM"`
3. Open browser devtools → Network tab → filter for `collection/owned`
4. **Expected:** Request to `/api/collection/owned` fires automatically on deck load
5. **Expected:** The card with SKU `MTG-DOM-001-NM` shows the "I own this" indicator (check mark / toggled state)
6. **Expected:** The "Buy Missing Cards" count excludes this card

### 6. Server sync is additive — doesn't remove manually toggled cards

1. Open a deck as an authenticated user
2. Manually toggle "I own this" on a card that is NOT in the server collection (e.g., `MTG-XYZ-999-NM`)
3. Close and reopen the deck
4. **Expected:** Both the manually toggled card AND the server-synced cards show as owned
5. **Expected:** The manually toggled card was not removed by the server sync

### 7. Full pipeline end-to-end: delivery → collection → deck builder

1. As a buyer, purchase cards from a listing (complete checkout flow)
2. As a seller/admin, create fulfillment and mark as delivered
3. Wait 1-2 seconds for Redis propagation
4. As the buyer, open a deck containing the purchased cards
5. **Expected:** Purchased cards automatically appear as "owned" in the deck builder
6. **Expected:** "Buy Missing Cards" count decreases by the number of purchased cards
7. **Expected:** No manual action required by the buyer

### 8. Acceptance checklist covers all M001 criteria

1. Open `.gsd/milestones/M001/slices/S10/acceptance-checklist.md`
2. **Expected:** File contains 8 numbered success criteria
3. **Expected:** Each criterion has: evidence type, evidence detail, and status (verified/blocked/pending-UAT)
4. **Expected:** At least 6 criteria show "verified" status
5. **Expected:** R025 (Figma export) shows "blocked"

### 9. Visual audit log covers all storefront routes

1. Open `.gsd/milestones/M001/slices/S10/visual-audit-log.md`
2. **Expected:** File lists all 51 storefront page routes
3. **Expected:** Routes are grouped by page family (core, decks, auth, homepage, seller, user-account, commerce, misc)
4. **Expected:** Each route has a wireframe reference and verification status

### 10. All tests pass and build succeeds

1. Run `cd storefront && npx vitest run`
2. **Expected:** 918 tests pass, 2 fail (AlgoliaSearchResults — pre-existing, not a regression)
3. Run `cd storefront && npm run build`
4. **Expected:** Build succeeds with warnings only (no errors)
5. Run `cd backend/apps/backend && npx jest --testPathPattern=collection-auto-update --forceExit`
6. **Expected:** 8 tests pass
7. Run `cd customer-backend && npx jest --testPathPattern=collection-subscriber`
8. **Expected:** 5 tests pass

## Edge Cases

### Fulfillment without catalog_sku in metadata

1. Create an order with a product that has no `catalog_sku` in metadata
2. Mark fulfillment as delivered
3. **Expected:** Backend subscriber logs `[collection-auto-update]` debug message about missing SKU
4. **Expected:** No message published to Redis (no items to publish)
5. **Expected:** No crash or error

### Malformed Redis message

1. Publish invalid JSON to Redis: `redis-cli publish order.receipt.confirmed 'not-valid-json'`
2. **Expected:** Customer-backend logs `[collection-subscriber] Failed to parse message`
3. **Expected:** Subscriber continues running (no crash)

### Customer-backend unavailable during BFF fetch

1. Stop customer-backend service
2. As an authenticated user, load a deck in storefront
3. **Expected:** BFF logs `[collection-sync] Unexpected error: ECONNREFUSED`
4. **Expected:** Deck loads normally with only local owned-cards state (no crash)
5. **Expected:** No error shown to user

### Duplicate catalog_sku in same delivery

1. Publish a message with duplicate SKU: `redis-cli publish order.receipt.confirmed '{"userId":"<id>","items":[{"catalogSku":"MTG-DOM-001-NM","quantity":2,"condition":"NM"},{"catalogSku":"MTG-DOM-001-NM","quantity":1,"condition":"NM"}]}'`
2. **Expected:** CollectionCard row for that SKU has quantity incremented by 3 total
3. **Expected:** No duplicate rows created

### User with no collections

1. Create a new user who has never had a collection
2. Trigger a delivery for this user
3. **Expected:** "My Collection" is auto-created with type "personal"
4. **Expected:** CollectionCard rows are inserted into the new collection

## Failure Signals

- Backend logs show `[collection-auto-update] Error processing delivery` — subscriber failed to query order data
- Customer-backend logs show `[collection-subscriber] Error processing` — DB upsert failed
- `GET /api/collection/owned` returns `{ catalogSkus: [], error: "..." }` — customer-backend communication failure
- Deck builder owned-cards don't include server-synced cards after page refresh — sync not running or BFF failing
- Redis channel `order.receipt.confirmed` shows no messages after delivery — backend subscriber not registered or Redis connection failed
- `redis-cli subscribe order.receipt.confirmed` shows messages but collection_cards table is empty — customer-backend subscriber not connected

## Requirements Proved By This UAT

- R021 — Collection auto-update on receipt: test cases 1-2 prove the pipeline, test case 5-7 prove the deck builder integration
- R024 — Voltage dark theme consistency: test case 9 verifies the audit log documenting all 51 routes
- R020 — Deck-to-cart flow (partial): test case 7 proves the final leg (receipt → collection update)

## Not Proven By This UAT

- R025 — Figma export: blocked on MCP auth (405 error). Not testable until auth is resolved.
- Visual pixel-perfection against wireframes at 1440px and 390px: requires human visual comparison. The visual-audit-log.md documents which pages need checking, but the actual comparison is a separate UAT activity.
- OAuth end-to-end with Google/Discord: requires configured API credentials. Structurally verified but not live-tested.
- Full multi-service E2E with production-like data volume: would require load testing infrastructure not in scope for MVP.

## Notes for Tester

- The 2 failing AlgoliaSearchResults tests are pre-existing and not related to S10. They fail because `getByText` finds duplicate text (card name appears in both image placeholder and title). These are excluded per slice plan.
- The `syncServerOwnedCards()` function runs asynchronously — there may be a brief moment on deck load where server-owned cards haven't appeared yet. Wait ~500ms and check again.
- To monitor Redis messages in real-time during testing: `redis-cli subscribe order.receipt.confirmed` in a terminal.
- The backend subscriber uses `query.graph()` to traverse fulfillment→order→items — if the Medusa data model changes (v2 to v3), this traversal may need updating.
- The customer-backend subscriber resolves catalogSku→Card via CatalogSKU→Print→Card relation. If the catalog_sku format changes, the resolution chain may fail silently (card won't be added to collection, but no crash).
