import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI()

STORAGE_DIR = os.path.join(os.path.dirname(__file__), 'storage')
os.makedirs(STORAGE_DIR, exist_ok=True)

class SaveRequest(BaseModel):
    sessionId: str
    transcript: str

@app.post('/media/save')
async def save_media(req: SaveRequest):
    path = os.path.join(STORAGE_DIR, f"{req.sessionId}.txt")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(req.transcript)
    return JSONResponse({'url': f'/media/{req.sessionId}.txt'})

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8701)
