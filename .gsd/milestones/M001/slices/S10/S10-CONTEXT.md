---
id: S10
milestone: M001
status: ready
---

# S10: Integration & Polish — Context

## Goal

Wire the remaining cross-service glue (collection auto-update on receipt confirmation), add automated visual snapshot tests for all 46 storefront pages at both breakpoints, build a Playwright E2E test proving the full user journey, and close out M001 acceptance.

## Why this Slice

S10 is the final slice in M001. All feature slices (S01–S09) build individual capabilities in isolation — S10 proves they work together end-to-end and catches any visual regressions introduced along the way. It also builds the missing cross-service wiring (Redis pub/sub for collection auto-update) that no prior slice owns. Without S10, the milestone has features but no proof they compose into a working product.

## Scope

### In Scope

- **Collection auto-update on receipt confirmation:** When a buyer confirms receipt of ordered cards, those cards are automatically added to their collection. The update is silent — no user prompt, just a toast notification confirming "X cards added to your collection." The mechanism is a Redis event (`order.receipt.confirmed`) published by the backend, consumed by customer-backend, which inserts `CollectionCard` rows.
- **Cross-service Redis pub/sub wiring:** Neither backend currently has Redis pub/sub for cross-service events. S10 creates the publisher (backend side, on order receipt confirmation) and subscriber (customer-backend side, listens and updates collection).
- **Automated visual snapshot tests for all 46 storefront pages** at 1440px desktop and 390px mobile (92 total screenshots). Uses Playwright's `toHaveScreenshot` with the existing config (`maxDiffPixelRatio: 0.02`, Chromium + Mobile Chrome projects).
- **Automated E2E acceptance test** in Playwright covering the full flow: OAuth login → card search → deck build → mark owned → cart optimize → checkout → receipt confirmation → collection update. Also a seller flow: login → seller upgrade → 3-step listing → listing appears on card detail.
- **Fix any visual regressions** discovered by the snapshot tests or E2E walkthrough.
- **Milestone acceptance sign-off:** all success criteria from M001 roadmap proven.

### Out of Scope

- New features or pages — S10 builds no new user-facing functionality beyond the collection auto-update wiring.
- Performance optimization beyond existing targets.
- Vendor panel changes.
- Backend admin UI changes.
- Adding new OAuth providers.
- Fixing upstream slice bugs that aren't regressions (e.g., CategoryPills not filtering is a known limitation from S02, not an S10 concern).

## Constraints

- **Split-brain architecture:** Collection auto-update crosses the backend → customer-backend boundary. Must use Redis pub/sub, not direct DB access. The backend publishes the event; customer-backend subscribes and writes to `sidedecked-db`.
- **Collection entities already exist:** `Collection` and `CollectionCard` entities in customer-backend are fully defined with CRUD routes at `/collections`. S10 adds cards via the existing repository pattern, not new endpoints.
- **Playwright already configured:** `storefront/playwright.config.ts` has desktop + mobile projects, `toHaveScreenshot` with 2% pixel tolerance, `e2e/` test directory, and `e2e/__screenshots__/` snapshot directory. Three E2E tests already exist.
- **Redis already in infrastructure:** Both backends have Redis configured (backend for Medusa internals, customer-backend for BullMQ queues via `infrastructure.ts`). Pub/sub uses the same connection.
- **All 4 services must be running** for E2E tests: storefront, backend, customer-backend, and any required infrastructure (PostgreSQL ×2, Redis, Algolia, Stripe test mode).
- **Toast notification uses sonner:** All alert/confirm/prompt calls were replaced with sonner toasts in S01. Collection auto-update notification follows the same pattern.

## Integration Points

### Consumes

- All prior slice outputs (S01–S09) — this slice verifies the composed product
- `customer-backend/src/entities/CollectionCard.ts` — entity for inserting owned cards
- `customer-backend/src/entities/Collection.ts` — user's collection to add cards to
- `customer-backend/src/routes/collections.ts` — existing CRUD patterns for collection card insertion
- `customer-backend/src/config/infrastructure.ts` — Redis client (`getRedisClient()`)
- `backend/apps/backend/src/subscribers/` — existing subscriber patterns for Medusa event handling
- `storefront/playwright.config.ts` — existing Playwright setup with desktop + mobile projects
- `storefront/e2e/` — existing E2E test directory with 3 tests
- All 9+ wireframe HTML files in `docs/plans/wireframes/` — visual reference for snapshot baselines

### Produces

- Redis event publisher in backend: publishes `order.receipt.confirmed` with order line item data (card IDs, quantities, conditions)
- Redis event subscriber in customer-backend: listens for `order.receipt.confirmed`, finds or creates user's default collection, inserts `CollectionCard` rows
- Storefront toast notification on collection update (via existing sonner pattern)
- `storefront/e2e/__screenshots__/` — baseline screenshots for all 46 pages at both breakpoints (92 images)
- `storefront/e2e/visual-regression.spec.ts` — Playwright visual snapshot tests
- `storefront/e2e/full-journey.spec.ts` — Playwright E2E acceptance test (buyer flow + seller flow)
- Final verification report proving all M001 success criteria are met

## Open Questions

- **Default collection creation:** If a user has no collection when receipt is confirmed, should one be auto-created? Current thinking: yes — auto-create a "My Collection" collection of type `personal` on first receipt event. The user never needs to manually create a collection for auto-update to work.
- **E2E test auth strategy:** The Playwright E2E test needs a logged-in user. Should it use real OAuth flow (slower, depends on Google/Discord test accounts) or seed a test user with a direct API call and inject the session? Current thinking: seed a test user via API for speed and reliability — real OAuth is tested separately in S05's scope.
- **Snapshot baseline source:** The 92 baseline screenshots need to be captured against the running app with real-ish data. Should the E2E test seed its own data, or rely on existing dev seed data? Current thinking: E2E test seeds its own fixture data for deterministic screenshots.
- **Which collection gets the cards:** If a user has multiple collections, does auto-update always go to a specific "default" collection, or should it use the most recently updated one? Current thinking: use or create a collection named "My Collection" with type `personal` — the user's primary ownership collection.
