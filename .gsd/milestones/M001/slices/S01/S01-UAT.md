# S01: Database Schemas & Core Entities - UAT

**Milestone:** M001
**Written:** 2026-03-17

## UAT Type

- UAT mode: live-runtime
- Why this mode is sufficient: Database schema correctness requires a running engine - column types, constraints, and indexes only validate at runtime.

## Preconditions

- Docker Desktop running
- `.env` file with POSTGRES_PASSWORD, DATABASE_URL (both DBs), REDIS_URL populated

## Smoke Test

1. `docker compose up -d`
2. `docker compose ps` - all services show `healthy`
3. `cd backend && npx medusa db:migrate` - exits 0
4. `cd customer-backend && npm run typeorm migration:run` - exits 0
5. `cd customer-backend && npm run seed` - exits 0

## Test Cases

### 1. Both databases start cleanly from cold state
1. `docker compose down -v && docker compose up -d`
2. Wait for health checks to pass
3. **Expected:** Both postgres services show `healthy`, redis shows `healthy`

### 2. Medusa schema complete
1. Connect to mercur-db: `psql $MEDUSA_DATABASE_URL`
2. `SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';`
3. **Expected:** Count >= 50 tables

### 3. TypeORM schema complete
1. Connect to sidedecked-db: `psql $CUSTOMER_DATABASE_URL`
2. `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;`
3. **Expected:** All 31 entity tables present

### 4. Seed data populated
1. `psql $CUSTOMER_DATABASE_URL -c "SELECT code, name FROM game ORDER BY code;"`
2. **Expected:** 4 rows: MTG, POKEMON, YUGIOH, OPTCG
3. `psql $CUSTOMER_DATABASE_URL -c "SELECT count(*) FROM format;"`
4. **Expected:** Count >= 8

### 5. Migrations are idempotent
1. Run `npm run typeorm migration:run` a second time
2. **Expected:** No migrations pending, exits 0 with no changes

## Edge Cases

- Port conflicts: if ports 5432, 5433, or 6379 are in use locally, Docker will fail to bind. Resolution: change ports in docker-compose.yml.
- Migration order: TypeORM migrations must run in timestamp order.

## Failure Signals

- `docker compose ps` shows any service as `unhealthy` or `Exit 1`
- Migration output contains `ERROR: relation already exists`
- TypeORM entity count in DB < 31
- Games table empty after seed

## Requirements Proved By This UAT

- R001 (partial) - multi-game data model supports MTG, Pokemon, Yu-Gi-Oh!, One Piece
- R006 (partial) - shared database infrastructure for JWT-sharing auth pattern established

## Not Proven By This UAT

- Auth round-trips (S02)
- Card data populated (S03)
- UI rendering (S04)

## Notes for Tester

- Run on a machine with Docker >= 24 and >= 4GB RAM available
- The `npm run seed` script must be idempotent - run it twice to verify
