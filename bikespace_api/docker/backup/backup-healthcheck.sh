#!/bin/sh
set -eu
MAX_AGE_MIN=1560   # 26h — a bit past the daily cadence to account for run time
for marker in /backups/.ok-db /backups/.ok-config; do
  [ -f "$marker" ] || exit 1
  find "$marker" -mmin +"$MAX_AGE_MIN" -print -quit | grep -q . && exit 1
done
exit 0