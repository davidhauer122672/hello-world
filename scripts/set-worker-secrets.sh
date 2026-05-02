#!/usr/bin/env bash
# Set Cloudflare Worker Secrets for ck-api-gateway
# CEO-AUTHORIZED: 2026-05-02
#
# Usage: CF_API_TOKEN=<token> ./scripts/set-worker-secrets.sh
#
# Required: API token with Workers Scripts: Edit permission
# Account ID: 8e596c2b3554fface410e253c0b7d892

set -euo pipefail

ACCOUNT_ID="8e596c2b3554fface410e253c0b7d892"
WORKER_NAME="ck-api-gateway"

if [ -z "${CF_API_TOKEN:-}" ]; then
  echo "Error: Set CF_API_TOKEN environment variable"
  echo "Generate at: https://dash.cloudflare.com/profile/api-tokens"
  echo "Required permission: Workers Scripts: Edit"
  exit 1
fi

echo "=== Set Cloudflare Worker Secrets ==="
echo "Worker: $WORKER_NAME"
echo "Account: $ACCOUNT_ID"
echo ""

# Verify token first
echo "[1/5] Verifying API token..."
VERIFY=$(curl -s -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/user/tokens/verify")
SUCCESS=$(echo "$VERIFY" | grep -o '"success":true' || true)
if [ -z "$SUCCESS" ]; then
  echo "Error: API token is invalid or lacks required permissions."
  echo "Response: $VERIFY"
  exit 1
fi
echo "  Token verified."

set_secret() {
  local name=$1 value=$2
  RESP=$(curl -s -X PUT \
    "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/scripts/$WORKER_NAME/secrets" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\",\"text\":\"$value\",\"type\":\"secret_text\"}")
  SUCCESS=$(echo "$RESP" | grep -o '"success":true' || true)
  if [ -n "$SUCCESS" ]; then
    echo "  + $name: SET"
  else
    ERROR=$(echo "$RESP" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "  x $name: FAILED - $ERROR"
  fi
}

# Prompt for each secret
echo ""
echo "[2/5] Setting WORKER_AUTH_TOKEN..."
if [ -n "${WORKER_AUTH_TOKEN:-}" ]; then
  set_secret "WORKER_AUTH_TOKEN" "$WORKER_AUTH_TOKEN"
else
  echo "  Skipped (set WORKER_AUTH_TOKEN env var to include)"
fi

echo "[3/5] Setting SLACK_WEBHOOK_URL..."
if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
  set_secret "SLACK_WEBHOOK_URL" "$SLACK_WEBHOOK_URL"
else
  echo "  Skipped (set SLACK_WEBHOOK_URL env var to include)"
fi

echo "[4/5] Setting ANTHROPIC_API_KEY..."
if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  set_secret "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY"
else
  echo "  Skipped (set ANTHROPIC_API_KEY env var to include)"
fi

echo "[5/5] Setting AIRTABLE_API_KEY..."
if [ -n "${AIRTABLE_API_KEY:-}" ]; then
  set_secret "AIRTABLE_API_KEY" "$AIRTABLE_API_KEY"
else
  echo "  Skipped (set AIRTABLE_API_KEY env var to include)"
fi

echo ""
echo "=== Complete ==="
echo "To set all secrets at once:"
echo "  CF_API_TOKEN=<token> WORKER_AUTH_TOKEN=<val> SLACK_WEBHOOK_URL=<val> \\"
echo "  ANTHROPIC_API_KEY=<val> AIRTABLE_API_KEY=<val> ./scripts/set-worker-secrets.sh"
