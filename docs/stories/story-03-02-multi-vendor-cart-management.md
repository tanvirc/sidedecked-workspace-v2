# Story 3.2: Multi-Vendor Cart Management

## Goal
Support a single cart experience spanning multiple vendors with inventory safety.

## Context
Epic 3: Marketplace & Cart

## Dependencies
- story-03-01-marketplace-browsing-search.md

## Acceptance Criteria
1. Group cart items by vendor, track quantity and condition, and support guest plus authenticated users.
2. Validate inventory availability and lock quantities during cart updates to prevent oversells.
3. Persist cart state across sessions, enable save-for-later, and ensure mobile friendly interactions.

## Implementation Tasks
- Design cart domain models and APIs that group items by vendor with guest session support.
- Integrate inventory availability checks and reservation locks when users adjust cart quantities.
- Implement UI for persistent carts, save-for-later lists, and responsive interactions.

## Validation Plan
- Run API tests simulating concurrent cart updates to confirm locking prevents oversells.
- Execute responsive UI tests verifying persistence and save-for-later flows.

