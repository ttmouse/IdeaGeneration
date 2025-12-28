# MetaGeny — 创意骨架生成器

> 从预设"创意世界"中随机抽取组合，生成结构化创意描述 JSON，用于 AI 提示词编写或灵感激发。

## 目录结构 / Directory Structure

```
.
├── src/              # 核心生成逻辑 / Core generation engine
├── public/           # 前端界面 / Frontend UI
├── docs/             # 规范文档 / Specifications
├── server.js         # API 服务器 / Express API server
└── PROTOCOL.md       # 文档协议 / Documentation protocol
```

## 模块边界 / Module Boundaries

| 层级 | 职责 | 入口 |
|------|------|------|
| `src/` | 创意生成算法、数据配置 | `logic.js` |
| `public/` | 用户界面、API 消费 | `index.html` |
| `server.js` | HTTP 边界、路由 | `/api/*` endpoints |
| `docs/` | 接口契约、数据规范 | `CONTRACT.md` |

## 快速启动 / Quick Start

```bash
npm install
node server.js
# 访问 http://localhost:3003
```

## API 端点 / Endpoints

| Method | Path | 描述 |
|--------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api/config` | 获取全部配置 |
| GET | `/api/worlds` | 获取可用世界列表 |
| POST | `/api/generate` | 生成创意骨架 |

## 文档协议 / Documentation Protocol

本项目使用 **Fractal Docs Protocol V2** 维护文档一致性：
- 宏观地图：本 README
- 局部地图：各目录 `.folder.md`
- 边界文件：IN/OUT/POS 三行头注释

> Only update documentation when boundaries, structure, or responsibilities change.
