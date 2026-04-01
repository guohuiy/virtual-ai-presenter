import asyncio
import base64
import json
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

app = FastAPI()

def synthesize_audio_chunks(text: str):
    # Mock: generate short WAV-like bytes per word (not real audio)
    chunks = []
    for i, w in enumerate(text.split()):
        b = (w + '\n').encode('utf-8')
        chunks.append(base64.b64encode(b).decode('ascii'))
    return chunks

def mock_visemes(text: str):
    visemes = []
    start = 0
    for w in text.split():
        dur = 80 + (len(w) % 4) * 40
        end = start + dur
        visemes.append({'phoneme': w[0].lower() if w else 'a', 'startMs': start, 'endMs': end})
        start = end
    return visemes

@app.post('/synthesize')
async def synth(request: Request):
    body = await request.json()
    text = body.get('text', '')
    voice = body.get('voice', {})

    audio_chunks = synthesize_audio_chunks(text)
    visemes = mock_visemes(text)

    async def stream():
        # stream viseme events interleaved with audio chunks
        for i, v in enumerate(visemes):
            # send viseme
            yield json.dumps({'type': 'viseme', 'data': v}) + '\n'
            await asyncio.sleep((v['endMs'] - v['startMs'])/1000.0)
            # send audio chunk corresponding to word
            if i < len(audio_chunks):
                yield json.dumps({'type': 'tts_audio_chunk', 'data': {'seq': i, 'chunkBase64': audio_chunks[i]}}) + '\n'
        # done
    return StreamingResponse(stream(), media_type='application/json')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8601)
