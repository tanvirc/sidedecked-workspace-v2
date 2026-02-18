# Story 2.5.1: Discover Individual Selling Opportunities

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: in_progress
**Domain**: Commerce (backend/)

## User Story

_As a collector, I want to easily discover selling opportunities so that I can monetize my excess cards and collection._

## Acceptance Criteria

- (IMPLEMENTED) "Sell" link prominently displayed in main navigation header
- (IMPLEMENTED) "Become a Seller" option in authenticated user dropdown menu
- (IMPLEMENTED) "Sell This Card" button on individual card detail pages
- (IN PROGRESS) Clear differentiation between individual and business selling options (PARTIAL)
- (IN PROGRESS) Authentication flow integration for non-logged users (PARTIAL)

## Implementation Notes

The "Sell" navigation item is in `ModernHeader.tsx` linking to `/sell`. The "Become a Seller" link is in `UserDropdown.tsx`. The SellThisCardButton component is on card detail pages. The seller upgrade flow at `/sell/upgrade` handles the transition but the differentiation between individual and business selling options in UI is only partially complete.
