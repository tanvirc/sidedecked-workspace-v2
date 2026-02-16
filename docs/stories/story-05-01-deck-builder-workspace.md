# Story 5.1: Deck Builder Workspace

## Goal
Create an interactive deck builder that supports rapid composition.

## Context
Epic 5: Deck Building & Collections

## Dependencies
- story-02-01-canonical-card-schema.md

## Acceptance Criteria
1. Support drag-and-drop from search results, card previews, and sorting by deck roles.
2. Auto-save deck state with version history and undo or redo support.
3. Enable exports to shareable URLs, text lists, and MTG Arena or similar formats.

## Implementation Tasks
- Implement deck builder UI with drag-and-drop, grouping, and responsive layout.
- Persist deck versions with change history and undo or redo operations.
- Provide export utilities for URLs, text formats, and game-specific payloads.

## Validation Plan
- Run UI tests confirming drag-and-drop, auto-save, and undo flows.
- Verify export outputs match expected formats via snapshot tests.

