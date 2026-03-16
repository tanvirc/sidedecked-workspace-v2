---
story_key: s01
title: Database Schemas & Core Entities
status: planned
requirement_ids: [R001]
affected_repos: [backend, customer-backend]
story_type: infra
ui_story: false
split_brain_risk: false
needs_deploy: pending
party_gates:
  readiness: passed
  design_plan: skipped
approvals:
  selected: true
  plan_frozen: true
  external_actions: false
review:
  spec_pass: pending
  quality_pass: pending
links:
  context: S01-CONTEXT.md
  research: S01-RESEARCH.md
  wireframe: S01-WIREFRAME.html
  wireframe_v2: S01-WIREFRAME-V2.html
  plan: S01-PLAN.md
  uat: S01-UAT.md
  summary: S01-SUMMARY.md
---

## Story

Both PostgreSQL databases (`mercur-db` for MedusaJS/MercurJS commerce and `sidedecked-db` for Express/TypeORM TCG domain) must run locally via Docker Compose with complete, validated schemas and seeded reference data.

The current `docker-compose.apps.yml` runs a single `app` database. This slice replaces that with two isolated Postgres 15 containers plus Redis, as required by the split-brain architecture. `mercur-db` receives all Medusa + MercurJS module tables via `npx medusa db:migrate`. `sidedecked-db` receives all 31 TypeORM entity tables via TypeORM migrations, then is seeded with games and formats reference data.

**Split-brain rule enforced from day one:** No direct foreign keys cross between the two databases. The `CatalogSKU` varchar field is the only cross-system linking concept.

### What already exists (must not be broken)
- `customer-backend/src/entities/` — 31 entity files exist on disk (Activity, AuthEvent, Card, CardImage, CardSet, CardTranslation, CatalogSKU, Collection, CollectionCard, Conversation, Deck, DeckCard, ETLJob, Format, ForumCategory, ForumPost, ForumTopic, Game, MarketPrice, Message, PriceAlert, PriceHistory, PricePrediction, Print, SellerRating, SellerReview, TrustScoreHistory, UserCollection, UserFollow, UserProfile, Wishlist, WishlistItem)
- `customer-backend/src/migrations/` — 19 migration files exist (initial schema through NarrowDeckNameTo100)
- `backend/apps/backend/medusa-config.ts` — registers 12 MercurJS modules + 4 custom auth modules
- `docker-compose.apps.yml` — single-DB setup (needs to become split-DB)

### What must be verified/fixed
- Migrations cover all 31 entities completely (no entity fields missing from migrations)
- Docker Compose is reconfigured for split databases
- Migration sequence runs clean from cold state
- Seed script is idempotent

## Acceptance Criteria

- [ ] `docker compose up -d` starts `mercur-db` (postgres:15), `sidedecked-db` (postgres:15), and `redis` (redis:7) without manual intervention
- [ ] `docker compose ps` shows all three services with status `healthy`
- [ ] `cd backend/apps/backend && npx medusa db:migrate` exits 0 and mercur-db contains >50 tables
- [ ] `cd customer-backend && npm run typeorm migration:run` exits 0 and all 31 entity tables exist in sidedecked-db
- [ ] `cd customer-backend && npm run seed` exits 0, Game table has 4 rows (MTG, POKEMON, YUGIOH, OPTCG), Format table has records for each game
- [ ] Seed script is idempotent — running it twice does not error or duplicate rows
- [ ] `cd customer-backend && npm run typecheck` exits 0
- [ ] `cd customer-backend && npm run lint` exits 0
- [ ] No direct foreign keys exist between mercur-db and sidedecked-db (enforced by DB isolation, not application code)
- [ ] All TypeORM migrations have reversible `down()` methods

## Constraints

- No direct PostgreSQL foreign keys between `mercur-db` and `sidedecked-db`
- TypeORM migrations must be reversible (down migrations required)
- MedusaJS migrations are managed by Medusa CLI — do not hand-edit generated files
- Migration timestamp format: Unix milliseconds (e.g. `1755427495483`)
- Docker Compose must work from cold state (no pre-existing volumes assumed)
- Redis 7 is shared by both backend (pub/sub) and customer-backend (Bull queues) — single Redis container

## Definition of Done

- [ ] `docker compose up -d && sleep 10 && docker compose ps` — all 3 services healthy, no errors
- [ ] `npx medusa db:migrate` from backend — exits 0
- [ ] `npm run typeorm migration:run` from customer-backend — exits 0
- [ ] `npm run seed` from customer-backend — exits 0, idempotent on second run
- [ ] `npm run typecheck` from customer-backend — exits 0
- [ ] No TODO stubs or dead paths in migration files
- [ ] Down migrations exist for all TypeORM migrations

## Open Questions

1. **docker-compose split strategy**: Should `docker-compose.apps.yml` be updated in-place to replace the single `app` DB with two databases, or should a new `docker-compose.yml` be created alongside it? (Preference: update in-place to avoid two compose files)
2. **Migration completeness**: The 19 existing migrations were written iteratively. Are there entity fields that were never captured in migrations? A migration vs entity diff is needed.
3. **Seed idempotency**: Current `SeedGameFormats` migration may handle seeding — should the seed script be separate from migrations or merge into the initial migration?
4. **mercur-db port**: Should mercur-db and sidedecked-db use different host ports (5432 and 5433) or rely on Docker network isolation with service-name DNS only?

## Affected Repos

- `backend/` — medusa-config.ts, Docker Compose DATABASE_URL env var
- `customer-backend/` — entities, migrations, seeds, data-source.ts, Docker Compose DATABASE_URL env var
