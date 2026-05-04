#!/bin/bash
# APP_SUPPORT_INTEGRITY_WATCHDOG
# Weekly diff of ~/Library/Application Support/ against a known-good baseline.
# Any new third-party integration directory triggers a review alert.
# Designed for macOS. Run weekly via launchd.

set -euo pipefail

APP_SUPPORT_DIR="$HOME/Library/Application Support"
BASELINE_DIR="$HOME/.coastal-key/baselines"
BASELINE_FILE="$BASELINE_DIR/app-support-baseline.txt"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
SLACK_CHANNEL="${SLACK_CHANNEL:-#exec-briefing}"
ALERT_TAG="${ALERT_TAG:-@david}"
LOG_DIR="$HOME/.coastal-key/watchdog-logs"
LOG_FILE="$LOG_DIR/app-support-integrity-$(date +%Y-%m-%d).log"

mkdir -p "$LOG_DIR" "$BASELINE_DIR"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

CURRENT_SNAPSHOT=$(mktemp)
find "$APP_SUPPORT_DIR" -maxdepth 1 -type d 2>/dev/null | sort > "$CURRENT_SNAPSHOT"

if [ ! -f "$BASELINE_FILE" ]; then
  cp "$CURRENT_SNAPSHOT" "$BASELINE_FILE"
  {
    echo "APP_SUPPORT_INTEGRITY_WATCHDOG | $TIMESTAMP"
    echo "BASELINE CREATED — $(wc -l < "$BASELINE_FILE") directories recorded"
    echo "Path: $BASELINE_FILE"
    echo "Review this baseline and remove any entries you do not recognize."
  } >> "$LOG_FILE"
  echo "APP_SUPPORT_INTEGRITY_WATCHDOG | $TIMESTAMP | BASELINE CREATED | $(wc -l < "$BASELINE_FILE") dirs"
  rm "$CURRENT_SNAPSHOT"
  exit 0
fi

NEW_DIRS=$(comm -13 "$BASELINE_FILE" "$CURRENT_SNAPSHOT")
REMOVED_DIRS=$(comm -23 "$BASELINE_FILE" "$CURRENT_SNAPSHOT")

NEW_COUNT=$(echo "$NEW_DIRS" | grep -c . 2>/dev/null || echo 0)
REMOVED_COUNT=$(echo "$REMOVED_DIRS" | grep -c . 2>/dev/null || echo 0)

FLAGGED=""
FLAGGED_COUNT=0

KNOWN_VENDORS=(
  "Apple" "Google" "Microsoft" "Adobe" "Slack" "zoom.us" "Discord"
  "Firefox" "Chrome" "Brave" "Safari" "Code" "JetBrains"
  "Cloudflare" "1Password" "Keychain" "com.apple"
)

while IFS= read -r dir; do
  [ -z "$dir" ] && continue
  DIR_NAME=$(basename "$dir")
  IS_KNOWN=false
  for vendor in "${KNOWN_VENDORS[@]}"; do
    if echo "$DIR_NAME" | grep -qi "$vendor"; then
      IS_KNOWN=true
      break
    fi
  done
  if [ "$IS_KNOWN" = false ]; then
    CREATED=$(stat -f "%SB" -t "%Y-%m-%d" "$dir" 2>/dev/null || echo "unknown")
    FLAGGED="${FLAGGED}\n- ${DIR_NAME} (created: ${CREATED})"
    FLAGGED_COUNT=$((FLAGGED_COUNT + 1))
  fi
done <<< "$NEW_DIRS"

{
  echo "APP_SUPPORT_INTEGRITY_WATCHDOG | $TIMESTAMP"
  echo "Baseline: $(wc -l < "$BASELINE_FILE") dirs | Current: $(wc -l < "$CURRENT_SNAPSHOT") dirs"
  echo "New directories: $NEW_COUNT | Removed: $REMOVED_COUNT | Flagged for review: $FLAGGED_COUNT"
  if [ "$FLAGGED_COUNT" -gt 0 ]; then
    echo "Unrecognized new directories:"
    echo -e "$FLAGGED"
    echo ""
    echo "ACTION: Verify each flagged directory. If unrecognized:"
    echo "  mv \"<path>\" \"<path>.QUARANTINE\""
    echo "This disables the integration without deleting data."
  fi
  if [ "$REMOVED_COUNT" -gt 0 ]; then
    echo "Removed since baseline:"
    echo "$REMOVED_DIRS" | while read -r d; do basename "$d" 2>/dev/null; done
  fi
} >> "$LOG_FILE"

if [ "$FLAGGED_COUNT" -gt 0 ] && [ -n "$SLACK_WEBHOOK_URL" ]; then
  SLACK_MSG="APP SUPPORT INTEGRITY ALERT | ${ALERT_TAG}\nTimestamp: ${TIMESTAMP}\n${FLAGGED_COUNT} unrecognized new directories in Application Support:${FLAGGED}\n\nAction: verify each entry. Quarantine unrecognized tools with: mv <path> <path>.QUARANTINE"

  curl -s -X POST "$SLACK_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"channel\":\"${SLACK_CHANNEL}\",\"text\":\"$(echo -e "$SLACK_MSG" | sed 's/"/\\"/g')\"}" \
    >/dev/null 2>&1
fi

# Option to auto-update baseline (pass --update-baseline flag)
if [ "${1:-}" = "--update-baseline" ]; then
  cp "$CURRENT_SNAPSHOT" "$BASELINE_FILE"
  echo "Baseline updated at $TIMESTAMP" >> "$LOG_FILE"
fi

rm "$CURRENT_SNAPSHOT"

if [ "$FLAGGED_COUNT" -eq 0 ]; then
  echo "APP_SUPPORT_INTEGRITY_WATCHDOG | $TIMESTAMP | CLEAN | No unrecognized directories"
else
  echo "APP_SUPPORT_INTEGRITY_WATCHDOG | $TIMESTAMP | ALERT | $FLAGGED_COUNT unrecognized — see $LOG_FILE"
  exit 1
fi
