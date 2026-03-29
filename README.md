# Phuc Vinh Solar Marketplace

Website thuong mai dien tu cho Phuc Vinh Solar.

## Development

- Start the dev server with `npm run dev`.

### Supabase migrations

This project keeps SQL migrations in `supabase/migrations/`. To apply them locally using the Supabase CLI, install the CLI and set the required env vars, then run the helper script:

POSIX (bash/macOS/Linux):
```bash
export VITE_SUPABASE_URL="https://<project>.supabase.co"
export VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
npm run supabase:migrate
```

PowerShell (Windows):
```powershell
$env:VITE_SUPABASE_URL = "https://<project>.supabase.co"
$env:VITE_SUPABASE_PUBLISHABLE_KEY = "<anon-key>"
npm run supabase:migrate:ps1
```

Notes:
- The scripts stream each SQL file to the `supabase db query` command. They require the Supabase CLI and appropriate access.
- If you prefer, use `supabase db remote set` and `supabase db push` / dashboard migrations.
