---
stepsCompleted:
  - step-01-init
  - step-02-vision
  - step-03-users
  - step-04-metrics
  - step-05-scope
  - step-06-complete
inputDocuments:
  - docs/specifications/03-tcg-catalog-card-database-system.md
date: 2026-02-16
author: CodexSandboxOffline
---
# Product Brief: TCG Catalog & Card Database System

## Routed Context

- Bounded context: Universal TCG catalog and ETL pipelines
- Primary owner repo: customer-backend
- Participating repos: customer-backend, storefront, backend
- API boundary constraints:
  - Catalog ingestion, search metadata, and card normalization live in customer-backend APIs
  - Commerce systems consume canonical catalog data through API contracts
  - Storefront reads card/search data through customer-backend APIs
- Data boundary constraints:
  - Card, print, set, and ETL state remains in sidedecked-db
  - Commerce repositories store only references needed for listings
  - No direct mercur-db access from customer-backend services

## Product Vision Summary

The TCG Catalog & Card Database System maintains a comprehensive, standardized database of trading cards across all supported games (Magic: The Gathering, Pokémon, Yu-Gi-Oh!, One Piece). It provides automated ETL pipelines for data import, universal card identification, image management, and serves as the authoritative source of card information for all platform features. This system enables consistent product identification, accurate search functionality, and reliable deck building across multiple trading card games.

## Scope Notes

- This specification is the source-of-truth PRD for the bounded context above.
- Functional requirements are represented by epic/story decomposition and acceptance criteria in Step 7.
- Non-functional requirements are captured in Technical, Security, Performance, and Testing sections below.
- Acceptance criteria statuses must remain machine-parseable for scripts/check-acceptance-criteria.js.

