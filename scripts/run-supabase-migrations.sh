#!/usr/bin/env bash
set -euo pipefail

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI not found. Install from https://supabase.com/docs/guides/cli"
  exit 2
fi

# Run migrations directory
MIGRATIONS_DIR="supabase/migrations"
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Migrations directory $MIGRATIONS_DIR not found."
  exit 1
fi

if [ -n "${SUPABASE_DB_URL-}" ]; then
  MODE="db-url"
else
  MODE="linked"
fi

echo "Applying SQL migrations from $MIGRATIONS_DIR"
for f in "$MIGRATIONS_DIR"/*.sql; do
  echo "-- Applying: $f"
  if [ "$MODE" = "db-url" ]; then
    supabase db query --db-url "$SUPABASE_DB_URL" --file "$f"
  else
    supabase db query --linked --file "$f"
  fi
done

echo "Migrations applied (or attempted). Verify via Supabase dashboard or CLI."
