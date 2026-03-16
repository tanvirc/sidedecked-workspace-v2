# GSD State

**Active Milestone:** M001: Platform Foundation
**Active Slice:** S01: Database Schemas & Core Entities
**Active Task:** T01 - Split Docker Compose into two isolated databases
**Phase:** execute
**Next Action:** Begin T01 - scaffold Docker Compose databases and run initial migrations
**Last Updated:** 2026-03-17
**Requirements Status:** 20 active - 0 validated - 4 deferred - 3 out of scope

## Recent Decisions

- D001 - Two isolated databases: mercur-db (Medusa/MercurJS) and sidedecked-db (TypeORM). No direct cross-DB foreign keys.
- D002 - CatalogSKU is the cross-system linking concept; backend stores catalog_sku on Medusa product variants.
- D003 - Redis pub/sub is the only cross-database event channel.

## Blockers

- (none)
