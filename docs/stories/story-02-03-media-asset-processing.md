# Story 2.3: Media Asset Processing

## Goal
Deliver responsive card imagery via a resilient media pipeline.

## Context
Epic 2: Catalog Platform

## Dependencies
- story-02-01-canonical-card-schema.md

## Acceptance Criteria
1. Download art assets, crop variants, generate responsive sizes, and store them in Cloudflare R2 or S3.
2. Persist CDN URLs and cache-control metadata alongside catalog records for storefront consumption.
3. Provide graceful fallbacks when assets are missing or flagged as restricted.

## Implementation Tasks
- Implement media worker that downloads, processes, and uploads images with size variants.
- Augment catalog records with CDN metadata and configure cache headers for optimal delivery.
- Introduce placeholder logic and moderation flags for missing or restricted imagery.

## Validation Plan
- Process representative batch of images and verify CDN URLs load with proper caching headers.
- Run storefront visual tests ensuring placeholders display for restricted content.

