# T03: Run and validate Medusa/MercurJS migrations on mercur-db

**Estimate:** 1h  
**Risk:** MEDIUM — Medusa CLI must be run from the correct directory. Wrong path = config not found or connects to wrong DB.

**Prerequisite:** T01 complete (mercur-db running on port 5432).

---

## What to Do

### Step 1: Verify backend env configuration

Medusa reads `DATABASE_URL` from `backend/apps/backend/.env`. Before running migrations, confirm:

```bash
cat backend/apps/backend/.env | grep DATABASE_URL
# Expected: DATABASE_URL=postgres://postgres:postgres@localhost:5432/mercur_db
```

If missing or wrong, create/update `backend/apps/backend/.env`:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mercur_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:3000,http://localhost:7001
```

### Step 2: Verify medusa-config.ts module registrations

Open `backend/apps/backend/medusa-config.ts` and confirm all MercurJS modules are registered:
- Core Medusa: `@medusajs/medusa/auth` (emailpass, google, discord, microsoft providers)
- Custom modules: `authentication`, `email-verification`, `two-factor-auth`, `seller-messaging`
- MercurJS modules: `@mercurjs/seller`, `@mercurjs/reviews`, `@mercurjs/marketplace`, `@mercurjs/configuration`, `@mercurjs/order-return-request`, `@mercurjs/dispute`, `@mercurjs/requests`, `@mercurjs/brand`, `@mercurjs/wishlist`, `@mercurjs/split-order-payment`, `@mercurjs/attribute`, `@mercurjs/taxcode`

This is already confirmed from normalization. No changes expected — just verify it hasn't drifted.

### Step 3: Run Medusa migrations

**CRITICAL:** Run from `backend/apps/backend/`, not the monorepo root or `backend/`.

```bash
cd backend/apps/backend
npx medusa db:migrate
```

Expected output: migration steps listed, exits 0. If it fails with "database does not exist", the `mercur-db` container is not yet running or `DATABASE_URL` is wrong.

### Step 4: Verify table count in mercur-db

```bash
# From repo root
docker compose -f docker-compose.apps.yml exec mercur-db psql -U postgres -d mercur_db -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
# Expected: count > 50 (Medusa + MercurJS tables are extensive)
```

### Step 5: Spot-check key MercurJS tables exist

```bash
docker compose -f docker-compose.apps.yml exec mercur-db psql -U postgres -d mercur_db -c "\dt" | grep -E "(seller|marketplace|product|order|customer)"
# Expected: seller, marketplace module tables present
```

---

## Files to Touch

- `backend/apps/backend/.env` — verify/create with correct `mercur-db` DATABASE_URL
- No source code changes expected — medusa-config.ts is already correct

---

## Verification

```bash
cd backend/apps/backend
npx medusa db:migrate
# Expected: exits 0

# From repo root:
docker compose -f docker-compose.apps.yml exec mercur-db psql -U postgres -d mercur_db -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
# Expected: count > 50
```

---

## Done When

- [ ] `npx medusa db:migrate` exits 0 (run from `backend/apps/backend/`)
- [ ] `mercur_db` table count > 50
- [ ] Key seller/marketplace tables present in mercur-db
- [ ] No errors in `docker compose logs mercur-db` after migrations run
