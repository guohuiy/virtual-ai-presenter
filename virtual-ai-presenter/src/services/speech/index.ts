import { SpeechConfig, VoiceSynthesisRequest, VoiceSynthesisResponse } from '@/types'

export class SpeechService {
  private config: SpeechConfig
  private synth: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isSpeaking = false
  private onSpeakingChange?: (speaking: boolean) => void
  
  constructor(config: SpeechConfig, onSpeakingChange?: (speaking: boolean) => void) {
    this.config = config
    this.onSpeakingChange = onSpeakingChange
    this.initialize()
  }
  
  private initialize() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
      
      // Preload voices
      this.loadVoices()
      
      // Listen for voice changes
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices()
      }
    } else {
      console.warn('Web Speech API is not supported in this browser')
    }
  }
  
  private loadVoices() {
    if (!this.synth) return
    
    // Voices are loaded asynchronously
    setTimeout(() => {
      const voices = this.synth!.getVoices()
      console.log('Available voices:', voices.length)
      
      // Try to find Chinese voice
      const chineseVoice = voices.find(voice => 
        voice.lang.includes('zh') || voice.name.includes('Chinese')
      )
      
      if (chineseVoice && !this.config.voice) {
        this.config.voice = chineseVoice.name
      }
    }, 1000)
  }
  
  async synthesize(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResponse> {
    const { text, config } = request
    const mergedConfig = { ...this.config, ...config }
    
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'))
        return
      }
      
      // Cancel any ongoing speech
      this.stop()
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text)
      this.currentUtterance = utterance
      
      // Configure utterance
      utterance.rate = mergedConfig.rate
      utterance.pitch = mergedConfig.pitch
      utterance.volume = mergedConfig.volume
      
      // Set voice if specified
      if (mergedConfig.voice) {
        const voices = this.synth.getVoices()
        const voice = voices.find(v => v.name === mergedConfig.voice)
        if (voice) {
          utterance.voice = voice
          utterance.lang = voice.lang
        }
      }
      
      // Calculate duration estimate (rough estimate)
      const wordCount = text.split(/\s+/).length
      const chineseCharCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length
      const totalUnits = wordCount + chineseCharCount
      const estimatedDuration = (totalUnits / 150) * 60 * 1000 // 150 units per minute
      
      // Event handlers
      utterance.onstart = () => {
        this.isSpeaking = true
        this.onSpeakingChange?.(true)
      }
      
      utterance.onend = () => {
        this.isSpeaking = false
        this.currentUtterance = null
        this.onSpeakingChange?.(false)
        
        resolve({
          audioUrl: '', // Web Speech API doesn't provide audio URL
          duration: estimatedDuration,
          wordCount: totalUnits
        })
      }
      
      utterance.onerror = (event) => {
        this.isSpeaking = false
        this.currentUtterance = null
        this.onSpeakingChange?.(false)
        
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }
      
      // Start synthesis
      this.synth.speak(utterance)
    })
  }
  
  speak(text: string, config?: Partial<SpeechConfig>): Promise<void> {
    const mergedConfig: Partial<SpeechConfig> = config || {}
    return this.synthesize({ text, config: mergedConfig })
      .then(() => {})
      .catch(error => {
        console.error('Speech synthesis failed:', error)
        throw error
      })
  }
  
  stop() {
    if (this.synth && this.isSpeaking) {
      this.synth.cancel()
      this.isSpeaking = false
      this.currentUtterance = null
      this.onSpeakingChange?.(false)
    }
  }
  
  pause() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause()
    }
  }
  
  resume() {
    if (this.synth && !this.isSpeaking) {
      this.synth.resume()
    }
  }
  
  isAvailable(): boolean {
    return !!this.synth
  }
  
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return []
    return this.synth.getVoices()
  }
  
  getChineseVoices(): SpeechSynthesisVoice[] {
    return this.getVoices().filter(voice => 
      voice.lang.includes('zh') || voice.name.includes('Chinese')
    )
  }
  
  updateConfig(config: Partial<SpeechConfig>) {
    this.config = { ...this.config, ...config }
  }
  
  getConfig(): SpeechConfig {
    return { ...this.config }
  }
  
  // Text-to-speech with ElevenLabs (premium option)
  async synthesizeWithElevenLabs(
    text: string,
    apiKey: string,
    voiceId: string = '21m00Tcm4TlvDq8ikWAM'
  ): Promise<VoiceSynthesisResponse> {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true
            }
          })
        }
      )
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`)
      }
      
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      // Calculate duration
      await new Promise(resolve => {
        audio.addEventListener('loadedmetadata', () => resolve(audio.duration))
      })
      
      const duration = audio.duration * 1000 // Convert to milliseconds
      const wordCount = text.split(/\s+/).length
      
      return {
        audioUrl,
        duration,
        wordCount
      }
    } catch (error) {
      console.error('ElevenLabs synthesis failed:', error)
      throw error
    }
  }
  
  // Export audio to file
  async exportToFile(text: string, filename: string = 'speech.mp3'): Promise<void> {
    // Note: Web Speech API doesn't support direct audio export
    // This would require using a different TTS service or recording the audio
    console.warn('Web Speech API does not support direct audio export')
    
    // For ElevenLabs or other services, you would implement file download here
    // const response = await this.synthesizeWithElevenLabs(text, apiKey)
    // const link = document.createElement('a')
    // link.href = response.audioUrl
    // link.download = filename
    // link.click()
  }
}

// Singleton instance
let speechServiceInstance: SpeechService | null = null

export const getSpeechService = (
  config?: SpeechConfig,
  onSpeakingChange?: (speaking: boolean) => void
): SpeechService => {
  if (!speechServiceInstance) {
    const defaultConfig: SpeechConfig = {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voice: undefined
    }
    
    speechServiceInstance = new SpeechService(
      config || defaultConfig,
      onSpeakingChange
    )
  }
  
  return speechServiceInstance
}

// Utility function for speaking text
export const speakText = async (
  text: string,
  config?: Partial<SpeechConfig>
): Promise<void> => {
  const service = getSpeechService()
  
  if (!service.isAvailable()) {
    console.warn('Speech synthesis not available')
    return
  }
  
  await service.speak(text, config)
}

// Utility function for stopping speech
export const stopSpeech = (): void => {
  const service = getSpeechService()
  service.stop()
}

// Check browser support
export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}