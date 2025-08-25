#!/usr/bin/env sh
python manage.py db upgrade --directory migrations
python manage.py add-seed-user
exec gunicorn -b :8000 --access-logfile - --error-logfile - manage:app