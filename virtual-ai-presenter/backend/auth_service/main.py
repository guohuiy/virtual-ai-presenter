import os
import time
from typing import Dict, Any

import jwt
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

try:
    import asyncpg
except Exception:
    asyncpg = None

from passlib.context import CryptContext

app = FastAPI()

JWT_SECRET = os.environ.get('JWT_SECRET', 'devsecret')
JWT_ALGO = 'HS256'
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:password@postgres:5432/presenter')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
pg_pool = None

async def init_db():
    global pg_pool
    if asyncpg and DATABASE_URL:
        pg_pool = await asyncpg.create_pool(DATABASE_URL)
        async with pg_pool.acquire() as conn:
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT now()
                )
            ''')

@app.on_event('startup')
async def startup_event():
    await init_db()

@app.post('/users/register')
async def register(req: Request):
    body: Dict[str, Any] = await req.json()
    username = body.get('username')
    password = body.get('password')
    if not username or not password:
        raise HTTPException(status_code=400, detail='username and password required')
    pw_hash = pwd_context.hash(password)
    if pg_pool:
        async with pg_pool.acquire() as conn:
            try:
                await conn.execute('INSERT INTO users(username, password_hash) VALUES($1,$2)', username, pw_hash)
            except asyncpg.UniqueViolationError:
                raise HTTPException(status_code=400, detail='user exists')
    else:
        raise HTTPException(status_code=500, detail='database not available')
    return JSONResponse({'status': 'created'})

@app.post('/token')
async def token(req: Request):
    body: Dict[str, Any] = await req.json()
    username = body.get('username')
    password = body.get('password')
    if not username or not password:
        raise HTTPException(status_code=400, detail='username/password required')
    if not pg_pool:
        raise HTTPException(status_code=500, detail='database not available')
    async with pg_pool.acquire() as conn:
        row = await conn.fetchrow('SELECT password_hash FROM users WHERE username=$1', username)
        if not row:
            raise HTTPException(status_code=401, detail='invalid credentials')
        pw_hash = row['password_hash']
        if not pwd_context.verify(password, pw_hash):
            raise HTTPException(status_code=401, detail='invalid credentials')
        now = int(time.time())
        payload = { 'sub': username, 'iat': now, 'exp': now + 3600 }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
        return JSONResponse({'access_token': token, 'token_type': 'bearer'})

@app.post('/verify')
async def verify(req: Request):
    body: Dict[str, Any] = await req.json()
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
