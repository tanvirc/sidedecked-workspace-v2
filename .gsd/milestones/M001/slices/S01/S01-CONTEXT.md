---
id: S01
milestone: M001
status: ready
---

# S01: Database Schemas & Core Entities

## Goal

Both PostgreSQL databases (mercur-db and sidedecked-db) are running locally via Docker Compose with complete, validated schemas and seed data.

## Why This Slice

Every other slice in M001 and all future milestones depend on the databases being correctly structured. Schema mistakes discovered late are expensive. This slice retires that risk first.

## Scope

### In Scope
- Docker Compose configuration for both databases and Redis
- MedusaJS/MercurJS module registration and initial migrations (mercur-db)
- TypeORM entity definitions and migrations for all TCG domain entities (sidedecked-db)
- Seed data: games (MTG, Pokemon, Yu-Gi-Oh!, One Piece), formats
- Schema validation: foreign keys, indexes, constraints verified

### Out of Scope
- Auth provider configuration (S02)
- ETL card data ingest (S03)
- Application-level services and routes (S02+)

## Constraints

- No direct foreign keys between mercur-db and sidedecked-db - CatalogSKU string is the link
- TypeORM migrations must be reversible (down migrations required)
- MedusaJS migrations are managed by Medusa CLI - do not hand-edit

## Integration Points

### Consumes
- Docker Compose base config in `docker-compose.apps.yml`

### Produces
- `mercur-db` PostgreSQL instance with Medusa + MercurJS schema
- `sidedecked-db` PostgreSQL instance with 31 TypeORM entities
- Redis instance for pub/sub and Bull queues
- Seed data: games table, formats table

## Open Questions

- Should both databases be in the same Docker Compose file or separate?
- What is the naming convention for TypeORM migration timestamps?
