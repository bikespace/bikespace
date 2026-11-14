#!/usr/bin/env sh
python manage.py db upgrade --directory migrations
python manage.py add-seed-user
# --worker-tmp-dir /dev/shm: keep gunicorn's worker heartbeat file in memory.
# The default /tmp is on the container's disk layer, where heartbeat writes
# can block when disk I/O is busy and stall incoming requests.
# See https://docs.gunicorn.org/en/stable/faq.html#blocking-os-fchmod
exec gunicorn -b :8000 \
--workers 2 --threads 4 --timeout 60 \
--worker-tmp-dir /dev/shm \
--forwarded-allow-ips='*' \
--access-logfile - --error-logfile - \
manage:app