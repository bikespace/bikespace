#!/usr/bin/env sh

python manage.py recreate-db
python manage.py seed-db