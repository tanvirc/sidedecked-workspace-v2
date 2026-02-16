# Story 2.5.4: Quick Card Listing from Collection

**Epic**: [epic-02-commerce-marketplace.md](../epics/epic-02-commerce-marketplace.md)
**Status**: not_started
**Domain**: Commerce (backend/)

## User Story

_As an individual seller, I want to quickly list specific cards I own so that I can sell them with minimal effort._

## Acceptance Criteria

- (NOT BUILT) "Sell This Card" button on every card detail page
- (NOT BUILT) One-click access to listing creation from card context
- (NOT BUILT) Auto-populated card information (name, set, game, rarity)
- (NOT BUILT) Condition selection with visual guide for accurate grading
- (NOT BUILT) Market price suggestions based on recent sales data
- (NOT BUILT) Simple photo upload with preview functionality
- (NOT BUILT) Quantity selector (limited to reasonable amounts for individuals)
- (NOT BUILT) Custom description field for additional details
- (NOT BUILT) Shipping preferences selection from seller profile defaults
- (NOT BUILT) Preview functionality showing how listing will appear to buyers
- (NOT BUILT) Save as draft option for incomplete listings
- (NOT BUILT) Immediate publication to marketplace upon completion
- (NOT BUILT) Mobile camera integration for condition photos
- (NOT BUILT) Authentication check with redirect to upgrade flow if needed
- (NOT BUILT) Integration with inventory system for immediate availability
- (NOT BUILT) Success confirmation with link to manage listing

## Implementation Notes

The quick listing interface would be at `/sell/list-card`. The QuickListingForm component would use the CardSearchSelector with TCG game filters and integrate with the catalog for auto-population. The ConditionGuide component would provide visual grading examples. The PriceSuggestion component would show real-time market data. Mobile camera integration would allow instant condition photo capture.
