#!/bin/bash
# Coastal Key Watchdog Uninstaller
# Removes launchd jobs. Does NOT delete logs or baselines.

set -euo pipefail

LAUNCHD_DIR="$HOME/Library/LaunchAgents"

PLISTS=(
  "com.coastalkey.credential-leak-watchdog"
  "com.coastalkey.data-residency-watchdog"
  "com.coastalkey.app-support-integrity-watchdog"
)

echo "Unloading watchdog jobs..."
for PLIST_NAME in "${PLISTS[@]}"; do
  DEST="$LAUNCHD_DIR/${PLIST_NAME}.plist"
  if [ -f "$DEST" ]; then
    launchctl unload "$DEST" 2>/dev/null || true
    rm "$DEST"
    echo "  Removed: $PLIST_NAME"
  fi
done

echo ""
echo "Launchd jobs removed."
echo "Logs preserved at: $HOME/.coastal-key/watchdog-logs/"
echo "Baselines preserved at: $HOME/.coastal-key/baselines/"
echo "Scripts preserved at: $HOME/.coastal-key/watchdogs/"
echo ""
echo "To fully remove all data: rm -rf ~/.coastal-key"
