# T02: Verify and finalize TypeORM migrations for all 31 entities

**Estimate:** 2h  
**Risk:** HIGH — missing entity fields in migrations = runtime writes fail silently after typecheck passes.

**Prerequisite:** T01 complete (sidedecked-db running on port 5433).

---

## What to Do

### Step 1: Audit migration coverage vs entity definitions

Run a coverage check: for each of the 31 entities, confirm that all non-transient fields appear in at least one migration.

**Known entities to audit** (31 total):
Activity, AuthEvent, Card, CardImage, CardSet, CardTranslation, CatalogSKU, Collection, CollectionCard, Conversation, Deck, DeckCard, ETLJob, Format, ForumCategory, ForumPost, ForumTopic, Game, MarketPrice, Message, PriceAlert, PriceHistory, PricePrediction, Print, SellerRating, SellerReview, TrustScoreHistory, UserCollection, UserFollow, UserProfile, Wishlist, WishlistItem

**Entities most likely to have migration gaps** (added later in development):
- `ForumCategory`, `ForumPost`, `ForumTopic`
- `Conversation`, `Message`
- `ETLJob`
- `PriceAlert`, `PricePrediction`
- `SellerReview` (separate from SellerRating — confirm it has its own table)
- `TrustScoreHistory` (has its own migration: `1772900000000-CreateTrustScoreHistory` — confirm it's complete)
- `AuthEvent` (has migration `1777000100000-CreateAuthEvents` — confirm all fields present)
- `CollectionCard` (check if `InitialSchema` covers it or if a later migration added missing fields)

### Step 2: Check `database.ts` entity registration

Open `customer-backend/src/config/database.ts`. Confirm that all 31 entities are imported and listed in the `entities` array of the `AppDataSource`. Note: `SellerReview` is in the entities directory but needs to be imported in `database.ts`.

### Step 3: Confirm down migrations exist

For each migration file in `customer-backend/src/migrations/`, open it and confirm the `down()` method contains real rollback SQL (not an empty body or `// TODO`). If any down migrations are empty, add the appropriate `DROP TABLE` or `ALTER TABLE DROP COLUMN` statement.

### Step 4: Write missing migrations (if any)

If the audit reveals entity fields not covered by existing migrations, create new migration files:

```bash
cd customer-backend
# After building, generate a migration comparing entities vs DB state:
npm run build
npx typeorm migration:generate src/migrations/TIMESTAMP-FixMissingFields -d dist/src/config/database.js
```

Review the generated migration carefully — do not auto-apply without reviewing its content.

### Step 5: Run the full migration chain

```bash
cd customer-backend
# Build first (TypeORM migrations run from dist/)
npm run build

# Run all pending migrations
npm run migration:run
# Expected: each migration listed as "EXECUTED", exit 0

# Verify migration count
npm run migration:show
# Expected: all 19+ migrations show as [X] (applied)
```

### Step 6: Spot-check down migration reversibility

```bash
cd customer-backend
# Revert the last migration and verify it succeeds
npm run migration:revert
# Expected: exit 0, last migration reverted cleanly

# Re-apply it
npm run migration:run
# Expected: exit 0, back to fully migrated state
```

---

## Files to Touch

- `customer-backend/src/config/database.ts` — add any missing entity imports/registrations
- `customer-backend/src/migrations/*.ts` — add missing down() bodies if empty; add new migration files if entity fields are missing

---

## Verification

```bash
cd customer-backend
npm run build && npm run migration:run
# Expected: exits 0

npm run migration:show
# Expected: all migrations show [X]

npm run typecheck
# Expected: exits 0

# Verify table count in sidedecked-db
docker compose -f ../docker-compose.apps.yml exec sidedecked-db psql -U postgres -d sidedecked_db -c "\dt"
# Expected: 31 tables (plus migrations_table = 32 rows)

# Spot-check a late-added table exists
docker compose -f ../docker-compose.apps.yml exec sidedecked-db psql -U postgres -d sidedecked_db -c "\d auth_event"
# Expected: table structure returned (not "relation does not exist")
```

---

## Done When

- [ ] All 31 entity tables exist in sidedecked-db
- [ ] `npm run migration:run` exits 0
- [ ] `npm run migration:revert` + `npm run migration:run` cycle exits 0 (last migration reversible)
- [ ] All 31 entities imported in `database.ts`
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
