#!/bin/bash
# CLAUDE_DATA_RESIDENCY_WATCHDOG
# Weekly scan: finds Claude-related files/dirs under cloud-synced paths.
# Flags any Claude data sitting in OneDrive, iCloud, Dropbox, or Google Drive.
# Designed for macOS. Run weekly via launchd.

set -euo pipefail

CLOUD_SYNC_ROOTS=(
  "$HOME/Library/CloudStorage"
  "$HOME/Library/Mobile Documents"
)

CLAUDE_INDICATORS=(
  ".claude"
  "claude.json"
  "claude-config"
  "anthropic"
  ".anthropic"
  "CLAUDE.md"
  "claude_desktop_config.json"
  "nanobanana"
  "master-orchestrator"
  "coastalkey"
  "coastal-key"
  "CKTCAME"
)

SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
SLACK_CHANNEL="${SLACK_CHANNEL:-#exec-briefing}"
ALERT_TAG="${ALERT_TAG:-@david}"
LOG_DIR="$HOME/.coastal-key/watchdog-logs"
LOG_FILE="$LOG_DIR/data-residency-$(date +%Y-%m-%d).log"

mkdir -p "$LOG_DIR"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
HITS=0
HIT_DETAILS=""

for ROOT in "${CLOUD_SYNC_ROOTS[@]}"; do
  if [ ! -d "$ROOT" ]; then
    continue
  fi

  for PROVIDER_DIR in "$ROOT"/*/; do
    [ -d "$PROVIDER_DIR" ] || continue
    PROVIDER_NAME=$(basename "$PROVIDER_DIR")

    for INDICATOR in "${CLAUDE_INDICATORS[@]}"; do
      while IFS= read -r match; do
        HITS=$((HITS + 1))
        SIZE=$(du -sh "$match" 2>/dev/null | cut -f1)
        HIT_DETAILS="${HIT_DETAILS}\n- [${PROVIDER_NAME}] ${match} (${SIZE})"
      done < <(find "$PROVIDER_DIR" -maxdepth 5 -iname "*${INDICATOR}*" 2>/dev/null || true)
    done
  done
done

{
  echo "CLAUDE_DATA_RESIDENCY_WATCHDOG | $TIMESTAMP"
  echo "Cloud roots scanned: ${CLOUD_SYNC_ROOTS[*]}"
  echo "Indicators checked: ${#CLAUDE_INDICATORS[@]}"
  echo "Hits: $HITS"
  if [ "$HITS" -gt 0 ]; then
    echo "Synced Claude data found:"
    echo -e "$HIT_DETAILS"
    echo ""
    echo "RISK: These files are being synced to cloud storage."
    echo "ACTION: Move to a non-synced local path or exclude from sync."
  fi
} >> "$LOG_FILE"

if [ "$HITS" -gt 0 ] && [ -n "$SLACK_WEBHOOK_URL" ]; then
  SLACK_MSG="DATA RESIDENCY WATCHDOG ALERT | ${ALERT_TAG}\nTimestamp: ${TIMESTAMP}\nClaude data found in cloud-synced paths: ${HITS} items\n${HIT_DETAILS}\n\nFiduciary risk: credentials or client data may be syncing to third-party cloud storage. Move to local non-synced path immediately."

  curl -s -X POST "$SLACK_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"channel\":\"${SLACK_CHANNEL}\",\"text\":\"$(echo -e "$SLACK_MSG" | sed 's/"/\\"/g')\"}" \
    >/dev/null 2>&1
fi

if [ "$HITS" -eq 0 ]; then
  echo "CLAUDE_DATA_RESIDENCY_WATCHDOG | $TIMESTAMP | CLEAN | No Claude data in cloud-synced paths"
else
  echo "CLAUDE_DATA_RESIDENCY_WATCHDOG | $TIMESTAMP | ALERT | $HITS items in cloud-synced paths — see $LOG_FILE"
  exit 1
fi
