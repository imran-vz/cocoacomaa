#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "$ROOT_DIR/.env" ]]; then
	set -a
	# shellcheck disable=SC1091
	source "$ROOT_DIR/.env"
	set +a
fi

if ! command -v pg_dump >/dev/null 2>&1; then
	echo "Error: pg_dump is not installed or not in PATH."
	exit 1
fi

if ! command -v pg_restore >/dev/null 2>&1; then
	echo "Error: pg_restore is not installed or not in PATH."
	exit 1
fi

if [[ -z "${REMOTE_DATABASE_URL:-}" ]]; then
	echo "Error: REMOTE_DATABASE_URL is not set."
	exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
	echo "Error: DATABASE_URL is not set."
	exit 1
fi

SCHEMA="${DB_CLONE_SCHEMA:-public}"
BACKUP_DIR="$ROOT_DIR/backup"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
DUMP_FILE="$BACKUP_DIR/remote-${SCHEMA}-${TIMESTAMP}.dump"

mkdir -p "$BACKUP_DIR"

echo "Creating dump from remote database schema: $SCHEMA"
pg_dump \
	--format=custom \
	--no-owner \
	--no-privileges \
	--schema="$SCHEMA" \
	--file="$DUMP_FILE" \
	"$REMOTE_DATABASE_URL"

echo "Restoring dump into local database"
pg_restore \
	--clean \
	--if-exists \
	--no-owner \
	--no-privileges \
	--dbname="$DATABASE_URL" \
	"$DUMP_FILE"

echo "Done. Local database refreshed from remote schema '$SCHEMA'."
echo "Dump saved at: $DUMP_FILE"
