---
estimated_steps: 7
estimated_files: 6
---

# T01: Build cross-service collection auto-update pipeline

**Slice:** S10 — Integration & Polish
**Milestone:** M001

## Description

Create the Redis pub/sub pipeline that auto-updates a buyer's card collection when a fulfillment is marked as delivered. The backend subscriber listens to Medusa's `delivery.created` event, queries the fulfillment→order→items→product chain to extract `catalog_sku` and condition from product metadata, then publishes a structured message to Redis channel `order.receipt.confirmed`. The customer-backend subscribes to that channel and upserts CollectionCard rows into the buyer's personal collection, creating the collection if it doesn't exist.

This is the only feature code in S10 — it closes R021 (Collection auto-update on receipt).

## Steps

1. **Create backend subscriber `collection-auto-update.ts`**
   - Follow the exact pattern from `notification-buyer-new-order.ts`: import `SubscriberArgs`, `SubscriberConfig`, use `container.resolve(ContainerRegistrationKeys.QUERY)` for data access.
   - Subscribe to `FulfillmentWorkflowEvents.DELIVERY_CREATED` (event name: `delivery.created`).
   - Event payload is `{ id: fulfillmentId }`. Query `query.graph()` with entity `fulfillment`, fields `['order.id', 'order.customer_id', 'order.items.*', 'order.items.variant.*', 'order.items.variant.product.*']` to get order items.
   - For each order item, extract `catalog_sku` from `item.variant.product.metadata.catalog_sku` or `item.variant.metadata.catalog_sku`. Extract condition from variant metadata. Skip items without catalog_sku.
   - Resolve Redis module from container (`Modules.CACHE_SERVICE` or use the event bus). If Medusa container doesn't expose a raw Redis client, use the `@medusajs/framework` cache or publish via a direct ioredis connection configured in medusa-config.ts Redis settings.
   - Publish JSON `{ userId: order.customer_id, items: [{ catalogSku, quantity, condition }] }` to Redis channel `order.receipt.confirmed`.
   - Log with `[collection-auto-update]` prefix on all paths.

2. **Add `getRedisSubscriber()` to customer-backend infrastructure.ts**
   - ioredis requires a separate client for pub/sub (a client in subscriber mode cannot issue regular commands). Create `getRedisSubscriber()` that returns a dedicated ioredis instance for subscriptions, using the same Redis URL as `getRedisClient()`.
   - Add cleanup to `closeInfrastructure()`.

3. **Create customer-backend `collection-subscriber.ts`**
   - New file: `customer-backend/src/subscribers/collection-subscriber.ts`.
   - Export a `startCollectionSubscriber()` function.
   - Subscribe to Redis channel `order.receipt.confirmed` using `getRedisSubscriber()`.
   - On message: parse JSON, validate shape. For each item, find-or-create the user's personal collection (`type: 'personal'`, name: `'My Collection'`). Use TypeORM repository pattern from `collections.ts` POST route — find existing CollectionCard by `catalogSku + condition`, increment quantity or create new.
   - Use a transaction for find-or-create collection to prevent race conditions on concurrent deliveries.
   - Log with `[collection-subscriber]` prefix.

4. **Hook subscriber into customer-backend startup**
   - In `customer-backend/src/index.ts`, import `startCollectionSubscriber` and call it after infrastructure initialization (after `initializeInfrastructure()` succeeds). Wrap in try/catch with degraded-mode logging to match existing patterns.

5. **Write backend subscriber unit test**
   - File: `backend/apps/backend/src/subscribers/__tests__/collection-auto-update.test.ts`
   - Mock `container.resolve` to return a mock `query` with `graph()` returning test fulfillment→order→items data.
   - Mock Redis publish.
   - Test: handler extracts catalog_sku from product metadata, publishes correct payload.
   - Test: handler skips items without catalog_sku.
   - Test: handler logs error and doesn't throw on query failure.

6. **Write customer-backend subscriber unit test**
   - File: `customer-backend/src/tests/collection-subscriber.test.ts`
   - Mock `getRedisSubscriber()` to return a mock ioredis client with `subscribe()` and `on('message')`.
   - Mock `AppDataSource.getRepository()` for Collection and CollectionCard.
   - Test: message handler creates "My Collection" when none exists, inserts CollectionCard.
   - Test: message handler increments quantity on existing CollectionCard with same SKU/condition.
   - Test: message handler handles multiple items in one event.
   - Test: message handler logs error on malformed JSON without crashing.

7. **Verify builds pass**
   - Run `cd backend && npm run build` to confirm subscriber compiles.
   - Run `cd customer-backend && npm run build` to confirm subscriber + infrastructure changes compile.

## Must-Haves

- [ ] Backend subscriber exists at `backend/apps/backend/src/subscribers/collection-auto-update.ts` and subscribes to `delivery.created`
- [ ] Subscriber extracts `catalog_sku` and `condition` from order item product/variant metadata
- [ ] Subscriber publishes structured JSON to Redis channel `order.receipt.confirmed`
- [ ] `getRedisSubscriber()` exists in customer-backend infrastructure with separate ioredis client
- [ ] Customer-backend subscriber creates "My Collection" (type: personal) if none exists for user
- [ ] Customer-backend subscriber upserts CollectionCard rows (increment quantity on match)
- [ ] Both subscriber unit test files pass
- [ ] Both repos build successfully

## Verification

- `cd backend/apps/backend && npx jest --testPathPattern=collection-auto-update --forceExit` — tests pass
- `cd customer-backend && npx jest --testPathPattern=collection-subscriber` — tests pass
- `cd backend && npm run build` — succeeds
- `cd customer-backend && npm run build` — succeeds

## Observability Impact

- Signals added: `[collection-auto-update]` log prefix on backend subscriber (info on publish, error on failure). `[collection-subscriber]` log prefix on customer-backend handler (info on upsert, error on failure, warn on malformed message).
- How a future agent inspects this: Check Redis channel `order.receipt.confirmed` for published messages. Query `collection_cards` table for rows with matching catalogSku. Filter logs by prefix.
- Failure state exposed: Backend subscriber logs fulfillment ID + error message. Customer-backend logs userId + catalogSku + error. Neither subscriber throws — failures are logged and swallowed to prevent blocking order flow.

## Inputs

- `backend/apps/backend/src/subscribers/notification-buyer-new-order.ts` — Medusa subscriber pattern to follow
- `customer-backend/src/routes/collections.ts` lines 188-303 — CollectionCard upsert pattern to replicate
- `customer-backend/src/config/infrastructure.ts` — `getRedisClient()` to model `getRedisSubscriber()` after
- `customer-backend/src/entities/CollectionCard.ts` — entity schema (catalogSku, cardId, quantity, condition)
- `customer-backend/src/entities/Collection.ts` — entity schema (userId, name, type)
- S10-RESEARCH.md — pitfalls around ioredis pub/sub client separation, fulfillment→order query chain

## Expected Output

- `backend/apps/backend/src/subscribers/collection-auto-update.ts` — Medusa subscriber for delivery.created → Redis publish
- `backend/apps/backend/src/subscribers/__tests__/collection-auto-update.test.ts` — 3+ tests
- `customer-backend/src/subscribers/collection-subscriber.ts` — Redis subscriber for order.receipt.confirmed → CollectionCard upsert
- `customer-backend/src/config/infrastructure.ts` — `getRedisSubscriber()` added + cleanup
- `customer-backend/src/index.ts` — `startCollectionSubscriber()` called on startup
- `customer-backend/src/tests/collection-subscriber.test.ts` — 4+ tests
