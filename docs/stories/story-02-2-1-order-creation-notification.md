# Story 2.2.1: Order Creation & Notification

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: in_progress
**Domain**: Commerce (backend/)

## User Story

_As a customer, I want to receive immediate confirmation when my order is placed so that I know the transaction was successful._

## Acceptance Criteria

- (IMPLEMENTED) Immediate order confirmation email with complete order details
- (IMPLEMENTED) Order number generation with unique identifier format
- (IMPLEMENTED) Order status page accessible via link in confirmation email
- (NOT BUILT) SMS notifications for order updates (if enabled by customer)
- (IMPLEMENTED) Inventory immediately reserved upon successful payment
- (NOT BUILT) Automatic vendor notifications with fulfillment instructions
- (IMPLEMENTED) Order splitting when items come from multiple vendors
- (IMPLEMENTED) Payment processing confirmation and receipt generation
- (IN PROGRESS) Expected delivery date calculation and communication (PARTIAL)
- (NOT BUILT) Customer service contact information in all communications

## Implementation Notes

The order confirmation page is at `/checkout/confirmation`. The OrderSet system groups multi-vendor orders and the `retrieveOrderSet` function generates display_id for unique order numbers. Orders are viewable at `/user/orders/[id]`. MercurJS handles inventory reservation. Stripe integration powers payment processing and receipt generation.
