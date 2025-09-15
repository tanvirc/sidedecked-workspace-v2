#!/usr/bin/env bash
set -euo pipefail

# Ensure a wrapper credential helper exists that ignores ephemeral Codespaces tokens
BIN_DIR="$HOME/.local/bin"
WRAPPER="$BIN_DIR/gh-cred-noenv"
mkdir -p "$BIN_DIR"
cat > "$WRAPPER" <<'EOS'
#!/usr/bin/env bash
# Wrapper around gh credential helper that ignores Codespaces env tokens
exec env -u GITHUB_TOKEN -u GH_TOKEN /usr/bin/gh auth git-credential "$@"
EOS
chmod +x "$WRAPPER"

# Ensure gh sets up git integration (adds per-host helpers); non-fatal if unavailable
if command -v gh >/dev/null 2>&1; then
  gh auth setup-git >/dev/null 2>&1 || true
fi

# Force GitHub hosts to use the wrapper so env tokens never overshadow stored PAT
git config --global --replace-all credential.https://github.com.helper "$WRAPPER"
git config --global --replace-all credential.https://gist.github.com.helper "$WRAPPER"

# Remove Codespaces system helper so our wrapper takes precedence
if command -v sudo >/dev/null 2>&1; then
  sudo git config --system --unset-all credential.helper 2>/dev/null || true
fi

# Optional: small self-check (non-fatal) to surface obvious issues during start
if command -v gh >/dev/null 2>&1; then
  env -u GITHUB_TOKEN -u GH_TOKEN gh auth status >/dev/null 2>&1 || true
fi

echo "[git-auth] Configured credential helper to use stored gh PAT (ignoring env tokens)."
