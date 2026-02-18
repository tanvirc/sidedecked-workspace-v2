# Story 2.5.6: Individual Seller Payment & Payout

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: not_started
**Domain**: Commerce (backend/)

## User Story

_As an individual seller, I want simple payment processing and payouts so that I can receive money from sales without complexity._

## Acceptance Criteria

- (NOT BUILT) Stripe Connect Standard account setup for individuals
- (NOT BUILT) Personal bank account linking with verification
- (NOT BUILT) Weekly payout schedule (configurable to daily for qualified sellers)
- (NOT BUILT) Clear fee structure display: platform percentage, payment processing fees
- (NOT BUILT) Automatic tax document generation (1099-K when applicable)
- (NOT BUILT) Payout history with detailed transaction breakdown
- (NOT BUILT) Reserve policy explanation for new individual sellers
- (NOT BUILT) Instant payout option for qualified sellers (small fee)
- (NOT BUILT) Currency support for international individual sellers
- (NOT BUILT) Mobile-friendly financial dashboard
- (NOT BUILT) Integration with order fulfillment (payout on delivery confirmation)
- (NOT BUILT) Clear communication of hold periods for new sellers
- (NOT BUILT) Support for personal PayPal accounts as backup payout method
- (NOT BUILT) Financial performance tracking suitable for individuals
- (NOT BUILT) Simple dispute resolution affecting payouts

## Implementation Notes

Payout management would be at `/sell/payouts` with financial overview at `/sell/financial`. Stripe Connect Standard provides the payment infrastructure. The PayoutDashboard shows available balance, pending, and lifetime earnings. The BankAccountSetup component integrates Stripe Connect onboarding. The 1099-K threshold is $600+ in earnings. Interactive fee calculator shows net earnings before listing.
