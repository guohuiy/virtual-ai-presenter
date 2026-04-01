param(
  [switch]$UseSqlite
)

# load .env into this session if present
$envFile = Join-Path $PSScriptRoot '..\.env'
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -and ($_ -notmatch '^\s*#')) {
      $pair = $_ -split '=',2
      if ($pair.Count -eq 2) {
        $name = $pair[0].Trim()
        $val = $pair[1].Trim()
        $env:$name = $val
      }
    }
  }
}

if ($UseSqlite) {
  Write-Host "Using SQLite fallback for dev."
  $dbPath = Resolve-Path .\dev-data\dev.db
  $env:DATABASE_URL = "sqlite:///$($dbPath)"
}

Write-Host "Ensure dependencies installed: npm install && npm --prefix virtual-ai-presenter/frontend install"
Write-Host "Ensure Python deps installed: pip install -r virtual-ai-presenter/backend/requirements.txt"
Write-Host "Ensure PostgreSQL is running and DATABASE_URL is set in this session or .env."

pm2 start ecosystem.config.windows.js
pm2 list
pm2 logs
