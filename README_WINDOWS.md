Windows 11 Local Run Guide

This document explains how to run the project locally on Windows 11 without Docker, using PM2 to manage microservices.

Prerequisites
- Node.js and npm
- Python 3.10+ (use conda or venv)
- PostgreSQL installed and running locally
- pm2 installed globally: `npm install -g pm2`

1) Clone & install
```powershell
# clone or pull latest
git checkout master
git pull origin master

# install node deps
npm install
npm --prefix .\virtual-ai-presenter\frontend install

# install python deps (activate your venv/conda env first)
pip install -r .\virtual-ai-presenter\backend\requirements.txt
```

2) Configure env
- Edit `virtual-ai-presenter/.env` or set environment variables in PowerShell. Example:
```powershell
$env:DATABASE_URL = 'postgresql://vpuser:pass@localhost:5432/vpdb'
```

3) Start services with PM2 (development)
```powershell
# start Windows-friendly PM2 config
pm2 start ecosystem.config.windows.js
pm2 list
pm2 logs
```
- For production-preview (after building frontend):
```powershell
npm --prefix .\virtual-ai-presenter\frontend run build
# load .env.production into PowerShell
Get-Content .env.production | ForEach-Object {
  if ($_ -and ($_ -notmatch '^#')) { $pair = $_ -split '=',2; $envName = $pair[0].Trim(); $envVal = $pair[1].Trim(); $env:$envName = $envVal }
}
pm install -g pm2
pm2 start ecosystem.config.prod.js --env production
```

Troubleshooting
- `socket.gaierror: [Errno 11001] getaddrinfo failed` → `DATABASE_URL` host not resolvable; ensure Postgres is running on `localhost` and `DATABASE_URL` uses `localhost`.
- `spawn EINVAL` when PM2 starts `frontend` → ensure `npm` is in PATH and the `ecosystem.config.windows.js` uses `npm` (Windows compatible). Use `pm2 logs frontend` for details.
- `wmic ENOENT` in PM2 logs → PM2 attempted to use `wmic`; it's a non-fatal warning on some Windows installs.

Notes
- The repo includes `ecosystem.config.windows.js` and `scripts/start-windows.ps1` to ease Windows local development.
- Important: several demo/one-off scripts and Docker files exist in other branches/backups; this guide assumes you use the Windows-friendly config on `master`.
