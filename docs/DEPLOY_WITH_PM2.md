PM2 Service Deployment

This project includes an `ecosystem.config.js` to manage backend microservices and the frontend dev or production server using PM2.

Prerequisites
- Node.js and npm. Install pm2 globally: `npm install -g pm2`, or use the local devDependency.

Install (local pm2):

```powershell
npm install
# or install pm2 globally
npm install -g pm2
```

Start in development (runs Vite dev server for frontend):

```powershell
pm2 start ecosystem.config.js
# or using local pm2 via npm script
npm run pm2:start
```

Start in production (build frontend and run production ecosystem):

```powershell
# build frontend
npm --prefix virtual-ai-presenter/frontend run build

# load production env (from .env.production) into PowerShell session
Get-Content .env.production | ForEach-Object {
  if ($_ -and ($_ -notmatch '^#')) {
    $pair = $_ -split '='; $envName = $pair[0]; $envVal = $pair[1]; $env:$envName = $envVal
  }
}

# start PM2
npm install -g pm2
pm2 start ecosystem.config.prod.js --env production
```

Notes
- PM2 runs Python scripts directly using system `python`. Ensure Python environment packages installed (see virtual-ai-presenter/backend/requirements.txt).
- For Windows local deployment, use `ecosystem.config.windows.js` if provided for easier local dev. For production, use the `ecosystem.config.prod.js` with appropriate env variables set.
