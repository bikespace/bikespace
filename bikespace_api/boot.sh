#!/usr/bin/env sh
python manage.py db upgrade --directory migrations
exec gunicorn -b :8000 --access-logfile - --error-logfile - manage:app