---
id: T01
parent: S10
milestone: M001
provides:
  - Backend subscriber for delivery.created → Redis publish pipeline
  - Customer-backend Redis subscriber for order.receipt.confirmed → CollectionCard upsert
  - Dedicated Redis subscriber client in customer-backend infrastructure
key_files:
  - backend/apps/backend/src/subscribers/collection-auto-update.ts
  - customer-backend/src/subscribers/collection-subscriber.ts
  - customer-backend/src/config/infrastructure.ts
  - customer-backend/src/index.ts
key_decisions:
  - Used direct ioredis in backend subscriber (Medusa container doesn't expose raw Redis publish)
  - Used AppDataSource.transaction() for find-or-create collection to prevent race conditions
patterns_established:
  - Cross-service Redis pub/sub bridge pattern (backend publishes, customer-backend subscribes)
  - CatalogSKU → Card resolution via print.card relation for collection insertion
observability_surfaces:
  - "[collection-auto-update]" log prefix on backend subscriber (info on publish, warn on missing data, error on failure)
  - "[collection-subscriber]" log prefix on customer-backend handler (info on upsert, warn on malformed/missing, error on failure)
  - "[redis-subscriber]" log prefix on dedicated subscriber connection events
duration: 25min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Build cross-service collection auto-update pipeline

**Built Redis pub/sub pipeline: backend subscriber extracts catalog_sku from delivered fulfillments and publishes to Redis; customer-backend subscriber upserts CollectionCard rows into buyer's personal collection.**

## What Happened

Created the full cross-service collection auto-update pipeline in two halves:

**Backend side:** New Medusa subscriber `collection-auto-update.ts` listens to `FulfillmentWorkflowEvents.DELIVERY_CREATED`. On delivery, it queries the fulfillment→order→items→variant→product chain via `query.graph()` to extract `catalog_sku` from product or variant metadata and `condition` from variant metadata. Publishes structured JSON `{ userId, items: [{ catalogSku, quantity, condition }] }` to Redis channel `order.receipt.confirmed`. Uses a direct ioredis connection since the Medusa container (`ContainerRegistrationKeys`) doesn't expose a raw Redis publish interface — only QUERY, LOGGER, PG_CONNECTION, etc.

**Customer-backend side:** Added `getRedisSubscriber()` to `infrastructure.ts` — a dedicated ioredis client for pub/sub (required because ioredis clients in subscriber mode can't issue regular commands). Created `collection-subscriber.ts` that subscribes to `order.receipt.confirmed`, validates the payload shape, and within a transaction: find-or-creates the user's "My Collection" (type: 'personal'), resolves each catalogSku to a Card ID via the CatalogSKU→Print→Card relation chain, then upserts CollectionCard rows (incrementing quantity on match or creating new). Hooked into startup in `index.ts` with degraded-mode try/catch matching existing patterns.

## Verification

- `cd backend/apps/backend && npx jest --testPathPattern=collection-auto-update --forceExit` — **8 tests pass** (2 suites: source + compiled)
- `cd customer-backend && npx jest --testPathPattern=collection-subscriber` — **5 tests pass**
- `cd backend && npm run build` — **succeeds** (20 tasks, 19 cached + 1 fresh build)
- `cd customer-backend && npm run build` — **succeeds** (tsc clean)

### Slice-level verification status (T01 is task 1 of 3):
- ✅ Backend subscriber unit tests pass
- ✅ Customer-backend subscriber unit tests pass
- ⏳ BFF endpoint tests — T02
- ⏳ DeckBuilderCollectionSync tests — T02
- ⏳ Full storefront vitest — T02/T03
- ⏳ Storefront build — T02/T03
- ⏳ Acceptance checklist — T03

## Diagnostics

- **Backend subscriber:** Filter logs by `[collection-auto-update]`. Logs fulfillment ID on entry, item count + channel on successful publish, and error message on failure. Items without `catalog_sku` in metadata are skipped with debug-level log.
- **Customer-backend subscriber:** Filter logs by `[collection-subscriber]`. Logs item count + userId on receipt, per-item upsert info, and errors on malformed JSON or DB failures. Connection events logged under `[redis-subscriber]`.
- **Redis channel:** Monitor `order.receipt.confirmed` for published messages. Payload shape: `{ userId: string, items: [{ catalogSku: string, quantity: number, condition: string }] }`.
- **Database:** Query `collections` for `type = 'personal'` + `name = 'My Collection'` rows. Query `collection_cards` for matching `catalogSku` entries.

## Deviations

- Used direct ioredis import in backend subscriber instead of resolving from Medusa container. The container only exposes QUERY, LOGGER, MANAGER, CONFIG_MODULE, REMOTE_QUERY, LINK, and FEATURE_FLAG_ROUTER — no cache or Redis publish interface. ioredis is available as a transitive dependency in the backend's node_modules. This is a clean solution that doesn't couple to Medusa internals.

## Known Issues

None.

## Files Created/Modified

- `backend/apps/backend/src/subscribers/collection-auto-update.ts` — New Medusa subscriber: delivery.created → extract catalog_sku → Redis publish
- `backend/apps/backend/src/subscribers/__tests__/collection-auto-update.test.ts` — 4 test cases covering happy path, SKU extraction, error handling, variant metadata fallback
- `customer-backend/src/subscribers/collection-subscriber.ts` — New Redis subscriber: order.receipt.confirmed → find-or-create collection → upsert CollectionCard
- `customer-backend/src/config/infrastructure.ts` — Added `getRedisSubscriber()` with dedicated ioredis client + cleanup in `closeInfrastructure()`
- `customer-backend/src/index.ts` — Added `startCollectionSubscriber()` call after infrastructure init with degraded-mode fallback
- `customer-backend/src/tests/collection-subscriber.test.ts` — 5 test cases covering collection creation, quantity increment, multi-item, malformed JSON, channel filtering
