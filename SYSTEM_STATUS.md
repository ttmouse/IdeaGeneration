# 当前系统状态说明（2025-12-25 再检测）

━━━━━━━━━━━━━━━━━━
**一、接口与输出结构现状**
━━━━━━━━━━━━━━━━━━

*   `GET /api/config` (`server.js`): 返回 `worlds`, `intents`, `logics`, `imaging_assumptions` 四个对象，用于前端填充下拉菜单。`worlds` 是带完整配置的对象，而不是纯名称数组。
*   `GET /api/worlds`: 仍然保留的 Legacy 列表，只返回世界名称数组，当前前端未使用。
*   `POST /api/generate`: 接收 JSON 负载 `{ world, intent, logic, imaging_assumption, n, lang, mode, seed }`。
    * `world/intention/logic/imaging_assumption` 均支持传 `"any"` 或缺省，缺省时由系统随机决策。
    * `n` 被夹在 1~20 之间（默认为 1），无论值为何响应始终是 **长度为 n 的数组**。
    * `mode ∈ {model, full, debug}`，无效值会被降级为 `full`。`full` 也是默认值（前端采用这一模式）。
    * `seed` 为可选数值；如果传入且请求 `n>1`，系统会对每个样本使用 `seed + index`，保证批次内稳定但仍可漂移。
    * 错误分支：非法 `world` 会返回 `400`，业务逻辑被 `PromptAssemblyError` 拦截时返回 `422`，其他异常为 `500`。

**mode=model（数组形式，仅最小模型上下文）**
```json
[
  {
    "creative_world": "meme_logic",
    "core_tension": "Corporate Voice Glitch",
    "twist_mechanisms": [
      "Missing Essential",
      "Rule Breaking UI",
      "Function Misuse"
    ],
    "subject_kit": {
      "primary_subject": "a chat screenshot",
      "secondary_elements": [
        "overly formal apology",
        "glitched emoji",
        "misaligned bubbles"
      ]
    },
    "stage_context": "mobile app screenshot",
    "composition_rule": "screenshot framing, UI-first",
    "lighting_rule": "flat UI lighting (no cinematic)"
  }
]
```

**mode=full（默认，模型输入 + 治理记录）**
```json
[
  {
    "model_input": { ... 同上 ... },
    "governance_record": {
      "creative_id": "ft6ygtch",
      "seed": 123,
      "ruleset_version": "structured-v1",
      "imaging_assumption": "auto_world_mapped",
      "imaging_assumption_desc": "World Adaptive",
      "imaging_profile": "High-end commercial advertising photography, ...",
      "creation_intent": "entertain",
      "generation_logic": "system-driven",
      "deliverable_type": "Screenshot Meme",
      "entry_point": "System",
      "core_tension": "Corporate Voice Glitch",
      "twist_mechanisms": ["Missing Essential", "Rule Breaking UI", "Function Misuse"],
      "subject_kit": { ... },
      "stage_context": "mobile app screenshot",
      "composition_rule": "screenshot framing, UI-first",
      "lighting_rule": "flat UI lighting (no cinematic)",
      "source_refs": {
        "creation_intent": "creation_intent:entertain",
        "twist_mechanisms": [
          "twist_mechanisms:missing_essential",
          "twist_mechanisms:rule_breaking_ui",
          "twist_mechanisms:function_misuse"
        ],
        ...
      },
      "selected_fields": {
        "core_tension": {
          "selected_id": "core_tension:corporate_voice_glitch",
          "candidate_ids": [ ... ]
        },
        "twist_mechanisms": {
          "selected_ids": [ ... ],
          "selected_values": [ ... ],
          "candidate_ids": [ ... ]
        },
        ...
      },
      "rule_hits": [
        { "id": "intent:entertain:world_bias", "detail": "Weighted world selection" },
        { "id": "logic:system-driven:preferred_entry", "detail": "system" }
      ],
      "rule_blocks": [],
      "warnings": [],
      "reject_reason": null
    }
  }
]
```

**mode=debug（包含 `selected_fields_verbose` 和 `seed`）**
```json
[
  {
    "model_input": { ... },
    "governance_record": { ... 同上 ... },
    "debug": {
      "seed": 123,
      "selected_fields_verbose": {
        "creative_world": [ { "id": "creative_world:advertising", "value": "advertising" }, ... ],
        "twist_mechanisms": [ ... 完整候选池 ... ],
        ...
      }
    }
  }
]
```

**附加事实**

* 世界选择优先遵循 `CREATION_INTENTS[intent].weight_bias`（无命中再随机），触发 `rule_hits` 记录。
* `logic.required_twist_category` 会在未抽中时强插，`logic.preferred_entry` 命中率 80%。
* `intent.forbidden_tensions` / `intent.forbidden_twists` 与 `FORBIDDEN_MECHANISMS_BY_WORLD` 共同决定候选池，触发的过滤写入 `rule_blocks`。
* 所有 `model_input` 字段均经过 `forbidden_visual_terms` 驱动的清洗；清洗导致字段为空时会写入 `warnings`。
* `lang` 影响治理描述和输出语句（默认 `en`）；`server.js` 允许透传 `zh` 因而可生成中文内容。
* `imaging_assumption` 仅写入 `governance_record` 和 UI 展示，不会改变 `model_input`。

━━━━━━━━━━━━━━━━━━
**二、维度与字段现状**
━━━━━━━━━━━━━━━━━━

| 字段/维度 | 所属层级 | 当前状态 | 进 Model? | 进 Rules? | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **creation_intent** | Upstream | Active | No | Yes | 决定 World 权重、禁止 tension/twist；desc 记录多语言说明 |
| **generation_logic** | Upstream | Active | No | Yes | 控制 entry 偏好与强制 twist 机制 |
| **imaging_assumption** | Upstream | Active | No | No | 仅写入 `governance_record`（desc & id），即便前端选择也不影响生成 |
| **creative_world** | Model | Active | **Yes** | Yes | 由 Intent 权重驱动；`source_refs` 记录 `creative_world:<slug>` |
| **imaging_profile** | World Meta | Active | No | No | 世界自带说明文字，仅记录在治理层 |
| **deliverable_type** | Governance | Active | No | No | 供 UI 展示，不参与 `model_input` |
| **entry_point** | Governance | Active | No | Yes | 受 Logic 偏好影响，当前仅记录在治理层 |
| **core_tension** | Model | Active | **Yes** | Yes | Intent 禁用的 tension 会被排除，必要时回退全量 |
| **twist_mechanisms** | Model | Active | **Yes** | Yes | 取值 2~3 个；`selected_fields` 以数组记录 ID/Value |
| **subject_kit** | Model | Active | **Yes** | No | 含 primary + secondary，逐项清洗禁词 |
| **stage_context** | Model | Active | **Yes** | No | 基于世界随机抽取 |
| **composition_rule** | Model | Active | **Yes** | No | 基于世界随机抽取 |
| **lighting_rule** | Model | Active | **Yes** | No | 基于世界随机抽取 |

━━━━━━━━━━━━━━━━━━
**三、前端站点现状（public/index.html + script.js）**
━━━━━━━━━━━━━━━━━━

* 页面顶部提供 Generator / Favorites 双标签页、语言切换（`idea_lang` 缓存在 `localStorage`），并加载 Google Fonts 以符合奢华风格设计。
* 页面加载后即刻调用 `generateIdeas()`，以 `mode=full`、`n=3` 固定生成三条方案；用户无法在 UI 中自定义返回数量。
* `GET /api/config` 的结果会被解析为世界/动机/逻辑/成像下拉框，且会随语言切换重新渲染文本；World 下拉还与一个自定义样式的 select 组件保持同步。
* 成像档位选择会被提交给后端并展示在卡片 `Imaging Assumption` 行，但它只影响治理元数据（见上），对生成结果无实质影响。
* 结果区域每次重新生成都会完全清空后 append 卡片。每张卡片包含复制 JSON、收藏按钮（心形 SVG）、意图/逻辑说明、Deliverable、Core tension、反转机制、主体套件、Stage/Composition/Lighting 信息，并在存在时展示 `rule_hits`、`rule_blocks`、`warnings`。
* Favorites 依赖 `localStorage.idea_favorites`，仅在本地存储。切换到 Favorites Tab 会即时重渲染收藏内容，按钮状态基于 creative_id 判断。
* 所有复制和收藏按钮都有中英文提示文案，语言切换会同步替换卡片中 `data-i18n-label` 标签文本；空状态文案同样基于语言资源更新。
* 目前没有表单校验或 Loading Skeleton，错误仅以 `alert` 或结果区域红字提示。

━━━━━━━━━━━━━━━━━━
**四、仍存在但“未生效”的字段或逻辑**
━━━━━━━━━━━━━━━━━━

1. **`CREATION_INTENTS` 内的 `forced_tone`** — 仍未被任何逻辑读取。
2. **`IMAGING_ASSUMPTIONS` 的 `template`** — 只被配置，未拼入输出；生成逻辑仅使用 `desc`。
3. **`reverseParseImagingAssumption`** — 虽然导出，但在 `server.js` 及前端中都没有调用。
4. **Legacy `/api/worlds` Endpoint** — 仍保留，但 UI 改为使用 `/api/config`；若未来不再需要可考虑移除。
5. **前端“成像档位”与实际生成的脱节** — 传参被记录在治理层，但既不改变世界/意图选择，也不写入 `model_input`；用户改变该下拉框不会影响生成骨架。

━━━━━━━━━━━━━━━━━━
**五、规则与治理能力现状**
━━━━━━━━━━━━━━━━━━

| 能力 | 状态 | 说明 |
| :--- | :--- | :--- |
| **Stable ID 支持** | ✅ | `getStableOptionId` 为每个维度生成 `dimension:item-slug`，`source_refs` 与 `selected_fields` 同步记录 |
| **Seed & Version 记录** | ✅ | `governance_record.seed` 储存 `createRNG` 种子；`ruleset_version` 当前为 `structured-v1` |
| **决策路径回放** | ✅ | `rule_hits`（意图加权、逻辑偏好、强制 twist）与 `rule_blocks`（禁用项）完整记录逻辑分支 |
| **模型/治理分离** | ✅ | `mode=model` 只返回最小输入；`mode=full/debug` 则提供完整治理 & 调试镜像 |
| **输出清洗** | ✅ | 所有字符串通过 `sanitizeValue` 去除世界禁词，若被清空则写入 `warnings` |

━━━━━━━━━━━━━━━━━━
**六、此次复检要点**
━━━━━━━━━━━━━━━━━━

* `/api/generate` 响应格式确认始终为数组（旧文档中示例为对象），已在本次文档中修正。
* 新增了对前端行为（双标签页、收藏、语言切换、固定 `n=3`）的记录，便于定位 UI 侧可配置性不足的问题。
* 再次确认前端“成像档位”仍只影响治理展示；若希望驱动模型，可在 `generateCreativeSkeleton` 中把 `imaging_assumption` 映射到世界或直接写入 `model_input`。
