#!/usr/bin/env bash
# Sends the project to the server and (re)builds the stack there.
#   ./deploy/deploy.sh user@server-ip [/opt/uwevwi]
# The first run needs a `.env` on the server (see deploy/production.env.example).
set -euo pipefail
cd "$(dirname "$0")/.."

TARGET="${1:?Usage: deploy.sh user@host [remote-dir]}"
REMOTE_DIR="${2:-/opt/uwevwi}"

ssh "$TARGET" "mkdir -p '$REMOTE_DIR'"
rsync -az --delete \
  --exclude node_modules --exclude .git --exclude .expo --exclude dist --exclude ios --exclude android \
  --exclude 'server/data' --exclude 'server/uploads' --exclude backups --exclude '.env' --exclude '.env.*' \
  --exclude .DS_Store \
  ./ "$TARGET:$REMOTE_DIR/"

ssh "$TARGET" "cd '$REMOTE_DIR' && test -f .env || { echo 'Missing $REMOTE_DIR/.env: copy deploy/production.env.example to .env and fill it in.' >&2; exit 1; }"
ssh "$TARGET" "cd '$REMOTE_DIR' && docker compose up -d --build && docker image prune -f >/dev/null && docker compose ps"
