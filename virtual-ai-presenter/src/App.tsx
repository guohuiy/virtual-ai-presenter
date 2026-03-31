import React from 'react'
import VirtualHumanScene from '@/components/VirtualHuman'
import Toolbar from '@/components/Toolbar'
import SpeechEditor from '@/components/SpeechEditor'
import { useAppStore } from '@/store'
import { Brain, Volume2, Users, Zap } from 'lucide-react'

const App: React.FC = () => {
  const { isSpeaking, isGenerating, currentSpeech } = useAppStore()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 flex items-center">
              <Brain className="w-8 h-8 mr-3 text-primary-400" />
              AI虚拟人演讲者
            </h1>
            <p className="text-gray-400 mt-2">
              集成大模型AI的3D虚拟人演讲平台 - 虚拟人作为表象，AI作为内核
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span>{isSpeaking ? '演讲中' : '待机'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span>{isGenerating ? 'AI生成中' : 'AI就绪'}</span>
              </div>
            </div>
            
            <button 
              onClick={() => window.location.reload()}
              className="btn-secondary text-sm"
            >
              重置
            </button>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-panel p-3 flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-200">AI大模型内核</h3>
              <p className="text-xs text-gray-400">GPT/本地LLM集成</p>
            </div>
          </div>
          
          <div className="glass-panel p-3 flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-200">3D虚拟人表象</h3>
              <p className="text-xs text-gray-400">实时动画与交互</p>
            </div>
          </div>
          
          <div className="glass-panel p-3 flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-200">智能语音合成</h3>
              <p className="text-xs text-gray-400">自然语音与口型同步</p>
            </div>
          </div>
          
          <div className="glass-panel p-3 flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-200">演讲与播客</h3>
              <p className="text-xs text-gray-400">录制与导出功能</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 3D Virtual Human - Left Column */}
        <div className="lg:col-span-2">
          <div className="glass-panel h-full">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-gray-200 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-400" />
                3D虚拟人展示
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                交互式3D虚拟人，支持语音驱动动画和实时控制
              </p>
            </div>
            <div className="h-[500px] md:h-[600px] p-2">
              <VirtualHumanScene />
            </div>
            <div className="p-4 border-t border-gray-700 bg-gray-800/30">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400">
                  {currentSpeech ? (
                    <span>正在演讲: <span className="text-gray-300">{currentSpeech.title}</span></span>
                  ) : (
                    <span>等待演讲稿...</span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <button className="text-xs text-gray-400 hover:text-gray-300">
                    旋转: 鼠标拖拽
                  </button>
                  <button className="text-xs text-gray-400 hover:text-gray-300">
                    缩放: 鼠标滚轮
                  </button>
                  <button className="text-xs text-gray-400 hover:text-gray-300">
                    平移: 右键拖拽
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Speech Editor - Right Column */}
        <div className="lg:col-span-1">
          <div className="h-full">
            <SpeechEditor />
          </div>
        </div>
      </main>
      
      {/* Toolbar */}
      <footer>
        <Toolbar />
        
        {/* Footer info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            AI虚拟人演讲者 v1.0 · 集成大模型AI的3D虚拟人演讲平台 · 
            技术支持: React + Three.js + AI大模型
          </p>
          <p className="mt-1">
            使用说明: 1. 输入主题生成演讲稿 2. 编辑或预览演讲稿 3. 开始演讲 4. 录制播客
          </p>
        </div>
      </footer>
      
      {/* Speech status indicator */}
      {isSpeaking && (
        <div className="fixed bottom-20 right-4 animate-pulse">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-full p-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Volume2 className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App