# Story 2.1.2: Multi-Vendor Checkout Process

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: in_progress
**Domain**: Commerce (backend/)

## User Story

_As a customer, I want to purchase items from multiple vendors in a single transaction so that I can get all my needed cards efficiently._

## Acceptance Criteria

- (IMPLEMENTED) Unified checkout flow for multi-vendor purchases
- (IMPLEMENTED) Clear breakdown of costs per vendor (items, shipping, taxes)
- (IMPLEMENTED) Combined shipping calculation when vendors can ship together
- (IMPLEMENTED) Single payment processing for entire order
- (IMPLEMENTED) Shipping address validation and multiple address support
- (IMPLEMENTED) Payment method selection (credit card, PayPal, Apple Pay, Google Pay)
- (IMPLEMENTED) Order review page with itemized breakdown before payment
- (IN PROGRESS) Guest checkout option for users without accounts (PARTIAL)
- (IN PROGRESS) Express checkout for returning customers with saved information (PARTIAL)
- (IMPLEMENTED) Order confirmation with tracking numbers and vendor contact info

## Implementation Notes

The checkout page is at `storefront/src/app/[locale]/(checkout)/checkout/page.tsx`. CartReview provides vendor breakdown at `storefront/src/components/sections/CartReview/`. CartAddressSection handles shipping address and CartPaymentSection handles payment methods. The 3-step checkout flow covers: Shipping Address → Payment Method → Review Order.
