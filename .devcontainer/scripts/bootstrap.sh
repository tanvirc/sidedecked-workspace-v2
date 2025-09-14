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

## Helper: clone if folder missing or not a git repo.
clone_repo() {
  local src="$1"; shift
  local target="$1"; shift

  if [[ -d "$target/.git" ]]; then
    echo "[bootstrap] $target already present; skipping clone."
    return 0
  fi

  if [[ -z "${src}" ]]; then
    echo "[bootstrap] No repo slug/url provided for $target; skipping."
    return 0
  fi

  # Normalize input
  local is_url=false
  if [[ "$src" =~ ^(git@|https?://) ]]; then
    is_url=true
  fi

  echo "[bootstrap] Cloning $src into $target ..."

  # If a full URL is provided, prefer plain git clone; gh's credential helper will supply creds.
  if $is_url; then
    if git clone --quiet "$src" "$target" 2>clone.err; then
      rm -f clone.err
      return 0
    else
      echo "[bootstrap] ERROR: git clone failed for $src → $target" >&2
      sed 's/^/[git] /' clone.err >&2 || true
      rm -f clone.err
      return 1
    fi
  fi

  # Otherwise, treat as OWNER/REPO slug
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    # Check access explicitly for clearer errors
    if env -u GITHUB_TOKEN -u GH_TOKEN gh repo view "$src" >/dev/null 2>view.err; then
      if env -u GITHUB_TOKEN -u GH_TOKEN gh repo clone "$src" "$target" -- --quiet 2>clone.err; then
        rm -f view.err clone.err
        return 0
      else
        echo "[bootstrap] ERROR: gh repo clone failed for $src → $target" >&2
        sed 's/^/[gh] /' clone.err >&2 || true
        rm -f view.err clone.err
        return 1
      fi
    else
      echo "[bootstrap] ERROR: Cannot access repository '$src' (not found or no permission)." >&2
      sed 's/^/[gh] /' view.err >&2 || true
      rm -f view.err
      echo "[bootstrap] Hint: ensure slug is correct (OWNER/REPO) and your PAT has repo scope/SSO enabled." >&2
      return 1
    fi
  fi

  # Final fallback to HTTPS with header if an explicit PAT provided
  local PAT="${GITHUB_PAT:-${GH_PAT:-}}"
  if [[ -n "$PAT" ]]; then
    if git -c http.extraheader="AUTHORIZATION: bearer $PAT" clone "https://github.com/${src}.git" "$target" --quiet 2>clone.err; then
      rm -f clone.err
      return 0
    else
      echo "[bootstrap] ERROR: git clone with PAT failed for $src → $target" >&2
      sed 's/^/[git] /' clone.err >&2 || true
      rm -f clone.err
      return 1
    fi
  fi

  echo "[bootstrap] ERROR: Could not clone $src. Authenticate gh or provide a PAT in GITHUB_PAT." >&2
  return 1
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
