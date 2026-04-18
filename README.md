# Phuc Vinh Solar Marketplace

Website thuong mai dien tu cho Phuc Vinh Solar.

## Development

- Start the dev server with `npm run dev`.

### Supabase migrations

This project keeps SQL migrations in `supabase/migrations/`.

The helper scripts support two modes:
- linked mode: run `supabase link --project-ref <project-ref>` first, then run the script.
- direct mode: set `SUPABASE_DB_URL` and run the script without linking.

POSIX (bash/macOS/Linux):
```bash
export VITE_SUPABASE_URL="https://<project>.supabase.co"
export VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
# Optional alternative to linked mode:
# export SUPABASE_DB_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
npm run supabase:migrate
```

PowerShell (Windows):
```powershell
$env:VITE_SUPABASE_URL = "https://<project>.supabase.co"
$env:VITE_SUPABASE_PUBLISHABLE_KEY = "<anon-key>"
# Optional alternative to linked mode:
# $env:SUPABASE_DB_URL = "postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
npm run supabase:migrate:ps1
```

Notes:
- The scripts apply each SQL file using `supabase db query --file`.
- If `SUPABASE_DB_URL` is not set, scripts use `--linked` and require `supabase link` access.
- If you prefer, use `supabase db remote set` and `supabase db push` / dashboard migrations.
