#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${COMPOSE_PROJECT_NAME:-workshop-dcn-c48-verify}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:8080}"
CLEANUP="${CLEANUP:-0}"

COMPOSE=(docker compose -p "$PROJECT_NAME")

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

wait_for_http() {
  local label="$1"
  local url="$2"

  for _ in $(seq 1 60); do
    if curl -fsS "$url" >/tmp/workshop-dcn-c48-check.out 2>/dev/null; then
      echo "OK: $label responds at $url"
      return 0
    fi
    sleep 2
  done

  echo "FAILED: $label did not respond at $url" >&2
  "${COMPOSE[@]}" ps >&2 || true
  "${COMPOSE[@]}" logs --tail=120 >&2 || true
  exit 1
}

require_command docker
require_command curl

echo "Validating compose configuration..."
"${COMPOSE[@]}" config >/dev/null

echo "Starting from a clean Compose project and empty SQLite volume..."
"${COMPOSE[@]}" down -v --remove-orphans >/dev/null 2>&1 || true

echo "Building images without cache..."
"${COMPOSE[@]}" build --no-cache

echo "Starting services..."
"${COMPOSE[@]}" up -d

wait_for_http "frontend" "$FRONTEND_URL/"
wait_for_http "backend health through frontend proxy" "$FRONTEND_URL/health"

echo "Checking API through frontend /api proxy..."
cases_payload="$(curl -fsS "$FRONTEND_URL/api/cases")"
echo "GET /api/cases -> $cases_payload"

echo "Creating one case through the deployed API..."
created_payload="$(curl -fsS -X POST "$FRONTEND_URL/api/cases" \
  -H "Content-Type: application/json" \
  -d '{"customer":{"firstName":"Deploy","lastName":"Check","phone":"0600000000","email":"deploy.check@example.test"},"item":{"articleType":"bike","category":"vtt","brand":"Rockrider","model":"520","year":2020,"frameSize":"M","serialNumber":"1234567890","estimatedBasePrice":200}}')"

case_number="$(printf '%s' "$created_payload" | sed -n 's/.*"caseNumber":"\([^"]*\)".*/\1/p')"
if [ -z "$case_number" ]; then
  echo "FAILED: unable to read caseNumber from create response: $created_payload" >&2
  exit 1
fi
echo "Created case: $case_number"

loaded_payload="$(curl -fsS "$FRONTEND_URL/api/cases/$case_number")"
printf '%s' "$loaded_payload" | grep -q "\"caseNumber\":\"$case_number\""
echo "Reloaded case through API: $case_number"

echo "Checking SQLite file inside the backend volume..."
"${COMPOSE[@]}" exec -T backend sh -lc 'test -s /app/data/app.db && ls -l /app/data/app.db'
"${COMPOSE[@]}" exec -T backend sh -lc 'test ! -e /app/prisma/dev.db && echo "OK: /app/prisma/dev.db is absent from the runtime image"'

echo "Container state:"
"${COMPOSE[@]}" ps

echo "PASS: deployment is working from Docker Compose."

if [ "$CLEANUP" = "1" ]; then
  echo "Cleaning up Compose project and volume..."
  "${COMPOSE[@]}" down -v --remove-orphans
fi
