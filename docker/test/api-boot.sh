#!/bin/bash
python manage.py recreate-db
python manage.py seed-db
python manage.py run --host 0.0.0.0