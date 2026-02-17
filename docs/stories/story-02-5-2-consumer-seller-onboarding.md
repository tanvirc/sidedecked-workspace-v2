# Story 2.5.2: Consumer Seller Onboarding

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: in-progress
**Domain**: Commerce (backend/) + Customer Backend (customer-backend/) + Storefront (storefront/)

## User Story

_As a collector, I want a simple upgrade process to become an individual seller so that I can start selling my cards quickly._

## Acceptance Criteria

- (IMPLEMENTED) Simplified 5-step upgrade flow (profile → seller type → preferences → terms → activate)
- (IMPLEMENTED) Clear selection between "Individual Seller" vs "Business Seller" paths
- (IMPLEMENTED) Individual seller benefits clearly communicated (no fees, simple setup)
- (IMPLEMENTED) Terms and conditions specific to individual selling responsibilities
- (NOT BUILT) Email verification confirmation integrated into flow — seller is created with UNVERIFIED status; email notification on upgrade is deferred
- (IMPLEMENTED) Initial trust score assignment (60 points for new individual sellers)
- (IMPLEMENTED) Welcome message with immediate next steps after completion
- (IMPLEMENTED) Automatic redirect to consumer seller dashboard upon success
- (IMPLEMENTED) Mobile-optimized upgrade experience for phone users
- (IMPLEMENTED) Skip complex business verification requirements for individuals
- (IMPLEMENTED) Integration with existing customer account (no separate registration)
- (IMPLEMENTED) Progress indicator showing current step and completion status

## Implementation Notes

The simplified consumer seller onboarding is a separate, lighter flow from the full business seller onboarding at `/sell/upgrade`. It would feature a clean 3-step process: Choose Seller Type → Accept Terms → Complete Setup. Individual sellers would bypass complex business verification, requiring only email verification and basic terms acceptance. A trust score of 60 points would be assigned on completion.

## Tasks

- [x] customer-backend: `POST /api/customers/:id/upgrade-to-seller` — creates `SellerRating` with `trust_score=60`, `seller_tier=BRONZE`, `verification_status=UNVERIFIED`
- [x] customer-backend: `GET /api/customers/:id/seller-status` — returns seller status
- [x] customer-backend: Jest config (`jest.config.js`) + test suite (`src/tests/routes/customers.test.ts`) — 15 tests, all passing
- [x] backend: `POST /store/consumer-seller/upgrade` — registers customer as seller in MercurJS (mercur-db); individual sellers activated immediately without Stripe/identity verification upfront
- [x] storefront: `CustomerToSellerUpgrade.tsx` — 5-step wizard (Profile, Seller Type, Preferences, Terms, Activate); calls both customer-backend (critical) and backend (best-effort); proper error state replacing `alert()`; auto-redirect to `/sell` on success via `onUpgradeComplete`
- [x] storefront: `/sell/upgrade/page.tsx` — auth gate + `onUpgradeComplete` redirect handler
- [x] customer-backend: add `authenticateToken` + IDOR check to seller routes; fix `seller_since` field; fix `as any` casts (code review fixes)
- [x] storefront: fix avatar URL memory leak, check avatar upload response, use `router.push` for redirect (code review fixes)
- [x] backend: use container logger instead of `console.error`; type `createSellers` input (code review fixes)

## Dev Agent Record

### File List

**customer-backend/**
- `src/routes/customers.ts` — MODIFIED: added `authenticateToken` + IDOR check to seller-status and upgrade-to-seller routes; fixed `seller_since` to use `created_at`; removed `as any` casts
- `src/routes/index.ts` — MODIFIED: removed dead TODO comments
- `src/tests/routes/customers.test.ts` — MODIFIED: rewrote to use supertest against real router; added auth mock; added 403 IDOR tests
- `jest.config.js` — CREATED

**backend/**
- `apps/backend/src/api/store/consumer-seller/upgrade/route.ts` — CREATED: POST /store/consumer-seller/upgrade endpoint

**storefront/**
- `src/components/seller/CustomerToSellerUpgrade.tsx` — CREATED: 5-step seller upgrade wizard
- `src/app/[locale]/(main)/sell/upgrade/page.tsx` — CREATED: page wrapper with auth gate
