# MetaGeny (创意随机抽取器 - Web 版)

这是一个基于 Node.js 的创意骨架生成工具。它可以从预设的“创意世界”中随机抽取组合，生成结构化的创意描述 JSON，用于后续的 AI 提示词编写或灵感激发。

## 功能

- **Web 界面**：直观的网页操作，选择创意世界和生成数量。
- **REST API**：提供 JSON 格式的 API 接口。
- **随机生成**：支持多种创意世界的随机组合逻辑。

## 包含文件

- `server.js`: Express 服务器后端
- `src/logic.js`: 核心生成逻辑 (移植自 Python)
- `public/`: 前端静态资源 (HTML/CSS/JS)

## 如何运行

确保您已安装 Node.js。

1. **安装依赖**：
   ```bash
   npm install
   ```

2. **启动服务器**：
   ```bash
   node server.js
   ```

3. **访问页面**：
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## API 使用

- **获取可用世界列表**:
  `GET /api/worlds`

- **生成创意**:
  `POST /api/generate`
  ```json
  {
    "world": "product_photography",
    "n": 3
  }
  ```
  *(world 可选 "any")*
