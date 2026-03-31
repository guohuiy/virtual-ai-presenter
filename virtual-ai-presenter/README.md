# AI虚拟人演讲者

一个集成了大模型AI的3D虚拟人网站，虚拟人可以作为表象，AI作为内核，能够说话、演讲、做播客。

## 功能特性

1. **3D虚拟人展示**
   - 使用Three.js渲染3D虚拟人模型
   - 支持表情、口型同步和肢体动作
   - 实时语音驱动动画

2. **AI大模型集成**
   - 集成OpenAI GPT或本地大模型
   - 支持文本生成和语音合成
   - 根据主题和演讲稿生成演讲内容

3. **演讲和播客功能**
   - 根据主题自动生成演讲稿
   - 支持导入外部演讲稿
   - 语音合成和播放控制
   - 播客录制和导出功能

4. **用户界面**
   - 3D虚拟人主展示区
   - 底部控制工具栏
   - 主题输入和演讲稿编辑器
   - 播放控制和设置面板

## 技术栈

- **前端**: React + TypeScript + Three.js
- **3D引擎**: Three.js + GLTF模型加载
- **AI集成**: OpenAI API / 本地LLM
- **语音合成**: Web Speech API / ElevenLabs API
- **样式**: Tailwind CSS
- **构建工具**: Vite

## 项目结构

```
virtual-ai-presenter/
├── public/              # 静态资源
├── src/
│   ├── components/      # React组件
│   │   ├── VirtualHuman/ # 3D虚拟人组件
│   │   ├── Toolbar/     # 工具栏组件
│   │   ├── SpeechEditor/ # 演讲稿编辑器
│   │   └── Controls/    # 控制面板
│   ├── services/        # 服务层
│   │   ├── ai/          # AI服务
│   │   ├── speech/      # 语音服务
│   │   └── animation/   # 动画服务
│   ├── hooks/           # 自定义Hooks
│   ├── utils/           # 工具函数
│   ├── types/           # TypeScript类型定义
│   ├── App.tsx          # 主应用组件
│   └── main.tsx         # 应用入口
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 快速开始

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑.env文件，添加您的API密钥
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 构建生产版本：
```bash
npm run build
```

## 配置说明

### AI模型配置
- 支持OpenAI GPT-4/3.5
- 支持本地部署的LLM（如Llama、ChatGLM）
- 可配置API端点和密钥

### 3D模型配置
- 支持GLTF/GLB格式的3D模型
- 可配置模型路径和动画
- 支持自定义材质和纹理

### 语音合成配置
- 支持Web Speech API（免费）
- 支持ElevenLabs API（高质量）
- 可配置语音风格和参数

## 使用示例

1. 在主题输入框中输入演讲主题
2. 点击"生成演讲稿"让AI自动生成内容
3. 或直接在编辑器中输入/粘贴演讲稿
4. 点击"开始演讲"让虚拟人开始演讲
5. 使用控制面板调整语速、音调等参数

## 部署

### Vercel部署
```bash
npm run build
vercel --prod
```

### Docker部署
```bash
docker build -t virtual-ai-presenter .
docker run -p 3000:3000 virtual-ai-presenter
```

## 许可证

MIT