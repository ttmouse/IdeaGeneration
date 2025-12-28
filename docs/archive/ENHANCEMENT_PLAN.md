# MetaGeny 增强计划

基于创意生成系统专家建议的渐进式改进方案。

## Phase 1: 交互增强 (立即实现)

### 1.1 卡片内维度可编辑
**功能**: 点击卡片中任何维度值，弹出下拉菜单调整

```javascript
// 实现思路
function makeCardDimensionEditable(card, dimension, currentValue) {
  const valueElement = card.querySelector(`[data-dimension="${dimension}"]`);

  valueElement.addEventListener('click', () => {
    // 显示该维度的所有候选值
    showDimensionSelector(dimension, currentValue, (newValue) => {
      // 保持其他维度不变，只更新这个维度
      regenerateCardWithConstraint(card, { [dimension]: newValue });
    });
  });
}
```

**UI设计**:
- 鼠标悬停时显示"点击调整"提示
- 点击后原地展开下拉菜单
- 选择新值后平滑动画切换

---

### 1.2 灵感种子输入框
**功能**: 用户输入关键词，影响生成方向

```javascript
// 灵感种子映射表 (核心数据结构)
const INSPIRATION_KEYWORDS = {
  // 情绪/氛围
  "奢华|luxury|豪华": {
    worlds: { advertising: 3, product_photography: 2 },
    intents: { sell: 3, demonstrate: 2 },
    tensions: ["luxury_vs_absurd"],
    imaging: "industrial_product_photography"
  },

  "荒诞|absurd|怪诞": {
    worlds: { concept_art: 3, meme_logic: 2 },
    intents: { evoke: 3, entertain: 2 },
    tensions: ["ritual_without_reason", "deadpan_absurd"],
    mechanisms: ["label_lies", "missing_essential"]
  },

  "梦幻|dreamy|fantasy": {
    worlds: { miniature_fantasy: 4, concept_art: 2 },
    intents: { evoke: 3, explore: 2 },
    logics: { composition_study: 2 }
  },

  "真实|realistic|纪实": {
    worlds: { documentary: 4, product_photography: 2 },
    intents: { document: 3, demonstrate: 2 },
    imaging: "documentary_available_light",
    avoidMechanisms: ["impossible_but_physical", "material_swap"]
  },

  // 材质
  "金属|metal|metallic": {
    mechanisms: ["material_swap", "cutaway_logic"],
    subjects: ["luxury watch", "smartphone"],
    imaging: "industrial_product_photography"
  },

  "玻璃|glass|transparent": {
    imaging: "jewelry_macro_photography",
    mechanisms: ["cutaway_logic"],
    subjects: ["fragrance bottle"]
  },

  "织物|fabric|textile": {
    subjects: ["chair"],
    mechanisms: ["material_swap"],
    tensions: ["comfort_vs_clinical"]
  },

  // 尺度
  "微观|micro|macro|细节": {
    worlds: { miniature_fantasy: 4, product_photography: 3 },
    mechanisms: ["scale_mismatch", "cutaway_logic"],
    imaging: "jewelry_macro_photography",
    logics: { composition_study: 2 }
  },

  "巨大|giant|massive": {
    mechanisms: ["scale_mismatch"],
    tensions: ["tiny_labor_vs_giant_object"]
  },

  // 概念
  "腐朽|decay|破败": {
    tensions: ["precision_vs_decay", "memory_corruption"],
    mechanisms: ["missing_essential", "time_discontinuity"],
    worlds: { concept_art: 3, documentary: 2 }
  },

  "控制|control|system": {
    tensions: ["desire_vs_control", "control_breakdown"],
    logics: { "system-driven": 3 },
    intents: { demonstrate: 2 }
  },

  "失控|chaos|glitch": {
    tensions: ["control_breakdown", "routine_vs_glitch"],
    mechanisms: ["missing_essential", "rule_breaking_ui"],
    worlds: { meme_logic: 2, concept_art: 2 }
  },

  // 场景
  "街头|street|urban": {
    worlds: { documentary: 4 },
    stages: ["busy street corner", "subway platform"],
    logics: { "narrative-moment": 2 }
  },

  "工作室|studio|clean": {
    worlds: { advertising: 3, product_photography: 3 },
    stages: ["clean studio tabletop", "white cyclorama"],
    imaging: "industrial_product_photography"
  }
};

// 解析灵感种子
function parseInspirationSeed(text) {
  if (!text || !text.trim()) return null;

  const weights = {
    worlds: {},
    intents: {},
    logics: {},
    tensions: [],
    mechanisms: [],
    avoidMechanisms: [],
    imaging: null,
    subjects: [],
    stages: []
  };

  // 匹配所有关键词（支持中英文、同义词）
  for (const [pattern, mapping] of Object.entries(INSPIRATION_KEYWORDS)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(text)) {
      // 累加权重
      if (mapping.worlds) {
        Object.entries(mapping.worlds).forEach(([w, weight]) => {
          weights.worlds[w] = (weights.worlds[w] || 0) + weight;
        });
      }
      if (mapping.intents) {
        Object.entries(mapping.intents).forEach(([i, weight]) => {
          weights.intents[i] = (weights.intents[i] || 0) + weight;
        });
      }
      if (mapping.logics) {
        Object.entries(mapping.logics).forEach(([l, weight]) => {
          weights.logics[l] = (weights.logics[l] || 0) + weight;
        });
      }
      if (mapping.tensions) weights.tensions.push(...mapping.tensions);
      if (mapping.mechanisms) weights.mechanisms.push(...mapping.mechanisms);
      if (mapping.avoidMechanisms) weights.avoidMechanisms.push(...mapping.avoidMechanisms);
      if (mapping.imaging) weights.imaging = mapping.imaging;
      if (mapping.subjects) weights.subjects.push(...mapping.subjects);
      if (mapping.stages) weights.stages.push(...mapping.stages);
    }
  }

  return Object.keys(weights.worlds).length > 0 ? weights : null;
}

// 在生成函数中应用灵感种子
function generateWithInspiration(inspirationText) {
  const weights = parseInspirationSeed(inspirationText);

  if (!weights) {
    // 没有匹配，正常生成
    return generateIdeas();
  }

  // 应用权重和约束
  const options = {
    // World选择受到影响
    worldWeights: weights.worlds,

    // 强制使用特定Intent/Logic (如果权重很高)
    forcedIntent: getHighestWeight(weights.intents),
    forcedLogic: getHighestWeight(weights.logics),

    // 优先选择这些tensions
    preferredTensions: weights.tensions,

    // 强制包含这些mechanisms
    requiredMechanisms: weights.mechanisms,

    // 禁用这些mechanisms
    forbiddenMechanisms: weights.avoidMechanisms,

    // 指定imaging assumption
    imaging: weights.imaging,

    // 约束subject选择
    preferredSubjects: weights.subjects,
    preferredStages: weights.stages
  };

  return generateIdeasWithConstraints(options);
}
```

---

## Phase 2: Kate Compton的建议 (结构优化)

### 2.1 生成语法层
**目标**: 用递归模板替代直接组合

```javascript
// Tracery-style 语法
const CREATIVE_GRAMMAR = {
  "origin": "#subject_setup# #tension_intro# #twist_reveal#",

  "subject_setup": [
    "#primary_subject# placed on #stage#",
    "Close-up of #primary_subject#",
    "#primary_subject# surrounded by #secondary_elements#"
  ],

  "tension_intro": [
    "with a sense of #core_tension#",
    "creating tension between #tension_aspect_a# and #tension_aspect_b#",
    "embodying #core_tension#"
  ],

  "twist_reveal": [
    "revealed through #twist_mechanism#",
    "where #twist_mechanism# disrupts expectations",
    "#twist_mechanism# creates visual paradox"
  ],

  // 递归展开
  "core_tension": ["#tension_word_a# vs #tension_word_b#"],
  "tension_word_a": ["luxury", "control", "precision", "comfort"],
  "tension_word_b": ["decay", "chaos", "absurdity", "clinical"]
}

// 生成时使用语法递归展开
function expandGrammar(grammar, symbol, context) {
  // Tracery算法实现
  // 可以实现更复杂的叙事结构
}
```

### 2.2 涌现性评分
**目标**: 评估元素组合的"化学反应"

```javascript
// 元素间的协同/冲突矩阵
const SYNERGY_MATRIX = {
  // 高协同组合 (+2分)
  synergies: [
    { world: "miniature_fantasy", tension: "tiny_labor_vs_giant_object", mechanism: "scale_mismatch" },
    { world: "concept_art", tension: "ritual_without_reason", mechanism: "missing_essential" },
    { world: "documentary", tension: "routine_vs_glitch", mechanism: "rule_breaking_signage" }
  ],

  // 意外但有趣的冲突 (+3分，更高分)
  interestingClashes: [
    { world: "advertising", tension: "luxury_vs_absurd", mechanism: "missing_essential" },
    { world: "product_photography", imaging: "documentary_available_light" }, // 反常规
    { world: "miniature_fantasy", tension: "clinical_vs_whimsical" } // 矛盾但有张力
  ],

  // 陈词滥调组合 (-1分)
  cliches: [
    { world: "advertising", tension: "desire_vs_control", intent: "sell" }, // 太直白
    { world: "miniature_fantasy", mechanism: "scale_mismatch" } // 太显而易见
  ]
};

function evaluateEmergence(skeleton) {
  let score = 0;

  // 检查协同
  SYNERGY_MATRIX.synergies.forEach(pattern => {
    if (matchesPattern(skeleton, pattern)) score += 2;
  });

  // 检查有趣冲突
  SYNERGY_MATRIX.interestingClashes.forEach(pattern => {
    if (matchesPattern(skeleton, pattern)) score += 3;
  });

  // 惩罚陈词滥调
  SYNERGY_MATRIX.cliches.forEach(pattern => {
    if (matchesPattern(skeleton, pattern)) score -= 1;
  });

  return {
    score,
    label: score > 5 ? "高度涌现" : score > 2 ? "有趣组合" : score < 0 ? "陈腐" : "标准"
  };
}

// 生成时过滤低分结果
function generateHighQuality() {
  let attempts = 0;
  while (attempts < 10) {
    const skeleton = generateCreativeSkeleton();
    const emergence = evaluateEmergence(skeleton);

    if (emergence.score >= 2) {
      return { skeleton, emergence };
    }
    attempts++;
  }
  // 兜底：返回最后一次生成
  return { skeleton, emergence: { score: 0, label: "标准" } };
}
```

---

## Phase 3: Brian Eno的建议 (破局机制)

### 3.1 Oblique Strategies 层
**目标**: 注入"打破思维定式"的约束

```javascript
const OBLIQUE_STRATEGIES = [
  {
    id: "remove_comfort",
    desc: "移除最舒适的选择",
    apply: (candidates, dimension) => {
      // 禁用该维度中最常用的30%选项
      return candidates.slice(Math.floor(candidates.length * 0.3));
    }
  },

  {
    id: "force_contradiction",
    desc: "强制包含矛盾元素",
    apply: (skeleton) => {
      // 注入一个与当前world风格相悖的元素
      if (skeleton.creative_world === "advertising") {
        skeleton.forcedMechanism = "missing_essential"; // 广告里的缺失
      }
    }
  },

  {
    id: "minimal_constraint",
    desc: "极简约束：只用3个元素",
    apply: (skeleton) => {
      // 清空secondary_elements，只保留primary
      skeleton.subject_kit.secondary_elements = [];
      skeleton.twist_mechanisms = skeleton.twist_mechanisms.slice(0, 1);
    }
  },

  {
    id: "reverse_assumption",
    desc: "颠倒一个基础假设",
    apply: (skeleton) => {
      // 例如：产品摄影使用纪实风格
      if (skeleton.creative_world === "product_photography") {
        skeleton.imaging_assumption = "documentary_available_light";
      }
    }
  },

  {
    id: "cheapest_luxury",
    desc: "用最便宜的方式实现最奢华的效果",
    apply: (skeleton) => {
      skeleton.creative_directive = "Use minimal, cheap materials to evoke luxury";
    }
  }
];

// 用户可选择是否启用"破局模式"
function generateWithObliqueStrategy() {
  const strategy = pick(OBLIQUE_STRATEGIES);
  let skeleton = generateCreativeSkeleton();

  // 应用策略
  strategy.apply(skeleton);

  // 在governance中记录
  skeleton.governance_record.oblique_strategy = {
    id: strategy.id,
    desc: strategy.desc
  };

  return skeleton;
}
```

### 3.2 挑衅性创作指令
**目标**: 不仅给元素，还给创作态度

```javascript
const PROVOCATIVE_DIRECTIVES = {
  "sell": [
    "让人想买但又说不清为什么",
    "用最诚实的方式呈现产品缺陷",
    "把广告做成艺术品，忘记要卖什么"
  ],

  "explore": [
    "找到材质的灵魂",
    "让观众看到制作过程的暴力",
    "把失败当作最终作品"
  ],

  "evoke": [
    "用冷静的方式呈现疯狂",
    "让观众感到不适但无法移开视线",
    "呈现记忆的腐蚀过程"
  ],

  "document": [
    "记录系统崩溃的瞬间",
    "找到日常中的超现实",
    "呈现规则失效的证据"
  ]
};

// 在生成结果中添加
function addProvocativeDirective(skeleton) {
  const intent = skeleton.governance_record.creation_intent;
  const directives = PROVOCATIVE_DIRECTIVES[intent] || [];

  if (directives.length > 0) {
    skeleton.creative_directive = pick(directives);
  }
}
```

---

## Phase 4: Margaret Boden的建议 (概念空间导航)

### 4.1 历史探索追踪
**目标**: 记录已探索区域，引导向边缘移动

```javascript
// 本地存储历史生成记录
const EXPLORATION_HISTORY = {
  totalGenerations: 0,

  // 各维度的使用频率
  worldUsage: {
    advertising: 12,
    product_photography: 8,
    concept_art: 3, // 少用 = 边缘区域
    documentary: 2,
    meme_logic: 1,
    miniature_fantasy: 0 // 未探索
  },

  // 组合模式
  patterns: [
    { world: "advertising", intent: "sell", count: 8 }, // 高频 = 舒适区
    { world: "concept_art", intent: "evoke", count: 2 }
  ],

  // 最近10次生成
  recent: [...]
};

// 分析探索状态
function analyzeExplorationState(history) {
  const unexplored = Object.entries(history.worldUsage)
    .filter(([w, count]) => count === 0)
    .map(([w]) => w);

  const underexplored = Object.entries(history.worldUsage)
    .filter(([w, count]) => count < 3)
    .map(([w]) => w);

  const overexplored = Object.entries(history.worldUsage)
    .filter(([w, count]) => count > 10)
    .map(([w]) => w);

  return { unexplored, underexplored, overexplored };
}

// 引导向未探索区域
function generateExplorative(explorationState) {
  const { unexplored, underexplored } = explorationState;

  if (unexplored.length > 0) {
    // 强制使用未探索的world
    return generateCreativeSkeleton({
      world: pick(unexplored),
      // 其他维度随机
    });
  }

  if (underexplored.length > 0) {
    // 偏向使用低频world
    return generateCreativeSkeleton({
      worldWeights: underexplored.reduce((acc, w) => {
        acc[w] = 5; // 高权重
        return acc;
      }, {})
    });
  }
}

// UI上显示探索地图
function visualizeExplorationMap(history) {
  return `
    <div class="exploration-map">
      <h3>创意空间探索度</h3>
      ${Object.entries(history.worldUsage).map(([world, count]) => `
        <div class="world-bar">
          <span>${world}</span>
          <div class="bar" style="width: ${Math.min(100, count * 10)}%">
            ${count}次
          </div>
        </div>
      `).join('')}

      <button onclick="generateExplorative()">
        探索未知区域
      </button>
    </div>
  `;
}
```

### 4.2 约束放松模式
**目标**: "如果打破这条规则会怎样？"

```javascript
const RULE_RELAXATION_OPTIONS = [
  {
    id: "allow_forbidden_mechanism",
    desc: "允许使用被禁止的机制",
    rule: "documentary world 禁用 material_swap",
    effect: () => {
      // 在documentary中启用material_swap
      const skeleton = generateCreativeSkeleton({ world: "documentary" });
      skeleton.twist_mechanisms.push("material_swap");
      skeleton.governance_record.rule_violations = ["allowed_forbidden_mechanism"];
      return skeleton;
    }
  },

  {
    id: "cross_world_hybrid",
    desc: "混合两个世界的规则",
    rule: "每次只用一个world",
    effect: () => {
      const world1 = "advertising";
      const world2 = "documentary";

      return {
        creative_world: `${world1} × ${world2}`,
        // 从world1取subject
        subject_kit: pick(WORLDS[world1].subject_kits),
        // 从world2取lighting
        lighting_rule: pick(WORLDS[world2].lighting_rule),
        // 其他随机混合
        governance_record: {
          rule_violations: ["cross_world_hybrid"],
          hybrid_sources: [world1, world2]
        }
      };
    }
  },

  {
    id: "triple_tension",
    desc: "使用3个core_tension而不是1个",
    rule: "每次只选1个tension",
    effect: (skeleton) => {
      const world = skeleton.creative_world;
      skeleton.core_tension = pickKUnique(WORLDS[world].core_tension, 3);
      skeleton.governance_record.rule_violations = ["multiple_tensions"];
    }
  }
];

// UI按钮
<button onclick="generateWithRuleRelaxation()">
  🔓 打破规则生成
</button>
```

---

## Phase 5: 元策略层

### 5.1 创意策略选择
**目标**: 用户选择"今天想怎么玩"

```javascript
const META_STRATEGIES = {
  "standard": {
    name: "标准生成",
    desc: "遵循所有规则，平衡生成",
    enabled: true // 默认
  },

  "maximalist": {
    name: "极繁主义",
    desc: "塞满所有元素，越复杂越好",
    apply: (options) => {
      options.twistKRange = [4, 6]; // 更多twist
      options.forceMaxSecondary = true; // 所有secondary elements
    }
  },

  "minimalist": {
    name: "极简主义",
    desc: "只保留最核心元素",
    apply: (options) => {
      options.twistKRange = [1, 1];
      options.maxSecondaryElements = 1;
    }
  },

  "clash_seeker": {
    name: "冲突猎人",
    desc: "刻意制造矛盾和张力",
    apply: (options) => {
      options.preferConflict = true;
      options.obliqueStrategy = "force_contradiction";
    }
  },

  "explorer": {
    name: "未知探索者",
    desc: "往少用的区域走",
    apply: (options) => {
      const state = analyzeExplorationState();
      options.world = pick(state.unexplored);
    }
  },

  "comfort_zone": {
    name: "舒适区生成",
    desc: "基于你的收藏偏好生成",
    apply: (options) => {
      const favorites = getFavorites();
      const preferredWorlds = analyzePreferences(favorites);
      options.worldWeights = preferredWorlds;
    }
  }
};

// UI策略选择器
<div class="strategy-selector">
  <label>今天的创作策略：</label>
  <select id="meta-strategy">
    <option value="standard">标准生成</option>
    <option value="maximalist">极繁主义</option>
    <option value="minimalist">极简主义</option>
    <option value="clash_seeker">冲突猎人</option>
    <option value="explorer">未知探索者</option>
    <option value="comfort_zone">舒适区</option>
  </select>
</div>
```

---

## 实施优先级建议

### 立即实现 (本周)
1. ✅ 灵感种子输入框 + 关键词映射
2. ✅ 卡片内维度可编辑
3. ✅ 涌现性评分显示

### 短期实现 (2周内)
4. 历史探索追踪 + 可视化
5. Oblique Strategies模式切换
6. 挑衅性创作指令

### 中期实现 (1个月)
7. 元策略选择器
8. 约束放松模式
9. 生成语法层（如需要更复杂叙事）

### 长期优化
10. 跨世界混合模式
11. 个性化学习（基于收藏分析偏好）

---

## 技术实现注意事项

1. **保持向后兼容**: 所有新功能作为可选增强，不破坏现有API
2. **渐进式增强**: 从简单功能开始，逐步叠加复杂度
3. **用户控制**: 让用户选择启用哪些高级功能（避免overwhelm）
4. **性能**: 评分和分析函数要快，不影响生成速度

要我开始实现Phase 1的功能吗？
