#!/usr/bin/env bash
# verify-wireframes.sh — Consistency checks for SideDecked storefront wireframes.
# Run from workspace root or from docs/plans/wireframes/.
set -euo pipefail

# Resolve wireframe directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WF_DIR="$SCRIPT_DIR"

PASS=0
FAIL=0

pass() { echo "  ✅ PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "  ❌ FAIL: $1"; FAIL=$((FAIL + 1)); }

echo "=== SideDecked Wireframe Verification ==="
echo ""

# -----------------------------------------------------------
# CHECK 1: Total wireframe file count >= 12 (will be 33 at slice end)
# -----------------------------------------------------------
echo "[1] Wireframe file count"
COUNT=$(ls "$WF_DIR"/storefront-*.html 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -ge 33 ]; then
  pass "Found $COUNT storefront wireframes (>= 33 required)"
else
  fail "Found $COUNT storefront wireframes (need >= 33)"
fi

# -----------------------------------------------------------
# CHECK 2: Every storefront-*.html contains capture.js script tag
# -----------------------------------------------------------
echo "[2] capture.js present in all wireframes"
MISSING_CAPTURE=""
for f in "$WF_DIR"/storefront-*.html; do
  if ! grep -q 'capture\.js' "$f"; then
    MISSING_CAPTURE="$MISSING_CAPTURE $(basename "$f")"
  fi
done
if [ -z "$MISSING_CAPTURE" ]; then
  pass "All wireframes include capture.js"
else
  fail "Missing capture.js in:$MISSING_CAPTURE"
fi

# -----------------------------------------------------------
# CHECK 3: Every storefront-*.html contains :root with --brand-primary: #8B5CF6
# -----------------------------------------------------------
echo "[3] :root token block with --brand-primary: #8B5CF6"
MISSING_ROOT=""
for f in "$WF_DIR"/storefront-*.html; do
  if ! grep -q '\-\-brand-primary: #8B5CF6' "$f"; then
    MISSING_ROOT="$MISSING_ROOT $(basename "$f")"
  fi
done
if [ -z "$MISSING_ROOT" ]; then
  pass "All wireframes have correct --brand-primary token"
else
  fail "Missing/wrong --brand-primary in:$MISSING_ROOT"
fi

# -----------------------------------------------------------
# CHECK 4: Files that should have sd-nav.js do contain it
# Checkout and auth wireframes are excluded from requiring sd-nav.
# -----------------------------------------------------------
echo "[4] sd-nav.js presence"
NAV_EXCLUDED="storefront-checkout.html storefront-auth.html storefront-verify-email.html storefront-reset-password.html"
MISSING_NAV=""
for f in "$WF_DIR"/storefront-*.html; do
  BASENAME=$(basename "$f")
  # Skip files that intentionally lack nav
  SKIP=false
  for ex in $NAV_EXCLUDED; do
    if [ "$BASENAME" = "$ex" ]; then SKIP=true; fi
  done
  if [ "$SKIP" = false ]; then
    if ! grep -q 'sd-nav\.js' "$f"; then
      MISSING_NAV="$MISSING_NAV $BASENAME"
    fi
  fi
done
# Also verify checkout does NOT have sd-nav
CHECKOUT_HAS_NAV=false
if [ -f "$WF_DIR/storefront-checkout.html" ]; then
  if grep -q 'sd-nav\.js' "$WF_DIR/storefront-checkout.html"; then
    CHECKOUT_HAS_NAV=true
  fi
fi

if [ -z "$MISSING_NAV" ] && [ "$CHECKOUT_HAS_NAV" = false ]; then
  pass "sd-nav.js present where expected, absent where excluded"
else
  if [ -n "$MISSING_NAV" ]; then
    fail "Missing sd-nav.js in:$MISSING_NAV"
  fi
  if [ "$CHECKOUT_HAS_NAV" = true ]; then
    fail "storefront-checkout.html should NOT contain sd-nav.js"
  fi
fi

# -----------------------------------------------------------
# CHECK 5: No divergent token values for key tokens
# -----------------------------------------------------------
echo "[5] Token consistency (--bg-base, --text-primary)"
BG_BASE_DIVERGENT=""
TEXT_PRIMARY_DIVERGENT=""
for f in "$WF_DIR"/storefront-*.html; do
  # Check --bg-base should be #09090F
  if grep -q '\-\-bg-base:' "$f"; then
    if ! grep -q '\-\-bg-base: #09090F' "$f"; then
      BG_BASE_DIVERGENT="$BG_BASE_DIVERGENT $(basename "$f")"
    fi
  fi
  # Check --text-primary should be #F0EEFF
  if grep -q '\-\-text-primary:' "$f"; then
    if ! grep -q '\-\-text-primary: #F0EEFF' "$f"; then
      TEXT_PRIMARY_DIVERGENT="$TEXT_PRIMARY_DIVERGENT $(basename "$f")"
    fi
  fi
done
if [ -z "$BG_BASE_DIVERGENT" ] && [ -z "$TEXT_PRIMARY_DIVERGENT" ]; then
  pass "Key tokens are consistent across all wireframes"
else
  if [ -n "$BG_BASE_DIVERGENT" ]; then
    fail "Divergent --bg-base in:$BG_BASE_DIVERGENT"
  fi
  if [ -n "$TEXT_PRIMARY_DIVERGENT" ]; then
    fail "Divergent --text-primary in:$TEXT_PRIMARY_DIVERGENT"
  fi
fi

# -----------------------------------------------------------
# SUMMARY
# -----------------------------------------------------------
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
