#!/bin/bash
# Disable Cloudflare Workers Builds Git integration for ck-nemotron-worker
# This script uses the Cloudflare API to disconnect the Git-triggered build
# Requires: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables

set -e

ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}"
API_TOKEN="${CLOUDFLARE_API_TOKEN}"
WORKER_NAME="ck-nemotron-worker"
API_BASE="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}"

if [ -z "$ACCOUNT_ID" ] || [ -z "$API_TOKEN" ]; then
  echo "ERROR: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set"
  exit 1
fi

echo "=== Disabling Workers Builds for ${WORKER_NAME} ==="

# Method 1: Try Workers script build settings endpoint
echo "[1/3] Attempting: PATCH script build settings..."
RESP=$(curl -s -w "\n%{http_code}" -X PATCH \
  "${API_BASE}/workers/scripts/${WORKER_NAME}/builds" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}' 2>/dev/null)
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | head -n -1)
echo "  HTTP ${CODE}: $(echo $BODY | head -c 200)"

# Method 2: Try Workers services build config endpoint
echo "[2/3] Attempting: DELETE service build config..."
RESP=$(curl -s -w "\n%{http_code}" -X DELETE \
  "${API_BASE}/workers/services/${WORKER_NAME}/environments/production/builds/config" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" 2>/dev/null)
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | head -n -1)
echo "  HTTP ${CODE}: $(echo $BODY | head -c 200)"

# Method 3: Try build config disable via PATCH
echo "[3/3] Attempting: PATCH service environment build_config..."
RESP=$(curl -s -w "\n%{http_code}" -X PATCH \
  "${API_BASE}/workers/services/${WORKER_NAME}/environments/production" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"build_config":{"enabled":false}}' 2>/dev/null)
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | head -n -1)
echo "  HTTP ${CODE}: $(echo $BODY | head -c 200)"

echo ""
echo "=== Also trying wrangler CLI ==="
# Method 4: Try wrangler builds commands if available
if command -v wrangler &>/dev/null; then
  echo "[wrangler] Checking builds configuration..."
  wrangler builds list --name ${WORKER_NAME} 2>&1 | head -5 || true
  echo "[wrangler] Attempting to disable builds..."
  wrangler builds configure --name ${WORKER_NAME} --disable 2>&1 | head -5 || true
else
  echo "[wrangler] Not installed, skipping CLI methods"
fi

echo ""
echo "=== Done. Check Cloudflare dashboard to verify build integration is disabled ==="
echo "URL: https://dash.cloudflare.com/${ACCOUNT_ID}/workers/services/view/${WORKER_NAME}/production"
