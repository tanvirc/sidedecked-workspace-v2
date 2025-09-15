#!/usr/bin/env bash
set -uo pipefail

# Resilient post-start wrapper: best-effort for setup steps, always start services.

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

log() { echo "[post-start] $*"; }
warn() { echo "[post-start] WARN: $*" >&2; }
err()  { echo "[post-start] ERROR: $*" >&2; }

# 1) Optional GitHub auth setup (skip if gh missing or repos already present)
if [[ -x ".github/setup-auth.sh" ]]; then
  if command -v gh >/dev/null 2>&1; then
    log "Running GitHub auth/setup..."
    if ! bash .github/setup-auth.sh; then
      warn "GitHub auth/setup failed; continuing without it."
    fi
  else
    warn "GitHub CLI (gh) not installed; skipping .github/setup-auth.sh"
  fi
fi

# 2) Configure git credential behavior (non-fatal)
if [[ -x ".devcontainer/scripts/configure-git-auth.sh" ]]; then
  log "Configuring git credential behavior..."
  if ! bash .devcontainer/scripts/configure-git-auth.sh; then
    warn "configure-git-auth failed; continuing."
  fi
fi

# 3) Optional developer CLIs (non-fatal)
if [[ -x ".devcontainer/scripts/install-ai-clis.sh" ]]; then
  log "Installing developer helper CLIs..."
  if ! bash .devcontainer/scripts/install-ai-clis.sh; then
    warn "install-ai-clis failed; continuing."
  fi
fi

# 4) Always start application services
if [[ -x ".devcontainer/scripts/start-all.sh" ]]; then
  log "Starting all application services..."
  exec bash .devcontainer/scripts/start-all.sh
else
  err "start-all.sh not found or not executable."
  exit 1
fi

