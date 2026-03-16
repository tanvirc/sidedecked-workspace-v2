# S01: Database Schemas & Core Entities

**Goal:** Both databases running with complete schemas and seed data.
**Demo:** `docker compose up -d` -> both databases healthy -> `npm run typeorm migration:run` exits 0 -> seed script populates games/formats.

## Must-Haves

- Docker Compose starts mercur-db, sidedecked-db, and Redis without manual intervention
- All MercurJS module migrations applied to mercur-db
- All 31 TypeORM entities have matching migrations in sidedecked-db
- Seed data: 4 games, format records for each game
- `npm run typecheck` passes in customer-backend

## Proof Level

- This slice proves: contract
- Real runtime required: yes (Docker must run)
- Human/UAT required: no

## Verification

- `docker compose up -d && sleep 5 && docker compose ps` - all services healthy
- `cd customer-backend && npm run typeorm migration:run` - exits 0
- `cd customer-backend && npm run seed` - seeds games and formats
- `cd backend && npx medusa db:migrate` - exits 0
- `cd customer-backend && npm run typecheck` - exits 0

## Observability / Diagnostics

- Runtime signals: Docker health checks on both Postgres containers
- Inspection surfaces: `docker compose logs db-mercur`, `docker compose logs db-sidedecked`
- Failure visibility: migration errors logged to stderr with table name and constraint
- Redaction constraints: no PII in seed data

## Integration Closure

- Upstream surfaces consumed: docker-compose.apps.yml base config
- New wiring introduced: two named Postgres volumes, one Redis volume
- What remains before milestone is truly usable: auth (S02), card data (S03), UI (S04)

## Tasks

- [ ] **T01: Docker Compose database stack** `est:1h`
  - Why: Services must be declaratively reproducible for local dev and CI
  - Files: `docker-compose.yml`, `docker-compose.apps.yml`
  - Do: Define mercur-db (postgres:15), sidedecked-db (postgres:15), redis:7 services with named volumes, health checks, and env vars. Ensure ports don't conflict.
  - Verify: `docker compose up -d && docker compose ps` shows all healthy
  - Done when: All 3 services start from cold state without manual steps

- [ ] **T02: MedusaJS/MercurJS migrations (mercur-db)** `est:2h`
  - Why: Medusa and MercurJS modules must have their tables before any backend routes work
  - Files: `backend/src/medusa-config.ts`
  - Do: Register all required MercurJS modules (@mercurjs/seller, marketplace, reviews, commission, dispute, payout, split-order-payment, algolia, wishlist, brand, attribute, requests, campaigns). Run `npx medusa db:migrate`.
  - Verify: `cd backend && npx medusa db:migrate` exits 0; table count in mercur-db > 50
  - Done when: All MercurJS module tables present in mercur-db

- [ ] **T03: TypeORM entity definitions (sidedecked-db)** `est:3h`
  - Why: Customer-backend owns TCG domain data - all entities must be defined before any service can write to them
  - Files: `customer-backend/src/entities/*.ts` (all 31 entities), `customer-backend/src/migrations/*.ts`
  - Do: Ensure all 31 entities are defined: Card, CardImage, CardSet, CardTranslation, CatalogSKU, Print, Game, Format, Collection, CollectionCard, UserCollection, Deck, DeckCard, SellerRating, SellerReview, TrustScoreHistory, MarketPrice, PriceHistory, PriceAlert, PricePrediction, UserProfile, UserFollow, Wishlist, WishlistItem, Activity, AuthEvent, Conversation, Message, ForumCategory, ForumPost, ForumTopic, ETLJob. Add indexes on foreign keys and frequently-queried columns.
  - Verify: `cd customer-backend && npm run typeorm migration:run` exits 0
  - Done when: `npm run typecheck` passes, all migrations run without error

- [ ] **T04: Seed games, formats, and reference data** `est:45m`
  - Why: Games and formats are static reference data that must exist before ETL or deck validation can work
  - Files: `customer-backend/src/seeds/seed-games.ts`, `customer-backend/src/seeds/seed-formats.ts`
  - Do: Insert 4 games (MTG, POKEMON, YUGIOH, OPTCG) and their associated competitive formats.
  - Verify: `cd customer-backend && npm run seed` exits 0; game table has 4 rows
  - Done when: All games and formats present; seed is idempotent

## Files Likely Touched

- `docker-compose.yml`
- `docker-compose.apps.yml`
- `backend/src/medusa-config.ts`
- `customer-backend/src/entities/*.ts`
- `customer-backend/src/migrations/*.ts`
- `customer-backend/src/seeds/seed-games.ts`
- `customer-backend/src/seeds/seed-formats.ts`
- `customer-backend/src/data-source.ts`
