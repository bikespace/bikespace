#!/bin/sh
# Install dependencies only when package-lock.json has changed since the last
# install into the node_modules volume, then start the Next.js dev server.
set -e

HASH_FILE=node_modules/.lock-hash
LOCK_HASH=$(sha256sum package-lock.json | cut -d ' ' -f 1)

if [ ! -f "$HASH_FILE" ] || [ "$(cat "$HASH_FILE")" != "$LOCK_HASH" ]; then
  echo "package-lock.json changed or no install found: running npm ci"
  npm ci --no-audit --no-fund
  echo "$LOCK_HASH" > "$HASH_FILE"
else
  echo "node_modules matches package-lock.json: skipping install"
fi

exec npm run develop
