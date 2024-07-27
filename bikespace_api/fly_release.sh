#!/usr/bin/env sh

python manage.py db stamp heads --directory migrations
python manage.py db upgrade --directory migrations
python manage.py db migrate --directory migrations