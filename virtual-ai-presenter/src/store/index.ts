import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, Speech, Podcast, SpeechConfig, AIConfig, VirtualHumanConfig } from '@/types'

interface AppStore extends AppState {
  // State setters
  setIsSpeaking: (isSpeaking: boolean) => void
  setIsGenerating: (isGenerating: boolean) => void
  setIsRecording: (isRecording: boolean) => void
  setCurrentSpeech: (speech?: Speech) => void
  setCurrentPodcast: (podcast?: Podcast) => void
  setSpeechConfig: (config: Partial<SpeechConfig>) => void
  setAIConfig: (config: Partial<AIConfig>) => void
  setVirtualHumanConfig: (config: Partial<VirtualHumanConfig>) => void
  
  // Actions
  generateSpeech: (topic: string, options?: any) => Promise<Speech>
  startSpeaking: (speech: Speech) => Promise<void>
  stopSpeaking: () => void
  recordPodcast: (title: string, description: string) => Promise<Podcast>
  saveSpeech: (speech: Speech) => void
  loadSpeech: (id: string) => Speech | undefined
  deleteSpeech: (id: string) => void
  
  // Utility
  reset: () => void
}

const defaultSpeechConfig: SpeechConfig = {
  rate: parseFloat(import.meta.env.VITE_SPEECH_RATE || '1.0'),
  pitch: parseFloat(import.meta.env.VITE_SPEECH_PITCH || '1.0'),
  volume: parseFloat(import.meta.env.VITE_SPEECH_VOLUME || '1.0'),
  voice: 'zh-CN-XiaoxiaoNeural',
}

const defaultAIConfig: AIConfig = {
  provider: (import.meta.env.VITE_OPENAI_API_KEY ? 'openai' : 'local') as 'openai' | 'local',
  model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  apiUrl: import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1',
  temperature: 0.7,
  maxTokens: 2000,
}

const defaultVirtualHumanConfig: VirtualHumanConfig = {
  modelPath: import.meta.env.VITE_3D_MODEL_PATH || '/models/virtual-human.glb',
  scale: parseFloat(import.meta.env.VITE_3D_MODEL_SCALE || '1.0'),
  position: [0, -1, 0],
  rotation: [0, 0, 0],
  animations: ['idle', 'talking', 'gesturing'],
}

const initialState: AppState = {
  isSpeaking: false,
  isGenerating: false,
  isRecording: false,
  speechConfig: defaultSpeechConfig,
  aiConfig: defaultAIConfig,
  virtualHumanConfig: defaultVirtualHumanConfig,
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setIsRecording: (isRecording) => set({ isRecording }),
      setCurrentSpeech: (currentSpeech) => set({ currentSpeech }),
      setCurrentPodcast: (currentPodcast) => set({ currentPodcast }),
      
      setSpeechConfig: (config) => 
        set((state) => ({ 
          speechConfig: { ...state.speechConfig, ...config } 
        })),
      
      setAIConfig: (config) => 
        set((state) => ({ 
          aiConfig: { ...state.aiConfig, ...config } 
        })),
      
      setVirtualHumanConfig: (config) => 
        set((state) => ({ 
          virtualHumanConfig: { ...state.virtualHumanConfig, ...config } 
        })),
      
      generateSpeech: async (topic, options) => {
        set({ isGenerating: true })
        
        try {
          // Simulate AI generation
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const speech: Speech = {
            id: Date.now().toString(),
            title: `关于${topic}的演讲`,
            content: `尊敬的听众们，大家好！

今天我想和大家分享关于${topic}的一些思考。

在这个快速发展的时代，${topic}已经成为我们生活中不可或缺的一部分。它不仅改变了我们的生活方式，也为我们带来了前所未有的机遇和挑战。

让我们一起探索${topic}的奥秘，共同创造更美好的未来！

谢谢大家！`,
            topic,
            duration: 180, // 3 minutes
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          set({ currentSpeech: speech, isGenerating: false })
          return speech
        } catch (error) {
          set({ isGenerating: false })
          throw error
        }
      },
      
      startSpeaking: async (speech) => {
        set({ isSpeaking: true, currentSpeech: speech })
        // Speech synthesis would happen here
      },
      
      stopSpeaking: () => {
        set({ isSpeaking: false })
      },
      
      recordPodcast: async (title, description) => {
        set({ isRecording: true })
        
        try {
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          const podcast: Podcast = {
            id: Date.now().toString(),
            title,
            description,
            speeches: get().currentSpeech ? [get().currentSpeech!] : [],
            duration: 300, // 5 minutes
            createdAt: new Date(),
          }
          
          set({ currentPodcast: podcast, isRecording: false })
          return podcast
        } catch (error) {
          set({ isRecording: false })
          throw error
        }
      },
      
      saveSpeech: (speech) => {
        // In a real app, this would save to localStorage or a backend
        console.log('Saving speech:', speech)
      },
      
      loadSpeech: (id) => {
        // In a real app, this would load from localStorage or a backend
        return undefined
      },
      
      deleteSpeech: (id) => {
        // In a real app, this would delete from storage
        console.log('Deleting speech:', id)
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'virtual-ai-presenter-storage',
      partialize: (state) => ({
        speechConfig: state.speechConfig,
        aiConfig: state.aiConfig,
        virtualHumanConfig: state.virtualHumanConfig,
      }),
    }
  )
)