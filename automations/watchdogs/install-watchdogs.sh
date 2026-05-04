#!/bin/bash
# Coastal Key Watchdog Installer
# Run on your Mac to install all three watchdog modules as scheduled launchd jobs.
# Usage: bash install-watchdogs.sh [SLACK_WEBHOOK_URL]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SLACK_WEBHOOK="${1:-YOUR_SLACK_WEBHOOK_URL}"
INSTALL_DIR="$HOME/.coastal-key/watchdogs"
LAUNCHD_DIR="$HOME/Library/LaunchAgents"
LOG_DIR="$HOME/.coastal-key/watchdog-logs"

echo "Coastal Key Watchdog Installer"
echo "=============================="

mkdir -p "$INSTALL_DIR" "$LAUNCHD_DIR" "$LOG_DIR" "$HOME/.coastal-key/baselines"

echo "1. Copying watchdog scripts to $INSTALL_DIR..."
cp "$SCRIPT_DIR/credential-leak-watchdog.sh" "$INSTALL_DIR/"
cp "$SCRIPT_DIR/data-residency-watchdog.sh" "$INSTALL_DIR/"
cp "$SCRIPT_DIR/app-support-integrity-watchdog.sh" "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR"/*.sh

echo "2. Installing launchd plists..."
PLISTS=(
  "com.coastalkey.credential-leak-watchdog"
  "com.coastalkey.data-residency-watchdog"
  "com.coastalkey.app-support-integrity-watchdog"
)

for PLIST_NAME in "${PLISTS[@]}"; do
  SRC="$SCRIPT_DIR/launchd/${PLIST_NAME}.plist"
  DEST="$LAUNCHD_DIR/${PLIST_NAME}.plist"

  sed \
    -e "s|WATCHDOG_DIR|${INSTALL_DIR}|g" \
    -e "s|LOG_DIR|${LOG_DIR}|g" \
    -e "s|YOUR_SLACK_WEBHOOK_URL|${SLACK_WEBHOOK}|g" \
    "$SRC" > "$DEST"

  launchctl unload "$DEST" 2>/dev/null || true
  launchctl load "$DEST"
  echo "   Loaded: $PLIST_NAME"
done

echo "3. Creating initial Application Support baseline..."
"$INSTALL_DIR/app-support-integrity-watchdog.sh" || true

echo ""
echo "Installation complete."
echo ""
echo "Schedule:"
echo "  Credential scan:     Daily at 6:00 AM"
echo "  Data residency scan: Weekly Monday at 7:00 AM"
echo "  App Support diff:    Weekly Monday at 7:30 AM"
echo ""
echo "Logs:     $LOG_DIR"
echo "Scripts:  $INSTALL_DIR"
echo "Baseline: $HOME/.coastal-key/baselines/"
echo ""
echo "To run manually:"
echo "  $INSTALL_DIR/credential-leak-watchdog.sh"
echo "  $INSTALL_DIR/data-residency-watchdog.sh"
echo "  $INSTALL_DIR/app-support-integrity-watchdog.sh"
echo ""
echo "To uninstall:"
echo "  bash $SCRIPT_DIR/uninstall-watchdogs.sh"
