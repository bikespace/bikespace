#!/bin/sh
set -eu
restic check --read-data-subset=5%
restic snapshots --latest 1