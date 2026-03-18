#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# CKPM Inference Router — Deploy Gate
# ---------------------------------------------------------------------------
# This script enforces pre-deployment checks before pushing the inference
# routing Worker to production:
#
#   1. Anthropic Tier Confirmation (Tier 3 minimum)
#   2. Model string verification (claude-sonnet-4-6)
#   3. Required secrets (including ANTHROPIC_TIER_CONFIRMED)
#   4. Durable Object migration awareness
#
# Usage:
#   ./scripts/deploy.sh [staging|production]
# ---------------------------------------------------------------------------

set -euo pipefail

ENV="${1:-staging}"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "============================================================"
echo "  CKPM Inference Router — Pre-Deploy Checklist"
echo "  Target environment: ${ENV}"
echo "============================================================"
echo ""

# ---------------------------------------------------------------------------
# CHECK 1: Anthropic Tier Confirmation
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[CHECK 1/4] Anthropic API Tier Confirmation${NC}"
echo ""
echo "  The fallback path routes to the Anthropic API (claude-sonnet-4-6)."
echo "  Under any meaningful load, accounts below Tier 3 will hit rate limits."
echo ""
echo "  Tier 3 provides:"
echo "    - 4,000 requests/min for Sonnet-class models"
echo "    - Sufficient headroom for 3-module fallback traffic"
echo ""
echo "  Verify your tier at: https://console.anthropic.com/settings/limits"
echo ""

read -p "  Have you confirmed your Anthropic account is Tier 3 or above? [y/N] " tier_answer
if [[ "${tier_answer}" != "y" && "${tier_answer}" != "Y" ]]; then
  echo -e "  ${RED}BLOCKED: Tier confirmation required. Aborting deploy.${NC}"
  echo "  Visit https://console.anthropic.com/settings/limits to check your tier."
  exit 1
fi
echo -e "  ${GREEN}PASS: Tier 3+ confirmed by operator.${NC}"
echo ""

# ---------------------------------------------------------------------------
# CHECK 2: Model String Verification
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[CHECK 2/4] Fallback Model String${NC}"
echo ""

MODEL_IN_CONFIG=$(grep 'FALLBACK_MODEL' ../wrangler.toml | head -1 | sed 's/.*= *"//' | sed 's/".*//')
echo "  Model in wrangler.toml: ${MODEL_IN_CONFIG}"

if [[ "${MODEL_IN_CONFIG}" == "claude-sonnet-4-20250514" ]]; then
  echo -e "  ${RED}WARNING: wrangler.toml still references base Sonnet 4 (claude-sonnet-4-20250514).${NC}"
  echo "  The current production model is claude-sonnet-4-6."
  echo "  Both share the same rate-limit pool, but claude-sonnet-4-6 is the supported version."
  read -p "  Continue with claude-sonnet-4-20250514 anyway? [y/N] " model_answer
  if [[ "${model_answer}" != "y" && "${model_answer}" != "Y" ]]; then
    echo -e "  ${RED}BLOCKED: Update FALLBACK_MODEL in wrangler.toml to claude-sonnet-4-6.${NC}"
    exit 1
  fi
elif [[ "${MODEL_IN_CONFIG}" == "claude-sonnet-4-6" ]]; then
  echo -e "  ${GREEN}PASS: Fallback model is claude-sonnet-4-6 (current production).${NC}"
else
  echo -e "  ${YELLOW}NOTE: Non-standard model string detected: ${MODEL_IN_CONFIG}${NC}"
  read -p "  Continue? [y/N] " custom_answer
  if [[ "${custom_answer}" != "y" && "${custom_answer}" != "Y" ]]; then
    exit 1
  fi
fi
echo ""

# ---------------------------------------------------------------------------
# CHECK 3: Required Secrets
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[CHECK 3/4] Required Wrangler Secrets${NC}"
echo ""
echo "  The following secrets must be set before deploy:"
echo ""
echo "    ANTHROPIC_API_KEY           — Anthropic API key"
echo "    AIRTABLE_API_KEY            — Airtable personal access token"
echo "    WORKER_AUTH_TOKEN            — Bearer token for /inference endpoint"
echo "    ANTHROPIC_TIER_CONFIRMED     — Set to 'true' after Tier 3 verification"
echo ""
echo "  Set each via:  wrangler secret put <SECRET_NAME>"
echo ""

read -p "  Have all four secrets been set via 'wrangler secret put'? [y/N] " secrets_answer
if [[ "${secrets_answer}" != "y" && "${secrets_answer}" != "Y" ]]; then
  echo -e "  ${RED}BLOCKED: Set all required secrets before deploying.${NC}"
  echo ""
  echo "  Run:"
  echo "    wrangler secret put ANTHROPIC_API_KEY"
  echo "    wrangler secret put AIRTABLE_API_KEY"
  echo "    wrangler secret put WORKER_AUTH_TOKEN"
  echo "    wrangler secret put ANTHROPIC_TIER_CONFIRMED"
  exit 1
fi
echo -e "  ${GREEN}PASS: Secrets confirmed by operator.${NC}"
echo ""

# ---------------------------------------------------------------------------
# CHECK 4: Durable Object Migration
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[CHECK 4/4] Durable Object Migration${NC}"
echo ""
echo "  This Worker uses a Durable Object (FallbackQueueCoordinator) to"
echo "  serialize fallback requests across concurrent isolates."
echo ""
echo "  On first deploy, Wrangler will run the migration tagged 'v1' to"
echo "  create the FallbackQueueCoordinator class. This is automatic."
echo ""
echo "  If you are redeploying after a class rename or structural change,"
echo "  you may need to add a new migration tag in wrangler.toml."
echo ""

read -p "  Acknowledged? [y/N] " do_answer
if [[ "${do_answer}" != "y" && "${do_answer}" != "Y" ]]; then
  echo -e "  ${RED}BLOCKED: Acknowledge Durable Object migration before deploying.${NC}"
  exit 1
fi
echo -e "  ${GREEN}PASS: Durable Object migration acknowledged.${NC}"
echo ""

# ---------------------------------------------------------------------------
# DEPLOY
# ---------------------------------------------------------------------------
echo "============================================================"
echo -e "  ${GREEN}All checks passed. Deploying to ${ENV}...${NC}"
echo "============================================================"
echo ""

if [[ "${ENV}" == "production" ]]; then
  npx wrangler deploy --env production
else
  npx wrangler deploy
fi

echo ""
echo -e "${GREEN}Deploy complete.${NC}"
echo "  Health check:   curl https://ckpm-inference-router.<subdomain>.workers.dev/health"
echo "  Tier check:     curl https://ckpm-inference-router.<subdomain>.workers.dev/tier-check"
echo "  Queue status:   curl https://ckpm-inference-router.<subdomain>.workers.dev/queue-status"
