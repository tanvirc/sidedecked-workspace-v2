# S10: Integration & Polish — Research

**Date:** 2026-03-14

## Summary

S10 has three deliverables: (1) collection auto-update on receipt, (2) visual audit / regression checks, and (3) end-to-end acceptance proof. The first is the only one that creates new production code; the other two are verification artifacts.

The collection auto-update needs careful scoping. The S10-CONTEXT document envisions a full Redis pub/sub pipeline (backend subscriber → Redis event → customer-backend subscriber → CollectionCard insertion → storefront sync). This is architecturally sound but creates a tall stack of new infrastructure that crosses all three services. The Medusa event `FulfillmentWorkflowEvents.DELIVERY_CREATED` fires when a fulfillment is marked delivered — that's the trigger point. On the customer-backend side, `CollectionCard` and `Collection` entities already exist with full CRUD routes, and the Redis client (`getRedisClient()` via ioredis) is already initialized. The storefront owned-cards state is purely localStorage (`sd-owned-${deckId}`) with no server sync — the collection auto-update must bridge this gap.

The primary recommendation is to implement the cross-service pipeline in three layers: (1) a Medusa subscriber that publishes to Redis on delivery, (2) a customer-backend Redis subscriber that writes CollectionCard rows, and (3) a storefront BFF endpoint that fetches a user's collection and a mechanism to sync it into the deck builder's owned-cards state. Visual regression and E2E tests should be Playwright-based using the existing config but scoped realistically — full 46-page snapshot testing requires all 4 services running with seed data, which is an integration test concern, not a unit-test-like gate. The E2E acceptance test should be a structured checklist with key flows scripted in Playwright where services are available.

## Recommendation

### Collection Auto-Update (R021)
Build the pipeline in three pieces:

1. **Backend subscriber** (`collection-auto-update.ts`): Subscribe to `FulfillmentWorkflowEvents.DELIVERY_CREATED`. Query order items to extract `catalog_sku` from product metadata. Publish `{ userId, items: [{ catalogSku, quantity, condition }] }` to Redis channel `order.receipt.confirmed`.

2. **Customer-backend subscriber** (new file in `src/subscribers/` or inline in app startup): Subscribe to Redis channel `order.receipt.confirmed`. For each item, find-or-create user's default "My Collection" (`type: 'personal'`), then upsert CollectionCard rows using the existing repository pattern from `collections.ts` POST route.

3. **Storefront sync**: Create `GET /api/collection/owned` BFF endpoint that fetches user's collection from customer-backend. On deck load, if user is authenticated, fetch owned catalogSkus from server and merge into the localStorage set. This makes the "I own this" state reflect both manual toggles and auto-updates.

### Visual Audit (R024)
Rather than 92 automated screenshots (which require all services + seed data), create a Playwright visual regression spec for key pages that can render without backend (static/SSG pages or pages with loading states). For the full visual audit, produce a checklist document listing all pages with their wireframe reference and status.

### E2E Acceptance (Milestone DoD)
Write a Playwright E2E spec for the critical buyer journey and seller journey. Gate it behind a `FULL_E2E=1` env var since it requires all 4 services running. Document what each test proves against the M001 success criteria.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| CollectionCard insertion | `POST /:collectionId/cards` route in `customer-backend/src/routes/collections.ts` | Handles find-by-SKU resolution via CatalogSKU entity, quantity upsert, duplicate detection by condition/language. Reuse the repository logic, not the HTTP route. |
| Redis client | `getRedisClient()` in `customer-backend/src/config/infrastructure.ts` | Already configured with ioredis, handles Railway URL parsing, connection events logged. |
| Medusa event subscription | `SubscriberConfig` pattern in `backend/apps/backend/src/subscribers/` | 20+ existing subscribers show the exact pattern. Use `FulfillmentWorkflowEvents.DELIVERY_CREATED` event. |
| Order data querying | `query.graph()` pattern in notification-buyer-new-order.ts | Shows how to resolve order → items → product data within a Medusa subscriber. |
| Playwright config | `storefront/playwright.config.ts` | Already has desktop + mobile projects, 2% pixel tolerance, webServer config. |

## Existing Code and Patterns

- `customer-backend/src/entities/CollectionCard.ts` — Entity with catalogSku, cardId, quantity, condition fields. Has ManyToOne to Collection and Card. Supports upsert by incrementing quantity.
- `customer-backend/src/entities/Collection.ts` — Has `type` field ('personal' | 'wishlist' | 'trading' | 'showcase'). `userId` is a string (matches Medusa customer ID format). Soft-deletes via `DeleteDateColumn`.
- `customer-backend/src/entities/UserCollection.ts` — Simpler entity with just userId + printId + quantity. Different from Collection/CollectionCard. May be a legacy entity — Collection/CollectionCard is the richer model to use.
- `customer-backend/src/routes/collections.ts` — Full CRUD. `POST /:collectionId/cards` handles card insertion with CatalogSKU resolution, quantity upsert by condition/language. This is the pattern to follow for the Redis subscriber's insertion logic.
- `customer-backend/src/config/infrastructure.ts` — `getRedisClient()` returns ioredis instance. Already lazy-connects with `lazyConnect: true`. Can call `.subscribe()` on it for pub/sub (but note: ioredis requires a separate client for pub/sub vs. normal commands).
- `backend/apps/backend/src/subscribers/notification-buyer-new-order.ts` — Shows the Medusa subscriber pattern: import `SubscriberConfig`, export default async handler + config object. Uses `query.graph()` to fetch order with items.
- `backend/node_modules/@medusajs/utils/dist/core-flows/events.d.ts` — `FulfillmentWorkflowEvents.DELIVERY_CREATED` fires when fulfillment is delivered (payload: `{ id }`, the fulfillment ID). `OrderWorkflowEvents.COMPLETED` fires when orders are completed (payload: `[{ id }]`).
- `storefront/src/contexts/DeckBuilderContext.tsx` (1267 lines) — Owned cards use `useRef<Set<string>>` + version counter. Persists to `sd-owned-${deckId}` in localStorage. `toggleOwned()`, `isOwned()`, `getMissingCards()` are the interface. No server sync exists.
- `storefront/playwright.config.ts` — Desktop Chrome + Pixel 5 mobile projects. `toHaveScreenshot` with 2% tolerance. 3 existing E2E tests in `e2e/`.
- `storefront/e2e/story-2-5-ux-compliance.spec.ts` — Example E2E test pattern: uses page.goto + waitForLoadState + locator assertions + manual screenshots to output dir.

## Constraints

- **Split-brain architecture**: Backend publishes to Redis; customer-backend subscribes. No direct DB cross-access. The Redis channel is the only bridge.
- **ioredis pub/sub requires separate client**: A Redis client in subscriber mode cannot issue regular commands. Customer-backend needs a dedicated subscriber client alongside the existing command client.
- **FulfillmentWorkflowEvents.DELIVERY_CREATED payload contains only fulfillment ID**: Must query back to get order → items → product metadata → catalog_sku. The product must store catalog_sku in metadata for this chain to work.
- **Product metadata must contain catalog_sku**: The optimizer panel already assumes `GET /store/products?catalog_sku=X` works (line 294 of CartOptimizerPanel.tsx). The listing creation route must store catalog_sku in product metadata. Need to verify this is the case.
- **Owned cards state is per-deck localStorage**: Server-side collection is per-user. Syncing server→client means: fetch user's collection catalogSkus, then for each loaded deck, set those SKUs as owned. This changes the mental model from "manually toggled per deck" to "globally owned + manually toggled per deck."
- **All 4 services required for E2E tests**: Storefront (Next.js), backend (Medusa/Mercur), customer-backend (Express), plus PostgreSQL ×2, Redis, potentially Algolia and Stripe in test mode.
- **2 pre-existing test failures**: `AlgoliaSearchResults.test.tsx` has 2 failing tests (48 total, 2 failed). Not S10's fault — carry forward.
- **909 tests currently pass** (907 actually passing, 2 failing in AlgoliaSearchResults).

## Common Pitfalls

- **ioredis pub/sub client reuse** — Using the same Redis client for both pub/sub and normal commands will cause errors. Create a separate `getRedisSubscriber()` client for the subscription side. The publishing side can use the existing command client.
- **Fulfillment ID ≠ Order ID** — `DELIVERY_CREATED` fires with `{ id: fulfillmentId }`. Must query `fulfillment → order → items → products` to get catalog_sku data. This is a multi-hop query inside the Medusa subscriber.
- **catalog_sku in product metadata** — If the listing wizard (S08) doesn't store catalog_sku in Medusa product metadata, the subscriber can't extract it. Must verify this exists before building the pipeline. If missing, S10 must add it.
- **Collection auto-create race condition** — If multiple fulfillments arrive simultaneously for a user with no collection, concurrent find-or-create could produce duplicate "My Collection" entries. Use a transaction or UNIQUE constraint on (userId, name, type).
- **localStorage vs server state merge semantics** — If a user manually un-toggles a card and the server says it's owned, which wins? Recommendation: server-side collection is the source of truth for "purchased cards." Manual toggles are additive (user can mark extra cards they own from elsewhere). A manual un-toggle of a server-owned card would need a different mechanism (e.g., "I traded this away"). For MVP, server data is additive — it only adds to the owned set, never removes.
- **Playwright snapshot flakiness** — Font rendering, animation timing, and async data loading cause false positives. Use `page.waitForLoadState('networkidle')`, disable animations in test CSS, and use the 2% tolerance already configured.

## Open Risks

- **catalog_sku not stored in Medusa product metadata**: If S08's listing wizard doesn't persist catalog_sku into the Medusa product's metadata field, the auto-update pipeline has no way to resolve fulfillment items back to card catalog SKUs. This is the critical data link. Needs verification before building the subscriber.
- **OrderWorkflowEvents.COMPLETED vs FulfillmentWorkflowEvents.DELIVERY_CREATED**: The context doc says "receipt confirmation" which implies buyer action. Medusa's DELIVERY_CREATED is a seller/admin action (marking shipped items as delivered). There's no built-in "buyer confirmed receipt" event. If the requirement is buyer-initiated confirmation, we need a custom endpoint + event. If seller-marked delivery is sufficient, DELIVERY_CREATED works.
- **E2E test environment**: Running all 4 services with seed data is non-trivial. If services aren't available, E2E tests must be skippable without blocking the slice.
- **Figma export (R025)**: Still blocked from S06 — Figma MCP auth 405 error. S10 can't resolve this without mcporter or Figma API changes. Should be documented as "blocked — carried forward" rather than attempting a fix.
- **Full visual audit**: 51 page routes × 2 breakpoints = 102 screenshots. Generating and verifying these manually is substantial work. Automated snapshots are the pragmatic approach but require running services.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Medusa | `medusajs/medusa-agent-skills@building-with-medusa` | available (782 installs) |
| Medusa Admin | `medusajs/medusa-agent-skills@building-admin-dashboard-customizations` | available (743 installs) |
| Playwright | `currents-dev/playwright-best-practices-skill@playwright-best-practices` | available (9.4K installs) |
| Playwright | `github/awesome-copilot@playwright-generate-test` | available (7.5K installs) |

The Medusa skill would be useful for understanding subscriber patterns and order data querying. The Playwright skill could help with E2E test structure. Neither is critical since the codebase already has 20+ subscriber examples and existing E2E tests to follow.

## Sources

- Medusa event types from `backend/node_modules/@medusajs/utils/dist/core-flows/events.d.ts` (local file)
- Subscriber pattern from `backend/apps/backend/src/subscribers/notification-buyer-new-order.ts` (local file)
- ioredis pub/sub separation requirement (ioredis documentation — well-known constraint)
- Collection CRUD patterns from `customer-backend/src/routes/collections.ts` (local file)
