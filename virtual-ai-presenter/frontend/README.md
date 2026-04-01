Frontend — Virtual AI Presenter

Run locally (frontend only):

```bash
cd virtual-ai-presenter/frontend
npm install
npm run dev
```

Build for production and serve with PM2:

```bash
cd virtual-ai-presenter/frontend
npm install
npm run build
# install serve if not available
npm install -g serve
# start via PM2 (production ecosystem)
pm install -g pm2
pm2 start ecosystem.config.prod.js --env production
```

The frontend expects the backend mock to be running on `http://localhost:8000` (see `backend`). Use `npm run build` to create production assets.
