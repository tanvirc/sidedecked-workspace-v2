# S01: Database Schemas & Core Entities

**Goal:** Both PostgreSQL databases (`mercur-db` and `sidedecked-db`) running locally via Docker Compose with complete schemas, seed data, and passing typechecks.

**Demo criteria:**
1. `docker compose up -d && sleep 10 && docker compose ps` — all 3 services (`mercur-db`, `sidedecked-db`, `redis`) show `healthy`
2. `cd backend/apps/backend && npx medusa db:migrate` — exits 0
3. `cd customer-backend && npm run build && npm run migration:run` — exits 0
4. `cd customer-backend && npm run seed:games && npm run seed:formats` — exits 0; `Game` table has 4 rows
5. `cd customer-backend && npm run typecheck` — exits 0

---

## Tasks

- [ ] **T01: Split Docker Compose into two isolated databases** `est:45m`
- [ ] **T02: Verify and finalize TypeORM migrations for all 31 entities** `est:2h`
- [ ] **T03: Run and validate Medusa/MercurJS migrations on mercur-db** `est:1h`
- [ ] **T04: Verify and fix seed scripts for games and formats** `est:30m`
- [ ] **T05: End-to-end cold-start validation** `est:30m`

**Total estimate:** ~4h 45m

---

## Risks

1. **Migration completeness** (HIGH) — 19 migrations vs 31 entities; if any entity fields are missing from migrations, `typecheck` passes but runtime writes will fail. T02 audits this explicitly.
2. **Medusa migration path** (MEDIUM) — Medusa CLI must be run from `backend/apps/backend/`, not the monorepo root. Wrong path silently connects to wrong DB or fails with config not found.
3. **Port collision** (LOW) — If existing `.env` already uses 5432 for the old single DB, splitting to 5432/5433 may require updating local `.env` files. T01 documents required env vars.
4. **Seed idempotency** (LOW) — Seed scripts may not handle "already exists" gracefully on re-run. T04 verifies.
