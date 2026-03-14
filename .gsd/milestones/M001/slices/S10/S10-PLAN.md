# S10: Integration & Polish

**Goal:** Collection auto-updates on receipt confirmation, all pages re-verified, end-to-end acceptance proven.
**Demo:** When a fulfillment is marked delivered, the purchased cards automatically appear in the buyer's collection in customer-backend. The storefront BFF can fetch a user's owned catalogSkus, and the deck builder merges server-owned cards into its local owned-cards state. All 907+ existing tests still pass. An E2E acceptance checklist documents the complete buyer and seller journeys against M001 success criteria.

## Must-Haves

- Backend subscriber fires on `delivery.created` event, extracts `catalog_sku` from order item product metadata, publishes to Redis channel `order.receipt.confirmed`
- Customer-backend subscribes to Redis `order.receipt.confirmed`, find-or-creates the user's "My Collection", upserts CollectionCard rows by catalogSku/condition
- Storefront BFF endpoint `GET /api/collection/owned` fetches user's collection catalogSkus from customer-backend
- DeckBuilderContext merges server-owned catalogSkus into the local owned-cards set on deck load (server data is additive — never removes manually toggled cards)
- All existing 907+ tests continue to pass, plus new unit tests for subscriber logic, BFF endpoint, and collection sync
- E2E acceptance checklist documents all M001 success criteria with verification status

## Proof Level

- This slice proves: integration + final-assembly
- Real runtime required: yes (for E2E — but unit tests cover core logic without running services)
- Human/UAT required: yes (visual audit comparison against wireframes)

## Verification

- `cd backend/apps/backend && npx jest --testPathPattern=collection-auto-update --forceExit` — backend subscriber unit tests pass
- `cd customer-backend && npx jest --testPathPattern=collection-subscriber` — customer-backend subscriber unit tests pass
- `cd storefront && npx vitest run src/app/api/collection/__tests__/owned.test.ts` — BFF endpoint tests pass
- `cd storefront && npx vitest run src/contexts/__tests__/DeckBuilderCollectionSync.test.tsx` — collection sync tests pass
- `cd storefront && npx vitest run` — all 907+ tests pass (2 pre-existing failures in AlgoliaSearchResults excluded)
- `cd storefront && npm run build` — production build succeeds
- `.gsd/milestones/M001/slices/S10/acceptance-checklist.md` exists with all M001 criteria documented

## Observability / Diagnostics

- Runtime signals: `[collection-auto-update]` log prefix in backend subscriber, `[collection-subscriber]` log prefix in customer-backend Redis handler, `[collection-sync]` prefix in storefront BFF
- Inspection surfaces: Redis channel `order.receipt.confirmed` carries JSON with `{ userId, items: [{ catalogSku, quantity, condition }] }`. Customer-backend `collections` table + `collection_cards` table. Storefront `GET /api/collection/owned` returns `{ catalogSkus: string[] }`.
- Failure visibility: Backend subscriber logs fulfillment ID + error on query failure. Customer-backend logs userId + error on upsert failure. BFF returns `{ catalogSkus: [], error: string }` on fetch failure.
- Redaction constraints: none (catalogSkus are not PII)

## Integration Closure

- Upstream surfaces consumed: `FulfillmentWorkflowEvents.DELIVERY_CREATED` event (Medusa core-flows), `query.graph()` for order→items→product metadata (Medusa), `getRedisClient()` (customer-backend infrastructure), `CollectionCard` + `Collection` entities (customer-backend), `DeckBuilderContext` (storefront)
- New wiring introduced in this slice: Redis pub/sub bridge between backend and customer-backend, storefront BFF→customer-backend collection API, DeckBuilderContext server sync on deck load
- What remains before the milestone is truly usable end-to-end: Visual UAT (human comparison against wireframes at 1440px and 390px), Figma export (blocked per R025), live multi-service E2E test execution

## Tasks

- [x] **T01: Build cross-service collection auto-update pipeline** `est:2h`
  - Why: R021 — the core new feature. Backend publishes to Redis on delivery, customer-backend subscribes and writes CollectionCard rows. This is the only new production code in S10.
  - Files: `backend/apps/backend/src/subscribers/collection-auto-update.ts`, `customer-backend/src/subscribers/collection-subscriber.ts`, `customer-backend/src/config/infrastructure.ts`, `customer-backend/src/index.ts`, `backend/apps/backend/src/subscribers/__tests__/collection-auto-update.test.ts`, `customer-backend/src/tests/collection-subscriber.test.ts`
  - Do: (1) Create backend subscriber that listens to `delivery.created`, queries fulfillment→order→items→product metadata to extract catalog_sku/condition, publishes JSON to Redis `order.receipt.confirmed`. (2) Add `getRedisSubscriber()` to customer-backend infrastructure (separate ioredis client for pub/sub). (3) Create customer-backend subscriber module that subscribes to Redis channel, find-or-creates user's "My Collection" (type: 'personal'), upserts CollectionCard rows using the existing repository pattern from collections.ts POST route. (4) Hook subscriber startup into customer-backend's `startServer()` after infrastructure init. (5) Write unit tests mocking Medusa container/query and Redis clients.
  - Verify: Backend subscriber tests pass, customer-backend subscriber tests pass, both builds succeed
  - Done when: `delivery.created` event triggers Redis publish with correct payload shape; Redis subscription handler correctly upserts CollectionCard rows; unit tests prove both sides independently

- [x] **T02: Storefront collection sync BFF + deck builder integration** `est:1.5h`
  - Why: Bridges the server-side collection (written by T01's pipeline) into the client-side owned-cards state. Without this, auto-updates are invisible to the deck builder.
  - Files: `storefront/src/app/api/collection/owned/route.ts`, `storefront/src/contexts/DeckBuilderContext.tsx`, `storefront/src/app/api/collection/__tests__/owned.test.ts`, `storefront/src/contexts/__tests__/DeckBuilderCollectionSync.test.tsx`
  - Do: (1) Create `GET /api/collection/owned` BFF endpoint — reads auth cookie, fetches user's collections from customer-backend `GET /api/collections/user/:userId`, extracts all catalogSkus from all personal collections, returns `{ catalogSkus: string[] }`. (2) Add `syncServerOwnedCards()` to DeckBuilderContext — on deck load (when user is authenticated), fetch `/api/collection/owned`, merge returned catalogSkus into ownedCardsRef (additive only — server SKUs are added, never removed). (3) Write tests for BFF endpoint (mock customer-backend response) and for sync behavior (mock fetch, verify merge semantics).
  - Verify: `npx vitest run src/app/api/collection/__tests__/owned.test.ts` and `npx vitest run src/contexts/__tests__/DeckBuilderCollectionSync.test.tsx` pass; full `npx vitest run` still passes 907+; `npm run build` succeeds
  - Done when: Authenticated users' server-side collection catalogSkus are additively merged into deck builder owned-cards state on deck load

- [x] **T03: E2E acceptance checklist, visual audit log, and milestone closeout** `est:1h`
  - Why: Final verification artifact. Documents that all M001 success criteria are met (or explicitly noted as blocked). Updates requirements validation status.
  - Files: `.gsd/milestones/M001/slices/S10/acceptance-checklist.md`, `.gsd/milestones/M001/slices/S10/visual-audit-log.md`, `.gsd/REQUIREMENTS.md`
  - Do: (1) Create acceptance-checklist.md mapping each M001 success criterion to its verification evidence (test counts, structural proofs, feature existence). (2) Create visual-audit-log.md listing all storefront page routes with their wireframe reference and Voltage compliance status (based on grep verification from S01-S09). (3) Update R021 validation in REQUIREMENTS.md to reflect the implemented pipeline. (4) Document R025 (Figma export) as still blocked. (5) Run final `npx vitest run` and `npm run build` to confirm baseline.
  - Verify: acceptance-checklist.md covers all 7 M001 success criteria; visual-audit-log.md lists all page routes; REQUIREMENTS.md R021 updated; storefront tests pass and build succeeds
  - Done when: All M001 criteria documented with evidence; R021 validation updated; final test/build gate passes

## Files Likely Touched

- `backend/apps/backend/src/subscribers/collection-auto-update.ts`
- `backend/apps/backend/src/subscribers/__tests__/collection-auto-update.test.ts`
- `customer-backend/src/subscribers/collection-subscriber.ts`
- `customer-backend/src/config/infrastructure.ts`
- `customer-backend/src/index.ts`
- `customer-backend/src/tests/collection-subscriber.test.ts`
- `storefront/src/app/api/collection/owned/route.ts`
- `storefront/src/app/api/collection/__tests__/owned.test.ts`
- `storefront/src/contexts/DeckBuilderContext.tsx`
- `storefront/src/contexts/__tests__/DeckBuilderCollectionSync.test.tsx`
- `.gsd/milestones/M001/slices/S10/acceptance-checklist.md`
- `.gsd/milestones/M001/slices/S10/visual-audit-log.md`
- `.gsd/REQUIREMENTS.md`
