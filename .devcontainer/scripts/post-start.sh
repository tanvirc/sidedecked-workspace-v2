#!/usr/bin/env bash
set -uo pipefail

# Resilient post-start wrapper: best-effort for setup steps, always start services.

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

log() { echo "[post-start] $*"; }
warn() { echo "[post-start] WARN: $*" >&2; }
err()  { echo "[post-start] ERROR: $*" >&2; }

LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"
LOCK_FILE="$LOG_DIR/post-start.lock"

# 0) Prevent duplicate concurrent launches; stale locks are tolerated and overwritten
if [[ -f "$LOCK_FILE" ]]; then
  old_pid=$(cut -d: -f1 "$LOCK_FILE" 2>/dev/null || echo "")
  if [[ -n "${old_pid:-}" ]] && kill -0 "$old_pid" >/dev/null 2>&1; then
    log "Startup already running (pid=$old_pid); skipping."
    exit 0
  fi
fi

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

# 4) Always start application services in background (non-blocking for attach/start hooks)
if [[ -f ".devcontainer/scripts/start-all.sh" ]]; then
  log "Launching all application services in background..."
  # Double-fork background start to detach cleanly
  (
    nohup bash .devcontainer/scripts/start-all.sh >"$LOG_DIR/post-start.out" 2>&1 &
    bg_pid=$!
    echo "$bg_pid:$(date -u +%s)" > "$LOCK_FILE" || true
    disown "$bg_pid" 2>/dev/null || true
  ) >/dev/null 2>&1 &
  log "Start-all launched (see logs/post-start.out)."
  exit 0
else
  err "start-all.sh not found or not executable."
  exit 1
fi
