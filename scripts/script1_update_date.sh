#!/usr/bin/env bash
# =============================================================================
# script1_update_date.sh — Push Post Date +48 Hours & Reset Status to Draft
#
# Target: Content Calendar record rechVm1hmggAvfvXp
# Actions:
#   1. Calculate date 48 hours from now
#   2. PATCH the Airtable record: Post Date → +48h, Status → Draft
#
# Environment Required:
#   AIRTABLE_API_KEY — Airtable personal access token or API key
#
# Usage:
#   export AIRTABLE_API_KEY="pat..."
#   ./script1_update_date.sh
# =============================================================================

set -euo pipefail

# ── Configuration ──
AIRTABLE_BASE_ID="appUSnNgpDkcEOzhN"
CONTENT_CALENDAR_TABLE_ID="tblEPr4f2lMz6ruxF"
RECORD_ID="rechVm1hmggAvfvXp"
AIRTABLE_API="https://api.airtable.com/v0"

# ── Validate environment ──
if [ -z "${AIRTABLE_API_KEY:-}" ]; then
  echo "ERROR: AIRTABLE_API_KEY is not set."
  echo "Usage: export AIRTABLE_API_KEY=\"pat...\" && ./script1_update_date.sh"
  exit 1
fi

# ── Calculate Post Date (48 hours from now) ──
if date --version >/dev/null 2>&1; then
  # GNU date (Linux)
  NEW_POST_DATE=$(date -u -d "+48 hours" "+%Y-%m-%d")
else
  # BSD date (macOS)
  NEW_POST_DATE=$(date -u -v+48H "+%Y-%m-%d")
fi

echo "============================================="
echo "  Coastal Key — Script 1: Update Post Date"
echo "============================================="
echo "Record:        ${RECORD_ID}"
echo "New Post Date: ${NEW_POST_DATE}"
echo "New Status:    Draft"
echo "---------------------------------------------"

# ── PATCH the Airtable record ──
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
  "${AIRTABLE_API}/${AIRTABLE_BASE_ID}/${CONTENT_CALENDAR_TABLE_ID}" \
  -H "Authorization: Bearer ${AIRTABLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"records\": [{
      \"id\": \"${RECORD_ID}\",
      \"fields\": {
        \"Post Date\": \"${NEW_POST_DATE}\",
        \"Status\": \"Draft\"
      }
    }],
    \"typecast\": true
  }")

# ── Parse response ──
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "SUCCESS (HTTP ${HTTP_CODE})"
  echo ""
  echo "Response:"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  echo ""
  echo "Record ${RECORD_ID} updated:"
  echo "  Post Date → ${NEW_POST_DATE}"
  echo "  Status    → Draft"
  echo "============================================="
  exit 0
else
  echo "FAILED (HTTP ${HTTP_CODE})"
  echo ""
  echo "Error Response:"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  echo "============================================="
  exit 1
fi
