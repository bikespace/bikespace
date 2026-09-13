#!/bin/sh
set -eu
export BACKUP_CRON_IMAGES="${BACKUP_CRON_IMAGES:-0 2 * * *}"
export BACKUP_CRON_DB="${BACKUP_CRON_DB:-30 2 * * *}"
export BACKUP_CRON_CONFIG="${BACKUP_CRON_CONFIG:-45 2 * * *}"
export BACKUP_CRON_CHECK="${BACKUP_CRON_CHECK:-0 4 * * 0}"
envsubst < /etc/crontab.template > /etc/crontab

# run restic init if needed
restic cat config >/dev/null 2>&1 || restic init

exec supercronic -no-reap /etc/crontab