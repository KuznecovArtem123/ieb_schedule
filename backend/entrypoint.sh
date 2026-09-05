#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until python -c "
import os
import psycopg

psycopg.connect(
    host=os.environ['POSTGRES_HOST'],
    port=os.environ.get('POSTGRES_PORT', '5432'),
    dbname=os.environ['POSTGRES_DB'],
    user=os.environ['POSTGRES_USER'],
    password=os.environ['POSTGRES_PASSWORD'],
)
" 2>/dev/null; do
  sleep 1
done

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn ieb.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -