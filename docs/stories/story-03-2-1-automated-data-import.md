# Story 3.2.1: Automated Data Import

**Epic**: [epic-03-tcg-catalog.md](../epics/epic-03-tcg-catalog.md)
**Status**: in_progress
**Domain**: Customer Experience (customer-backend/)

## User Story

_As a system administrator, I want to automatically import card data from multiple sources so that the catalog stays current without manual intervention._

## Acceptance Criteria

- (IMPLEMENTED) Automated daily imports from official sources (Wizards, Nintendo, Konami, Bandai)
- (IMPLEMENTED) Integration with community databases (MTGJson, Scryfall, PokeAPI, YGOPRODECK)
- (IMPLEMENTED) Configurable import schedules for different data sources
- (IMPLEMENTED) Import validation with error reporting and manual review queues
- (IMPLEMENTED) Incremental updates to avoid full database rebuilds
- (IMPLEMENTED) Rollback capability for problematic imports
- (IMPLEMENTED) Import performance metrics and monitoring
- (IN PROGRESS) Data source health checking and automatic failover (PARTIAL)
- (IMPLEMENTED) Custom data source integration for specialized catalogs

## Implementation Notes

The ETL system uses `master-etl.ts` and supports multiple game imports with configurable schedules. Community databases including MTGJson, Scryfall, PokeAPI, and YGOPRODECK are integrated. Import validation uses error reporting with manual review queues. The incremental update system avoids full rebuilds. Rollback functionality with impact analysis is implemented. Data source health checking exists but automatic failover needs verification.
