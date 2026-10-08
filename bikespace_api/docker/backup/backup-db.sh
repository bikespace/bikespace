#!/bin/sh
set -eu
OUT=/backups/pg
rm -rf "$OUT"; mkdir -p "$OUT"

# make password available to pg_* commands
export PGPASSWORD="${POSTGRES_PASSWORD}"
# docker service for db
HOST=db
# user for running backup
USER=$POSTGRES_USER

# 1) Global objects: roles incl. passwords
pg_dumpall -h "$HOST" -U "$USER" --globals-only > "$OUT/globals.sql"

# 2) Application database
# Custom format (-Fc) = compressed and restorable selectively with pg_restore.
pg_dump -h "$HOST" -U "$USER" -Fc "${POSTGRES_DB}" > "$OUT/${POSTGRES_DB}.dump"

# 3) Ship encrypted to the backup S3, then apply retention
restic backup --host bikespace --tag db "$OUT"
restic forget --host bikespace --tag db \
  --keep-daily "${RESTIC_KEEP_DAILY:-7}" \
  --keep-weekly "${RESTIC_KEEP_WEEKLY:-5}" \
  --keep-monthly "${RESTIC_KEEP_MONTHLY:-12}" \
  --prune

# 4) Success marker for the container healthcheck — only reached if
# everything above exited zero, thanks to `set -eu`.
touch /backups/.ok-db