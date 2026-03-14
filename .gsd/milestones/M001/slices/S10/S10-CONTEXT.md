---
id: S10
milestone: M001
status: ready
---

# S10: Integration & Polish — Context

<!-- Slice-scoped context. Milestone-only sections (acceptance criteria, completion class,
     milestone sequence) do not belong here — those live in the milestone context. -->

## Goal

Prove the entire MVP works end-to-end: collection auto-updates on order fulfillment, every storefront page passes visual regression against its wireframe, and automated E2E tests verify both buyer and seller journeys with real local services.

## Why this Slice

S10 is the final slice of M001. All feature work (S01–S09) is complete — what remains is the cross-cutting integration that proves the features compose into a working product. Without S10, we have individually verified slices but no proof that the full user journey works, no visual regression safety net for future changes, and no automated way to catch regressions in the buyer or seller flows. S10 also delivers the last feature gap: collection auto-update on fulfillment, which closes the loop from purchase to ownership.

## Scope

### In Scope

- **Collection auto-update on fulfillment:** When Medusa emits a fulfillment event (order shipped), purchased cards are automatically added to the buyer's collection in customer-backend. If the buyer has no collection, a "Purchases" collection is auto-created.
- **Cross-service event plumbing:** Medusa fulfillment event → customer-backend collection update. This is the first cross-service event in the system — requires a communication mechanism between the two backends (subscriber in Medusa that calls customer-backend API, or shared event bus).
- **Visual regression test suite:** Playwright screenshot tests for all storefront pages (~54 routes) at both desktop (1440px / Desktop Chrome) and mobile (390px / Pixel 5) breakpoints. Baseline screenshots established against current implementation.
- **E2E test suite — buyer journey:** Playwright E2E test with real local services covering: OAuth login → card search → deck build → mark owned → cart optimize → checkout → receipt → collection update.
- **E2E test suite — seller journey:** Playwright E2E test with real local services covering: login → seller upgrade → 3-step listing wizard → listing visible on card detail page.
- **Final test/build/lint gate:** All 909+ unit tests pass, production build succeeds, zero lint errors across all affected repos.

### Out of Scope

- Figma export completion (R025 blocked on MCP auth — tracked separately, not gated by S10)
- Any new feature development — S10 is integration, testing, and the collection auto-update wiring only
- Performance optimization beyond existing targets
- Visual redesign or pixel adjustments — screenshots capture current state as baseline; deviations from wireframes found during screenshot review become follow-up issues, not S10 scope
- CI pipeline setup for running E2E/visual tests — tests are authored to run locally; CI integration is a future concern
- Vendor panel or admin UI changes
- Multi-currency or international payment flows

## Constraints

- **Split-brain architecture:** Collection auto-update crosses the backend/customer-backend boundary. Per the architecture guardrail, no direct DB access across systems — Medusa must communicate to customer-backend via API call (D002 in AGENTS.md).
- **Real local services for E2E:** E2E tests require all 4 services running (storefront, backend, customer-backend, plus PostgreSQL/Redis). Tests must handle service startup/teardown or document the required running state.
- **OAuth for E2E:** The buyer and seller journeys start with OAuth login. E2E tests need either real OAuth credentials configured or a test-user seeding mechanism that bypasses OAuth for test runs.
- **Existing Playwright config:** `storefront/playwright.config.ts` is already configured with `toHaveScreenshot` (2% maxDiffPixelRatio), Desktop Chrome + Mobile Chrome projects, `testDir: ./e2e`, `snapshotDir: ./e2e/__screenshots__`. Build on this, don't replace it.
- **Respect all prior decisions:** D001–D034 are locked. Especially D009 (Voltage tokens via inline style), D023 (commit child repo changes to slice branch), D031 (owned cards useRef pattern).

## Integration Points

### Consumes

- Medusa fulfillment events — `order.fulfillment_created` or equivalent event emitted when seller marks order as shipped
- `customer-backend/src/routes/collections.ts` — existing collection CRUD API for adding cards
- `customer-backend/src/entities/CollectionCard.ts` — entity with `catalogSku`, `quantity`, `condition`, `acquiredPrice`, `acquiredDate` fields
- S09 optimizer + checkout flow — the end of the buyer journey that precedes collection update
- S08 listing wizard — the seller journey verified in E2E
- All 33 wireframes in `docs/plans/wireframes/` — visual regression baseline targets
- All storefront page routes (54 `page.tsx` files) — screenshot targets
- `storefront/e2e/` — existing E2E test directory with 3 spec files
- `storefront/playwright.config.ts` — existing Playwright configuration

### Produces

- Medusa subscriber or webhook handler that fires on fulfillment and calls customer-backend
- `POST /api/collections/auto-add` or similar endpoint in customer-backend that receives order line items and creates CollectionCard entries
- Auto-creation of "Purchases" collection when buyer has no existing collection
- `storefront/e2e/visual-regression/` — screenshot test specs for all pages at both breakpoints
- `storefront/e2e/__screenshots__/` — baseline screenshot images
- `storefront/e2e/buyer-journey.spec.ts` — full buyer flow E2E test
- `storefront/e2e/seller-journey.spec.ts` — full seller flow E2E test
- Final verification report confirming all milestone acceptance criteria

## Open Questions

- **Medusa fulfillment event mechanism:** Medusa v2 has an event system with subscribers. Need to verify the exact event name and payload shape for fulfillment creation. Current thinking: create a subscriber in `backend/apps/backend/src/subscribers/` that listens to the fulfillment event and makes an HTTP POST to customer-backend with the order line items.
- **OAuth in E2E tests:** Real OAuth (Google/Discord) requires browser redirect flows that are fragile in E2E. Current thinking: seed a test user directly in the database and use Medusa's email/password auth for E2E tests, proving OAuth separately via the existing unit test coverage in S05.
- **Visual regression for auth-gated pages:** Many pages (user account, seller dashboard, orders, etc.) require authentication to render content. Current thinking: E2E tests log in first, then navigate to each page for screenshots. Group tests by auth state to minimize login overhead.
- **Visual regression for data-dependent pages:** Card detail, deck viewer, orders, etc. need data to render meaningfully. Current thinking: seed test data in the databases before running visual tests, or accept that some pages render empty/placeholder states and that's the baseline.
- **Collection card mapping from order line items:** Order line items in Medusa contain variant/product IDs, not catalogSkus. The fulfillment handler needs to resolve Medusa product → catalogSku to create the CollectionCard. Current thinking: products synced from customer-backend already carry `catalog_sku` metadata — read it from the product during the fulfillment event.
