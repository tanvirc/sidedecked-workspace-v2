#!/usr/bin/env bash
set -euo pipefail

echo "[ai] Installing OpenAI and Claude CLIs..."

# Ensure we're at repo root
cd "$(dirname "$0")/.." >/dev/null 2>&1 || true
cd ".." >/dev/null 2>&1 || true

# 1) Ensure package managers are available (features add Node and Python)
if command -v python3 >/dev/null 2>&1; then
  echo "[ai] Upgrading pip and ensuring latest Python SDKs (openai, anthropic)"
  python3 -m pip install --upgrade pip >/dev/null
  python3 -m pip install --upgrade openai anthropic >/dev/null
else
  echo "[ai] WARNING: python3 not found; Python-based CLIs will be unavailable."
fi

if command -v npm >/dev/null 2>&1; then
  echo "[ai] Ensuring latest Node openai package globally"
  npm i -g openai@latest >/dev/null 2>&1 || true
  echo "[ai] Tip: authenticate OpenAI with 'openai login' (or '--no-browser' in headless)."
fi

# 2) Provide a minimal 'claude' CLI shim if none exists
if ! command -v claude >/dev/null 2>&1; then
  echo "[ai] Installing lightweight 'claude' CLI shim"
  # Choose install target for the shim
  TARGET_BIN="/usr/local/bin/claude"
  if ! command -v sudo >/dev/null 2>&1; then
    mkdir -p "$HOME/.local/bin"
    TARGET_BIN="$HOME/.local/bin/claude"
  fi
  INSTALL_CMD=(tee "$TARGET_BIN")
  if command -v sudo >/dev/null 2>&1; then INSTALL_CMD=(sudo "${INSTALL_CMD[@]}"); fi
  "${INSTALL_CMD[@]}" >/dev/null <<'PYCLI'
#!/usr/bin/env python3
import os, sys
try:
    from anthropic import Anthropic
except Exception as e:
    print("ERROR: anthropic package is not installed.\nInstall with: python3 -m pip install anthropic", file=sys.stderr)
    sys.exit(1)

api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    print("ERROR: No Anthropic credentials found.\n"
          "- The anthropic SDK currently requires ANTHROPIC_API_KEY.\n"
          "- Browser login is not supported for CLI usage.\n"
          "- Options: set ANTHROPIC_API_KEY, or use the VS Code 'Claude Code' extension for OAuth-based access.", file=sys.stderr)
    sys.exit(1)

prompt = " ".join(sys.argv[1:]).strip()
if not prompt:
    print("Usage: claude \"your prompt\"", file=sys.stderr)
    sys.exit(1)

client = Anthropic(api_key=api_key)
model = os.getenv("MODEL", "claude-3-5-sonnet-latest")

try:
    msg = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    # Concatenate any text blocks
    out = []
    for block in getattr(msg, 'content', []) or []:
        text = getattr(block, 'text', None)
        if text:
            out.append(text)
    print("".join(out) if out else str(msg))
except Exception as e:
    print(f"Request failed: {e}", file=sys.stderr)
    sys.exit(1)
PYCLI
  chmod +x "$TARGET_BIN" || true
  # Ensure user-local bin is on PATH in current session (devcontainer usually has it)
  if [[ "$TARGET_BIN" == "$HOME/.local/bin/claude" ]]; then
    export PATH="$HOME/.local/bin:$PATH"
  fi
fi

# 3) Print versions if available
echo "[ai] Verifying installations..."
if command -v openai >/dev/null 2>&1; then
  echo -n " - openai CLI: "; openai --version || true
else
  echo " - openai CLI: not found (Python and Node SDKs installed)"
fi

if command -v claude >/dev/null 2>&1; then
  echo " - claude CLI shim: installed"
else
  echo " - claude CLI: not found"
fi

echo "[ai] Ready. For OpenAI, run 'openai login' (device flow in Codespaces)."
echo "[ai] For Anthropic CLI usage, an API key is required; browser login isn't supported."
