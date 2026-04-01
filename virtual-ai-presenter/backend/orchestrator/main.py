import asyncio
import json
import os
import uuid
from typing import Dict, Any

import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException
from fastapi.responses import JSONResponse

try:
    import aioredis
except Exception:
    aioredis = None

try:
    import asyncpg
except Exception:
    asyncpg = None

import jwt

app = FastAPI()

# Simple in-memory session store as fallback
sessions: Dict[str, Dict[str, Any]] = {}

LM_URL = os.environ.get('LM_URL', 'http://localhost:8501/generate')
TTS_URL = os.environ.get('TTS_URL', 'http://localhost:8601/synthesize')
MEDIA_URL = os.environ.get('MEDIA_URL', 'http://localhost:8701')
REDIS_URL = os.environ.get('REDIS_URL')
DATABASE_URL = os.environ.get('DATABASE_URL')
AUTH_URL = os.environ.get('AUTH_URL')
JWT_SECRET = os.environ.get('JWT_SECRET', 'devsecret')
JWT_ALGO = 'HS256'

redis = None
pg_pool = None

async def init_resources():
    global redis, pg_pool
    if aioredis and REDIS_URL:
        redis = await aioredis.from_url(REDIS_URL)
    if asyncpg and DATABASE_URL:
        pg_pool = await asyncpg.create_pool(DATABASE_URL)

@app.on_event('startup')
async def startup_event():
    await init_resources()
    # ensure transcripts table exists
    if pg_pool:
        async with pg_pool.acquire() as conn:
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS transcripts (
                    id SERIAL PRIMARY KEY,
                    session_id TEXT UNIQUE,
                    transcript TEXT,
                    created_at TIMESTAMP DEFAULT now()
                )
            ''')

def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload
    except Exception:
        return None

@app.post('/session/start')
async def start_session(request: Request):
    # Require Authorization: Bearer <token>
    auth = request.headers.get('authorization')
    if not auth or not auth.lower().startswith('bearer '):
        raise HTTPException(status_code=401, detail='authorization required')
    token = auth.split(' ', 1)[1]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail='invalid token')

    payload_json = await request.json()
    user_id = payload_json.get('userId', payload.get('sub', 'anon'))
    session_id = str(uuid.uuid4())
    sessions[session_id] = {'user_id': user_id}
    if redis:
        try:
            await redis.hset(f'session:{session_id}', mapping={'user_id': user_id})
        except Exception:
            pass
    ws_url = f"ws://localhost:8000/ws/{session_id}?token={token}"
    return JSONResponse({'sessionId': session_id, 'websocketUrl': ws_url})

@app.post('/session/{session_id}/submit')
async def submit_script(session_id: str, payload: Dict[str, Any]):
    if session_id not in sessions and not redis:
        return JSONResponse({'error': 'unknown session'}, status_code=404)
    # store submit payload
    sessions.setdefault(session_id, {})['last_submit'] = payload
    if redis:
        try:
            await redis.hset(f'session:{session_id}', mapping={'last_submit': json.dumps(payload)})
        except Exception:
            pass
    # trigger background processing (non-blocking)
    asyncio.create_task(process_session(session_id, payload))
    return JSONResponse({}, status_code=202)

@app.post('/session/{session_id}/control')
async def control(session_id: str, payload: Dict[str, Any]):
    # store control commands in redis or memory
    if redis:
        try:
            await redis.hset(f'session:{session_id}', mapping={'control': json.dumps(payload)})
        except Exception:
            pass
    else:
        sessions.setdefault(session_id, {})['control'] = payload
    return JSONResponse({'status': 'ok'})

# Websocket endpoint to stream events to client
@app.websocket('/ws/{session_id}')
async def ws_endpoint(websocket: WebSocket, session_id: str):
    # Expect token query param: ?token=...
    token = websocket.query_params.get('token')
    payload = None
    if token:
        payload = verify_token(token)
    if not payload:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    sessions.setdefault(session_id, {})['ws'] = websocket
    if redis:
        try:
            await redis.hset(f'session:{session_id}', mapping={'ws': 'connected'})
        except Exception:
            pass
    try:
        while True:
            message = await websocket.receive_text()
            # simple echo for unsupported messages
            await websocket.send_text(json.dumps({'type': 'ack', 'payload': message}))
    except WebSocketDisconnect:
        sessions.get(session_id, {}).pop('ws', None)
        if redis:
            try:
                await redis.hdel(f'session:{session_id}', 'ws')
            except Exception:
                pass

async def process_session(session_id: str, payload: Dict[str, Any]):
    """Call LM to generate text, then call TTS to synthesize and stream events to websocket client."""
    ws = sessions.get(session_id, {}).get('ws')
    # if redis is used, prefer to read ws mapping
    if redis and not ws:
        try:
            r = await redis.hget(f'session:{session_id}', 'ws')
            if r:
                # cannot retrieve websocket object across processes; keep best-effort
                pass
        except Exception:
            pass

    theme = payload.get('theme', '')
    script = payload.get('script') or ''

    async with httpx.AsyncClient(timeout=60.0) as client:
        # Call LM service (streaming JSON lines)
        try:
            lm_resp = await client.stream('POST', LM_URL, json={'prompt': theme + '\n' + script})
            async for line in lm_resp.aiter_lines():
                if not line.strip():
                    continue
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                # forward lm_partial
                if ws:
                    await send_ws(ws, {'type': 'lm_partial', 'data': obj})
        except Exception:
            if ws:
                await send_ws(ws, {'type': 'error', 'message': 'lm service failed'})
            return

        # Call TTS service (streaming JSON lines of viseme/audio)
        try:
            tts_resp = await client.stream('POST', TTS_URL, json={'text': script, 'voice': payload.get('voice', {})}, timeout=120.0)
            async for line in tts_resp.aiter_lines():
                if not line.strip():
                    continue
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                # forward events (viseme, tts_audio_chunk)
                if ws:
                    await send_ws(ws, obj)
        except Exception:
            if ws:
                await send_ws(ws, {'type': 'error', 'message': 'tts service failed'})
            return

        # store transcript in Postgres if available
        if pg_pool:
            try:
                async with pg_pool.acquire() as conn:
                    await conn.execute('INSERT INTO transcripts(session_id, transcript) VALUES($1,$2) ON CONFLICT (session_id) DO UPDATE SET transcript = EXCLUDED.transcript', session_id, script)
            except Exception:
                pass

        # store transcript via media service as well (legacy)
        try:
            await client.post(MEDIA_URL + '/media/save', json={'sessionId': session_id, 'transcript': script})
        except Exception:
            pass

        if ws:
            await send_ws(ws, {'type': 'meta_end', 'data': {'recordingUrl': f'/media/{session_id}.wav', 'transcript': script}})

async def send_ws(ws: WebSocket, msg: Dict[str, Any]):
    try:
        await ws.send_text(json.dumps(msg))
    except Exception:
        # ignore send errors
        pass

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
