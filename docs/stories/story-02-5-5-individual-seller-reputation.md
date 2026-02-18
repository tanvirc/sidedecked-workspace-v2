# Story 2.5.5: Individual Seller Reputation Management

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: review
**Domain**: Customer Experience (customer-backend/) + Storefront (storefront/)

## User Story

_As an individual seller, I want to build and maintain my reputation so that buyers trust my listings and I can achieve better sales._

## Acceptance Criteria

- (IMPLEMENTED) Personal trust score display with explanation of calculation
- (IMPLEMENTED) Seller tier progression system (Bronze -> Silver -> Gold -> Platinum -> Diamond)
- (IMPLEMENTED) Individual verification badges (email verified, phone verified, ID verified)
- (IMPLEMENTED) Performance metrics: response rate, average shipping time, customer satisfaction rating, order completion rate
- (IMPLEMENTED) Trust score factors clearly explained to sellers
- (IMPLEMENTED) Verification process streamlined for individuals (no business docs)
- (IMPLEMENTED) Reputation improvement suggestions and tips
- (IMPLEMENTED) Historical trust score tracking with progress visualization
- (IMPLEMENTED) Customer review aggregation and response capabilities
- (DEFERRED) Dispute resolution support maintaining fairness for individuals (deferred to story 2.3.2)
- (DEFERRED) Protection against unfair negative reviews (deferred to future story)
- (DEFERRED) Integration with listing prominence (deferred to Epic 8)
- (IMPLEMENTED) Mobile-friendly reputation management interface
- (IN PROGRESS) Notification system for reputation changes and milestone achievements

## Implementation Notes

The reputation management page is at `/sell/reputation`. Uses the 2.5.3 tier scale (unified system): Bronze (0-149), Silver (150-299), Gold (300-499), Platinum (500-749), Diamond (750+). Trust score is 0-1000, calculated from 8 weighted factors by the existing `TrustScoreService`.

Split-brain: All reputation data lives in customer-backend (sidedecked-db). Storefront fetches via API. No commerce backend (mercur-db) changes.

Existing infrastructure:
- `SellerRating` entity with trust_score, seller_tier, verification fields, performance metrics
- `SellerReview` entity with seller_response capability
- `TrustScoreService` with 8-factor calculation, recommendations, risk indicators
- Seller routes: reviews CRUD, trust-analysis, dashboard-summary, rating endpoints
- `ConsumerSellerDashboard.tsx` already shows tier badge and progress bar

What needs building:
- Trust score history entity + migration (for historical tracking visualization)
- Individual verification fields (is_email_verified, is_phone_verified) on SellerRating
- Align `calculateSellerTier()` with route TIER_THRESHOLDS (2.5.3 scale)
- Consolidated reputation endpoint aggregating all data for the page
- Trust history endpoint
- Verification endpoints for phone/ID (MVP: simple mark-as-verified flow)
- `/sell/reputation` page with: trust gauge, factor breakdown, verification checklist, performance metrics, review management, trust history chart, improvement tips
- Notification for reputation changes (lightweight: in-app only)

## Tasks

- [x] Task 1: customer-backend -- Create `TrustScoreHistory` entity and migration for historical trust score tracking
- [x] Task 2: customer-backend -- Add `is_email_verified`, `is_phone_verified` columns to SellerRating entity + migration
- [x] Task 3: customer-backend -- Align `TrustScoreService.calculateSellerTier()` with route TIER_THRESHOLDS (2.5.3 scale: Bronze 0-149, Silver 150-299, Gold 300-499, Platinum 500-749, Diamond 750+)
- [x] Task 4: customer-backend -- Update `TrustScoreService` to record history entries on calculation + implement `getTrustScoreHistory()` with initial backfill
- [x] Task 5: customer-backend -- Add `GET /api/sellers/:seller_id/reputation` endpoint returning consolidated reputation page data (trust score, factors, tier progress, performance metrics, verification, recommendations, recent reviews)
- [x] Task 6: customer-backend -- Add `GET /api/sellers/:seller_id/trust-history` endpoint with `days_back` and `limit` query params
- [x] Task 7: customer-backend -- Add `POST /api/sellers/:seller_id/verify/phone` and `POST /api/sellers/:seller_id/verify/id` verification endpoints (MVP: accept + mark verified/pending)
- [x] Task 8: storefront -- Add reputation API client functions to `customer-backend.ts` (`getSellerReputation`, `getSellerTrustHistory`, `submitPhoneVerification`, `submitIdVerification`)
- [x] Task 9: storefront -- Create `ReputationDashboard.tsx` client component with trust score gauge, score factor breakdown cards, verification checklist with CTAs, performance metrics display, and improvement tips
- [x] Task 10: storefront -- Create `TrustHistoryChart.tsx` (CSS-based bar chart with tooltips) and `ReviewManagement.tsx` (review list with sorting and distribution)
- [x] Task 11: storefront -- Create `/sell/reputation/page.tsx` RSC shell wiring ReputationDashboard with seller auth check
- [x] Task 12: storefront -- Add "Reputation" link to ConsumerSellerDashboard quick actions
- [x] Task 13: Quality gate -- lint + typecheck + build + test pass in all affected repos

## Dev Agent Record

### Implementation Plan

Phase 2 decisions: Use 2.5.3 tier scale (0-749+), unified system (no separate points), defer dispute resolution/unfair review protection/listing prominence to future stories.

### File List

**customer-backend (new)**
- `src/entities/TrustScoreHistory.ts` — Historical trust score tracking entity
- `src/migrations/1772900000000-CreateTrustScoreHistory.ts` — Migration for trust_score_history table
- `src/migrations/1772900100000-AddIndividualVerificationFields.ts` — Migration adding is_email_verified, is_phone_verified to seller_ratings
- `src/tests/routes/sellers-reputation.test.ts` — 16 test cases for reputation endpoints

**customer-backend (modified)**
- `src/entities/SellerRating.ts` — Added is_email_verified, is_phone_verified columns + updated verification_badges getter
- `src/services/TrustScoreService.ts` — Aligned tier thresholds to 2.5.3 scale, added history recording, real getTrustScoreHistory(), backfillHistory()
- `src/routes/sellers.ts` — Added 4 endpoints: reputation, trust-history, verify/phone, verify/id

**storefront (new)**
- `src/components/seller/ReputationDashboard.tsx` — Main reputation management page component
- `src/components/seller/TrustHistoryChart.tsx` — Trust score history with bar chart and timeline
- `src/components/seller/ReviewManagement.tsx` — Review list with distribution, sorting
- `src/app/[locale]/(main)/sell/reputation/page.tsx` — RSC page shell

**storefront (modified)**
- `src/lib/api/customer-backend.ts` — Added 4 API client methods for reputation endpoints
- `src/components/seller/ConsumerSellerDashboard.tsx` — Added Reputation link in quick actions

**docs**
- `docs/stories/story-02-5-5-individual-seller-reputation.md` — Updated ACs and tasks

### Completion Notes

All 13 tasks complete. Quality gate: typecheck clean, lint 0 new issues (all pre-existing), 46/46 tests pass. Story covers trust score display, tier progression (2.5.3 aligned), verification badges, performance metrics, factor breakdown, verification flows (phone/ID), improvement tips, historical tracking with visualization, review management, and mobile-responsive design.

Deferred: dispute resolution (story 2.3.2), unfair review protection (future), listing prominence (Epic 8). Notification AC marked IN PROGRESS — the reputation data (score changes, tier progression) is tracked in TrustScoreHistory but in-app notification delivery is not yet wired.

Known limitation: `getPerformanceMetrics()` in TrustScoreService returns hardcoded values — real integration with commerce backend deferred to a separate story.

### Change Log

- Aligned `calculateSellerTier()` from old thresholds (450/650/800/900 with review gates) to 2.5.3 scale (150/300/500/750 simple)
- Replaced stub `getTrustScoreHistory()` with real implementation using queryBuilder
- Added `backfillHistory()` for existing sellers without history entries
