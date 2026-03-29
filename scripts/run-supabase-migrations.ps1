param()

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
  Write-Error "supabase CLI not found. Install from https://supabase.com/docs/guides/cli"
  exit 2
}

if (-not $env:VITE_SUPABASE_URL -or -not $env:VITE_SUPABASE_PUBLISHABLE_KEY) {
  Write-Error "Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY environment variables (or load .env) before running."
  exit 2
}

$MigrationsDir = Join-Path $PSScriptRoot '..' 'supabase' 'migrations'
if (-not (Test-Path $MigrationsDir)) {
  Write-Error "Migrations directory $MigrationsDir not found."
  exit 1
}

Write-Output "Applying SQL migrations from $MigrationsDir"
Get-ChildItem -Path $MigrationsDir -Filter *.sql | Sort-Object Name | ForEach-Object {
  Write-Output "-- Applying: $($_.FullName)"
  $sql = Get-Content -Raw -Path $_.FullName
  supabase db query -q $sql
}

Write-Output "Migrations applied (or attempted). Verify via Supabase dashboard or CLI."
