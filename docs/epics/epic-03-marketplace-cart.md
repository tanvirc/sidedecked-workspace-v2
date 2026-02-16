# Epic 3: Marketplace & Cart

## Objective
Enable customers to discover products, manage a single cart across vendors, and complete purchases confidently.

## Outcome
- High-performance search and browse experience spanning cards, vendors, and pricing context.
- Persistent multi-vendor cart with inventory validation and save-for-later support.
- Guided checkout flow producing aggregate orders and vendor sub-orders with notifications.

## Stories

### Story 3.1: Marketplace Browsing & Search
As a customer, I want powerful search tools so that I can quickly find the cards I need.

**Acceptance Criteria**
1. Storefront lists products with filters for game, set, condition, price range, vendor rating, and availability.
2. Search service indexes catalog and vendor inventory, returning results within 200ms and supporting typo tolerance.
3. Product detail pages display vendor offers, shipping estimates, and add-to-cart actions with analytics instrumentation.

### Story 3.2: Multi-Vendor Cart Management
As a shopper, I want a single cart across vendors so that checkout stays frictionless.

**Acceptance Criteria**
1. Cart API groups items by vendor, tracks quantity/condition, and supports guest + authenticated users.
2. Cart updates validate inventory availability and lock quantities to prevent oversells.
3. UI persists cart state, supports save-for-later, and provides mobile-friendly interactions.

### Story 3.3: Checkout Flow & Order Creation
As a customer, I want a guided checkout so that I can confirm shipping, payment, and review before purchase.

**Acceptance Criteria**
1. Checkout wizard collects shipping address, shipping method per vendor, and payment method with validation.
2. Taxes, fees, and shipping costs calculate per vendor and jurisdiction with clear review step breakdown.
3. Successful checkout creates aggregate orders plus vendor sub-orders, sends confirmations, and redirects to order details page.
