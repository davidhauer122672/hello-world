#!/usr/bin/env bash
# DNS Repair Script for coastalkey-pm.com
# CEO-AUTHORIZED: 2026-05-02
#
# Usage: CLOUDFLARE_EMAIL=david@coastalkey-pm.com CF_API_KEY=<global-api-key> ./scripts/dns-repair.sh
# Or:    CF_API_TOKEN=<dns-edit-token> ./scripts/dns-repair.sh

set -euo pipefail

ZONE_NAME="coastalkey-pm.com"
ACCOUNT_ID="8e596c2b3554fface410e253c0b7d892"

if [ -n "${CF_API_TOKEN:-}" ]; then
  AUTH_HEADER="Authorization: Bearer $CF_API_TOKEN"
elif [ -n "${CF_API_KEY:-}" ] && [ -n "${CLOUDFLARE_EMAIL:-}" ]; then
  AUTH_HEADER="X-Auth-Key: $CF_API_KEY"
  EMAIL_HEADER="X-Auth-Email: $CLOUDFLARE_EMAIL"
else
  echo "Error: Set CF_API_TOKEN or (CF_API_KEY + CLOUDFLARE_EMAIL)"
  exit 1
fi

api() {
  local method=$1 endpoint=$2
  shift 2
  if [ -n "${EMAIL_HEADER:-}" ]; then
    curl -s -X "$method" "https://api.cloudflare.com/client/v4$endpoint" \
      -H "$AUTH_HEADER" -H "$EMAIL_HEADER" -H "Content-Type: application/json" "$@"
  else
    curl -s -X "$method" "https://api.cloudflare.com/client/v4$endpoint" \
      -H "$AUTH_HEADER" -H "Content-Type: application/json" "$@"
  fi
}

echo "=== Coastal Key DNS Repair ==="
echo "Zone: $ZONE_NAME"
echo ""

# Step 1: Find zone
echo "[1/4] Looking up zone..."
ZONE_RESP=$(api GET "/zones?name=$ZONE_NAME&account.id=$ACCOUNT_ID")
ZONE_ID=$(echo "$ZONE_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ZONE_ID" ]; then
  echo "Zone not found. Creating..."
  CREATE_RESP=$(api POST "/zones" -d "{\"name\":\"$ZONE_NAME\",\"account\":{\"id\":\"$ACCOUNT_ID\"},\"jump_start\":true}")
  ZONE_ID=$(echo "$CREATE_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "Zone created: $ZONE_ID"
else
  echo "Zone found: $ZONE_ID"
fi

STATUS=$(echo "$ZONE_RESP" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Zone status: $STATUS"

# Step 2: Add Microsoft 365 email records
echo ""
echo "[2/4] Adding Microsoft 365 DNS records..."

add_record() {
  local type=$1 name=$2 content=$3 priority=${4:-}
  local data="{\"type\":\"$type\",\"name\":\"$name\",\"content\":\"$content\",\"ttl\":1,\"proxied\":false"
  if [ -n "$priority" ]; then
    data="$data,\"priority\":$priority"
  fi
  data="$data}"

  RESP=$(api POST "/zones/$ZONE_ID/dns_records" -d "$data")
  SUCCESS=$(echo "$RESP" | grep -o '"success":true' || true)
  if [ -n "$SUCCESS" ]; then
    echo "  + $type $name -> $content"
  else
    ERROR=$(echo "$RESP" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "  ~ $type $name: $ERROR (may already exist)"
  fi
}

add_record "MX" "$ZONE_NAME" "coastalkey-pm-com.mail.protection.outlook.com" 0
add_record "TXT" "$ZONE_NAME" "v=spf1 include:spf.protection.outlook.com -all"
add_record "CNAME" "autodiscover" "autodiscover.outlook.com"
add_record "CNAME" "selector1._domainkey" "selector1-coastalkey-pm-com._domainkey.coastalkeypm.onmicrosoft.com"
add_record "CNAME" "selector2._domainkey" "selector2-coastalkey-pm-com._domainkey.coastalkeypm.onmicrosoft.com"
add_record "TXT" "_dmarc.$ZONE_NAME" "v=DMARC1; p=quarantine; rua=mailto:dmarc@$ZONE_NAME"

# Step 3: Verify nameservers
echo ""
echo "[3/4] Checking nameservers..."
NS=$(api GET "/zones/$ZONE_ID" | grep -o '"name_servers":\[[^]]*\]' || echo "Unable to retrieve")
echo "  Cloudflare nameservers: $NS"
echo "  Ensure GoDaddy points to these nameservers."

# Step 4: Verify
echo ""
echo "[4/4] Verifying records..."
RECORDS=$(api GET "/zones/$ZONE_ID/dns_records?type=MX")
MX_COUNT=$(echo "$RECORDS" | grep -o '"type":"MX"' | wc -l)
echo "  MX records found: $MX_COUNT"

echo ""
echo "=== DNS Repair Complete ==="
echo "Next: Wait 5-10 minutes for propagation, then send a test email to david@coastalkey-pm.com"
