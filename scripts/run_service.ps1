Param([string]$service)

if (-not $service) {
  Write-Host "Usage: pwsh scripts\run_service.ps1 <service>"
  exit 1
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repoRoot "virtual-ai-presenter\backend\$service"
$venvDir = Join-Path $repoRoot ".venv\$service"

if (-not (Test-Path $backendDir)) {
  Write-Error "Service not found: $service"
  exit 1
}

if (-not (Test-Path $venvDir)) {
  python -m venv $venvDir
}

$pythonExe = Join-Path $venvDir "Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
  Write-Error "Python executable not found in venv. Ensure Python is installed and on PATH."
  exit 1
}

& $pythonExe -m pip install --upgrade pip
& $pythonExe -m pip install -r (Join-Path $backendDir "requirements.txt")

Set-Location $backendDir
& $pythonExe main.py
