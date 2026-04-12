#!/usr/bin/env bash
# =============================================================================
# production-loop-setup.sh — One-Shot Production Loop Closure
#
# Executes all automatable steps to close the Coastal Key production loop.
# CEO runs this once after providing credentials.
#
# Prerequisites:
#   - AIRTABLE_API_KEY set in environment
#   - SLACK_BOT_TOKEN set in environment (xoxb-...)
#   - curl and jq available
#
# Usage:
#   export AIRTABLE_API_KEY="pat..."
#   export SLACK_BOT_TOKEN="xoxb-..."
#   ./scripts/production-loop-setup.sh
# =============================================================================

set -euo pipefail

AIRTABLE_BASE_ID="appUSnNgpDkcEOzhN"
CONTENT_CALENDAR_TABLE_ID="tblEPr4f2lMz6ruxF"
GATEWAY_URL="https://ck-api-gateway.david-e59.workers.dev"

echo "============================================="
echo "  COASTAL KEY — Production Loop Closure"
echo "  Sovereign Operations Deployment"
echo "============================================="
echo ""

PASS=0
FAIL=0
SKIP=0

check() {
  local label="$1"
  local result="$2"
  if [ "$result" = "ok" ]; then
    echo "  [PASS] $label"
    PASS=$((PASS + 1))
  elif [ "$result" = "skip" ]; then
    echo "  [SKIP] $label — requires CEO action"
    SKIP=$((SKIP + 1))
  else
    echo "  [FAIL] $label — $result"
    FAIL=$((FAIL + 1))
  fi
}

# ── Step 1: Meta Ads OAuth ──────────────────────────────────────────────────
echo "Step 1: Meta Ads Connector"
if [ -n "${META_PAGE_ACCESS_TOKEN:-}" ]; then
  META_CHECK=$(curl -s "https://graph.facebook.com/v19.0/me?access_token=${META_PAGE_ACCESS_TOKEN}" | grep -c '"id"' 2>/dev/null || echo "0")
  if [ "$META_CHECK" -gt 0 ]; then
    check "Meta Ads OAuth token valid" "ok"
  else
    check "Meta Ads OAuth token" "Token expired or invalid — re-authorize at business.facebook.com"
  fi
else
  check "Meta Ads OAuth" "skip"
fi

# ── Step 2: Buffer Account ──────────────────────────────────────────────────
echo ""
echo "Step 2: Buffer Account"
if [ -n "${BUFFER_ACCESS_TOKEN:-}" ]; then
  BUFFER_CHECK=$(curl -s "https://api.bufferapp.com/1/profiles.json?access_token=${BUFFER_ACCESS_TOKEN}" | grep -c '"service"' 2>/dev/null || echo "0")
  if [ "$BUFFER_CHECK" -gt 0 ]; then
    check "Buffer account connected" "ok"
    echo "         Connected profiles: $BUFFER_CHECK"
  else
    check "Buffer API" "Token invalid or no profiles connected"
  fi
else
  check "Buffer account" "skip"
fi

# ── Step 3: Airtable WF-2 Automation ───────────────────────────────────────
echo ""
echo "Step 3: Airtable WF-2 Content Publish Trigger"
if [ -n "${AIRTABLE_API_KEY:-}" ]; then
  # Verify Content Calendar table is accessible
  AT_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CONTENT_CALENDAR_TABLE_ID}?maxRecords=1" \
    -H "Authorization: Bearer ${AIRTABLE_API_KEY}")
  if [ "$AT_CHECK" = "200" ]; then
    check "Content Calendar table accessible" "ok"
    echo ""
    echo "  ACTION REQUIRED: Create Airtable Automation manually:"
    echo "  1. Open Airtable → Content Calendar table"
    echo "  2. Automations → New automation"
    echo "  3. Trigger: When record matches conditions"
    echo "  4. Condition: Status = 'Approved'"
    echo "  5. Action: Send webhook"
    echo "  6. URL: ${GATEWAY_URL}/v1/content/publish"
    echo "  7. Method: POST"
    echo "  8. Headers: Authorization: Bearer {WORKER_AUTH_TOKEN}"
    echo "  9. Body: {\"recordId\": \"{Record ID}\"}"
    echo "  10. Enable the automation"
    SKIP=$((SKIP + 1))
  else
    check "Airtable Content Calendar" "HTTP $AT_CHECK — check AIRTABLE_API_KEY"
  fi
else
  check "Airtable API key" "skip"
fi

# ── Step 4: Express Server Health ───────────────────────────────────────────
echo ""
echo "Step 4: Express Server Deployment"
echo "  render.yaml is configured for Render.com deployment."
echo "  To deploy:"
echo "    1. Go to https://dashboard.render.com"
echo "    2. New → Web Service → Connect your GitHub repo"
echo "    3. Select 'hello-world' repository"
echo "    4. Render auto-detects render.yaml"
echo "    5. Set all environment variables (sync: false items)"
echo "    6. Deploy"
SKIP=$((SKIP + 1))

# ── Step 5: Data File Initialization ────────────────────────────────────────
echo ""
echo "Step 5: Initialize Missing Data Files"
DATA_DIR="data"
INITIALIZED=0

for FILE in content-calendar.json drip-sequences.json visual-briefs.json call-logs.json ai-log.json; do
  FILEPATH="${DATA_DIR}/${FILE}"
  if [ ! -f "$FILEPATH" ]; then
    echo "[]" > "$FILEPATH"
    echo "  Created: $FILEPATH"
    INITIALIZED=$((INITIALIZED + 1))
  fi
done

if [ "$INITIALIZED" -gt 0 ]; then
  check "Initialized $INITIALIZED data files" "ok"
else
  check "All data files exist" "ok"
fi

# ── Step 6: API Gateway Health ──────────────────────────────────────────────
echo ""
echo "Step 6: API Gateway Health Check"
GW_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${GATEWAY_URL}/v1/health" 2>/dev/null || echo "000")
if [ "$GW_CHECK" = "200" ]; then
  check "API Gateway reachable" "ok"
  GW_DATA=$(curl -s "${GATEWAY_URL}/v1/health" 2>/dev/null)
  echo "         Status: $(echo "$GW_DATA" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("status","unknown"))' 2>/dev/null || echo 'unknown')"
else
  check "API Gateway" "HTTP $GW_CHECK — gateway may be down"
fi

# ── Step 8: Slack Channel Check ─────────────────────────────────────────────
echo ""
echo "Step 8: Slack Channel Verification"
if [ -n "${SLACK_BOT_TOKEN:-}" ]; then
  REQUIRED_CHANNELS=("content-calendar" "ai-drafts" "content-production" "ceo-dashboard" "sales-alerts-high-value")

  EXISTING=$(curl -s "https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=200" \
    -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" 2>/dev/null | python3 -c '
import sys, json
data = json.load(sys.stdin)
if data.get("ok"):
    for ch in data.get("channels", []):
        print(ch["name"])
' 2>/dev/null || echo "")

  for CH in "${REQUIRED_CHANNELS[@]}"; do
    if echo "$EXISTING" | grep -q "^${CH}$"; then
      check "#${CH}" "ok"
    else
      # Attempt to create the channel
      CREATE_RESULT=$(curl -s -X POST "https://slack.com/api/conversations.create" \
        -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"${CH}\", \"is_private\": false}" 2>/dev/null)

      CREATED=$(echo "$CREATE_RESULT" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("ok", False))' 2>/dev/null || echo "False")

      if [ "$CREATED" = "True" ]; then
        check "#${CH} — CREATED" "ok"
      else
        ERROR=$(echo "$CREATE_RESULT" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("error", "unknown"))' 2>/dev/null || echo "unknown")
        check "#${CH}" "Could not create: $ERROR"
      fi
    fi
  done
else
  check "Slack channels" "skip"
fi

# ── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "============================================="
echo "  PRODUCTION LOOP STATUS"
echo "============================================="
echo "  PASS: $PASS"
echo "  FAIL: $FAIL"
echo "  SKIP: $SKIP (require CEO credentials)"
echo "============================================="

if [ "$FAIL" -eq 0 ]; then
  echo "  All automatable steps PASSED."
  echo "  Complete SKIP items to close the loop."
else
  echo "  $FAIL items need attention before launch."
fi

echo ""
echo "  Next: CEO completes SKIP items, then:"
echo "  → Merge branch to main (triggers CI/CD)"
echo "  → AUTHORIZE SOVEREIGN OPERATIONS"
echo "============================================="

exit "$FAIL"
