#!/usr/bin/env sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
FILE="${BACKUP_DIR}/crew-desk-${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

docker compose exec -T postgres pg_dump \
  -U "${POSTGRES_USER:-crew_desk}" \
  -d "${POSTGRES_DB:-crew_desk}" \
  --clean \
  --if-exists \
  | gzip > "${FILE}"

echo "Backup written to ${FILE}"
