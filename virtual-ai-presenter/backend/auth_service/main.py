import os
import time
from typing import Dict

import jwt
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

app = FastAPI()

JWT_SECRET = os.environ.get('JWT_SECRET', 'devsecret')
JWT_ALGO = 'HS256'

@app.post('/token')
async def token(req: Request):
    body: Dict = await req.json()
    username = body.get('username')
    password = body.get('password')
    # Very simple: accept any username/password for prototype
    if not username or not password:
        raise HTTPException(status_code=400, detail='username/password required')
    now = int(time.time())
    payload = { 'sub': username, 'iat': now, 'exp': now + 3600 }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
    return JSONResponse({'access_token': token, 'token_type': 'bearer'})

@app.post('/verify')
async def verify(req: Request):
    body: Dict = await req.json()
    token = body.get('token')
    if not token:
        raise HTTPException(status_code=400, detail='token required')
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
    return JSONResponse({'valid': True, 'payload': decoded})

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8801)
