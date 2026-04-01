Backend microservices (prototype)

Services (ports):
- Orchestrator: http://localhost:8000 (session API + websocket)
- LM mock: http://localhost:8501 (POST /generate streaming JSON lines)
- TTS mock: http://localhost:8601 (POST /synthesize streaming JSON lines)
- Media: http://localhost:8701 (POST /media/save)

Run with Python (development)

```bash
cd virtual-ai-presenter/backend/orchestrator
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000

# in other terminals run LM, TTS, Media similarly
cd ../lm_inference
uvicorn main:app --reload --port 8501

cd ../tts_service
uvicorn main:app --reload --port 8601

cd ../media_service
uvicorn main:app --reload --port 8701
```

Or run all services with Docker Compose:

```bash
docker compose up --build
```

Notes
- These are MVP mock services for local development and integration testing.
- The orchestrator expects services reachable by DNS names `lm`, `tts`, `media` when running under docker-compose; when running locally without compose, update LM_URL/TTS_URL/MEDIA_URL in `orchestrator/main.py` to `http://localhost:8501` etc.
