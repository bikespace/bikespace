#!/bin/sh
set -eu
OUT=/backups/config
rm -rf "$OUT"; mkdir -p "$OUT"

# Assume for e.g. Coolify that there may not be an .env to copy
cat > "$OUT/secrets.env" <<EOF
BIKESPACE_SECURITY_PASSWORD_SALT=${BIKESPACE_SECURITY_PASSWORD_SALT}
BIKESPACE_SECRET_KEY=${BIKESPACE_SECRET_KEY}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
SEED_USER_EMAIL=${SEED_USER_EMAIL}
SEED_USER_PASSWORD=${SEED_USER_PASSWORD}
EOF

restic backup --host bikespace --tag config "$OUT"
restic forget --host bikespace --tag config \
  --keep-daily "${RESTIC_KEEP_DAILY:-7}" \
  --keep-weekly "${RESTIC_KEEP_WEEKLY:-5}" \
  --keep-monthly "${RESTIC_KEEP_MONTHLY:-12}" \
  --prune

# Success marker for the container healthcheck
touch /backups/.ok-config
