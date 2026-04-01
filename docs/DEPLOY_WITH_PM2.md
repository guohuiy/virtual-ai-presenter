Deploying built frontend with PM2

This document explains how to deploy the `dist` produced by `npm run build` to a target server and run it using `serve` + `pm2`.

Prerequisites (target server):
- Node 18+ and `npm` installed
- `pm2` installed globally: `npm install -g pm2`
- `serve` installed globally or available in the deploy path: `npm install -g serve`
- SSH access from CI or your workstation to the server

Manual steps (on your workstation):

1. Build locally:

```bash
cd virtual-ai-presenter/frontend
npm install
npm run build
```

2. Copy build to server (example using `rsync`):

```bash
rsync -avz virtual-ai-presenter/frontend/dist/ user@your.host:~/presenter-frontend/
```

3. On the server, start (or reload) PM2 production ecosystem:

```bash
ssh user@your.host
cd ~/presenter-frontend
# ensure ecosystem.config.prod.js is present on server root or repo clone
pm2 reload ecosystem.config.prod.js --env production || pm2 start ecosystem.config.prod.js --env production
```

Tips:
- You can store deployment credentials as GitHub Secrets and use the SSH-based deploy action in `.github/workflows/build-frontend.yml` by providing `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`, and `DEPLOY_PORT`.
- Ensure `.env.production` on the server contains production env vars (do NOT commit secrets to Git).
