---
stepsCompleted:
  - step-01-init
  - step-02-vision
  - step-03-users
  - step-04-metrics
  - step-05-scope
  - step-06-complete
inputDocuments:
  - docs/specifications/05-deck-building-system.md
date: 2026-02-16
author: CodexSandboxOffline
---
# Product Brief: Deck Building System

## Routed Context

- Bounded context: Deck construction, validation, and sharing
- Primary owner repo: customer-backend
- Participating repos: customer-backend, storefront, backend
- API boundary constraints:
  - Deck CRUD, validation, and collaboration APIs remain in customer-backend
  - Storefront deck builder consumes deck APIs only
  - Commerce listing generation from decks uses explicit backend-to-customer-backend API contracts
- Data boundary constraints:
  - Deck entities and social metadata remain in sidedecked-db
  - Commerce order/listing state remains in mercur-db
  - No direct deck-table reads from commerce services

## Product Vision Summary

The Deck Building System enables users to create, manage, and share card decks for all supported TCG games with format-specific validation, social sharing, and collection integration. It provides an intuitive drag-and-drop interface, comprehensive deck analysis tools, and seamless integration with the user's card collection and marketplace. The system supports both casual deck building and serious tournament preparation while fostering community interaction through deck sharing and collaboration features.

## Scope Notes

- This specification is the source-of-truth PRD for the bounded context above.
- Functional requirements are represented by epic/story decomposition and acceptance criteria in Step 7.
- Non-functional requirements are captured in Technical, Security, Performance, and Testing sections below.
- Acceptance criteria statuses must remain machine-parseable for scripts/check-acceptance-criteria.js.

