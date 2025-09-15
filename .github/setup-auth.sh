#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[auth] Starting GitHub authentication setup..."

if ! command -v gh >/dev/null 2>&1; then
  echo "[auth] ERROR: GitHub CLI (gh) is not installed. Install it and rerun." >&2
  exit 1
fi

echo "[auth] gh version: $(gh --version | head -n1)"

# Load repo slugs from env file if present
ENV_FILE=".devcontainer/repos.env"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
else
  echo "[auth] WARN: $ENV_FILE not found. Proceeding without slug checks."
fi

echo "[auth] Checking current gh auth status..."
STATUS_OUTPUT=$(gh auth status 2>&1 || true)
echo "$STATUS_OUTPUT"

# Determine if current token is a Codespaces token (ghu_/ghs_) which often lacks repo scope
IS_CODESPACES_TOKEN=false
if echo "$STATUS_OUTPUT" | grep -q "Token: ghu_\|Token: ghs_"; then
  IS_CODESPACES_TOKEN=true
fi

NEED_LOGIN=false
if echo "$STATUS_OUTPUT" | grep -q "Not logged in"; then
  NEED_LOGIN=true
elif $IS_CODESPACES_TOKEN; then
  echo "[auth] Detected Codespaces token; this often lacks access to private repos outside the workspace owner."
  NEED_LOGIN=true
fi

if $NEED_LOGIN; then
  echo "[auth] Logging into GitHub CLI with a Personal Access Token (requires repo scope)."
  # Prefer env-provided token if present, otherwise prompt
  # Intentionally DO NOT default to GITHUB_TOKEN because Codespaces sets it and it usually lacks repo scope
  GH_PAT="${GITHUB_PAT:-${GH_PAT:-${GH_PERSONAL_ACCESS_TOKEN:-}}}"
  if [[ -n "$GH_PAT" ]]; then
    echo "[auth] Using token from environment (masked)."
    # Ensure env-provided tokens don't overshadow stored credentials during login
    # shellcheck disable=SC2069
    echo "$GH_PAT" | env -u GITHUB_TOKEN -u GH_TOKEN gh auth login --hostname github.com --with-token >/dev/null
  else
    echo "[auth] No token found in env. You will be prompted for a PAT."
    echo "[auth] Create a Personal Access Token at https://github.com/settings/tokens with at least: repo, read:org (if needed)."
    echo "[auth] Note: Do NOT use the built-in GITHUB_TOKEN from Codespaces; it typically lacks access to private repos."
    gh auth login --hostname github.com --git-protocol https
  fi
  echo "[auth] gh auth login complete."
  echo "[auth] Current stored auth (ignoring env tokens):"
  env -u GITHUB_TOKEN -u GH_TOKEN gh auth status || true
fi

echo "[auth] Ensuring git is configured to use gh credentials..."
gh auth setup-git >/dev/null

echo "[auth] Verifying access to repositories..."
FAIL=0
check_repo() {
  local slug="$1"
  if [[ -z "$slug" ]]; then
    return 0
  fi
  if env -u GITHUB_TOKEN -u GH_TOKEN gh repo view "$slug" >/dev/null 2>&1; then
    echo "  ✓ $slug"
  else
    echo "  ✗ $slug (no access or not found)"
    FAIL=1
  fi
}

check_repo "${BACKEND_REPO:-}"
check_repo "${CUSTOMER_BACKEND_REPO:-}"
check_repo "${STOREFRONT_REPO:-}"
check_repo "${VENDORPANEL_REPO:-}"

if [[ "$FAIL" -ne 0 ]]; then
  echo "[auth] ERROR: One or more repositories are not accessible with current credentials."
  echo "[auth] Ensure your token has 'repo' scope and org access if applicable."
  exit 1
fi

echo "[auth] Access verified. Running bootstrap to clone repositories..."
# Run bootstrap without env tokens so gh uses stored credentials
env -u GITHUB_TOKEN -u GH_TOKEN bash .devcontainer/scripts/bootstrap.sh

echo "[auth] Done."
