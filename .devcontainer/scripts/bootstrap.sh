#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

echo "[bootstrap] Starting repo bootstrap..."

# Load repo slugs from env file if present
ENV_FILE=".devcontainer/repos.env"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

# Helper: clone if folder missing or not a git repo.
clone_repo() {
  local slug="$1"; shift
  local target="$1"; shift

  if [[ -d "$target/.git" ]]; then
    echo "[bootstrap] $target already present; skipping clone."
    return 0
  fi

  if [[ -z "${slug}" ]]; then
    echo "[bootstrap] No repo slug provided for $target; skipping."
    return 0
  fi

  echo "[bootstrap] Cloning $slug into $target ..."

  # Prefer gh if available and authenticated
  if command -v gh >/dev/null 2>&1; then
    if gh auth status >/dev/null 2>&1; then
      gh repo clone "$slug" "$target" -- --quiet && return 0
    fi
  fi

  # Fallback to git clone over HTTPS (requires GITHUB_TOKEN permissions)
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    git -c http.extraheader="AUTHORIZATION: bearer $GITHUB_TOKEN" clone "https://github.com/${slug}.git" "$target" --quiet && return 0
  fi

  echo "[bootstrap] ERROR: Could not clone $slug. Ensure gh is authenticated or GITHUB_TOKEN has access." >&2
}

# Configure git safe directories to avoid dubious ownership warnings
git config --global --add safe.directory "/workspaces/${localWorkspaceFolderBasename:-workspace}"
for d in backend customer-backend storefront vendorpanel; do
  mkdir -p "$d"
  git config --global --add safe.directory "/workspaces/${localWorkspaceFolderBasename:-workspace}/$d" || true
done

# Clone repos based on provided slugs
clone_repo "${BACKEND_REPO:-}" "backend"
clone_repo "${CUSTOMER_BACKEND_REPO:-}" "customer-backend"
clone_repo "${STOREFRONT_REPO:-}" "storefront"
clone_repo "${VENDORPANEL_REPO:-}" "vendorpanel"

echo "[bootstrap] Done."

