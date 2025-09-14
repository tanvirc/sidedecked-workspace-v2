#!/usr/bin/env bash
set -euo pipefail

# Delegate to unified root launcher for a single code path.
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
exec "$ROOT_DIR/scripts/dev/start-all.sh"
