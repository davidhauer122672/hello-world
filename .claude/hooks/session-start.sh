#!/bin/bash
set -euo pipefail

# Coastal Key AI CEO — Session Startup Hook
# Only runs in remote (Claude Code on the web) environments

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install npm workspace dependencies (wrangler + workspaces)
npm install

# Install wrangler globally for deploy commands
npm install -g wrangler
