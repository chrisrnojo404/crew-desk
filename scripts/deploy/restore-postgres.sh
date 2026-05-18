#!/usr/bin/env sh
set -eu

if [ "${1:-}" = "" ]; then
  echo "Usage: scripts/deploy/restore-postgres.sh backups/crew-desk-YYYYMMDD-HHMMSS.sql.gz"
  exit 1
fi

gzip -dc "$1" | docker compose exec -T postgres psql \
  -U "${POSTGRES_USER:-crew_desk}" \
  -d "${POSTGRES_DB:-crew_desk}"

echo "Restore completed from $1"
