import { AIConfig, SpeechGenerationRequest, AIResponse } from '@/types'

export class AIService {
  private config: AIConfig
  
  constructor(config: AIConfig) {
    this.config = config
  }
  
  async generateSpeech(request: SpeechGenerationRequest): Promise<AIResponse> {
    const { topic, length, style, language } = request
    
    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.generateWithOpenAI(topic, length, style, language)
        case 'local':
          return await this.generateWithLocalLLM(topic, length, style, language)
        case 'custom':
          return await this.generateWithCustomAPI(topic, length, style, language)
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('AI generation failed:', error)
      // Fallback to mock response
      return this.generateMockResponse(topic, length, style, language)
    }
  }
  
  private async generateWithOpenAI(
    topic: string, 
    length: 'short' | 'medium' | 'long',
    style: 'formal' | 'casual' | 'persuasive' | 'educational',
    language: string
  ): Promise<AIResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required')
    }
    
    const lengthMap = {
      short: '约300字',
      medium: '约600字',
      long: '约1000字'
    }
    
    const styleMap = {
      formal: '正式、专业的语气',
      casual: '轻松、自然的语气',
      persuasive: '有说服力、激励人心的语气',
      educational: '教育性、解释性的语气'
    }
    
    const prompt = `请生成一篇关于"${topic}"的演讲稿。
要求：
1. 语言：${language}
2. 长度：${lengthMap[length]}
3. 风格：${styleMap[style]}
4. 结构：包含开场白、主体内容和结束语
5. 内容：有逻辑性、有感染力、适合公开演讲

请直接输出演讲稿内容，不要添加额外说明。`
    
    try {
      const response = await fetch(`${this.config.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: '你是一位专业的演讲撰稿人，擅长创作各种主题的演讲稿。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        })
      })
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      const text = data.choices[0]?.message?.content || ''
      
      return {
        text,
        tokens: data.usage?.total_tokens || 0,
        model: data.model,
        duration: 0 // API调用时间可以在这里计算
      }
    } catch (error) {
      console.error('OpenAI API call failed:', error)
      throw error
    }
  }
  
  private async generateWithLocalLLM(
    topic: string,
    length: 'short' | 'medium' | 'long',
    style: 'formal' | 'casual' | 'persuasive' | 'educational',
    language: string
  ): Promise<AIResponse> {
    // For local LLM (e.g., Ollama, LocalAI)
    const apiUrl = this.config.apiUrl || 'http://localhost:11434'
    
    const prompt = `请生成一篇关于"${topic}"的演讲稿，使用${language}，风格为${style}，长度为${length}。`
    
    try {
      const response = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: this.config.temperature
          }
        })
      })
      
      if (!response.ok) {
        throw new Error(`Local LLM API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      return {
        text: data.response || '',
        tokens: 0, // Local LLM可能不返回token计数
        model: this.config.model,
        duration: 0
      }
    } catch (error) {
      console.error('Local LLM API call failed:', error)
      throw error
    }
  }
  
  private async generateWithCustomAPI(
    topic: string,
    length: 'short' | 'medium' | 'long',
    style: 'formal' | 'casual' | 'persuasive' | 'educational',
    language: string
  ): Promise<AIResponse> {
    // For custom AI API endpoints
    if (!this.config.apiUrl) {
      throw new Error('Custom API URL is required')
    }
    
    const requestBody = {
      topic,
      length,
      style,
      language,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    }
    
    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`Custom API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      return {
        text: data.text || data.content || '',
        tokens: data.tokens || 0,
        model: this.config.model,
        duration: data.duration || 0
      }
    } catch (error) {
      console.error('Custom API call failed:', error)
      throw error
    }
  }
  
  private generateMockResponse(
    topic: string,
    length: 'short' | 'medium' | 'long',
    style: 'formal' | 'casual' | 'persuasive' | 'educational',
    language: string
  ): AIResponse {
    // Mock response for development/demo purposes
    const lengthText = {
      short: '简短',
      medium: '中等',
      long: '详细'
    }[length]
    
    const styleText = {
      formal: '正式',
      casual: '轻松',
      persuasive: '有说服力',
      educational: '教育性'
    }[style]
    
    const mockSpeech = `尊敬的各位听众，大家好！

今天，我非常荣幸能在这里与大家分享关于"${topic}"的一些思考。

在这个快速变化的时代，${topic}已经成为我们生活中不可或缺的一部分。它不仅影响着我们的日常生活，也塑造着我们的未来。

首先，让我们来看看${topic}的基本概念。${topic}代表着一种新的思维方式，它鼓励我们突破传统界限，探索未知领域。

其次，${topic}的应用前景非常广阔。从科技创新到社会发展，${topic}都在发挥着重要作用。我们需要深入理解${topic}的本质，才能更好地把握机遇。

最后，我想强调的是，${topic}不仅仅是一个概念，更是一种行动指南。我们应该积极拥抱${topic}带来的变化，共同创造更美好的未来。

谢谢大家！`

    return {
      text: mockSpeech,
      tokens: 250,
      model: 'mock-model',
      duration: 1000
    }
  }
  
  // Text analysis and improvement
  async analyzeText(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral'
    complexity: number
    suggestions: string[]
  }> {
    // Simple text analysis
    const words = text.split(/\s+/).length
    const sentences = text.split(/[.!?]+/).length - 1
    const complexity = words > 0 ? words / Math.max(sentences, 1) : 0
    
    const suggestions: string[] = []
    
    if (complexity > 20) {
      suggestions.push('句子可能过长，建议拆分复杂句子')
    }
    
    if (words < 100) {
      suggestions.push('内容较短，可以考虑增加更多细节')
    }
    
    // Simple sentiment analysis
    const positiveWords = ['好', '优秀', '成功', '进步', '发展', '创新', '美好']
    const negativeWords = ['问题', '困难', '挑战', '风险', '失败', '局限']
    
    let positiveCount = 0
    let negativeCount = 0
    
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveCount++
    })
    
    negativeWords.forEach(word => {
      if (text.includes(word)) negativeCount++
    })
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (positiveCount > negativeCount) sentiment = 'positive'
    else if (negativeCount > positiveCount) sentiment = 'negative'
    
    return {
      sentiment,
      complexity: Math.round(complexity * 10) / 10,
      suggestions
    }
  }
  
  // Update configuration
  updateConfig(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config }
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null

export const getAIService = (config?: AIConfig): AIService => {
  if (!aiServiceInstance && config) {
    aiServiceInstance = new AIService(config)
  }
  
  if (!aiServiceInstance) {
    throw new Error('AIService not initialized. Please provide configuration.')
  }
  
  return aiServiceInstance
}

// Utility function for speech generation
export const generateSpeechWithAI = async (
  topic: string,
  options?: Partial<SpeechGenerationRequest>
): Promise<{
  text: string
  analysis: any
}> => {
  const defaultOptions: SpeechGenerationRequest = {
    topic,
    length: 'medium',
    style: 'formal',
    language: 'zh-CN',
    ...options
  }
  
  // In a real app, you would get the config from store
  const mockConfig: AIConfig = {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000
  }
  
  const service = new AIService(mockConfig)
  const response = await service.generateSpeech(defaultOptions)
  const analysis = await service.analyzeText(response.text)
  
  return {
    text: response.text,
    analysis
  }
}