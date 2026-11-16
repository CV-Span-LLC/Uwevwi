#!/usr/bin/env bash
# Backs up the database and uploaded images to ./backups and prunes old copies.
# Run it on the server from anywhere: ./deploy/backup.sh. Schedule it with cron (see DEPLOY.md).
set -euo pipefail
cd "$(dirname "$0")/.."

DIR="${BACKUP_DIR:-$PWD/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DIR"

# A consistent copy of the live SQLite database (safe while the site is running).
docker compose exec -T api node -e "
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
fs.rmSync('/tmp/backup.db', { force: true });
const db = new DatabaseSync(process.env.DB_PATH);
db.exec(\"VACUUM INTO '/tmp/backup.db'\");
db.close();
"
docker compose exec -T api cat /tmp/backup.db | gzip > "$DIR/uwevwi-$STAMP.db.gz"
docker compose exec -T api rm -f /tmp/backup.db

# The uploaded images.
docker compose exec -T api tar -cz -C server uploads > "$DIR/uploads-$STAMP.tar.gz"

find "$DIR" -type f \( -name 'uwevwi-*.db.gz' -o -name 'uploads-*.tar.gz' \) -mtime +"$KEEP_DAYS" -delete
echo "Backed up to $DIR ($STAMP)"
