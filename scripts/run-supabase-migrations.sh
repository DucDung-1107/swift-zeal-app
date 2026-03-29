#!/usr/bin/env bash
set -euo pipefail

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI not found. Install from https://supabase.com/docs/guides/cli"
  exit 2
fi

# Ensure environment variables are set
if [ -z "${VITE_SUPABASE_URL-}" ] || [ -z "${VITE_SUPABASE_PUBLISHABLE_KEY-}" ]; then
  echo "Please export VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or set in .env) before running."
  exit 2
fi

# Run migrations directory
MIGRATIONS_DIR="supabase/migrations"
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Migrations directory $MIGRATIONS_DIR not found."
  exit 1
fi

echo "Applying SQL migrations from $MIGRATIONS_DIR"
for f in "$MIGRATIONS_DIR"/*.sql; do
  echo "-- Applying: $f"
  supabase db query "$(cat "$f")"
done

echo "Migrations applied (or attempted). Verify via Supabase dashboard or CLI."
