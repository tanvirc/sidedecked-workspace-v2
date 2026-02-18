# Story 2.1.1: Shopping Cart Management

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: completed
**Domain**: Commerce (backend/)

## User Story

_As a customer, I want to add items to a shopping cart and manage my intended purchases so that I can buy multiple items efficiently._

## Acceptance Criteria

- (IMPLEMENTED) One-click "Add to Cart" on all product listings
- (IMPLEMENTED) Cart persists across browser sessions and devices
- (IMPLEMENTED) Cart displays item details: image, name, condition, price, vendor, shipping
- (IMPLEMENTED) Quantity adjustment with real-time inventory checking
- (IMPLEMENTED) Remove items with confirmation for expensive items
- (IN PROGRESS) Save for later functionality to move items out of active cart (PARTIAL)
- (IMPLEMENTED) Cart total calculation including items, shipping, taxes, fees
- (IMPLEMENTED) Multi-vendor cart organization grouping items by seller
- (IMPLEMENTED) Mobile-optimized cart interface with swipe actions

## Implementation Notes

The cart page is at `/cart`. The ShoppingCartDrawer slides in from the right showing added items. EnhancedCartItems component at `storefront/src/components/sections/Cart/EnhancedCartItems.tsx` handles multi-vendor organization. UpdateCartItemButton and DeleteCartItemButton handle quantity and removal. CartSummary is in `storefront/src/components/organisms/CartSummary/`. Cart items display 80x80px thumbnails with card name, set, condition badge, and vendor grouping.
