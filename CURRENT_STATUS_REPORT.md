# 代码现状盘点报告 (Status Audit Report)

## 1) 项目概览 (Project Overview)

- **技术栈**:
  - **服务端**: Node.js + Express (`server.js`, `package.json`).
  - **前端**: Vanilla JavaScript + HTML5 + CSS (`public/script.js`, `public/style.css`).
  - **交互**: 单页应用 (SPA-like), 通过 `/api/generate` 和 `/api/config` 进行数据交互.
  - **部署**: 本地开发 (`npm start`), 依赖 `express`.

- **入口与路由**:
  - **UI 入口**: `public/index.html`.
  - **API 路由**:
    - `GET /api/config`: 返回完整维度配置 (Worlds, Intents, Logics).
    - `POST /api/generate`: 核心生成接口.
    - `GET /api/worlds`: (Legacy) 获取世界列表.

- **关键功能**:
  - **生成**: 基于“创意世界” + “创作动机” + “生成逻辑”的组合生成 (n=1~20).
  - **筛选**: 支持手动覆盖 (Overrides) 核心张力、反转机制等维度.
  - **多语言**: 前端 `i18n` (En/Zh) 切换, 后端通过 `lang` 参数处理部分本地化.
  - **收藏/复制**: 前端 `localStorage` 存储 (`idea_favorites`), 剪贴板复制 JSON.

---

## 2) 当前数据模型与字段清单 (Data Model & Schema)

### 2.1 创意骨架 Schema (后端返回)
数据生成逻辑位于 `src/logic.js` 的 `generateCreativeSkeleton` 函数中 (Lines 1621+).

| 字段名 | 类型 | 说明 | 来源/备注 |
| :--- | :--- | :--- | :--- |
| `creative_id` | String | 唯一ID (e.g., "7a8b9c") | `generateId()` (Line 1638) |
| `creative_world` | String | 世界ID (e.g., "advertising") | 必选, 整个骨架的基础 |
| `core_tension` | String | 核心张力描述 | `WORLDS[w].core_tension` |
| `twist_mechanisms` | Array<String> | 反转机制列表 (文本) | `WORLDS[w].twist_mechanisms_pool` |
| `subject_kit` | Object | 主体套件 | 结构见下 |
| `stage_context` | String | 场景/环境描述 | `WORLDS[w].stage_context` |
| `composition_rule` | String | 构图规则 | `WORLDS[w].composition_rule` |
| `lighting_rule` | String | 布光规则 | `WORLDS[w].lighting_rule` |
| `creation_intent` | String | 创作动机ID (e.g., "sell") | 影响权重/约束 |
| `generation_logic` | String | 生成逻辑ID (e.g., "system-driven") | 影响入口/反转 |
| `deliverable_type` | String | 交付物类型 (e.g., "Ad Key Visual") | `WORLDS[w].deliverable_type` |
| `imaging_assumption` | String | 成像假设ID | 决定 `imaging_profile` |
| `final_prompt` | String | 拼装好的自然语言提示词 | `assemblePrompt()` 生成 |
| `rule_hits` | Array<Object> | 命中规则/权重的记录 |用于 Debug/UI 展示 |
| `selected_fields` | Object | 包含 ID/Value/Candidates 的详细对象 | 用于前端回显控制 |

### 2.2 Subject Kit 结构
在 `src/logic.js` 中定义，但在传输和前端使用时存在混乱。
- **定义**: `{ primary_subject: {en:...,zh:...}, secondary_elements: [...] }`
- **输出 (JSON)**:
  ```json
  {
      "primary_subject": "String (Localized)",
      "secondary_elements": ["String (Localized)", ...]
  }
  ```

### 2.3 命名不一致与潜在风险 (Naming Inconsistencies)

| 概念 | 后端字段 (Source) | 前端展示/处理 (UI) | 矛盾点/风险 |
| :--- | :--- | :--- | :--- |
| **主体** | `subject_kit.primary_subject` | `item.subject_kit.primary` 或 `primary_subject` | `script.js` (Line 669) 做了三重 fallback (`primary_subject` \|\| `primary` \|\| `subjectKit`), 极易出错. |
| **反转机制** | `twist_mechanisms` (Array of Strings) | `item.twist_mechanisms` 或 `selected.twist_mechanisms` | 后端有时返回对象数组, 有时清洗为字符串数组; 前端 `script.js` (Line 651) 需要判断 `selected_values`/`selected_ids` 极为复杂. |
| **字段值ID** | `dimension:value-slug` (e.g. `core:desire-vs-control`) | `clean()` 去除冒号前缀 (Line 637) | 后端 `getStableOptionId` 强制加前缀, 前端强制去前缀, 导致 Override 回传时 IDs 可能不匹配. |

---

## 3) 维度库与随机抽取 (Dimensions & Sampler)

- **维度库位置**: `src/logic.js` 中的 `const WORLDS = { ... }` (Line 437+).
- **随机入口**: `src/logic.js` -> `generateCreativeSkeleton(options)`.
- **抽取逻辑**:
  - `selectWithRecording` 函数 (Line 1435) 统一处理随机抽取.
  - **优先级**:
    1. **Override (前端强制指定)**: 优先级最高.
    2. **Inspiration Seed (灵感种子)**: 如果命中关键词, `inspirationWeights` 会覆盖或加权 (Lines 1537, 1650).
    3. **Weight Bias (Intent)**: `CREATION_INTENTS` 中的 `weight_bias` 影响 World 概率.
    4. **Random**: 纯随机.
- **重新生成**: 前端 `generateBtn` 点击 -> `generateIdeas()` -> `fetch('/api/generate')`.

---

## 4) 约束与依赖 (Constraints & Logic)

存在明确的逻辑校验层，并未“裸奔”。

- **位置**: `src/logic.js` 中的 `generateCreativeSkeleton` 内部.
- **主要规则**:
  1. **互斥 (Forbidden)**:
     - `FORBIDDEN_MECHANISMS_BY_WORLD`: 全局定义的互斥表 (Lines 1292).
     - `WORLDS[w].forbidden_visual_terms`: 视觉禁词 (Line 609等), 通过 `sanitizeValue` 清洗.
     - `intentObj.forbidden_tensions`: 动机排斥特定张力 (Line 11).
  2. **依赖 (Required)**:
     - `logicObj.required_twist_category`: 特定生成逻辑强制包含某类反转 (Line 51).
     - `logicObj.preferred_entry`: 特定生成逻辑偏好某种入口 (Line 56).
- **风险**: 前端 Override 时**未经过**完整的校验逻辑 (如果直接传 ID), 可能会绕过部分互斥规则，或者造成 后端 `sanitizeValue` 默默丢弃用户输入的值。

---

## 5) Prompt/文案拼装 (Prompt Assembly)

存在拼装逻辑。

- **位置**: `src/logic.js` -> `function assemblePrompt(governance)` (Line 1589).
- **拼装顺序**:
  1. `deliverable_type`
  2. "featuring" + `subject_kit` (primary + secondary)
  3. "inspired by" + `core_tension`
  4. "with" + `twist_mechanisms`
  5. "set in" + `stage_context`
  6. "following" + `composition_rule`
  7. "lit by" + `lighting_rule`
- **逻辑**: 直接字符串拼接 (English only template).
- **状态**: 这是一个非常“死板”的拼接，没有根据不同 World 做句式变化 (Template Mapping 较弱).

---

## 6) UI 与状态流 (UI & State)

- **顶部筛选区**:
  - 对应 `World`, `Intent`, `Logic`, `Imaging`.
  - 下方高级区域 (Advanced) 对应 `Core Tension`, `Twist`, `Subject`, `Stage`, `Composition`, `Lighting`.
  - 数据源: `globalConfig` (来自 `/api/config`).
- **卡片展示**:
  - 动态创建 DOM (`createCardElement` in `script.js`).
  - 展示字段: 几乎所有后端返回的字段.
  - **收藏**: 存入 `localStorage.getItem('idea_favorites')`, 结构为完整的 JSON 对象（容易导致版本不兼容）.
  - **复制**: `JSON.stringify(item)`.

---

## 7) 结构性混乱点 (Top 10 Messy Points)

1.  **Selection Logic Complexity**: `selectWithRecording` (Line 1435) 试图同时兼容 ID 匹配、Value 匹配、Slug 匹配和 Raw Object 匹配，逻辑极其臃肿且脆弱。
2.  **ID Prefix Hell**: 后端生成 `dimension:slug` 形式的 ID, 前端 `clean()` (Line 637) 暴力移除冒号前缀进行展示，导致 ID 系统在前后端交互中“失真”。
3.  **Twist Mechanism Handling**: `twist_mechanisms` 是唯一的“多选”字段，后端处理逻辑 (Line 1894) 和前端渲染逻辑 (Line 651) 都为此写了大量特例代码 (Array vs Single Object vs String)。
4.  **Subject Kit Schema Disconnect**: 后端定义清楚的 `{primary, secondary}` 结构，在前端渲染时被多次 check (property names 不统一)，暗示历史上改过多次名。
5.  **Inspiration Seed Regex**: `parseInspirationSeed` (Line 1537) 使用硬编码的正则匹配中文/英文关键词，列表极长 (Lines 84-402)，维护成本极高，且容易误判。
6.  **Sanitize Silent Fail**: `sanitizeValue` 会在发现禁词时默默替换为空格 (Line 1512)，用户不知情，可能导致生成的 Prompt 缺字漏词。
7.  **Server Result Shaping**: `server.js` 中的 `shapeResult` (Line 37) 对返回数据结构做了硬编码的裁剪 (governance record vs model input)，导致前端调试时有时拿不到 ID。
8.  **Frontend Logic Leaking**: `script.js` 里写了大量的 UI 逻辑来处理 World 联动 (`populateWorldDimensionControls`)，这部分本该由后端 Config 驱动，现在耦合在 DOM 操作里。
9.  **Language Handling**: 后端部分字段只有 `en`，部分有 `zh`，前端 `t()` 函数 (Line 61) 做了极其复杂的 fallback (En/Zh split, Object check)，数据层面的多语言标准未统一。
10. **Validate Lack**: 虽然有 `sanitize`，但对于 Override 传入的参数，后端没有做严格的 `Candidate Check` (仅做 Warning)，用户可能通过 API 传入不属于该 World 的值。

---

## 8) 最小事实集合 (Minimal Facts for Architect)

- **Schema Status**: 核心 JSON 骨架包含 8 个主要维度，其中 `twist_mechanisms` 是数组，其余为单值/对象。
- **Source of Truth**: 维度数据完全静态定义在 `src/logic.js` (Lines 437+)，未通过数据库管理。
- **Logic Flow**: `generateCreativeSkeleton` 是上帝函数，包含所有权重、随机、互斥和拼装逻辑 (约 400 行)。
- **Prompting**: 仅实现了最基础的“字段拼接” (`assemblePrompt`)，无动态模板。
- **Overrides**: 前后端通过 ID 交互，但 ID 格式不统一 (`prefix:slug` vs `clean slug`).
- **Data Persistence**: 无后端存储，依靠 LocalStorage。
- **Multilingual**: 混合策略 (Backend Config + Frontend Fallback)，标准混乱。
- **Code Coupling**: 业务逻辑高度集中在 `src/logic.js`，易于迁移但难于维护扩展。
