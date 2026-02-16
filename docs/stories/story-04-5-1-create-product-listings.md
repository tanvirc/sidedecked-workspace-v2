# Story 4.5.1: Create Product Listings

**Epic**: [epic-04-vendor-management.md](../epics/epic-04-vendor-management.md)
**Status**: not_started
**Domain**: Both

## User Story

_As a vendor, I want to create detailed product listings for my cards so that customers can find and purchase them._

## Acceptance Criteria

- (NOT BUILT) Vendors can access "Create Listing" from their dashboard
- (NOT BUILT) Listing form includes: card selection from catalog, condition grade, price, quantity, description
- (NOT BUILT) Image upload supports multiple photos (max 10 images, 5MB each, JPG/PNG/WEBP)
- (NOT BUILT) Automatic card information population from TCG catalog (name, set, rarity, etc.)
- (NOT BUILT) Real-time validation of required fields and business rules
- (NOT BUILT) Preview functionality showing how listing will appear to customers
- (NOT BUILT) Save as draft functionality for incomplete listings
- (NOT BUILT) Bulk listing creation for multiple copies of same card
- (NOT BUILT) Listing immediately appears in search results upon publication
- (NOT BUILT) Automatic SKU generation linking to catalog entries

## Implementation Notes

The listing creation interface would be located at `/vendor/listings/create`. The step-by-step guided workflow covers Card Selection → Details → Images → Preview → Publish. Components include CardSelector (catalog integration), ListingForm, ImageUpload (multi-photo support), PreviewPane (customer view), and BulkCreation. The card selection interface integrates with the universal TCG catalog and supports auto-population of card details.
