#!/usr/bin/env bash
# =============================================================================
# script2_clear_image_url.sh — Clear Invalid Canva Link from Image URL Field
#
# Target: Content Calendar record rechVm1hmggAvfvXp
# Actions:
#   1. Clear the "Image URL" text field (removes broken Canva embed links)
#   2. Leave the "Asset" attachment field intact (used by publish pipeline)
#
# Environment Required:
#   AIRTABLE_API_KEY — Airtable personal access token or API key
#
# Usage:
#   export AIRTABLE_API_KEY="pat..."
#   ./script2_clear_image_url.sh
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
  echo "Usage: export AIRTABLE_API_KEY=\"pat...\" && ./script2_clear_image_url.sh"
  exit 1
fi

echo "============================================="
echo "  Coastal Key — Script 2: Clear Image URL"
echo "============================================="
echo "Record:  ${RECORD_ID}"
echo "Action:  Clear 'Image URL' field"
echo "Note:    'Asset' attachment field is NOT affected"
echo "---------------------------------------------"

# ── PATCH the Airtable record — clear Image URL ──
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
  "${AIRTABLE_API}/${AIRTABLE_BASE_ID}/${CONTENT_CALENDAR_TABLE_ID}" \
  -H "Authorization: Bearer ${AIRTABLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"records\": [{
      \"id\": \"${RECORD_ID}\",
      \"fields\": {
        \"Image URL\": \"\"
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
  echo "  Image URL → (cleared)"
  echo "  Asset     → (unchanged)"
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
