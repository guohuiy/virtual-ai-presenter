import React, { useState } from 'react'
import { useAppStore } from '@/store'
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Save, 
  Download, 
  Settings, 
  FileText,
  Podcast,
  Sparkles,
  Volume2,
  Type
} from 'lucide-react'

const Toolbar: React.FC = () => {
  const {
    isSpeaking,
    isGenerating,
    isRecording,
    currentSpeech,
    generateSpeech,
    startSpeaking,
    stopSpeaking,
    recordPodcast,
    saveSpeech,
  } = useAppStore()
  
  const [topic, setTopic] = useState('人工智能与未来')
  const [showSettings, setShowSettings] = useState(false)
  const [podcastTitle, setPodcastTitle] = useState('我的播客')
  const [podcastDescription, setPodcastDescription] = useState('关于人工智能的讨论')
  
  const handleGenerateSpeech = async () => {
    if (!topic.trim()) {
      alert('请输入主题')
      return
    }
    
    try {
      await generateSpeech(topic)
    } catch (error) {
      console.error('生成演讲稿失败:', error)
      alert('生成演讲稿失败，请重试')
    }
  }
  
  const handleStartSpeaking = () => {
    if (currentSpeech) {
      startSpeaking(currentSpeech)
    } else {
      alert('请先生成演讲稿')
    }
  }
  
  const handleRecordPodcast = async () => {
    if (!podcastTitle.trim()) {
      alert('请输入播客标题')
      return
    }
    
    try {
      await recordPodcast(podcastTitle, podcastDescription)
      alert('播客录制完成！')
    } catch (error) {
      console.error('录制播客失败:', error)
      alert('录制播客失败，请重试')
    }
  }
  
  const handleSaveSpeech = () => {
    if (currentSpeech) {
      saveSpeech(currentSpeech)
      alert('演讲稿已保存')
    } else {
      alert('没有可保存的演讲稿')
    }
  }
  
  const toolbarActions = [
    {
      id: 'generate',
      label: '生成演讲稿',
      icon: <Sparkles className="w-5 h-5" />,
      description: '根据主题生成演讲稿',
      action: handleGenerateSpeech,
      disabled: isGenerating,
    },
    {
      id: 'speak',
      label: isSpeaking ? '停止演讲' : '开始演讲',
      icon: isSpeaking ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />,
      description: isSpeaking ? '停止虚拟人演讲' : '开始虚拟人演讲',
      action: isSpeaking ? stopSpeaking : handleStartSpeaking,
      disabled: !currentSpeech && !isSpeaking,
    },
    {
      id: 'record',
      label: isRecording ? '录制中...' : '录制播客',
      icon: isRecording ? <Mic className="w-5 h-5 animate-pulse" /> : <Podcast className="w-5 h-5" />,
      description: '录制播客节目',
      action: handleRecordPodcast,
      disabled: isRecording,
    },
    {
      id: 'save',
      label: '保存',
      icon: <Save className="w-5 h-5" />,
      description: '保存当前演讲稿',
      action: handleSaveSpeech,
      disabled: !currentSpeech,
    },
    {
      id: 'export',
      label: '导出',
      icon: <Download className="w-5 h-5" />,
      description: '导出演讲稿或音频',
      action: () => alert('导出功能开发中'),
    },
    {
      id: 'settings',
      label: '设置',
      icon: <Settings className="w-5 h-5" />,
      description: '打开设置面板',
      action: () => setShowSettings(!showSettings),
    },
  ]
  
  return (
    <div className="glass-panel p-4">
      <div className="flex flex-col space-y-4">
        {/* Topic input */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              演讲主题
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="请输入演讲主题..."
                className="input-field flex-1"
              />
              <button
                onClick={handleGenerateSpeech}
                disabled={isGenerating}
                className="btn-primary flex items-center space-x-2 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? '生成中...' : '生成演讲稿'}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {toolbarActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              disabled={action.disabled}
              className="flex flex-col items-center justify-center p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              title={action.description}
            >
              <div className="mb-2 text-primary-400 group-hover:text-primary-300">
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-gray-200">
                {action.label}
              </span>
            </button>
          ))}
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span>{isSpeaking ? '演讲中' : '待机中'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span>{isGenerating ? 'AI生成中' : 'AI就绪'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span>{isRecording ? '录制中' : '录制就绪'}</span>
            </div>
          </div>
          
          {currentSpeech && (
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>{currentSpeech.title}</span>
              <span className="text-gray-500">·</span>
              <span>{Math.ceil(currentSpeech.duration / 60)}分钟</span>
            </div>
          )}
        </div>
        
        {/* Podcast recording panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-800/30 rounded-lg animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
              <Podcast className="w-5 h-5 mr-2" />
              播客录制设置
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  播客标题
                </label>
                <input
                  type="text"
                  value={podcastTitle}
                  onChange={(e) => setPodcastTitle(e.target.value)}
                  placeholder="请输入播客标题..."
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  播客描述
                </label>
                <textarea
                  value={podcastDescription}
                  onChange={(e) => setPodcastDescription(e.target.value)}
                  placeholder="请输入播客描述..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    语音设置
                  </label>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 text-gray-400 hover:text-gray-300">
                      <Volume2 className="w-4 h-4" />
                      <span>音量</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-400 hover:text-gray-300">
                      <Type className="w-4 h-4" />
                      <span>语速</span>
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleRecordPodcast}
                  disabled={isRecording}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>{isRecording ? '录制中...' : '开始录制播客'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Toolbar