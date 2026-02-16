# Story 3.1.3: Card Identification & SKU System

**Epic**: [epic-03-tcg-catalog.md](../epics/epic-03-tcg-catalog.md)
**Status**: in_progress
**Domain**: Customer Experience (customer-backend/)

## User Story

_As a vendor, I want to accurately identify any card so that my listings are correctly categorized and searchable._

## Acceptance Criteria

- (IMPLEMENTED) Universal SKU format: [GAME]-[SET_CODE]-[CARD_NUMBER]-[LANGUAGE]-[TREATMENT]
- (IMPLEMENTED) Example: MTG-NEO-123-EN-FOIL, PKM-BST-001-JP-HOLO, YGO-LOB-001-EN-1ST
- (NOT BUILT) Barcode integration for physical card identification where available
- (NOT BUILT) Visual identification system using machine learning for image-based card recognition
- (IMPLEMENTED) Fuzzy matching for partial or misspelled card names
- (IMPLEMENTED) Duplicate detection and consolidation across data sources
- (IMPLEMENTED) Variant tracking (alternate artwork, special frames, promotional versions)
- (IN PROGRESS) Print run information and scarcity indicators (PARTIAL)
- (IMPLEMENTED) Cross-reference system for reprints across multiple sets
- (IMPLEMENTED) API endpoint for third-party applications to verify card identity

## Implementation Notes

The universal SKU system is implemented with the standardized format. Fuzzy matching handles misspellings and partial names in card search. Variant tracking uses the Print entity for alternate artworks, special frames, and promotional versions. The cross-reference system links reprints across multiple sets via card relationships. A public API endpoint supports third-party card identity verification. Barcode scanning and visual recognition are not yet implemented.
