#!/bin/sh
set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"

mkdir -p /app/data

echo "Applying Prisma migrations..."
npx prisma migrate deploy

exec "$@"
