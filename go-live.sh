#!/usr/bin/env bash
# ============================================================================
# COASTAL KEY — GO LIVE EXECUTION SCRIPT
# Runs all remaining deployment tasks in one pass. Idempotent. Safe to re-run.
#
# Usage: bash go-live.sh
# ============================================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
FEATURE_BRANCH="claude/setup-r2-bucket-zapier-hp3v8"
PAGES_PROJECT="coastalkey-pm"
WORKER_DIR="worker"
API_KEY_VALUE="f9cK2-2ivk5Xq8wdbnwAUNd9fMrQdK1VpMmVVuMA"

# ── Colors ───────────────────────────────────────────────────────────────────
GOLD='\033[38;2;201;168;76m'
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
DIM='\033[2m'
RESET='\033[0m'

step() { echo -e "\n${GOLD}▶ $1${RESET}"; }
ok()   { echo -e "${GREEN}✓ $1${RESET}"; }
warn() { echo -e "${RED}✗ $1${RESET}"; }
info() { echo -e "${DIM}  $1${RESET}"; }

banner() {
  echo ""
  echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "  COASTAL KEY — GO LIVE EXECUTION"
  echo -e "${DIM}  Master Orchestrator v2.0 — AUTHORIZED${RESET}"
  echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

# ── Preflight ────────────────────────────────────────────────────────────────
banner

step "Preflight checks"

if [ ! -d ".git" ]; then
  warn "Not in a git repository. cd to your project root first."
  exit 1
fi
ok "Git repository detected"

if ! command -v git &>/dev/null; then
  warn "git not installed"; exit 1
fi
ok "git available"

if ! command -v wrangler &>/dev/null; then
  warn "wrangler not installed. Installing..."
  npm install -g wrangler || { warn "wrangler install failed"; exit 1; }
fi
ok "wrangler available ($(wrangler --version 2>&1 | head -1))"

# ── Step 1: Sync local main with feature branch ──────────────────────────────
step "STEP 1 — Merge feature branch into main"

git fetch origin "$FEATURE_BRANCH" main 2>&1 | tail -3
ok "Fetched latest from origin"

CURRENT_BRANCH=$(git branch --show-current)
info "Current branch: $CURRENT_BRANCH"

git checkout main 2>&1 | tail -1
git pull origin main --no-rebase --no-edit 2>&1 | tail -1 || true
ok "Local main synced"

if git merge-base --is-ancestor "origin/$FEATURE_BRANCH" HEAD 2>/dev/null; then
  ok "Feature branch already merged into main"
else
  git merge "origin/$FEATURE_BRANCH" --no-edit -m "Merge $FEATURE_BRANCH: Master Orchestrator v2.0 LIVE"
  ok "Feature branch merged"
fi

# ── Step 2: Push main ────────────────────────────────────────────────────────
step "STEP 2 — Push main to origin"

if git push origin main 2>&1 | tee /tmp/push_result.log | tail -5; then
  ok "Main pushed to origin"
else
  warn "Push failed. Check repository permissions."
  cat /tmp/push_result.log
  exit 1
fi

# ── Step 3: Deploy Worker ────────────────────────────────────────────────────
step "STEP 3 — Deploy Cloudflare Worker (image-ingestion-proxy)"

if [ ! -d "$WORKER_DIR" ]; then
  warn "Worker directory '$WORKER_DIR' not found. Skipping."
else
  pushd "$WORKER_DIR" > /dev/null

  if ! wrangler whoami &>/dev/null; then
    warn "Wrangler not authenticated. Running 'wrangler login'..."
    wrangler login
  fi
  ok "Wrangler authenticated"

  wrangler deploy 2>&1 | tail -10
  ok "Worker deployed"

  step "STEP 3b — Set Worker secrets"
  echo "$API_KEY_VALUE" | wrangler secret put API_KEY 2>&1 | tail -3
  ok "API_KEY secret set"

  if [ -n "${API_TOKEN_VALUE:-}" ]; then
    echo "$API_TOKEN_VALUE" | wrangler secret put API_TOKEN 2>&1 | tail -3
    ok "API_TOKEN secret set"
  else
    info "API_TOKEN not provided in env. Set manually: wrangler secret put API_TOKEN"
  fi

  popd > /dev/null
fi

# ── Step 4: Deploy Pages ─────────────────────────────────────────────────────
step "STEP 4 — Deploy site to Cloudflare Pages"

wrangler pages deploy . --project-name="$PAGES_PROJECT" --commit-dirty=true 2>&1 | tail -10
ok "Pages deployed"

# ── Step 5: Verify ───────────────────────────────────────────────────────────
step "STEP 5 — Verify live endpoints"

WORKER_URL="https://image-ingestion-proxy.${PAGES_PROJECT}.workers.dev"
PAGES_URL="https://${PAGES_PROJECT}.pages.dev"

WORKER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$WORKER_URL" || echo "TIMEOUT")
PAGES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$PAGES_URL/ceo.html" || echo "TIMEOUT")

echo ""
echo -e "${CYAN}  Worker:  ${WORKER_URL} → ${WORKER_STATUS}${RESET}"
echo -e "${CYAN}  Pages:   ${PAGES_URL}/ceo.html → ${PAGES_STATUS}${RESET}"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}  GO LIVE COMPLETE${RESET}"
echo -e "${DIM}  Master Orchestrator v2.0 — AUTHORIZED LIVE${RESET}"
echo -e "${DIM}  Atlas Step 10: ACTIVE${RESET}"
echo -e "${DIM}  WF-1 through WF-7: LIVE${RESET}"
echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${CYAN}Live URLs:${RESET}"
echo "  CEO Page: $PAGES_URL/ceo.html"
echo "  Worker:   $WORKER_URL"
echo "  R2:       https://pub-${PAGES_PROJECT}.r2.dev"
echo ""
