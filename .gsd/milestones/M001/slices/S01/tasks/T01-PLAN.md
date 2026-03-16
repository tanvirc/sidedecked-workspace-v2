# T01: Split Docker Compose into two isolated databases

**Estimate:** 45m  
**Risk:** HIGH — this is the foundational change all other tasks depend on. Wrong here = nothing else works.

---

## What to Do

The current `docker-compose.apps.yml` has a single `db` container (`postgres:16-alpine`, database: `app`). Replace it with two isolated Postgres 15 containers (`mercur-db` and `sidedecked-db`) plus the existing Redis, all sharing a Docker network.

### Step-by-step

1. **Open `docker-compose.apps.yml`** and replace the single `db` service with two services:

   ```yaml
   mercur-db:
     image: postgres:15-alpine
     container_name: sidedecked-mercur-db
     environment:
       POSTGRES_USER: postgres
       POSTGRES_PASSWORD: postgres
       POSTGRES_DB: mercur_db
     volumes:
       - mercur-db-data:/var/lib/postgresql/data
     healthcheck:
       test: ["CMD-SHELL", "pg_isready -U postgres -d mercur_db"]
       interval: 5s
       timeout: 5s
       retries: 10
     ports:
       - "5432:5432"
     networks:
       - devcontainer_default

   sidedecked-db:
     image: postgres:15-alpine
     container_name: sidedecked-sidedecked-db
     environment:
       POSTGRES_USER: postgres
       POSTGRES_PASSWORD: postgres
       POSTGRES_DB: sidedecked_db
     volumes:
       - sidedecked-db-data:/var/lib/postgresql/data
     healthcheck:
       test: ["CMD-SHELL", "pg_isready -U postgres -d sidedecked_db"]
       interval: 5s
       timeout: 5s
       retries: 10
     ports:
       - "5433:5432"
     networks:
       - devcontainer_default
   ```

2. **Remove** the old `db` service entirely.

3. **Update volumes** section — remove `postgres-data`, add `mercur-db-data` and `sidedecked-db-data`.

4. **Remove** the `./infra/postgres-init` bind mount — it was for creating the `app` database on the old setup. The new setup uses the `POSTGRES_DB` env var directly.

5. **Document required env vars** in a comment block at the top of the compose file:
   ```yaml
   # Required env vars for local development:
   # Backend (backend/apps/backend/.env):
   #   DATABASE_URL=postgres://postgres:postgres@localhost:5432/mercur_db
   # Customer-backend (customer-backend/.env):
   #   DATABASE_URL=postgres://postgres:postgres@localhost:5433/sidedecked_db
   ```

6. **Check `customer-backend/src/config/env.ts`** — the default `DATABASE_URL` fallback is `postgres://localhost:5432/sidedecked_db`. Update it to `postgres://localhost:5433/sidedecked_db` to match the new port.

---

## Files to Touch

- `docker-compose.apps.yml` — primary change
- `customer-backend/src/config/env.ts` — update default DATABASE_URL port from 5432 to 5433

---

## Verification

```bash
# From repo root
docker compose -f docker-compose.apps.yml down -v  # tear down old state
docker compose -f docker-compose.apps.yml up -d
sleep 10
docker compose -f docker-compose.apps.yml ps
# Expected: mercur-db (healthy), sidedecked-db (healthy), redis (healthy)

# Test mercur-db connection
docker compose -f docker-compose.apps.yml exec mercur-db pg_isready -U postgres -d mercur_db
# Expected: /var/run/postgresql:5432 - accepting connections

# Test sidedecked-db connection
docker compose -f docker-compose.apps.yml exec sidedecked-db pg_isready -U postgres -d sidedecked_db
# Expected: /var/run/postgresql:5432 - accepting connections
```

---

## Done When

- [ ] `docker compose ps` shows all 3 services healthy
- [ ] `mercur-db` accessible on host port 5432
- [ ] `sidedecked-db` accessible on host port 5433
- [ ] No `postgres-data` volume (old single DB) — only `mercur-db-data` and `sidedecked-db-data`
- [ ] `customer-backend/src/config/env.ts` default DATABASE_URL uses port 5433
