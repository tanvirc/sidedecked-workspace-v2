# Story 7.1: Market Data Aggregation

## Goal
Aggregate external pricing data into a unified model.

## Context
Epic 7: Pricing Intelligence

## Dependencies
- story-02-02-scryfall-import-pipeline.md

## Acceptance Criteria
1. Ingest pricing feeds from marketplaces, vendor imports, and historical datasets on a schedule.
2. Normalize card identities, currencies, and conditions into a unified model.
3. Store historical price series with retention policies and expose via API.

## Implementation Tasks
- Implement scheduled ingestion pipelines for each pricing source with resilient connectors.
- Create normalization utilities mapping external identifiers to internal card references.
- Persist historical price snapshots with retention policies and API accessors.

## Validation Plan
- Run ingestion dry runs validating normalization accuracy and duplicate handling.
- Query historical API endpoints to confirm retention and data availability.

