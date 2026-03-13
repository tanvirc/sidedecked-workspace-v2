# M003: Growth & Analytics — Context

**Gathered:** 2026-03-13
**Status:** Future milestone — plan when M002 completes

## Project Description

Add analytics, price intelligence, and collection management features that deepen user engagement and give sellers data to optimize their business. Build the standalone admin dashboard.

## Why This Milestone

M001 proved the core loop. M002 scaled supply and added safety. M003 makes the platform sticky — users come back because price alerts tell them when to buy, sellers come back because analytics show what to list, and admins have real tooling instead of raw API calls.

## User-Visible Outcome

### When this milestone is complete, the user can:

- View price history charts (7/30/90 day) on card detail pages
- Set price alerts and get notified when watched cards change price
- Import their collection from TCGPlayer/Moxfield CSV
- View vendor performance dashboards with sales analytics
- (Admin) View platform metrics dashboard (GMV, active sellers, order volume, conversion)
- (Admin) Run automated financial reconciliation between orders and Stripe
- Save searches and get notifications for new matches
- Follow other users and see their public deck activity
- Use a standalone admin dashboard (not MedusaJS admin API)

### Entry point / environment

- Entry point: Storefront, Vendor panel, Admin dashboard
- Environment: production
- Live dependencies: Stripe (reconciliation), Resend (notifications), Algolia (saved searches)

## Completion Class

- Contract complete means: Price history data populates correctly, analytics queries return expected results, reconciliation identifies discrepancies
- Integration complete means: Price alerts → email notifications, saved searches → Algolia persisted queries, admin dashboard → cross-service data aggregation
- Operational complete means: Reconciliation runs daily without human intervention, price history doesn't degrade query performance

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A user can view price history for a card, set a price alert, and receive a notification when the price drops
- A vendor can view their dashboard showing sales trends, listing performance, and payout history
- An admin can view GMV, run reconciliation, and see flagged discrepancies
- A user can import their TCGPlayer collection and see owned cards reflected in the deck builder

## Risks and Unknowns

- Price history storage at scale — daily snapshots for 50K+ cards could grow large
- Admin dashboard scope — could easily expand. Need a focused MVP dashboard.
- Collection import format parsing — TCGPlayer and Moxfield export formats change periodically

## Existing Codebase / Prior Art

- `customer-backend/src/services/PriceHistoryService.ts` — 399 lines
- `customer-backend/src/services/PriceAlertService.ts` — 460 lines
- `customer-backend/src/services/MarketDataService.ts` — 560 lines
- `_bmad-output/planning-artifacts/epics.md` — Epic 8 (Stories 8.3, 8.6)

## Relevant Requirements

- R035 — Price history charts

## Scope

### In Scope
- Price history charts on card detail page
- Price alert creation and email notifications
- Collection import from TCGPlayer/Moxfield CSV
- Vendor performance dashboards (views, cart-adds, sales, revenue per listing)
- Saved searches with notification
- Community profiles and following
- Admin metrics dashboard (GMV, sellers, orders, conversion)
- Automated financial reconciliation
- Transactional email improvements

### Out of Scope / Non-Goals
- Community forums/events (M004)
- ML price forecasting (M005)
- Multi-channel inventory sync (future)
