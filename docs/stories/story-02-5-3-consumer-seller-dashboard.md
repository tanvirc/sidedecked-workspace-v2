# Story 2.5.3: Consumer Seller Dashboard

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: dev-complete
**Domain**: Commerce (backend/) + Customer Backend (customer-backend/) + Storefront (storefront/)

## User Story

_As an individual seller, I want a simple dashboard to manage my selling activities so that I can track my progress and manage listings easily._

## Acceptance Criteria

- (IMPLEMENTED) Clean, mobile-first dashboard design appropriate for casual sellers
- (IMPLEMENTED) Overview tab showing key metrics: active listings, total sales, current rating
- (IMPLEMENTED) Quick stats cards: listings count, revenue this month, trust score, seller tier
- (IMPLEMENTED) Recent activity feed showing latest sales, messages, and reviews
- (IMPLEMENTED) Listings tab with grid view of active/inactive items
- (IMPLEMENTED) Simple listing management: edit price/quantity, pause/unpause, delete
- (IMPLEMENTED) Sales tab showing order history and payout status
- (IMPLEMENTED) Profile tab for managing seller settings and verification status
- (IMPLEMENTED) Trust level badge display (Bronze, Silver, Gold, Platinum, Diamond)
- (IMPLEMENTED) Individual verification checklist (email, phone, optional ID verification)
- (IMPLEMENTED) Quick action buttons for common tasks (list new card, check messages)
- (IMPLEMENTED) Mobile-responsive design with touch-friendly controls
- (IMPLEMENTED) Link to messages for important updates (notification system deferred)
- (IMPLEMENTED) Basic analytics appropriate for individual sellers (4 stat cards, no charts)
- (IMPLEMENTED) Easy access to customer support and seller resources

## Implementation Notes

The individual seller dashboard is located at `/sell` (existing route). It aggregates data from both mercur-db (listings, orders, sales) via backend APIs and sidedecked-db (trust scores, seller ratings, verification) via customer-backend APIs. The storefront makes parallel API calls and combines results client-side.

Trust tier thresholds: Bronze (0-149), Silver (150-299), Gold (300-499), Platinum (500-749), Diamond (750+).

Existing `ConsumerSellerDashboard.tsx` has full UI scaffold with mock data — replace mocks with real API calls. Delete dead `SellerDashboard.tsx`.

## Tasks

- [x] Task 1: customer-backend — Add `GET /api/sellers/:seller_id/dashboard-summary` endpoint returning consolidated trust, rating, verification, tier progress, and recent reviews
- [x] Task 2: backend — Add `GET /store/consumer-seller/dashboard` endpoint returning aggregate stats (active listings, total sales, monthly revenue, pending orders, recent activity)
- [x] Task 3: backend — Add `GET /store/consumer-seller/listings` endpoint with pagination and status filter
- [x] Task 4: backend — Add `PUT /store/consumer-seller/listings/:id` and `DELETE /store/consumer-seller/listings/:id` endpoints for listing management
- [x] Task 5: backend — Add `GET /store/consumer-seller/orders` endpoint for seller order history
- [x] Task 6: storefront — Add seller dashboard API client functions for both backends
- [x] Task 7: storefront — Replace mock data in ConsumerSellerDashboard with real API calls + empty states + error handling
- [x] Task 8: storefront — Implement trust tier badge with progress bar and defined thresholds
- [x] Task 9: storefront — Implement listings tab with real data, inline edit/pause/delete actions
- [x] Task 10: storefront — Implement sales tab with order history and payout status CTA
- [x] Task 11: storefront — Implement profile tab with seller settings integration
- [x] Task 12: storefront — Delete dead SellerDashboard.tsx, ensure mobile-responsive design, add quick action links
- [x] Task 13: Quality gate — Run lint + typecheck + build + test in all affected repos

## Dev Agent Record

### File List

**customer-backend/**
- `src/routes/sellers.ts` — MODIFIED: Added `GET /:seller_id/dashboard-summary` endpoint with tier progress calculation
- `src/tests/routes/sellers-dashboard.test.ts` — CREATED: 8 tests for dashboard-summary endpoint

**backend/apps/backend/src/api/store/consumer-seller/**
- `dashboard/route.ts` — CREATED: `GET` dashboard stats (listings, sales, revenue, activity)
- `listings/route.ts` — CREATED: `GET` paginated listings with status filter
- `listings/[id]/route.ts` — CREATED: `PUT` (status toggle) and `DELETE` with IDOR protection
- `orders/route.ts` — CREATED: `GET` seller order history with seller-scoped totals

**storefront/src/lib/**
- `data/seller-dashboard.ts` — CREATED: Server actions for commerce backend consumer-seller endpoints
- `api/customer-backend.ts` — MODIFIED: Added `getSellerDashboardSummary()` and `getSellerRating()`

**storefront/src/components/seller/**
- `ConsumerSellerDashboard.tsx` — REWRITTEN: Replaced all mock data with real API calls to both backends. Added tier progress bar, empty states, error handling, inline listing actions (pause/delete), order history with pagination, seller profile with real trust data
- `SellerDashboard.tsx` — DELETED: Dead code with non-existent endpoints
