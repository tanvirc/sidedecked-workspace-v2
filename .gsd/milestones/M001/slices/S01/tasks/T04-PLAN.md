# T04: Verify and fix seed scripts for games and formats

**Estimate:** 30m  
**Risk:** LOW — seed scripts exist (`seed-games.ts`, `seed-formats.ts`). Main concern is idempotency and correct DB connection.

**Prerequisite:** T02 complete (all tables exist in sidedecked-db).

---

## What to Do

### Step 1: Inspect existing seed scripts

Read `customer-backend/src/scripts/seed-games.ts` and `customer-backend/src/scripts/seed-formats.ts`.

Verify:
- They import and initialize `AppDataSource` from `../config/database`
- They insert 4 games: `MTG`, `POKEMON`, `YUGIOH`, `OPTCG` (check exact enum/string values against the `Game` entity)
- They insert format records for each game
- They handle "already exists" gracefully — either `INSERT ... ON CONFLICT DO NOTHING` or a pre-check

### Step 2: Check for idempotency

The `SeedGameFormats` migration (`1755735597526-SeedGameFormats.ts`) may already contain seed data. If it does:
- The seed scripts must not duplicate that data on re-run
- Confirm the scripts use upsert or existence checks, not blind inserts

### Step 3: Verify package.json seed script commands

`customer-backend/package.json` has:
- `"seed:games": "ts-node src/scripts/seed-games.ts"`
- `"seed:formats": "ts-node src/scripts/seed-formats.ts"`

Both scripts must:
1. Connect to `sidedecked-db` using `DATABASE_URL` from env
2. Exit 0 on success

If no combined `npm run seed` exists, that is acceptable — the AC uses `npm run seed:games && npm run seed:formats`.

### Step 4: Run the seed scripts

```bash
cd customer-backend

# Set correct DATABASE_URL if not already in .env
# DATABASE_URL=postgres://postgres:postgres@localhost:5433/sidedecked_db

npm run seed:games
# Expected: "Seeded X games" or similar, exit 0

npm run seed:formats  
# Expected: "Seeded X formats" or similar, exit 0

# Run again to verify idempotency
npm run seed:games && npm run seed:formats
# Expected: exit 0 again, no duplicate key errors
```

### Step 5: Verify row counts

```bash
# From repo root
docker compose -f docker-compose.apps.yml exec sidedecked-db psql -U postgres -d sidedecked_db -c "SELECT code, name FROM game ORDER BY code;"
# Expected: 4 rows (MTG, POKEMON, YUGIOH, OPTCG)

docker compose -f docker-compose.apps.yml exec sidedecked-db psql -U postgres -d sidedecked_db -c "SELECT count(*) FROM format;"
# Expected: > 0 rows (at least 1 format per game)
```

---

## Files to Touch

- `customer-backend/src/scripts/seed-games.ts` — fix idempotency if needed
- `customer-backend/src/scripts/seed-formats.ts` — fix idempotency if needed
- `customer-backend/.env` — verify `DATABASE_URL` points to port 5433

---

## Verification

```bash
cd customer-backend
npm run seed:games && npm run seed:formats
# Expected: exits 0

# Second run (idempotency check)
npm run seed:games && npm run seed:formats
# Expected: exits 0 with no errors
```

---

## Done When

- [ ] `npm run seed:games` exits 0
- [ ] `npm run seed:formats` exits 0
- [ ] Both scripts are idempotent (second run exits 0, no duplicate key errors)
- [ ] `game` table has exactly 4 rows: MTG, POKEMON, YUGIOH, OPTCG
- [ ] `format` table has at least 1 row per game
