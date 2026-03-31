MVP Prototype — Virtual AI Presenter

This minimal prototype demonstrates the flow: client submits a script, backend streams LM partials and viseme events, and the frontend animates a simple avatar and plays tones as "audio".

Prereqs
- Python 3.10+
- Install backend deps: `pip install -r mvp/backend/requirements.txt`

Run backend (development):

```bash
cd virtual-ai-presenter/mvp/backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Run frontend (simple static server):

```bash
cd virtual-ai-presenter/mvp/frontend
python -m http.server 8080
# open http://localhost:8080 in browser
```

How it works
- POST `/session/start` returns `sessionId` and websocket URL.
- Frontend connects to websocket `/ws/{sessionId}` and sends a JSON `submit` message with `script`.
- Backend will stream `lm_partial` and `viseme` JSON messages, then a `meta_end` message.

Files added
- `mvp/backend/main.py` — FastAPI websocket mock orchestrator
- `mvp/frontend/index.html` — Minimal Three.js avatar and WebSocket client
- `mvp/backend/requirements.txt` — Python deps

Next steps
- Replace mock backend with real `orchestrator` that calls `lm-inference` and `tts-service`.
- Stream real audio (WebRTC or raw binary via WebSocket) and align visemes with audio timestamps.
