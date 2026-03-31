# Virtual AI Presenter — Technical Design

## Purpose
提供一个以3D虚拟人作为表象、集成大模型为内核的演讲/播客平台。本文档定义微服务拆分、关键接口、数据流、部署与扩展建议，及 MVP 范围。

## High-level Architecture
- API Gateway (HTTPS / WebSocket / WebRTC)
- Web Client (React + Three.js)
- Orchestrator (业务编排，脚本预处理、情绪/分镜生成)
- LM Inference (LLM 推理服务，支持流式输出)
- TTS Service (流式 TTS，导出 phoneme/viseme 时间戳)
- Animation Service (将 viseme/情绪映射为 avatar 动画或 blendshapes)
- Media Service (录制、转码、存储)
- Assets Service (模型/表情/动作/声音包管理)
- Auth/User/Quota Service
- Message Bus (Kafka/RabbitMQ)
- Observability (Prometheus/Grafana, ELK/Loki)

## Services & Responsibilities
- `api-gateway`: HTTPS, JWT 验证、路由、限流、WebSocket 协议终端
- `web-client`: 渲染 3D avatar，播放音频、接收 viseme/事件流
- `orchestrator`: 处理用户请求，拆分任务，调用 LLM/TTS，管理会话状态
- `lm-inference`: LLM 模型推理，支持流式输出和版本管理
- `tts-service`: 文本到语音，返回流式音频与 viseme 时间戳
- `animation-service`: 根据 viseme + 情绪映射前端动画指令或预渲染帧
- `media-service`: 录制会话、生成下载链接、转码与存储
- `assets-service`: 存储与版本化 3D 模型、表情与动作数据
- `auth-service`: 用户认证、配额与付费集成

## Data Flow (simplified)
1. 客户端通过 `api-gateway` 建立会话（WebSocket/WebRTC）。
2. 提交主题/稿件到 `orchestrator`。
3. `orchestrator` 请求 `lm-inference` 生成最终文本并附带语气/情绪标注（流式）。
4. 生成文本传给 `tts-service`，返回流式音频与 `viseme` 时间戳。
5. 前端接收音频流与 `viseme` 事件并驱动 avatar 动画；或 `animation-service` 预渲染时间轴供前端播放。
6. `media-service` 可在后台合成并存储最终音视频/播客文件。

## Interface Strategy
- 外部：REST + WebSocket / WebRTC（OpenAPI 文档参见 /api/openapi.yaml）
- 内部：gRPC / protobuf（高吞吐、低延迟，参见 /proto/presenter.proto）

## Deployment
- 使用 Kubernetes 部署，LM/TTS 放到 GPU 节点池（nodeSelector + tolerations）。
- Horizontal Pod Autoscaler（基于 CPU/queue-length）、GPU 池按需扩缩。
- 模型与媒体文件存储在 S3 兼容对象存储；元数据放 Postgres；会话缓存用 Redis。

## Scaling & Cost Optimizations
- 短请求先走小模型快速响应；复杂/长文本走大模型异步完成。
- 使用模型实例池（预热）减少冷启动。
- 对重复文本或常见片段缓存 TTS 输出与 viseme 时间轴。

## Security & Content Safety
- 鉴权：OAuth2 + JWT，API Gateway 限流与 RBAC。
- 内容审核：在 Orchestrator 前对生成文本/用户稿件做敏感内容检测并记录审计日志。
- 隐私：用户数据加密存储，提供删除/导出接口以满足 GDPR。

## Observability
- 指标：请求延迟、模型推理时间、音频生成速率、错误率
- 日志：集中式日志（ELK/Loki）+ 分布式追踪（Jaeger）

## MVP Scope (建议)
- MVP-1: 文本输入 → LLM（或 Mock）→ TTS（预录/流）→ 前端播放 + 基本唇形同步
- MVP-2: 流式播放 (WebRTC)、情绪/语速控制、录制导出

## Acceptance Checklist (for approval)
- [ ] 服务清单与职责被确认
- [ ] OpenAPI（外部契约）审阅并接受
- [ ] protobuf（内部契约）审阅并接受
- [ ] K8s 部署模板与资源清单（包含 GPU 池规则）审阅
- [ ] 隐私/合规点确认（数据保存时长、删除策略）

## Next Steps
1. 若接受契约，我将基于这些接口实现 MVP-1（mock LLM/TTS + 前端 demo）。
2. 编写 contract tests（OpenAPI validation + protobuf schema tests）。
3. 添加 CI 作业，自动生成 SDK（OpenAPI / protobuf）并运行简单集成测试。
