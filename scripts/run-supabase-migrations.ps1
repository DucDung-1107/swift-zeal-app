param()

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
  Write-Error "supabase CLI not found. Install from https://supabase.com/docs/guides/cli"
  exit 2
}

$MigrationsDir = Join-Path -Path $PSScriptRoot -ChildPath "..\supabase\migrations"
if (-not (Test-Path $MigrationsDir)) {
  Write-Error "Migrations directory $MigrationsDir not found."
  exit 1
}

if ($env:SUPABASE_DB_URL) {
  $mode = "db-url"
} else {
  $mode = "linked"
}

Write-Output "Applying SQL migrations from $MigrationsDir"
Get-ChildItem -Path $MigrationsDir -Filter *.sql | Sort-Object Name | ForEach-Object {
  Write-Output "-- Applying: $($_.FullName)"
  if ($mode -eq "db-url") {
    supabase db query --db-url $env:SUPABASE_DB_URL --file $_.FullName
  } else {
    supabase db query --linked --file $_.FullName
  }

  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed applying migration: $($_.Name)"
    exit $LASTEXITCODE
  }
}

Write-Output "Migrations applied (or attempted). Verify via Supabase dashboard or CLI."
