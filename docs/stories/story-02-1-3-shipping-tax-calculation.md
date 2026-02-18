# Story 2.1.3: Shipping & Tax Calculation

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: in_progress
**Domain**: Commerce (backend/)

## User Story

_As a customer, I want to see accurate shipping costs and taxes during checkout so that I know the total cost before purchasing._

## Acceptance Criteria

- (IMPLEMENTED) Real-time shipping calculation based on customer location and vendor settings
- (IN PROGRESS) Integration with shipping carriers for accurate rates (AusPost, USPS, UPS, FedEx) (PARTIAL)
- (IMPLEMENTED) Shipping options per vendor (standard, expedited, overnight)
- (IMPLEMENTED) Combined shipping discounts when multiple items ship from same vendor
- (IN PROGRESS) International shipping support with customs declaration (PARTIAL)
- (IMPLEMENTED) Tax calculation based on customer location and vendor nexus rules
- (IN PROGRESS) Tax-exempt status support for qualified buyers (PARTIAL)
- (IN PROGRESS) Free shipping threshold configuration per vendor (PARTIAL)
- (IN PROGRESS) Shipping insurance options for high-value orders (PARTIAL)

## Implementation Notes

CartShippingMethodsSection is at `storefront/src/components/sections/CartShippingMethodsSection/` and provides multiple shipping options per vendor. The enhanced cart shows combined shipping notifications when applicable. Tax calculations are integrated into the cart totals component. Shipping cost display includes delivery timeframes per vendor.
