# Story 2.1: Canonical Card Schema & Storage

## Goal
Define and migrate the normalized card schema that supports all trading card games.

## Context
Epic 2: Catalog Platform

## Dependencies
- story-01-01-project-workspace-ci-bootstrap.md

## Acceptance Criteria
1. Create normalized entities for cards, prints, rulings, and game metadata with necessary indexes in sidedecked-db.
2. Support multi-language names, legalities, tags, and format metadata through JSONB fields.
3. Seed reference data via migrations and expose CRUD APIs limited to admin roles.

## Implementation Tasks
- Design TypeORM entities and migrations for card, print, ruling, and metadata tables with indexes.
- Implement JSONB structures and utility functions for localization, legalities, and tagging.
- Create admin-protected catalog management APIs with input validation and audit logging.

## Validation Plan
- Run schema migration tests and verify indexes exist via automated checks.
- Execute admin API tests validating create/update/delete flows and authorization guards.

