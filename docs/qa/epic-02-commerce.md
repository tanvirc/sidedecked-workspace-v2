# QA Gate – Epic 02 Commerce & Marketplace

- **Gate Status**: Pending
- **QA Owner**: Quinn (Test Architect)

## Entry Criteria
- Story 02.1 (cart management) merged with regression coverage.
- Checkout API contract documented with mock tests ready.
- Payment orchestration mock available for integration testing.

## Exit Criteria
- End-to-end cart → checkout → order confirmation Playwright suite.
- Load test demonstrating cart API stability under 500 concurrent users.
- Reviews subsystem smoke test verifying moderation hooks.

## Coverage Strategy
- Unit: cart reducers, order services, pricing breakdown calculations.
- Integration: multi-vendor checkout flow using Stripe test mode.
- E2E: Add/remove items, adjust quantities, complete checkout, verify order history.

## Outstanding Risks
- Saved-for-later integration depends on wishlist service readiness.
- Stripe webhook reliability requires dedicated monitoring before production.

## Artifacts & Evidence
- Performance test scripts in `backend/tests/perf/commerce` (to be added).
- Checkout API contract fixtures stored in `storefront/contracts/checkout`.
