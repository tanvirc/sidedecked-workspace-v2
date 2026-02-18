# Story 9.1.2: Condition & Variation Management

**Epic**: [epic-09-inventory-management.md](../epics/epic-09-inventory-management.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As a card seller, I want detailed condition and variation tracking so that I can accurately represent my inventory and maximize sales._

## Acceptance Criteria

- (IMPLEMENTED) Comprehensive condition tracking (Mint, Near Mint, Lightly Played, Moderately Played, Heavily Played, Damaged)
- (IMPLEMENTED) Foil and non-foil inventory separation with accurate quantity tracking
- (IMPLEMENTED) Multiple printing/set variation management for the same card
- (IMPLEMENTED) Language variant support for international card inventory
- (IN PROGRESS) Graded card inventory with grading service and grade level tracking (PARTIAL)
- (NOT BUILT) Misprint and error card classification with rarity and value assessment
- (IN PROGRESS) Photo documentation for high-value and unique condition items (PARTIAL)
- (NOT BUILT) Condition assessment tools with visual guides and community standards
- (IMPLEMENTED) Automated condition-based pricing adjustments and market value tracking

## Implementation Notes

The condition tracking system uses the standard TCG condition scale. Foil and non-foil inventory are tracked separately with independent pricing. Multiple printings of the same card (different sets, alternate arts) are managed as distinct inventory items. Language variant tracking supports international card inventory for Japanese, German, French, and other language versions. Graded card tracking exists partially with full PSA/BGS grade level tracking in progress.
