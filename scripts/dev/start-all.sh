#!/usr/bin/env bash
set -euo pipefail

# SideDecked: build and run all repos

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

# Detect devcontainer/Codespaces environment
IS_DEVCONTAINER=0
if [[ -n "${CODESPACES-}" || -n "${GITHUB_CODESPACES_WORKSPACE_ID-}" || ( -f "/.dockerenv" && -d "/workspaces" ) ]]; then
  IS_DEVCONTAINER=1
fi

# Only run inside devcontainer/Codespaces
if [[ "$IS_DEVCONTAINER" -ne 1 ]]; then
  echo "[env] Not running in devcontainer/Codespaces. Skipping startup."
  echo "      Use the devcontainer to run the full stack."
  exit 0
fi

# Connection targets (resolve hostnames for both container and host environments)
# Prefer docker compose service DNS (db/redis); fall back to localhost if not resolvable.
DB_HOST="db"
REDIS_HOST="redis"
if ! getent hosts db >/dev/null 2>&1; then
  # If db hostname is not resolvable, try localhost where ports are published
  DB_HOST="localhost"
fi
if ! getent hosts redis >/dev/null 2>&1; then
  REDIS_HOST="localhost"
fi

DB_URL_DEFAULT="postgres://postgres:postgres@${DB_HOST}:5432/app"
REDIS_URL_DEFAULT="redis://${REDIS_HOST}:6379"

echo "[1/6] Waiting for compose services (db:5432, redis:6379)..."
wait_for_tcp() {
  local host="$1"; shift
  local port="$1"; shift
  local retries="${1:-120}"
  local delay=1
  local i=0
  while ! (exec 3<>/dev/tcp/$host/$port) 2>/dev/null; do
    sleep "$delay"; i=$((i+1))
    if [[ $i -ge $retries ]]; then
      echo "[wait] Timeout waiting for $host:$port" >&2
      return 1
    fi
  done
  exec 3>&- 3<&-
}
wait_for_tcp "$DB_HOST" 5432 120
wait_for_tcp "$REDIS_HOST" 6379 120

echo "[2/6] Ensuring customer-db exists..."
(
  set -e
  CHECK_SQL="SELECT 'ok' FROM pg_database WHERE datname='customer-db';"
  CREATE_SQL='CREATE DATABASE "customer-db"'
  if command -v psql >/dev/null 2>&1; then
    echo "$CHECK_SQL" | PGPASSWORD=postgres psql -h "$DB_HOST" -U postgres -d postgres -Atq | grep -q ok || \
    PGPASSWORD=postgres psql -h "$DB_HOST" -U postgres -d postgres -c "$CREATE_SQL"
  else
    DB_CONT=$(docker compose -f "$ROOT_DIR/.devcontainer/docker-compose.yml" ps -q db 2>/dev/null || true)
    if [[ -n "$DB_CONT" ]]; then
      docker exec -e PGPASSWORD=postgres "$DB_CONT" psql -h localhost -U postgres -d postgres -Atqc "$CHECK_SQL" | grep -q ok || \
      docker exec -e PGPASSWORD=postgres "$DB_CONT" psql -h localhost -U postgres -d postgres -c "$CREATE_SQL"
    else
      echo "[db] WARN: Could not locate db container to run psql; skipping explicit create."
    fi
  fi
) || true

echo "[3/6] Installing and building backend (MercurJS monorepo) ..."
(
  cd "$ROOT_DIR/backend"
  npm ci
  npm run build
)

echo "[4/6] Migrating, seeding, and starting backend (Medusa) on :9000 ..."
# Override DB/Redis hosts for host-network usage or devcontainer
(
  cd "$ROOT_DIR/backend/apps/backend"
  # Ensure non-SSL DB for local Postgres
  _DB_URL="${DATABASE_URL:-$DB_URL_DEFAULT}"
  if [[ "$_DB_URL" == *\?* ]]; then
    export DATABASE_URL="${_DB_URL}&sslmode=disable"
  else
    export DATABASE_URL="${_DB_URL}?sslmode=disable"
  fi
  export REDIS_URL="${REDIS_URL:-$REDIS_URL_DEFAULT}"
  export PGSSLMODE=disable
  # Ensure DB schema and sample data
  npm run db:migrate
  npm run seed
  # Start dev server
  nohup npm run dev >"$LOG_DIR/backend.log" 2>&1 & echo $! >"$LOG_DIR/backend.pid"
)

echo "[5/6] Installing, migrating, and starting customer-backend on :7000 ..."
(
  cd "$ROOT_DIR/customer-backend"
  npm ci
  # Point to dev infra in compose network
  export DATABASE_URL=${DATABASE_URL:-postgres://postgres:postgres@${DB_HOST}:5432/customer-db}
  export REDIS_URL=${REDIS_URL:-redis://${REDIS_HOST}:6379}
  export API_HOST=${API_HOST:-0.0.0.0}
  # Required secrets for local dev
  export JWT_SECRET=${JWT_SECRET:-dev-jwt-secret}
  export COOKIE_SECRET=${COOKIE_SECRET:-dev-cookie-secret}
  # Allow optional services (Algolia/MinIO) to be absent without blocking startup
  export ALLOW_DEGRADED_START=${ALLOW_DEGRADED_START:-true}
  # Build and run migrations before starting
  npm run migration:deploy || {
    echo "[customer-backend] Migration failed; check configuration and DB connectivity." >&2
  }
  nohup npm run dev >"$LOG_DIR/customer-backend.log" 2>&1 & echo $! >"$LOG_DIR/customer-backend.pid"
)

echo "[6/6] Installing and starting vendorpanel (Vite) on :5173 ..."
(
  cd "$ROOT_DIR/vendorpanel"
  npm ci
  nohup npm run dev >"$LOG_DIR/vendorpanel.log" 2>&1 & echo $! >"$LOG_DIR/vendorpanel.pid"
)

echo "[5/5] Installing and starting storefront (Next.js) on :3000 ..."
(
  cd "$ROOT_DIR/storefront"
  npm ci
  nohup npm run dev >"$LOG_DIR/storefront.log" 2>&1 & echo $! >"$LOG_DIR/storefront.pid"
)

echo
echo "All services launched. Tail logs with:"
echo "  tail -f $LOG_DIR/backend.log"
echo "  tail -f $LOG_DIR/customer-backend.log"
echo "  tail -f $LOG_DIR/vendorpanel.log"
echo "  tail -f $LOG_DIR/storefront.log"
echo
echo "Endpoints:"
echo "  MercurJS Backend (Medusa):   http://localhost:9000"
echo "  Customer Backend (Express):  http://localhost:7000"
echo "  Vendor Panel (Vite):         http://localhost:5173"
echo "  Storefront (Next.js):        http://localhost:3000"
echo
