# Story 5.3.1: Owned Card Tracking

**Epic**: [epic-05-deck-building.md](../epics/epic-05-deck-building.md)
**Status**: not_started
**Domain**: Customer Experience (customer-backend/)

## User Story

_As a collector, I want to see which cards I own so that I can build decks with my existing collection._

## Acceptance Criteria

- (NOT BUILT) Visual indicators on all cards showing ownership status (owned, missing, partial)
- (NOT BUILT) Quantity owned vs. quantity needed display for each card
- (NOT BUILT) Collection completion percentage for entire deck
- (NOT BUILT) Alternative card suggestions for missing cards with similar effects
- (NOT BUILT) Wishlist integration for cards needed to complete deck
- (NOT BUILT) Price calculation for missing cards with shopping cart integration
- (NOT BUILT) Collection value tracking showing total deck value and owned value
- (NOT BUILT) Trade suggestions for acquiring missing cards from other users
- (NOT BUILT) Inventory location tracking for physical card organization
- (NOT BUILT) Collection sync with external inventory management systems

## Implementation Notes

Collection ownership indicators would use color-coded borders: Green (owned sufficient), Yellow (partial), Red (missing). Quantity badges would show "3/4 owned" format. A deck completion percentage indicator would display overall buildability. The CollectionStatus component would integrate with the inventory system for real-time ownership data and with the shopping system for seamless purchasing of missing cards.
