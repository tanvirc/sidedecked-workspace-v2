# T05: End-to-end cold-start validation

**Estimate:** 30m  
**Risk:** LOW — final integration check. Catches anything missed by individual task verifications.

**Prerequisite:** T01, T02, T03, T04 all complete.

---

## What to Do

This task runs the complete slice from cold state (no volumes, no running containers) to verify the full setup is reproducible.

### Step 1: Full teardown

```bash
# From repo root
docker compose -f docker-compose.apps.yml down -v
# Expected: removes containers AND volumes (the -v flag wipes data)
# This simulates a fresh developer machine
```

### Step 2: Cold start

```bash
docker compose -f docker-compose.apps.yml up -d
sleep 10
docker compose -f docker-compose.apps.yml ps
# Expected: all 3 services (mercur-db, sidedecked-db, redis) show "healthy"
```

### Step 3: Medusa migrations (mercur-db)

```bash
cd backend/apps/backend
npx medusa db:migrate
# Expected: exits 0
```

### Step 4: TypeORM migrations (sidedecked-db)

```bash
cd customer-backend
npm run build && npm run migration:run
# Expected: exits 0, all migrations applied
```

### Step 5: Seed reference data

```bash
cd customer-backend
npm run seed:games && npm run seed:formats
# Expected: exits 0
```

### Step 6: Quality gate

```bash
cd customer-backend
npm run typecheck
# Expected: exits 0

npm run lint
# Expected: exits 0
```

### Step 7: Database state audit

```bash
# Verify mercur-db table count
docker compose -f docker-compose.apps.yml exec mercur-db psql -U postgres -d mercur_db \
  -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
# Expected: > 50

# Verify sidedecked-db table count
docker compose -f docker-compose.apps.yml exec sidedecked-db psql -U postgres -d sidedecked_db \
  -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
# Expected: >= 32 (31 entity tables + migrations table)

# Verify no cross-DB foreign keys exist (architectural invariant)
docker compose -f docker-compose.apps.yml exec sidedecked-db psql -U postgres -d sidedecked_db \
  -c "SELECT count(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';"
# Expected: all foreign keys are within sidedecked_db only (no references to mercur_db)

# Verify seed data
docker compose -f docker-compose.apps.yml exec sidedecked-db psql -U postgres -d sidedecked_db \
  -c "SELECT code FROM game ORDER BY code;"
# Expected: MTG, OPTCG, POKEMON, YUGIOH
```

---

## Files to Touch

None — this is a read-only validation task. If any step fails, go back to the relevant task (T01-T04) to fix.

---

## Verification

All steps above must pass sequentially from cold state.

---

## Done When

- [ ] Full teardown + cold start completes without manual intervention
- [ ] All 3 Docker services healthy after cold start
- [ ] `npx medusa db:migrate` exits 0 on clean mercur-db
- [ ] `npm run migration:run` exits 0 on clean sidedecked-db
- [ ] `npm run seed:games && npm run seed:formats` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] mercur-db has >50 tables
- [ ] sidedecked-db has ≥32 tables (31 entities + migrations)
- [ ] `game` table has 4 rows
- [ ] No cross-database foreign keys (verified by inspection)
- [ ] S01 story status updated to `status: complete` in `S01-STORY.md`
