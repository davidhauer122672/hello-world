#!/bin/bash
# CREDENTIAL_LEAK_WATCHDOG
# Scans Claude config/backup paths for exposed credential patterns.
# Designed for macOS. Run daily via launchd.
# Any hit posts to Slack #exec-briefing immediately.
# DOES NOT store or log matched credential values — only file paths and pattern types.

set -euo pipefail

SCAN_PATHS=(
  "$HOME/.claude"
  "$HOME/.anthropic"
)

# Credential patterns — token prefixes and key formats only, not English words
PATTERNS=(
  'sk-ant-[a-zA-Z0-9_-]{20,}'
  'sk-proj-[a-zA-Z0-9_-]{20,}'
  'patU[a-zA-Z0-9]{14}'
  'xoxb-[0-9]{10,}-[a-zA-Z0-9-]+'
  'xoxp-[0-9]{10,}-[a-zA-Z0-9-]+'
  'AKIA[0-9A-Z]{16}'
  'ghp_[a-zA-Z0-9]{36}'
  'gho_[a-zA-Z0-9]{36}'
  'glpat-[a-zA-Z0-9_-]{20,}'
  'sk-[a-zA-Z0-9]{48}'
)

SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
SLACK_CHANNEL="${SLACK_CHANNEL:-#exec-briefing}"
ALERT_TAG="${ALERT_TAG:-@david}"
LOG_DIR="$HOME/.coastal-key/watchdog-logs"
LOG_FILE="$LOG_DIR/credential-scan-$(date +%Y-%m-%d).log"
KNOWN_SAFE_FILE="$HOME/.coastal-key/credential-watchdog-allowlist.txt"

mkdir -p "$LOG_DIR"

COMBINED_PATTERN=$(IFS='|'; echo "${PATTERNS[*]}")

HITS=0
HIT_SUMMARY=""

for SCAN_PATH in "${SCAN_PATHS[@]}"; do
  if [ ! -d "$SCAN_PATH" ]; then
    continue
  fi

  while IFS= read -r line; do
    FILE_PATH=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)

    if [ -f "$KNOWN_SAFE_FILE" ] && grep -qF "$FILE_PATH" "$KNOWN_SAFE_FILE"; then
      continue
    fi

    MATCHED_PATTERN="unknown"
    for p in "${PATTERNS[@]}"; do
      if echo "$line" | grep -qE "$p"; then
        MATCHED_PATTERN="$p"
        break
      fi
    done

    HITS=$((HITS + 1))
    HIT_SUMMARY="${HIT_SUMMARY}\n- ${FILE_PATH}:${LINE_NUM} [${MATCHED_PATTERN%%\\*}...]"
  done < <(grep -rnE "$COMBINED_PATTERN" "$SCAN_PATH" 2>/dev/null || true)
done

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

{
  echo "CREDENTIAL_LEAK_WATCHDOG | $TIMESTAMP"
  echo "Paths scanned: ${SCAN_PATHS[*]}"
  echo "Patterns checked: ${#PATTERNS[@]}"
  echo "Hits: $HITS"
  if [ "$HITS" -gt 0 ]; then
    echo "Hit locations (values NOT logged):"
    echo -e "$HIT_SUMMARY"
  fi
} >> "$LOG_FILE"

if [ "$HITS" -gt 0 ] && [ -n "$SLACK_WEBHOOK_URL" ]; then
  SLACK_MSG="CREDENTIAL LEAK WATCHDOG ALERT | ${ALERT_TAG}\nTimestamp: ${TIMESTAMP}\nHits: ${HITS}\nLocations:${HIT_SUMMARY}\n\nAction required: rotate any credential that has appeared in these paths. Values not logged — inspect files directly."

  curl -s -X POST "$SLACK_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"channel\":\"${SLACK_CHANNEL}\",\"text\":\"$(echo -e "$SLACK_MSG" | sed 's/"/\\"/g')\"}" \
    >/dev/null 2>&1
fi

if [ "$HITS" -eq 0 ]; then
  echo "CREDENTIAL_LEAK_WATCHDOG | $TIMESTAMP | CLEAN | 0 hits"
else
  echo "CREDENTIAL_LEAK_WATCHDOG | $TIMESTAMP | ALERT | $HITS hits — see $LOG_FILE"
  exit 1
fi
