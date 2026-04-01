PM2 Service Management

This project includes an `ecosystem.config.js` to manage backend microservices and the frontend dev server using PM2.

Prerequisites
- Node.js and npm (for PM2). You can install pm2 globally: `npm install -g pm2`, or use the local devDependency.
- Python 3.11+ and backend dependencies (if you prefer running directly without PM2 building containers).

Install (local pm2):

```bash
npm install
# or install pm2 globally
npm install -g pm2
```

Start all services with PM2 (uses `ecosystem.config.js`):

```bash
# using global pm2
pm2 start ecosystem.config.js

# or using local pm2 via npm script
npm run pm2:start
```

Common commands

- List processes:
  ```bash
  pm2 list
  ```

- Stop a service:
  ```bash
  pm2 stop orchestrator
  pm2 stop lm
  pm2 stop tts
  pm2 stop media
  pm2 stop auth
  pm2 stop frontend
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
- For production use consider running services inside containers (docker-compose) and using PM2 on a process manager host only if desired.
- To run frontend in production, build it (`npm --prefix virtual-ai-presenter/frontend run build`) and update `ecosystem.config.js` to serve `dist` via a static server (e.g., `serve`).
