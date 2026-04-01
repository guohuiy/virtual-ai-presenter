PM2 Service Management

This project includes an `ecosystem.config.js` to manage backend microservices and the frontend dev or production server using PM2.

Prerequisites
- Node.js and npm. Install pm2 globally: `npm install -g pm2`, or use the local devDependency.
- For production hosting of frontend, this repo uses `serve` to serve `dist`.

Install (local pm2):

```bash
npm install
# or install pm2 globally
npm install -g pm2
```

Start in development (runs Vite dev server for frontend):

```bash
# using global pm2
pm2 start ecosystem.config.js
# or using local pm2 via npm script
npm run pm2:start
```

Start in production (build frontend and run production ecosystem):

```bash
# build frontend
npm --prefix virtual-ai-presenter/frontend run build

# load production env (from .env.production) and start
export $(cat .env.production | xargs)  # Linux/macOS
pm2 start ecosystem.config.prod.js --env production
```

Windows (PowerShell) equivalents

```powershell
# install dependencies
npm install

# build frontend
npm --prefix virtual-ai-presenter/frontend run build

# load env vars from .env.production into $env:
Get-Content .env.production | ForEach-Object {
  if ($_ -and ($_ -notmatch '^#')) {
    $pair = $_ -split '='; $envName = $pair[0]; $envVal = $pair[1]; $env:$envName = $envVal
  }
}

# start PM2 (assumes pm2 is installed globally)
pm install -g pm2
pm2 start ecosystem.config.prod.js --env production
```

Common PM2 commands

- List processes:
  ```bash
  pm2 list
  ```

- Stop a service:
  ```bash
  pm2 stop orchestrator
  ```

- Restart a service:
  ```bash
  pm2 restart orchestrator
  ```

- Delete a service (remove from pm2 process list):
  ```bash
  pm2 delete orchestrator
  ```

- Stop all services and remove them:
  ```bash
  pm2 delete all
  ```

- View logs:
  ```bash
  pm2 logs orchestrator
  pm2 logs
  ```

Notes
- PM2 runs the Python scripts directly using the system `python` interpreter. Ensure your Python environment has required packages installed (see `virtual-ai-presenter/backend/requirements.txt`).
- Running backend services under PM2 is convenient for local development. For production consider containers and orchestrators like Kubernetes.
- To run frontend in production, build it (`npm --prefix virtual-ai-presenter/frontend run build`) and use the production ecosystem which serves `dist` via `serve`.
