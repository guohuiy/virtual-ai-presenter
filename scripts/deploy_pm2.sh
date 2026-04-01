#!/usr/bin/env bash
set -euo pipefail

# Example: ./scripts/deploy_pm2.sh user@host:/path/to/deploy
# Requires: rsync, ssh, pm2 and serve installed on target server

REMOTE_TARGET=${1:-}
if [ -z "$REMOTE_TARGET" ]; then
  echo "Usage: $0 user@host:/path/to/deploy"
  exit 2
fi

LOCAL_DIST=virtual-ai-presenter/frontend/dist/

echo "Syncing dist -> $REMOTE_TARGET"
rsync -avz --delete "$LOCAL_DIST" "$REMOTE_TARGET"

# After sync, reload pm2 on remote
ssh ${REMOTE_TARGET%@*} "bash -lc 'cd ${REMOTE_TARGET#*:} || exit 1; pm2 reload ecosystem.config.prod.js --env production || pm2 start ecosystem.config.prod.js --env production'"

echo "Deployed to $REMOTE_TARGET"
