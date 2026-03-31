import React, { useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { javascript } from '@codemirror/lang-javascript'
import { useAppStore } from '@/store'
import { Edit, Eye, Copy, Trash2, Clock, FileText } from 'lucide-react'

const SpeechEditor: React.FC = () => {
  const { currentSpeech, setCurrentSpeech } = useAppStore()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [wordCount, setWordCount] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  
  // Initialize with current speech
  useEffect(() => {
    if (currentSpeech) {
      setContent(currentSpeech.content)
      setTitle(currentSpeech.title)
      calculateStats(currentSpeech.content)
    } else {
      setContent('# 欢迎使用AI虚拟人演讲者\n\n请在上方输入主题并点击"生成演讲稿"开始。\n\n或者，您可以在这里直接编辑演讲稿。')
      setTitle('新演讲稿')
      calculateStats('')
    }
  }, [currentSpeech])
  
  // Calculate word count and estimated time
  const calculateStats = (text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const totalWords = words + chineseChars
    const minutes = Math.ceil(totalWords / 150) // Assuming 150 words per minute
    
    setWordCount(totalWords)
    setEstimatedTime(minutes)
  }
  
  const handleContentChange = (value: string) => {
    setContent(value)
    calculateStats(value)
    
    // Update current speech if exists
    if (currentSpeech) {
      setCurrentSpeech({
        ...currentSpeech,
        content: value,
        title: title,
        updatedAt: new Date(),
        duration: estimatedTime * 60,
      })
    }
  }
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    
    if (currentSpeech) {
      setCurrentSpeech({
        ...currentSpeech,
        title: newTitle,
        updatedAt: new Date(),
      })
    }
  }
  
  const handleSave = () => {
    if (!content.trim()) {
      alert('演讲稿内容不能为空')
      return
    }
    
    const speech = {
      id: currentSpeech?.id || Date.now().toString(),
      title: title || '未命名演讲稿',
      content,
      topic: currentSpeech?.topic || '自定义主题',
      duration: estimatedTime * 60,
      createdAt: currentSpeech?.createdAt || new Date(),
      updatedAt: new Date(),
    }
    
    setCurrentSpeech(speech)
    alert('演讲稿已更新')
  }
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => alert('演讲稿已复制到剪贴板'))
      .catch(err => console.error('复制失败:', err))
  }
  
  const handleClear = () => {
    if (confirm('确定要清空演讲稿吗？')) {
      setContent('')
      setTitle('新演讲稿')
      setCurrentSpeech(undefined)
    }
  }
  
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分钟`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`
    }
  }
  
  return (
    <div className="glass-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary-400" />
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="演讲稿标题"
              className="bg-transparent text-lg font-semibold text-gray-200 border-none outline-none focus:ring-0 min-w-[200px]"
            />
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>预计时长: {formatTime(estimatedTime)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>字数: {wordCount}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {viewMode === 'edit' ? (
              <>
                <Eye className="w-4 h-4" />
                <span>预览</span>
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                <span>编辑</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Editor/Preview */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'edit' ? (
          <div className="h-full">
            <CodeMirror
              value={content}
              height="100%"
              theme="dark"
              extensions={[markdown(), javascript()]}
              onChange={handleContentChange}
              className="h-full text-sm"
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                foldGutter: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                syntaxHighlighting: true,
                tabSize: 2,
              }}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-6">
            <div className="prose prose-invert max-w-none">
              <h1 className="text-3xl font-bold text-gray-200 mb-6">{title}</h1>
              <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                {content.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h2 key={index} className="text-2xl font-semibold text-gray-200 mt-6 mb-4">{line.substring(2)}</h2>
                  } else if (line.startsWith('## ')) {
                    return <h3 key={index} className="text-xl font-semibold text-gray-200 mt-5 mb-3">{line.substring(3)}</h3>
                  } else if (line.startsWith('### ')) {
                    return <h4 key={index} className="text-lg font-semibold text-gray-200 mt-4 mb-2">{line.substring(4)}</h4>
                  } else if (line.trim() === '') {
                    return <br key={index} />
                  } else {
                    return <p key={index} className="mb-4">{line}</p>
                  }
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-800/50">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <span>状态:</span>
            <span className={`px-2 py-1 rounded ${currentSpeech ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {currentSpeech ? '已保存' : '未保存'}
            </span>
          </div>
          {currentSpeech && (
            <div className="flex items-center space-x-1">
              <span>最后更新:</span>
              <span>{currentSpeech.updatedAt.toLocaleString('zh-CN')}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="复制演讲稿"
          >
            <Copy className="w-4 h-4" />
            <span>复制</span>
          </button>
          
          <button
            onClick={handleClear}
            className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            title="清空演讲稿"
          >
            <Trash2 className="w-4 h-4" />
            <span>清空</span>
          </button>
          
          <button
            onClick={handleSave}
            className="btn-primary flex items-center space-x-2"
          >
            <span>保存更改</span>
          </button>
        </div>
      </div>
      
      {/* Tips */}
      <div className="p-3 bg-gray-800/30 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          <strong>提示:</strong> 支持Markdown格式。使用 # 标题、**粗体**、*斜体*、- 列表等。
          {!currentSpeech && ' 请先生成演讲稿或直接在此编辑。'}
        </div>
      </div>
    </div>
  )
}

export default SpeechEditor