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
   打开浏览器访问 [http://localhost:3003](http://localhost:3003)

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

## P0 验收复现 (Reproduction)

请执行以下命令验证 P0 版本核心逻辑：

1. **基础连通**:
   `curl --max-time 5 -s http://localhost:3003/health | jq .`

2. **基础生成 (包含 validation 字段)**:
   `curl --max-time 5 -s -X POST http://localhost:3003/api/generate -H "Content-Type: application/json" -d '{"world":"advertising"}' | jq '.[0].validation'`

3. **Subject Kit Miss 报错检测**:
   `curl --max-time 5 -s -X POST http://localhost:3003/api/generate -H "Content-Type: application/json" -d '{"world":"advertising","overrides":{"subject_kit":"NON_EXISTENT"}}' | jq '.[0].validation'`

4. **Required Twist 追加检测**:
   `curl --max-time 5 -s -X POST http://localhost:3003/api/generate -H "Content-Type: application/json" -d '{"world":"advertising","logic":"process-driven","overrides":{"twist_mechanisms":["scale_mismatch"]}}' | jq '.[0] | {twist_ids: .twist_ids, warnings: .validation.warnings}'`

5. **Prefixed 输入归一化检测**:
   `curl --max-time 5 -s -X POST http://localhost:3003/api/generate -H "Content-Type: application/json" -d '{"world":"advertising","overrides":{"twist_mechanisms":["twist:scale_mismatch"]}}' | jq '.[0] | {twist_ids: .twist_ids, warnings: .validation.warnings}'`
