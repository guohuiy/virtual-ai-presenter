module.exports = {
  apps: [
    {
      name: 'orchestrator',
      script: 'main.py',
      interpreter: 'python',
      cwd: './virtual-ai-presenter/backend/orchestrator',
      watch: false,
      env: {
        LM_URL: process.env.LM_URL || 'http://lm:8501/generate',
        TTS_URL: process.env.TTS_URL || 'http://tts:8601/synthesize',
        MEDIA_URL: process.env.MEDIA_URL || 'http://media:8701',
        REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379/0',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/presenter',
        JWT_SECRET: process.env.JWT_SECRET || 'supersecret_for_local_dev'
      }
    },
    {
      name: 'lm',
      script: 'main.py',
      interpreter: 'python',
      cwd: './virtual-ai-presenter/backend/lm_inference',
      watch: false
    },
    {
      name: 'tts',
      script: 'main.py',
      interpreter: 'python',
      cwd: './virtual-ai-presenter/backend/tts_service',
      watch: false
    },
    {
      name: 'media',
      script: 'main.py',
      interpreter: 'python',
      cwd: './virtual-ai-presenter/backend/media_service',
      watch: false
    },
    {
      name: 'auth',
      script: 'main.py',
      interpreter: 'python',
      cwd: './virtual-ai-presenter/backend/auth_service',
      watch: false,
      env: {
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/presenter',
        JWT_SECRET: process.env.JWT_SECRET || 'supersecret_for_local_dev'
      }
    },
    {
      name: 'frontend',
      // run the Vite dev server via npm; for production change to serve built files
      script: 'npm',
      args: 'run dev --prefix virtual-ai-presenter/frontend',
      cwd: './',
      interpreter: 'none',
      watch: false
    }
  ]
}
