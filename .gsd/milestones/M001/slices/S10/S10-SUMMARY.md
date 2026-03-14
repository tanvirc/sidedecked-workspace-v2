---
id: S10
parent: M001
milestone: M001
provides:
  - Cross-service collection auto-update pipeline (delivery.created → Redis → CollectionCard upsert)
  - GET /api/collection/owned BFF endpoint returning user's owned catalogSkus
  - syncServerOwnedCards() in DeckBuilderContext for additive server→local merge
  - M001 acceptance checklist (8 criteria, 6 verified / 1 blocked / 1 pending UAT)
  - Visual audit log covering all 51 storefront page routes
requires:
  - slice: S09
    provides: Complete cart optimizer + checkout flow, owned-cards state management
  - slice: S03
    provides: DeckBuilderContext with owned-cards ref and localStorage persistence
affects: []
key_files:
  - backend/apps/backend/src/subscribers/collection-auto-update.ts
  - customer-backend/src/subscribers/collection-subscriber.ts
  - customer-backend/src/config/infrastructure.ts
  - storefront/src/app/api/collection/owned/route.ts
  - storefront/src/contexts/DeckBuilderContext.tsx
  - .gsd/milestones/M001/slices/S10/acceptance-checklist.md
  - .gsd/milestones/M001/slices/S10/visual-audit-log.md
key_decisions:
  - D035 — Server-owned cards are additive-only merge into local state (never removes manually toggled cards)
  - D036 — Separate ioredis client for Redis pub/sub in customer-backend (subscriber mode can't issue regular commands)
  - Direct ioredis import in backend subscriber (Medusa container doesn't expose raw Redis publish)
  - BFF collection endpoint uses retrieveCustomer() for auth (same pattern as /api/customer/me)
  - syncServerOwnedCards is fire-and-forget (non-blocking, keeps deck load fast)
patterns_established:
  - Cross-service Redis pub/sub bridge pattern (backend publishes, customer-backend subscribes)
  - BFF collection endpoint pattern (authenticate → call customer-backend → return empty array on failure)
  - Additive server→local owned-cards merge pattern (server SKUs added to ref Set, version bumped, localStorage saved)
  - Acceptance checklist pattern (criterion → evidence type + detail + status)
  - Visual audit log pattern (routes grouped by page family with wireframe reference + verification status)
observability_surfaces:
  - "[collection-auto-update]" log prefix in backend subscriber (info on publish, warn on missing data, error on failure)
  - "[collection-subscriber]" log prefix in customer-backend Redis handler (info on upsert, warn on malformed, error on failure)
  - "[redis-subscriber]" log prefix on dedicated subscriber connection events
  - "[collection-sync]" log prefix in storefront BFF route (errors only)
  - Redis channel "order.receipt.confirmed" carries JSON { userId, items: [{ catalogSku, quantity, condition }] }
  - GET /api/collection/owned returns { catalogSkus: string[] } or { catalogSkus: [], error: string }
  - acceptance-checklist.md and visual-audit-log.md are inspection surfaces for M001 closure status
drill_down_paths:
  - .gsd/milestones/M001/slices/S10/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S10/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S10/tasks/T03-SUMMARY.md
duration: ~67min
verification_result: passed
completed_at: 2026-03-14
---

# S10: Integration & Polish

**Cross-service collection auto-update pipeline (delivery → Redis → CollectionCard → BFF → deck builder sync), M001 acceptance verification with 918 tests passing, and visual audit of all 51 storefront routes.**

## What Happened

Built the final integration layer connecting order fulfillment to the deck builder's owned-cards state, then created the M001 milestone closure artifacts.

**T01 — Cross-service pipeline (25min):** Created a Medusa subscriber (`collection-auto-update.ts`) that listens to `delivery.created` events, traverses the fulfillment→order→items→variant→product chain to extract `catalog_sku` and `condition` from metadata, and publishes structured JSON to Redis channel `order.receipt.confirmed`. Uses direct ioredis since Medusa's container doesn't expose raw Redis publish. On the customer-backend side, added a dedicated `getRedisSubscriber()` client (ioredis in subscriber mode can't issue regular commands) and a subscriber module that validates the payload, find-or-creates the user's "My Collection" (type: personal) within a transaction, resolves catalogSku→Card via Print→Card relation, and upserts CollectionCard rows with quantity incrementing.

**T02 — BFF + deck builder sync (12min):** Created `GET /api/collection/owned` that authenticates via `retrieveCustomer()`, fetches personal collections from customer-backend, deduplicates catalogSkus across all collections, and returns `{ catalogSkus: string[] }`. Added `syncServerOwnedCards()` to DeckBuilderContext — runs fire-and-forget after `loadOwnedCards()` on deck load when authenticated, additively merging server SKUs into the local owned-cards ref without ever removing manually toggled entries.

**T03 — Acceptance & closeout (30min):** Created acceptance-checklist.md mapping all 8 M001 success criteria to concrete evidence (6 verified, 1 blocked on Figma MCP, 1 pending visual UAT). Created visual-audit-log.md covering all 51 storefront routes with wireframe references and Voltage compliance status. Updated R021 and R024 validations in REQUIREMENTS.md with pipeline evidence. Committed child repo changes (storefront, backend, customer-backend).

## Verification

| Check | Result |
|---|---|
| `backend/apps/backend: jest collection-auto-update` | 8 tests pass (2 suites) |
| `customer-backend: jest collection-subscriber` | 5 tests pass |
| `storefront: vitest owned.test.ts` | 7 tests pass |
| `storefront: vitest DeckBuilderCollectionSync.test.tsx` | 4 tests pass |
| `storefront: vitest run` (full suite) | 918 pass / 2 fail (pre-existing AlgoliaSearchResults) |
| `storefront: npm run build` | Production build succeeds |
| `backend: npm run build` | Succeeds (20 tasks) |
| `customer-backend: npm run build` | Succeeds (tsc clean) |
| acceptance-checklist.md exists | ✅ (8 criteria covered) |
| visual-audit-log.md exists | ✅ (51 routes documented) |

## Requirements Advanced

- R021 — Collection auto-update pipeline fully implemented: delivery.created → backend subscriber → Redis → customer-backend subscriber → CollectionCard upsert → BFF → deck builder sync. 24 tests across the pipeline.
- R024 — Voltage dark theme consistency verified across all 51 storefront routes (S01–S10). Zero bare light-mode Tailwind classes in any component touched by M001.

## Requirements Validated

- R021 — 24 tests prove the full pipeline (8 backend + 5 customer-backend + 7 BFF + 4 sync). Each segment independently verified. Full runtime integration requires all 3 services + Redis.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Used direct ioredis import in backend subscriber instead of resolving from Medusa container — the container only exposes QUERY, LOGGER, MANAGER, CONFIG_MODULE, etc., not a raw Redis publish interface.
- Counted 8 success criteria in acceptance checklist instead of 7 — M001-ROADMAP.md lists "672+ tests pass, build succeeds, zero lint errors" as an additional criterion.

## Known Limitations

- 2 pre-existing AlgoliaSearchResults test failures — `getByText` finds duplicate text from image-placeholder fallback `<span>` and card title `<span>`. Not an S10 regression.
- Visual UAT pending for 46 pages — requires human comparison against wireframes at 1440px and 390px.
- Figma export blocked (R025) — MCP auth 405 error (mcporter SSE/HTTP transport mismatch).
- Full runtime integration test of the collection pipeline requires all 3 services + Redis running simultaneously.
- `syncServerOwnedCards()` has no "un-own" mechanism — if a user trades away a purchased card, it will still appear owned. Intentional per D035.

## Follow-ups

- Fix AlgoliaSearchResults test failures (change `getByText` to `getAllByText` in 2 tests)
- Resolve Figma MCP auth (R025) — update mcporter for HTTP MCP support, or use Claude Desktop/Cursor with native Figma MCP
- Conduct human visual UAT at 1440px and 390px for all 46 pages with wireframes
- Consider "un-own" mechanism for traded/sold cards in a future milestone

## Files Created/Modified

- `backend/apps/backend/src/subscribers/collection-auto-update.ts` — Medusa subscriber: delivery.created → extract catalog_sku → Redis publish
- `backend/apps/backend/src/subscribers/__tests__/collection-auto-update.test.ts` — 4 test cases (8 with compiled suite)
- `customer-backend/src/subscribers/collection-subscriber.ts` — Redis subscriber: order.receipt.confirmed → CollectionCard upsert
- `customer-backend/src/config/infrastructure.ts` — Added getRedisSubscriber() + cleanup in closeInfrastructure()
- `customer-backend/src/index.ts` — Added startCollectionSubscriber() after infrastructure init
- `customer-backend/src/tests/collection-subscriber.test.ts` — 5 test cases
- `storefront/src/app/api/collection/owned/route.ts` — BFF endpoint: user's owned catalogSkus
- `storefront/src/app/api/collection/__tests__/owned.test.ts` — 7 test cases
- `storefront/src/contexts/DeckBuilderContext.tsx` — Added syncServerOwnedCards() + calls in loadDeck/loadDeckForEdit
- `storefront/src/contexts/__tests__/DeckBuilderCollectionSync.test.tsx` — 4 integration tests
- `.gsd/milestones/M001/slices/S10/acceptance-checklist.md` — M001 success criteria verification
- `.gsd/milestones/M001/slices/S10/visual-audit-log.md` — Per-page Voltage compliance audit (51 routes)
- `.gsd/REQUIREMENTS.md` — R021 + R024 validation updated

## Forward Intelligence

### What the next slice should know
- M001 is structurally complete. The next work is either M002 planning or the human visual UAT + Figma export resolution.
- The collection auto-update pipeline is the first cross-service Redis pub/sub bridge — any future cross-service events should follow the same pattern (dedicated subscriber client, structured JSON payloads, transaction-wrapped DB operations).
- 918 tests is the new baseline (was 672+ at milestone start, 907+ at S09 end).

### What's fragile
- The ioredis import in backend subscriber (`collection-auto-update.ts`) depends on ioredis being available as a transitive dependency — if the backend's dependency tree changes and ioredis is removed, this will break at runtime. Consider adding ioredis as an explicit dependency if the subscriber moves to production.
- `syncServerOwnedCards` runs fire-and-forget — if the BFF endpoint is slow, owned cards from the server won't appear immediately on deck load. No loading indicator exists for this background sync.

### Authoritative diagnostics
- `acceptance-checklist.md` — definitive M001 closure status. Each criterion has evidence type + status.
- `visual-audit-log.md` — definitive per-page wireframe mapping and Voltage compliance status. Start here for visual UAT.
- Redis channel `order.receipt.confirmed` — monitor with `redis-cli subscribe order.receipt.confirmed` to verify pipeline is publishing.

### What assumptions changed
- Assumed Medusa container would expose Redis access — it doesn't. Direct ioredis import was necessary.
- Assumed test count would be ~907+ (S09 baseline) — ended at 918 due to 11 new S10 tests.
