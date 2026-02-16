# Story 3.3.2: Custom Image Upload

**Epic**: [epic-03-tcg-catalog.md](../epics/epic-03-tcg-catalog.md)
**Status**: in_progress
**Domain**: Customer Experience (customer-backend/)

## User Story

_As a vendor, I want to upload custom card condition photos so that customers can see the actual card they're purchasing._

## Acceptance Criteria

- (IMPLEMENTED) High-resolution image upload (up to 10MB per image, JPEG/PNG/WEBP)
- (IMPLEMENTED) Multiple images per card listing (front, back, close-ups of wear/damage)
- (NOT BUILT) Image annotation tools for highlighting specific features or issues
- (IMPLEMENTED) Automatic image rotation and orientation correction
- (NOT BUILT) Image moderation system to prevent inappropriate content
- (IMPLEMENTED) Compression and optimization pipeline for uploaded images
- (NOT BUILT) Image comparison tools showing listing photos vs. catalog images
- (IN PROGRESS) Bulk image upload for vendors with large inventories (PARTIAL)
- (NOT BUILT) Image editing tools (crop, brightness/contrast, color correction)
- (IMPLEMENTED) Mobile-optimized image capture and upload from phone cameras

## Implementation Notes

Vendor image upload supports up to 10MB per image in JPEG, PNG, and WEBP formats. Multiple images per listing are supported. Automatic orientation correction and compression are applied on upload. Mobile camera integration allows direct capture. Bulk image upload exists partially through the CSV import workflow but needs verification for standalone bulk use. Annotation, moderation, and comparison tools are not yet implemented.
