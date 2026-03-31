import asyncio
import json
import uuid
from typing import Dict, Any

import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

app = FastAPI()

# Simple in-memory session store
sessions: Dict[str, Dict[str, Any]] = {}

LM_URL = "http://lm:8501/generate"
TTS_URL = "http://tts:8601/synthesize"
MEDIA_URL = "http://media:8701"  # for storing transcripts

@app.post('/session/start')
async def start_session(payload: Dict[str, Any]):
    user_id = payload.get('userId', 'anon')
    session_id = str(uuid.uuid4())
    sessions[session_id] = {'user_id': user_id}
    ws_url = f"ws://localhost:8000/ws/{session_id}"
    return JSONResponse({'sessionId': session_id, 'websocketUrl': ws_url})

@app.post('/session/{session_id}/submit')
async def submit_script(session_id: str, payload: Dict[str, Any]):
    if session_id not in sessions:
        return JSONResponse({'error': 'unknown session'}, status_code=404)
    # store submit payload
    sessions[session_id]['last_submit'] = payload
    # trigger background processing (non-blocking)
    asyncio.create_task(process_session(session_id, payload))
    return JSONResponse({}, status_code=202)

@app.post('/session/{session_id}/control')
async def control(session_id: str, payload: Dict[str, Any]):
    # For MVP we just store control commands
    sessions.setdefault(session_id, {})['control'] = payload
    return JSONResponse({'status': 'ok'})

# Websocket endpoint to stream events to client
@app.websocket('/ws/{session_id}')
async def ws_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    sessions.setdefault(session_id, {})['ws'] = websocket
    try:
        while True:
            message = await websocket.receive_text()
            # simple echo for unsupported messages
            await websocket.send_text(json.dumps({'type': 'ack', 'payload': message}))
    except WebSocketDisconnect:
        sessions.get(session_id, {}).pop('ws', None)

async def process_session(session_id: str, payload: Dict[str, Any]):
    """Call LM to generate text, then call TTS to synthesize and stream events to websocket client."""
    ws = sessions.get(session_id, {}).get('ws')
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
                # accumulate or modify as needed
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

        # store transcript via media service
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
