# Story 4.2.1: Bulk CSV Import System

**Epic**: [epic-04-vendor-management.md](../epics/epic-04-vendor-management.md)
**Status**: in_progress
**Domain**: Both

## User Story

_As a vendor, I want to upload my entire inventory via CSV so that I can quickly list thousands of cards without manual data entry._

## Acceptance Criteria

- (IMPLEMENTED) CSV template download with all required and optional fields clearly defined
- (IMPLEMENTED) Support for common CSV formats from popular inventory management systems
- (IMPLEMENTED) Intelligent column mapping allowing flexible CSV structures
- (IMPLEMENTED) Card matching system that identifies cards from partial information (name, set, number)
- (IMPLEMENTED) Condition standardization mapping vendor terms to platform standards
- (IN PROGRESS) Price validation and market price warnings for significantly over/under-priced items
- (IMPLEMENTED) Image association system linking uploaded images to specific inventory items
- (IMPLEMENTED) Progress tracking during upload with real-time status updates
- (IMPLEMENTED) Error reporting with specific line numbers and correction suggestions
- (IMPLEMENTED) Partial import success allowing correction of errors without re-uploading entire file
- (NOT BUILT) Import history with ability to rollback recent imports
- (IMPLEMENTED) Preview mode showing how data will appear before final import

## Implementation Notes

The CSV import interface is located at `/vendor/import`. The import workflow is a step-by-step wizard: Upload → Map Columns → Preview → Import → Results. Components include CSVUploader (drag-and-drop), ColumnMapper (flexible field mapping), ImportPreview, ErrorReporter, and ImportProgress. The `importSellerProductsWorkflow` handles CSV processing with TCG catalog integration for card matching.
