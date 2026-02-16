# Story 2.2: Automated Scryfall Import Pipeline

## Goal
Automate ingestion of external card data with robust monitoring.

## Context
Epic 2: Catalog Platform

## Dependencies
- story-02-01-canonical-card-schema.md

## Acceptance Criteria
1. Schedule workflows to retrieve bulk card data, incremental updates, and rulings from Scryfall and related sources.
2. Deduplicate and map incoming data into the canonical schema while logging anomalies for review.
3. Emit metrics and alerts with retry semantics for transient failures during import runs.

## Implementation Tasks
- Implement ingestion workers that fetch bulk and incremental Scryfall datasets and stage them safely.
- Build transformation layer that normalizes incoming records, handles deduplication, and records anomalies.
- Publish metrics and alerts through Datadog while adding retry/backoff for transient API issues.

## Validation Plan
- Run end-to-end import against staged dataset to confirm schema population and anomaly logging.
- Verify metrics and alerts fire under simulated failure scenarios.

