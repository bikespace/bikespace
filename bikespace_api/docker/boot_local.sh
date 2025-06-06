#!/usr/bin/env sh
python manage.py db upgrade --directory migrations
python manage.py seed-db
exec python manage.py run --host 0.0.0.0