# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

MetaGeny 是一个创意骨架生成工具，从预设的"创意世界"中随机抽取组合，生成结构化的创意描述，用于后续的 AI 提示词编写或灵感激发。

**核心架构**: Python 原型 → Node.js Web 应用迁移
- Python 版本 (`creative_sampler.py`): 原始 CLI 工具，命令行生成创意骨架
- Node.js 版本 (当前主要版本): Express 后端 + Web 前端

## 常用命令

### 开发运行
```bash
# 安装依赖
npm install

# 启动开发服务器 (端口 3000)
node server.js
# 或
npm start

# Python CLI 工具 (原型版本)
python creative_sampler.py --world any --n 3
python creative_sampler.py --seed 42 --world product_photography --imaging jewelry_macro_photography
```

### 测试
项目当前没有配置测试框架。

## 架构设计

### 三层架构

1. **上游决策维度** (`CREATION_INTENTS`, `GENERATION_LOGICS`, `IMAGING_ASSUMPTIONS`)
   - **Creation Intent**: 创作动机 (sell, demonstrate, explore, document, entertain, evoke)
   - **Generation Logic**: 生成逻辑 (process-driven, system-driven, narrative-moment, composition-study, object-centric, character-centric)
   - **Imaging Assumptions**: 成像主控层，定义最终图像的摄影风格和技术规格

2. **创意世界层** (`WORLDS`)
   - 6个预设世界: advertising, product_photography, concept_art, documentary, meme_logic, miniature_fantasy
   - 每个世界包含独立的变量集:
     - `deliverable_type`: 交付类型
     - `entry_point`: 入口点
     - `core_tension`: 核心张力
     - `twist_mechanisms_pool`: 反转机制池
     - `stage_context`: 场景语境
     - `composition_rule`: 构图规则
     - `lighting_rule`: 布光规则
     - `subject_kits`: 主体套件 (primary_subject + secondary_elements)
     - `forbidden_visual_terms`: 禁用视觉术语

3. **规则与过滤层**
   - Intent 可以影响 World 选择 (weight_bias)
   - Intent 可以禁止某些 tensions 或 twists
   - Logic 可以偏好某些 entry_points 或要求特定 twist_category
   - World 层面也有禁用机制 (`FORBIDDEN_MECHANISMS_BY_WORLD`)

### 核心生成逻辑 (`src/logic.js`)

**关键函数**: `generateCreativeSkeleton(options)`

生成流程:
1. 根据 Intent 的 weight_bias 选择或分配 World
2. 根据规则过滤 tensions (forbidden_tensions)
3. 根据规则过滤和选择 twist mechanisms (2-3个)
4. 如果 Logic 指定 `required_twist_category`，强制包含
5. 随机选择其他维度 (subject_kit, stage, composition, lighting)
6. 应用 forbidden_visual_terms 清理所有输出
7. 返回 `model_input` (简化提示词) + `governance_record` (完整元数据)

**返回结构**:
```javascript
{
  model_input: {
    creative_world, core_tension, twist_mechanisms,
    subject_kit, stage_context, composition_rule, lighting_rule
  },
  governance_record: {
    creative_id, seed, creation_intent, generation_logic,
    imaging_assumption, deliverable_type, entry_point,
    selected_fields, rule_hits, rule_blocks, warnings, ...
  },
  debug: { selected_fields_verbose, seed }
}
```

### API 端点

**GET /api/config**
- 返回所有配置: worlds, intents, logics, imaging_assumptions

**GET /api/worlds** (Legacy)
- 返回可用世界列表

**POST /api/generate**
- Body: `{ world, intent, logic, imaging_assumption, n, lang, mode, seed }`
- mode: 'model' (仅 model_input) | 'full' (model_input + governance) | 'debug' (全部)
- 返回: 生成结果数组

### 前端架构

- **双标签页**: Generator (生成器) + Favorites (收藏夹)
- **多语言支持**: 中英文切换 (localStorage: `idea_lang`)
- **自定义下拉菜单**: World 选择使用自定义样式替代原生 select
- **收藏功能**: 本地存储 (localStorage: `idea_favorites`)
- **复制提示词**: 生成格式化的 prompt 文本，包含前缀引导

## 关键设计原则

### 可追溯性 (Governance)
每次生成都记录完整的决策路径:
- `selected_fields`: 每个维度的选中值和候选列表
- `rule_hits`: 被触发的规则
- `rule_blocks`: 被阻止的选项
- `source_refs`: ID 级别的溯源

### 稳定的 ID 系统
- `getStableOptionId()`: 为每个选项生成稳定 ID (dimension:value_slug)
- 确保同样的配置生成同样的 ID，方便追溯和引用

### 多语言设计
- 所有配置支持 `{ en, zh }` 双语描述
- 生成逻辑保持语言无关，仅在最终输出时应用语言
- 前端动态切换不重新生成数据

### 随机种子
- 支持可复现随机性 (seed parameter)
- Mulberry32 PRNG 算法确保跨环境一致性

## Python 原型保留说明

`creative_sampler.py` 是最初的概念验证版本，保留用于:
- 快速 CLI 批量生成
- 算法验证和调试
- 与 Node.js 版本对比参考

两者的核心逻辑保持同步，但 Node.js 版本添加了更多上游决策层和治理功能。

## 代码风格

- **中文注释**: 项目内注释和文档主要使用中文
- **变量命名**: 使用描述性英文命名 (如 `twist_mechanisms`, `subject_kit`)
- **配置驱动**: 核心逻辑通过配置对象 (WORLDS, INTENTS, LOGICS) 驱动，易扩展
- **纯函数优先**: 生成逻辑使用纯函数 + 显式 RNG 参数
- **错误处理**: 使用自定义 `PromptAssemblyError` 区分业务逻辑错误

## 扩展指南

### 添加新的创意世界
在 `src/logic.js` 的 `WORLDS` 对象中添加新条目，包含所有必需字段。

### 添加新的 Intent 或 Logic
在 `CREATION_INTENTS` 或 `GENERATION_LOGICS` 中添加，配置相应的规则影响。

### 添加新的 Imaging Assumption
在 `IMAGING_ASSUMPTIONS` 中添加新的成像档位，定义 template 模板文本。

### 调整规则
- 修改 `weight_bias` 影响世界选择概率
- 在 `forbidden_tensions`/`forbidden_twists` 中添加互斥规则
- 在 `FORBIDDEN_MECHANISMS_BY_WORLD` 中添加世界级禁用机制
