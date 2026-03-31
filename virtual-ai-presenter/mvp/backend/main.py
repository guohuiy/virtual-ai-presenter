import asyncio
import json
import uuid
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/session/start")
async def start_session(payload: dict):
    user_id = payload.get("userId") or "anon"
    session_id = str(uuid.uuid4())
    ws_url = f"ws://localhost:8000/ws/{session_id}"
    return JSONResponse({"sessionId": session_id, "websocketUrl": ws_url})

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        while True:
            msg = await websocket.receive_text()
            data = json.loads(msg)
            # Expect a submit message: {type: "submit", theme, script, voice}
            if data.get("type") == "submit":
                script = data.get("script", "Hello, this is a demo speech.")
                # Stream LM partials
                for i, chunk in enumerate(_chunk_text(script, 12)):
                    await websocket.send_text(json.dumps({
                        "type": "lm_partial",
                        "data": {"textChunk": chunk, "done": False}
                    }))
                    await asyncio.sleep(0.25)
                await websocket.send_text(json.dumps({"type": "lm_partial", "data": {"textChunk": "", "done": True}}))

                # Simulate viseme events and "audio" playback timeline
                # Create simple phoneme sequence and durations
                visemes = _mock_visemes_from_script(script)
                start_ms = 0
                for v in visemes:
                    end_ms = start_ms + v[1]
                    await websocket.send_text(json.dumps({
                        "type": "viseme",
                        "data": {"phoneme": v[0], "startMs": start_ms, "endMs": end_ms}
                    }))
                    await asyncio.sleep(v[1] / 1000.0)
                    start_ms = end_ms

                # Send meta end with a placeholder recording URL and transcript
                await websocket.send_text(json.dumps({
                    "type": "meta_end",
                    "data": {"recordingUrl": "/mvp/assets/placeholder_audio.wav", "transcript": script}
                }))
            elif data.get("type") == "control":
                # Echo control back
                await websocket.send_text(json.dumps({"type": "control_ack", "data": data.get("command")}))
            else:
                await websocket.send_text(json.dumps({"type": "error", "message": "unknown message"}))
    except WebSocketDisconnect:
        return


def _chunk_text(text, size=12):
    return [text[i:i+size] for i in range(0, len(text), size)]


def _mock_visemes_from_script(script: str):
    # Very simple mock: map words to short viseme durations
    words = script.split()
    visemes = []
    for w in words:
        phoneme = w[0].lower() if w else "a"
        # duration 80-240 ms
        dur = 80 + (len(w) % 4) * 40
        visemes.append((phoneme, dur))
    return visemes

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
