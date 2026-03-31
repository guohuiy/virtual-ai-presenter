export interface SpeechConfig {
  rate: number;
  pitch: number;
  volume: number;
  voice?: string;
}

export interface AIConfig {
  provider: 'openai' | 'local' | 'custom';
  model: string;
  apiKey?: string;
  apiUrl?: string;
  temperature: number;
  maxTokens: number;
}

export interface VirtualHumanConfig {
  modelPath: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
  animations: string[];
}

export interface Speech {
  id: string;
  title: string;
  content: string;
  topic: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Podcast {
  id: string;
  title: string;
  description: string;
  speeches: Speech[];
  duration: number;
  createdAt: Date;
}

export interface AppState {
  isSpeaking: boolean;
  isGenerating: boolean;
  isRecording: boolean;
  currentSpeech?: Speech;
  currentPodcast?: Podcast;
  speechConfig: SpeechConfig;
  aiConfig: AIConfig;
  virtualHumanConfig: VirtualHumanConfig;
}

export interface AIResponse {
  text: string;
  tokens: number;
  model: string;
  duration: number;
}

export interface SpeechGenerationRequest {
  topic: string;
  length: 'short' | 'medium' | 'long';
  style: 'formal' | 'casual' | 'persuasive' | 'educational';
  language: string;
}

export interface SpeechGenerationResponse {
  speech: Speech;
  aiResponse: AIResponse;
}

export interface VoiceSynthesisRequest {
  text: string;
  config: SpeechConfig;
}

export interface VoiceSynthesisResponse {
  audioUrl: string;
  duration: number;
  wordCount: number;
}

export interface AnimationState {
  isTalking: boolean;
  isIdle: boolean;
  isGesturing: boolean;
  currentAnimation: string;
  mouthOpenAmount: number;
}

export interface ToolbarAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  action: () => void;
  disabled?: boolean;
}