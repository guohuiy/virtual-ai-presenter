import asyncio
import json
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.post('/generate')
async def generate(request: Request):
    body = await request.json()
    prompt = body.get('prompt', '')

    async def event_stream():
        # Very simple mock: split words and stream as partials
        words = prompt.split()
        for i, w in enumerate(words):
            obj = {'textChunk': w + (' ' if i < len(words)-1 else ''), 'done': False}
            yield json.dumps(obj) + '\n'
            await asyncio.sleep(0.15)
        yield json.dumps({'textChunk': '', 'done': True}) + '\n'

    return StreamingResponse(event_stream(), media_type='application/json')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8501)
