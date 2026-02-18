# Story 4.5.2: Manage Existing Listings

**Epic**: [epic-04-vendor-management.md](../epics/epic-04-vendor-management.md)
**Status**: not_started
**Domain**: Both

## User Story

_As a vendor, I want to edit, pause, or delete my product listings so that I can manage my inventory effectively._

## Acceptance Criteria

- (NOT BUILT) Vendors can view all listings in organized dashboard with filtering/sorting
- (NOT BUILT) Edit functionality for all listing attributes (price, quantity, condition, description)
- (NOT BUILT) Bulk edit capabilities for multiple listings simultaneously
- (NOT BUILT) Pause/unpause listings to temporarily remove from marketplace
- (NOT BUILT) Delete listings with confirmation dialog and impact warning
- (NOT BUILT) View listing performance metrics (views, saves, inquiries)
- (NOT BUILT) Listing status indicators (active, paused, out of stock, sold)
- (NOT BUILT) Change history tracking for price and inventory updates
- (NOT BUILT) Quick actions for common tasks (repricing, inventory updates)

## Implementation Notes

The listing management dashboard would be located at `/vendor/listings`. The ListingGrid component would provide sortable columns (Name, Price, Quantity, Status, Views, Last Updated) with inline editing and auto-save. Status indicators would use color coding: Active (green), Paused (yellow), Sold (gray). Bulk operations would support multi-select with keyboard shortcuts and a batch editor modal with preview of changes before confirmation.
