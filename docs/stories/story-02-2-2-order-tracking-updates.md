# Story 2.2.2: Order Tracking & Updates

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: in_progress
**Domain**: Commerce (backend/)

## User Story

_As a customer, I want to track my order status and receive updates so that I know when to expect delivery._

## Acceptance Criteria

- (IN PROGRESS) Real-time order tracking page with status timeline (PARTIAL)
- (NOT BUILT) Integration with carrier tracking systems for live updates
- (NOT BUILT) Automatic status update emails (shipped, in transit, delivered)
- (NOT BUILT) Expected delivery date updates based on actual shipping progress
- (NOT BUILT) Delivery confirmation with photo proof when available
- (NOT BUILT) Exception handling for delivery issues (delays, failed delivery)
- (IMPLEMENTED) Easy access to tracking from order history and email confirmations

## Implementation Notes

The order tracking page exists at `/user/orders/[id]` with basic status display. The ParcelAccordion component links to order details from order history. Full carrier tracking integration, automatic status emails, and exception handling are not yet implemented. The OrderTimeline component with visual milestones (Confirmed → Processing → Shipped → In Transit → Delivered) is specified but tracking integration is not confirmed.
