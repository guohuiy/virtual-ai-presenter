import React, { useEffect, useRef, useState } from 'react'
import Avatar from './components/Avatar'

type Msg = any

export default function App(){
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [logLines, setLogLines] = useState<string[]>([])
  const [theme, setTheme] = useState('Demo theme')
  const [script, setScript] = useState('Hello everyone. This is a demo speech from the Virtual AI Presenter.')
  const [voice, setVoice] = useState('demo')
  const [isRunning, setIsRunning] = useState(false)
  const [visemeEvent, setVisemeEvent] = useState<{phoneme:string, startMs:number, endMs:number} | null>(null)

  const log = (s:string)=> setLogLines(l=>[...l, s].slice(-500))

  useEffect(()=>{
    return ()=>{ if(ws) ws.close() }
  },[ws])

  async function startSession(){
    const res = await fetch('/session/start', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({userId:'demo'})})
    const body = await res.json()
    setSessionId(body.sessionId)
    log('session started: '+body.sessionId)
    const w = new WebSocket(`ws://localhost:8000/ws/${body.sessionId}`)
    w.onopen = ()=>{ log('ws open'); setIsRunning(true) }
    w.onmessage = (ev)=>{ handleWsMessage(ev.data); }
    w.onclose = ()=>{ log('ws closed'); setIsRunning(false); }
    setWs(w)
  }

  function handleWsMessage(raw:string){
    let msg: Msg
    try{ msg = JSON.parse(raw) }catch(e){ log('invalid JSON: '+raw); return }
    if(msg.type === 'lm_partial'){
      log('[LM] '+(msg.data?.textChunk||''))
    } else if(msg.type === 'viseme'){
      log(`[Viseme] ${msg.data.phoneme} ${msg.data.startMs}-${msg.data.endMs}`)
      setVisemeEvent({phoneme: msg.data.phoneme, startMs: msg.data.startMs, endMs: msg.data.endMs})
    } else if(msg.type === 'tts_audio_chunk'){
      // optional: handle base64 audio chunk
      log('[Audio chunk] seq='+msg.data?.seq)
      // decode/play if supported
      if(msg.data?.chunkBase64){
        playBase64Audio(msg.data.chunkBase64)
      }
    } else if(msg.type === 'meta_end'){
      log('[Meta] finished. recording='+msg.data.recordingUrl)
    } else if(msg.type === 'control_ack'){
      log('[Control ack] '+msg.data)
    } else {
      log('[Unknown] '+raw)
    }
  }

  async function submit(){
    if(!ws || ws.readyState !== WebSocket.OPEN){ log('WebSocket not open'); return }
    ws.send(JSON.stringify({type:'submit', theme, script, voice:{name:voice}}))
    log('submitted script')
  }

  function sendControl(command:string, seekMs?: number){
    if(!ws) return
    ws.send(JSON.stringify({type:'control', command, seekMs}))
    log('sent control '+command)
  }

  // audio playback helper (assumes encoded audio in base64 as WAV/opus that decodeAudioData can parse)
  const audioCtxRef = useRef<AudioContext | null>(null)
  function ensureAudioContext(){
    if(!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    return audioCtxRef.current
  }
  async function playBase64Audio(b64:string){
    try{
      const audioCtx = ensureAudioContext()
      const raw = atob(b64)
      const len = raw.length
      const arr = new Uint8Array(len)
      for(let i=0;i<len;i++) arr[i] = raw.charCodeAt(i)
      const audioBuffer = await audioCtx.decodeAudioData(arr.buffer)
      const src = audioCtx.createBufferSource()
      src.buffer = audioBuffer
      src.connect(audioCtx.destination)
      src.start()
    }catch(e){ log('audio play error: '+String(e)) }
  }

  return (
    <div className="app">
      <div className="sidebar">
        <h3>Virtual AI Presenter — Demo</h3>
        <div className="toolbar">
          <label>Theme</label>
          <input value={theme} onChange={e=>setTheme(e.target.value)} />
          <label>Script</label>
          <textarea rows={8} value={script} onChange={e=>setScript(e.target.value)} />
          <label>Voice</label>
          <input value={voice} onChange={e=>setVoice(e.target.value)} />
          <div>
            {!sessionId && <button onClick={startSession}>Start Session</button>}
            {sessionId && !isRunning && <button onClick={startSession}>Reconnect</button>}
            {isRunning && <button onClick={submit}>Submit Script</button>}
            {isRunning && <button onClick={()=>sendControl('pause')}>Pause</button>}
            {isRunning && <button onClick={()=>sendControl('resume')}>Resume</button>}
            {isRunning && <button onClick={()=>sendControl('stop')}>Stop</button>}
          </div>
        </div>
        <div className="log">
          {logLines.map((l,i)=>(<div key={i}>{l}</div>))}
        </div>
      </div>
      <div className="canvas">
        <Avatar viseme={visemeEvent} />
      </div>
    </div>
  )
}
