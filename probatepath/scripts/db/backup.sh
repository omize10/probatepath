#!/usr/bin/env bash
set -euo pipefail

# Simple Neon/Postgres backup script
# Requires: BACKUP_DATABASE_URL env var
# Writes a gzipped SQL dump to ./backups/db-YYYYMMDD-HHMM.sql.gz

if [ -z "${BACKUP_DATABASE_URL:-}" ]; then
  echo "Missing BACKUP_DATABASE_URL environment variable. Aborting."
  exit 1
fi

TS=$(date -u +"%Y%m%d-%H%M")
OUT_DIR="./backups"
mkdir -p "$OUT_DIR"
OUT_FILE="$OUT_DIR/db-$TS.sql.gz"

echo "Creating backup to $OUT_FILE"

# Use pg_dump with the connection string. pg_dump accepts a connection string via --dbname or as the first argument.
# We pipe to gzip to create a compressed dump.

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump not found in PATH. Please install postgresql client tools (pg_dump)."
  exit 2
fi

# Run pg_dump; note: for Neon you typically use the full Postgres URL (including ?sslmode=require)
pg_dump "$BACKUP_DATABASE_URL" | gzip -c > "$OUT_FILE"

echo "Backup complete: $OUT_FILE"
