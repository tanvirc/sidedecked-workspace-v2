# Story 5.2: Format Validation Engine

## Goal
Validate decks against game and format specific rule sets.

## Context
Epic 5: Deck Building & Collections

## Dependencies
- story-05-01-deck-builder-workspace.md

## Acceptance Criteria
1. Enforce game and format rules with extensible definitions for each title.
2. Display real-time validation results with actionable messaging linked to offending cards.
3. Expose public validation API endpoints for third-party tools with rate limiting.

## Implementation Tasks
- Design validation rule engine supporting pluggable format definitions per game.
- Integrate validation feedback into deck builder UI with inline highlights and messaging.
- Publish validation APIs with documentation and rate limiting controls.

## Validation Plan
- Write unit tests for rule engine covering common and edge cases across games.
- Run API contract tests ensuring validation endpoints enforce limits and return actionable errors.

