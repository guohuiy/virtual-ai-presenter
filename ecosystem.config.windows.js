module.exports = {
  apps: [
    {
      name: 'orchestrator',
      script: 'python',
      args: 'virtual-ai-presenter/backend/orchestrator/main.py',
      interpreter: 'python',
      watch: false,
      env: { PYTHONUNBUFFERED: '1' }
    },
    {
      name: 'auth',
      script: 'python',
      args: 'virtual-ai-presenter/backend/auth_service/main.py',
      interpreter: 'python',
      watch: false
    },
    {
      name: 'lm',
      script: 'python',
      args: 'virtual-ai-presenter/backend/lm_inference/main.py',
      interpreter: 'python',
      watch: false
    },
    {
      name: 'tts',
      script: 'python',
      args: 'virtual-ai-presenter/backend/tts_service/main.py',
      interpreter: 'python',
      watch: false
    },
    {
      name: 'media',
      script: 'python',
      args: 'virtual-ai-presenter/backend/media_service/main.py',
      interpreter: 'python',
      watch: false
    },
    {
      name: 'frontend',
      script: 'npm',
      args: '--prefix virtual-ai-presenter/frontend run dev',
      watch: false
    }
  ]
};
