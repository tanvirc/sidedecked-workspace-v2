# Story 5.3: Collection Management & Sync

## Goal
Allow players to track collections and sync with deck workflows.

## Context
Epic 5: Deck Building & Collections

## Dependencies
- story-05-01-deck-builder-workspace.md

## Acceptance Criteria
1. Store owned cards with quantity, condition, acquisition cost, and storage location.
2. Highlight owned, needed, or missing cards inside the deck builder via collection integration.
3. Support CSV import or export with validation and scheduled sync for premium features.

## Implementation Tasks
- Implement collection entities, APIs, and UI for recording owned cards with metadata.
- Wire deck builder to collection data to highlight owned versus missing cards.
- Build CSV import or export pipelines with validation and optional scheduled sync.

## Validation Plan
- Run integration tests confirming collection CRUD and deck builder highlighting.
- Upload sample CSV files to validate import handling and error messaging.

