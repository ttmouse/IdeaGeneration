// [IN]: world configs (WORLDS, CREATION_INTENTS, GENERATION_LOGICS), user overrides, seed
// [OUT]: generateCreativeSkeleton(), getAvailableWorlds(), exported constants
// [POS]: 核心生成引擎，被 server.js 调用，不直接处理 HTTP / Core generation engine, called by server.js
// Protocol: When updated, sync this header + parent .folder.md

const { evaluate: evaluateSkeleton, reloadRules: reloadEvaluatorRules } = require('./evaluator');
const dimensionLoader = require('./dimension_loader');


// -----------------------------
// 1) 上游决策维度 (New Dimensions)
// -----------------------------

const CREATION_INTENTS = {
    "sell": {
        id: "sell",
        desc: { en: "Commercial persuasion", zh: "商业说服" },
        weight_bias: { "advertising": 5, "product_photography": 4, "meme_logic": 1 },
        forbidden_tensions: ["identity_slippage", "ritual_without_reason"], // Selling usually avoids existential dread
        forced_tone: "persuasive"
    },
    "demonstrate": {
        id: "demonstrate",
        desc: { en: "Showcase craft/tech/skill", zh: "展示工艺或技术" },
        weight_bias: { "product_photography": 5, "concept_art": 3, "miniature_fantasy": 3 },
        forced_tone: "technical"
    },
    "explore": {
        id: "explore",
        desc: { en: "Form/Material exploration", zh: "形式或材料探索" },
        weight_bias: { "concept_art": 5, "miniature_fantasy": 4, "product_photography": 2 },
        forced_tone: "experimental"
    },
    "document": {
        id: "document",
        desc: { en: "Record reality/state", zh: "记录现实或状态" },
        weight_bias: { "documentary": 8, "concept_art": 2 },
        forbidden_twists: ["impossible_but_physical", "material_swap"], // Documentary implies reality
        forced_tone: "objective"
    },
    "entertain": {
        id: "entertain",
        desc: { en: "Fun/Joke/Meme", zh: "娱乐或玩笑" },
        weight_bias: { "meme_logic": 8, "miniature_fantasy": 2 },
        forced_tone: "playful"
    },
    "evoke": {
        id: "evoke",
        desc: { en: "Emotion/Vibe/Aesthetic", zh: "情绪或氛围" },
        weight_bias: { "concept_art": 5, "documentary": 3, "advertising": 1 },
        forced_tone: "atmospheric"
    }
};

const GENERATION_LOGICS = {
    "process-driven": {
        id: "process-driven",
        desc: { en: "Focus on making/process", zh: "过程或制作本身是看点" },
        required_twist_category: "cutaway_logic" // Preference, not strict requirement if not available
    },
    "system-driven": {
        id: "system-driven",
        desc: { en: "Rules/Structure/System", zh: "规则、结构、系统驱动" },
        preferred_entry: "system"
    },
    "narrative-moment": {
        id: "narrative-moment",
        desc: { en: "Storytelling instant", zh: "瞬间叙事" },
        preferred_entry: "action"
    },
    "composition-study": {
        id: "composition-study",
        desc: { en: "Form/Layout research", zh: "构图或形式研究" },
        preferred_entry: "object"
    },
    "object-centric": {
        id: "object-centric",
        desc: { en: "Focus on the artifact", zh: "物为中心" },
        preferred_entry: "object"
    },
    "character-centric": {
        id: "character-centric",
        desc: { en: "Focus on the person/role", zh: "人或角色为中心" },
        preferred_entry: "person"
    }
};

// -----------------------------
// 1.3) 灵感种子关键词映射表
// -----------------------------

// Minimal fallback for INSPIRATION_KEYWORDS if external file not available
const INSPIRATION_KEYWORDS_INLINE = {
    "奢华|luxury|豪华": {
        worlds: { advertising: 3 },
        intents: { sell: 3 },
        imaging: "industrial_product_photography"
    }
};

// Use external data if available, otherwise use inline fallback
let INSPIRATION_KEYWORDS = dimensionLoader.hasExternalData()
    ? dimensionLoader.loadInspirationKeywords()
    : INSPIRATION_KEYWORDS_INLINE;

// Function to reload keywords (for hot-reload)
function reloadInspirationKeywords() {
    if (dimensionLoader.hasExternalData()) {
        INSPIRATION_KEYWORDS = dimensionLoader.loadInspirationKeywords(true);
        console.log('[Logic] Reloaded INSPIRATION_KEYWORDS from external file');
    }
    return INSPIRATION_KEYWORDS;
}

// -----------------------------
// 1.5) 破局机制 (Oblique Strategies & Provocative Directives)
// -----------------------------

const OBLIQUE_STRATEGIES = [
    {
        id: "remove_comfort",
        desc: { en: "Remove the focal point", zh: "移除视觉焦点" },
        apply: (skeleton) => {
            // If we have secondary elements, promote one to primary
            if (skeleton.subject_kit && skeleton.subject_kit.secondary_elements && skeleton.subject_kit.secondary_elements.length > 0) {
                // Pick random secondary to become primary
                const idx = Math.floor(Math.random() * skeleton.subject_kit.secondary_elements.length);
                const newPrimary = skeleton.subject_kit.secondary_elements[idx];
                skeleton.subject_kit.secondary_elements.splice(idx, 1); // Remove it from secondary
                skeleton.subject_kit.primary_subject = newPrimary;
            } else {
                // Fallback: Make it empty/void
                skeleton.subject_kit = { primary_subject: "Void / Negative Space", secondary_elements: [] };
            }
        }
    },
    {
        id: "force_contradiction",
        desc: { en: "Force a contradictory element", zh: "强制包含矛盾元素" },
        apply: (skeleton, worlds) => {
            // Pick a mechanism that is usually forbidden for this world
            const world = skeleton.creative_world;
            const allMechanisms = ["material_swap", "missing_essential", "phase_violation", "gravity_defiance", "infinite_mirror", "rule_breaking_ui", "scale_mismatch", "label_lies", "function_misuse", "cutaway_logic"];
            const forbidden = worlds[world] ? (worlds[world].forbidden_mechanisms || []) : [];
            const contradictory = allMechanisms.filter(m => forbidden.includes(m));

            if (contradictory.length > 0) {
                const pick = contradictory[Math.floor(Math.random() * contradictory.length)];
                if (!skeleton.twist_mechanisms.includes(pick)) {
                    skeleton.twist_mechanisms.push(pick);
                    return true;
                }
            }
            return false;
        }
    },
    {
        id: "minimal_constraint",
        desc: { en: "Minimal constraint: use only 3 elements", zh: "极简约束：只用3个元素" },
        apply: (skeleton) => {
            if (skeleton.subject_kit && skeleton.subject_kit.secondary_elements) {
                skeleton.subject_kit.secondary_elements = [];
            }
            if (skeleton.twist_mechanisms && skeleton.twist_mechanisms.length > 1) {
                skeleton.twist_mechanisms = skeleton.twist_mechanisms.slice(0, 1);
            }
        }
    },
    {
        id: "reverse_assumption",
        desc: { en: "Reverse a fundamental assumption", zh: "颠倒一个基础假设" },
        apply: (skeleton) => {
            // If World is Advertising, use Documentary lighting
            if (skeleton.creative_world === "advertising") {
                skeleton.lighting_rule = "Documentary available light, naturalistic, slight grain";
            } else if (skeleton.creative_world === "product_photography") {
                skeleton.imaging_assumption = "documentary_available_light";
            }
        }
    }
];

const PROVOCATIVE_DIRECTIVES = {
    "sell": [
        { en: "Make them want to buy but not know why", zh: "让人想买但又说不清为什么" },
        { en: "Present product defects in the most honest way", zh: "用最诚实的方式呈现产品缺陷" },
        { en: "Treat it as an artwork, forget what you're selling", zh: "把广告做成艺术品，忘记要卖什么" }
    ],
    "explore": [
        { en: "Find the soul of the material", zh: "找到材质的灵魂" },
        { en: "Let the audience see the violence of the process", zh: "让观众看到制作过程的暴力" },
        { en: "Treat failure as the final piece", zh: "把失败当作最终作品" }
    ],
    "evoke": [
        { en: "Present madness in a calm way", zh: "用冷静的方式呈现疯狂" },
        { en: "Make the audience uncomfortable but unable to look away", zh: "让观众感到不适但无法移开视线" },
        { en: "Show the process of memory erosion", zh: "呈现记忆的腐蚀过程" }
    ],
    "document": [
        { en: "Record the moment of system collapse", zh: "记录系统崩溃的瞬间" },
        { en: "Find the surreal in the everyday", zh: "找到日常中的超现实" },
        { en: "Present evidence of rule failure", zh: "呈现规则失效的证据" }
    ],
    "demonstrate": [
        { en: "Show the invisible force behind the function", zh: "展示功能背后的无形力量" },
        { en: "Deconstruct it until it's unrecognizable", zh: "解构它直到无法辨认" },
        { en: "Make the object feel sentient", zh: "让物体感觉有生命" }
    ],
    "entertain": [
        { en: "Subvert the punchline", zh: "颠覆笑点的预期" },
        { en: "Use excessive formality for something absurd", zh: "对荒诞的事物使用过度的正式感" },
        { en: "Break the fourth wall through UI", zh: "通过UI打破第四面墙" }
    ]
};

// -----------------------------
// 1.6) 成像主控层 (Imaging Assumptions)
// -----------------------------

// Try to load from external JSON, fallback to inline data
const IMAGING_ASSUMPTIONS_INLINE = {
    "industrial_product_photography": {
        id: "industrial_product_photography",
        desc: { en: "Industrial Product Photography", zh: "工业产品摄影" },
        template: "Industrial product photography, extremely high resolution, sharp focus, studio lighting, realistic textures, 8k, unreal engine 5 render style avoided, no cgi, no 3d render, authentic camera noise."
    },
    "documentary_available_light": {
        id: "documentary_available_light",
        desc: { en: "Documentary Available Light", zh: "纪实自然光" },
        template: "Documentary photography, available light, candid moment, leica m style, slight grain, high dynamic range, storytelling, 35mm lens."
    }
};

// Use external data if available, otherwise use inline fallback
let IMAGING_ASSUMPTIONS = dimensionLoader.hasExternalData()
    ? dimensionLoader.loadImagingAssumptions()
    : IMAGING_ASSUMPTIONS_INLINE;

// Function to reload imaging assumptions (for hot-reload)
function reloadImagingAssumptions() {
    if (dimensionLoader.hasExternalData()) {
        IMAGING_ASSUMPTIONS = dimensionLoader.loadImagingAssumptions(true);
        console.log('[Logic] Reloaded IMAGING_ASSUMPTIONS from external file');
    }
    return IMAGING_ASSUMPTIONS;
}

// -----------------------------
// 1.7) 元素密度配置 (Element Density Config)
// -----------------------------

const DENSITY_CONFIG = {
    sparse: {
        id: "sparse",
        secondary_element_count_range: [0, 1],
        secondary_element_prob: 0.3,
        twist_k_range: [1, 1], // Just one twist or none
        optional_dimension_prob: 0.2 // Low chance of detailed staging/lighting if not critical
    },
    medium: {
        id: "medium",
        secondary_element_count_range: [2, 3],
        secondary_element_prob: 0.8,
        twist_k_range: [2, 3],
        optional_dimension_prob: 0.9
    },
    dense: {
        id: "dense",
        secondary_element_count_range: [4, 6],
        secondary_element_prob: 1.0,
        twist_k_range: [3, 5],
        optional_dimension_prob: 1.0
    }
};

// -----------------------------
// 2) 变量库 (Legacy Worlds, Retained but Managed)
// -----------------------------

const RULESET_VERSION = 'structured-v1';
const { evaluateRules } = require('./rule_engine');

// Minimal fallback WORLDS if external files not available
const WORLDS_INLINE = {
    "advertising": {
        "name": { en: "Advertising", zh: "广告" },
        "imaging_profile": "High-end commercial advertising photography, 8k",
        "forbidden_visual_terms": ["dirty", "broken"],
        "deliverable_type": [{ id: "ad_key_visual", en: "Ad Key Visual", zh: "广告主视觉" }],
        "entry_point": [{ id: "object", en: "Object", zh: "物体" }],
        "core_tension": [{ id: "desire_vs_control", en: "Desire vs Control", zh: "欲望 vs 控制" }],
        "twist_mechanisms_pool": [{ id: "scale_mismatch", en: "Scale Mismatch", zh: "尺度错位" }],
        "stage_context": [{ en: "clean studio tabletop", zh: "干净的摄影棚桌面" }],
        "composition_rule": [{ en: "centered hero object", zh: "中心主体" }],
        "lighting_rule": [{ en: "soft studio light", zh: "柔和影棚光" }],
        "subject_kits": [{
            primary_subject: { en: "a product", zh: "产品" },
            secondary_elements: [{ en: "label", zh: "标签" }]
        }]
    }
};

// Try to load from external JSON files
let WORLDS = dimensionLoader.hasExternalData() 
    ? dimensionLoader.loadAllWorlds() 
    : WORLDS_INLINE;

// If external load returned empty, use inline
if (!WORLDS || Object.keys(WORLDS).length === 0) {
    WORLDS = WORLDS_INLINE;
    console.warn('[Logic] Using inline WORLDS fallback');
}

// Function to reload worlds (for hot-reload)
function reloadWorlds() {
    if (dimensionLoader.hasExternalData()) {
        const loaded = dimensionLoader.loadAllWorlds(true);
        if (loaded && Object.keys(loaded).length > 0) {
            WORLDS = loaded;
            console.log('[Logic] Reloaded WORLDS from external files');
        }
    }
    return WORLDS;
}


// -----------------------------
// 3) 互斥/白名单规则
// -----------------------------

const FORBIDDEN_MECHANISMS_BY_WORLD = {
    "documentary": ["material_swap", "impossible_but_physical", "time_discontinuity"],
    "meme_logic": ["cinematic_lighting", "ultra_photoreal_macro"],
};

// Helper functions

function createSeedValue(seed) {
    if (typeof seed === 'number' && Number.isFinite(seed)) {
        return seed >>> 0;
    }
    return (Date.now() + Math.floor(Math.random() * 1e9)) >>> 0;
}

function mulberry32(a) {
    return function () {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function createRNG(seed) {
    const seedValue = createSeedValue(seed);
    const next = mulberry32(seedValue);
    const rng = () => next();
    rng.seed = seedValue;
    return rng;
}

function pick(items, rng) {
    if (!items || items.length === 0) return null;
    const index = Math.floor((rng ? rng() : Math.random()) * items.length);
    return items[index];
}

function pickKUnique(items, k, rng) {
    if (k <= 0 || !items || items.length === 0) return [];
    const pool = [...items];
    const result = [];
    const randomFn = rng || Math.random;
    while (pool.length > 0 && result.length < k) {
        const idx = Math.floor(randomFn() * pool.length);
        result.push(pool[idx]);
        pool.splice(idx, 1);
    }
    return result;
}

function getRandomInt(min, max, rng) {
    const randomFn = rng || Math.random;
    return Math.floor(randomFn() * (max - min + 1)) + min;
}

// Helper to get value based on lang
function getVal(item, lang) {
    if (typeof item === 'object' && item !== null) {
        if (item[lang]) return item[lang];
        // fallback to en or first key
        return item.en || Object.values(item)[0];
    }
    return item;
}

function slugify(value) {
    return (
        value
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'item'
    );
}

function getStableOptionId(worldId, dimension, item, lang) {
    if (item && typeof item === 'object') {
        if (item.id) {
            return `${dimension}:${item.id}`;
        }
        if (item.primary_subject) {
            return `${dimension}:${slugify(getVal(item.primary_subject, 'en'))}`;
        }
        if (item.en || item.zh) {
            return `${dimension}:${slugify(getVal(item, 'en'))}`;
        }
    }
    const raw = item && typeof item === 'string' ? item : JSON.stringify(item || 'unknown');
    return `${dimension}:${slugify(raw)}`;
}

function getDisplayValue(item, lang) {
    if (!item) return '';
    if (typeof item === 'string') return item;
    // Handle CREATION_INTENTS and GENERATION_LOGICS objects with desc property
    if (item.desc) {
        return getVal(item.desc, lang);
    }
    // Handle WORLDS objects with name property
    if (item.name) {
        return getVal(item.name, lang);
    }
    if (item.primary_subject) {
        return getVal(item.primary_subject, lang);
    }
    if (item.en || item.zh) {
        return getVal(item, lang);
    }
    if (Array.isArray(item)) {
        return item.map(value => getDisplayValue(value, lang)).join(', ');
    }
    if (typeof item === 'object') {
        return Object.values(item)[0] || JSON.stringify(item);
    }
    return `${item}`;
}

function buildCandidates(pool, dimension, worldId, lang) {
    return pool.map(item => ({
        id: getStableOptionId(worldId, dimension, item, lang),
        value: getDisplayValue(item, lang),
        raw: item
    }));
}

function recordSelection(governance, dimension, candidates, selectedIdx, debugStore) {
    if (!candidates.length) {
        throw new PromptAssemblyError('EMPTY_POOL', `No candidates for ${dimension}`);
    }
    const selected = candidates[selectedIdx];
    governance.selected_fields[dimension] = {
        selected_id: selected.id,
        selected_value: selected.value,
        candidate_ids: candidates.map(c => c.id)
    };
    governance.source_refs[dimension] = selected.id;
    if (debugStore) {
        debugStore.selected_fields_verbose[dimension] = candidates.map(c => ({ id: c.id, value: c.value }));
    }
    return selected;
}

function selectWithRecording({ dimension, pool, rng, lang, worldId = 'global', governance, debugStore, matchValue }) {
    if (!pool || pool.length === 0) {
        throw new PromptAssemblyError('EMPTY_POOL', `No entries available for ${dimension}`);
    }
    const candidates = buildCandidates(pool, dimension, worldId, lang);
    let selectedIdx = -1;
    if (matchValue !== undefined && matchValue !== null && matchValue !== 'any') {
        // Debug logging
        console.log(`=== selectWithRecording: ${dimension} ===`);
        console.log('matchValue:', matchValue);
        console.log('candidates:', candidates.map(c => ({ id: c.id, value: c.value })));

        // 1. 完全匹配 ID (dimension:value 格式)
        selectedIdx = candidates.findIndex(c => c.id === matchValue);
        // 2. 匹配原始对象
        if (selectedIdx === -1) {
            selectedIdx = candidates.findIndex(c => c.raw === matchValue);
        }
        // 3. 匹配显示值
        if (selectedIdx === -1) {
            selectedIdx = candidates.findIndex(c => c.value === matchValue);
        }
        // 4. 尝试提取 ID 中的 value 部分
        if (selectedIdx === -1 && typeof matchValue === 'string') {
            const matchParts = matchValue.split(':');
            const matchValuePart = matchParts[matchParts.length - 1];
            selectedIdx = candidates.findIndex(c => {
                const candIdParts = c.id.split(':');
                const candIdPart = candIdParts[candIdParts.length - 1];
                return candIdPart === matchValuePart;
            });
            // 5. 如果还是不匹配，尝试 slugify 匹配
            if (selectedIdx === -1) {
                selectedIdx = candidates.findIndex(c => c.id.endsWith(`:${slugify(matchValuePart)}`));
            }
        }
        console.log('selectedIdx:', selectedIdx);
    }
    if (selectedIdx < 0) {
        const randomFn = rng || Math.random;
        selectedIdx = Math.floor(randomFn() * candidates.length);
        console.log('Random selection, idx:', selectedIdx);
    }
    const selected = recordSelection(governance, dimension, candidates, selectedIdx, debugStore);
    return { candidates, selectedIdx, selected, raw: candidates[selectedIdx].raw };
}

class PromptAssemblyError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'PromptAssemblyError';
        this.code = code;
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createForbiddenPattern(term) {
    if (!term || typeof term !== 'string') return null;
    const trimmed = term.trim();
    if (!trimmed) return null;
    const escaped = escapeRegExp(trimmed);
    const singleWord = /^[A-Za-z0-9_-]+$/.test(trimmed);
    if (singleWord) {
        return new RegExp(`\\b${escaped}\\b`, 'gi');
    }
    return new RegExp(escaped, 'gi');
}

function sanitizePart(part, forbiddenTerms = []) {
    if (!part) return '';
    let sanitized = part;
    for (const term of forbiddenTerms) {
        const pattern = createForbiddenPattern(term);
        if (!pattern) continue;
        sanitized = sanitized.replace(pattern, ' ');
    }
    sanitized = sanitized.replace(/\s{2,}/g, ' ').replace(/\s+,/g, ',').replace(/,\s*,/g, ',').trim();
    return sanitized;
}

function containsForbiddenTerm(text = '', forbiddenTerms = []) {
    if (!text) return false;
    return forbiddenTerms.some(term => {
        const pattern = createForbiddenPattern(term);
        if (!pattern) return false;
        pattern.lastIndex = 0;
        return pattern.test(text);
    });
}

function sanitizeValue(value, forbiddenTerms = [], governance = null, fieldName = '') {
    const cleaned = sanitizePart(value, forbiddenTerms);
    if (!cleaned && governance) {
        governance.warnings.push(`Value dropped after sanitization: ${fieldName}`);
    }
    return cleaned;
}

// -----------------------------
// 1.6) 涌现性评分 (Emergence Scoring)
// -----------------------------

const SYNERGY_MATRIX = {
    // 高协同组合 (+2分)
    synergies: [
        { world: "miniature_fantasy", core_tension: "tiny_labor_vs_giant_object", mechanisms: ["scale_mismatch"] },
        { world: "concept_art", core_tension: "ritual_without_reason", mechanisms: ["missing_essential"] },
        { world: "documentary", core_tension: "routine_vs_glitch", mechanisms: ["rule_breaking_signage"] },
        { world: "advertising", core_tension: "luxury_vs_absurd", mechanisms: ["label_lies"] },
        { world: "product_photography", core_tension: "precision_vs_decay", mechanisms: ["cutaway_logic"] }
    ],

    // 意外但有趣的冲突 (+3分)
    interestingClashes: [
        { world: "advertising", core_tension: "luxury_vs_absurd", mechanisms: ["missing_essential"] },
        { world: "product_photography", imaging: "documentary_available_light" },
        { world: "miniature_fantasy", intent: "document" },
        { world: "meme_logic", core_tension: "corporate_voice_glitch", mechanisms: ["function_misuse"] }
    ],

    // 陈词滥调组合 (-1分)
    cliches: [
        { world: "advertising", core_tension: "desire_vs_control", intent: "sell" },
        { world: "miniature_fantasy", mechanisms: ["scale_mismatch"] }
    ]
};

function evaluateEmergence(skeleton) {
    let score = 0;
    const worldId = skeleton.creative_world.replace('world:', '');

    const matchesPattern = (skeleton, pattern) => {
        if (pattern.world && worldId !== pattern.world) return false;
        if (pattern.core_tension && skeleton.core_tension !== pattern.core_tension) return false;
        if (pattern.imaging && skeleton.imaging_assumption !== pattern.imaging) return false;
        if (pattern.intent && skeleton.creation_intent !== pattern.intent) return false;
        if (pattern.mechanisms) {
            const hasMech = pattern.mechanisms.every(m => skeleton.twist_mechanisms.includes(m));
            if (!hasMech) return false;
        }
        return true;
    };

    SYNERGY_MATRIX.synergies.forEach(pattern => {
        if (matchesPattern(skeleton, pattern)) score += 2;
    });

    SYNERGY_MATRIX.interestingClashes.forEach(pattern => {
        if (matchesPattern(skeleton, pattern)) score += 3;
    });

    SYNERGY_MATRIX.cliches.forEach(pattern => {
        if (matchesPattern(skeleton, pattern)) score -= 1;
    });

    let label = "Standard / 标准";
    if (score >= 5) label = "Highly Emergent / 高度涌现";
    else if (score >= 2) label = "Interesting Combo / 有趣组合";
    else if (score < 0) label = "Cliche / 陈词滥调";

    return { score, label };
}

// 灵感种子解析函数
function parseInspirationSeed(text) {
    if (!text || !text.trim()) return null;

    const weights = {
        worlds: {},
        intents: {},
        logics: {},
        tensions: [],
        mechanisms: [],
        imaging: null,
        subjects: [],
        stages: []
    };

    let matched = false;

    // 匹配所有关键词（支持中英文、同义词）
    for (const [pattern, mapping] of Object.entries(INSPIRATION_KEYWORDS)) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(text)) {
            matched = true;

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
            if (mapping.imaging) weights.imaging = mapping.imaging;
            if (mapping.subjects) weights.subjects.push(...mapping.subjects);
            if (mapping.stages) weights.stages.push(...mapping.stages);
        }
    }

    return matched ? weights : null;
}

/**
 * 拼装最终提示词 (Assemble Prompt)
 */
function assemblePrompt(governance) {
    const {
        deliverable_type,
        core_tension,
        twist_mechanisms = [],
        subject_kit = {},
        stage_context,
        composition_rule,
        lighting_rule
    } = governance;

    const subjects = [subject_kit.primary_subject, ...(subject_kit.secondary_elements || [])]
        .filter(Boolean)
        .join(', ');

    const twists = twist_mechanisms.join(', ');

    const parts = [
        deliverable_type,
        subjects ? `featuring ${subjects}` : '',
        core_tension ? `inspired by ${core_tension}` : '',
        twists ? `with ${twists}` : '',
        stage_context ? `set in ${stage_context}` : '',
        composition_rule ? `following ${composition_rule}` : '',
        lighting_rule ? `lit by ${lighting_rule}` : ''
    ].filter(Boolean);

    return parts.join('. ') + '.';
}

// -----------------------------
// P1 Modules (Pure Functions)
// -----------------------------

// Module 1: Normalize Overrides
function normalize_overrides({ overrides }) {
    const clean = {};
    const warnings = [];
    if (!overrides) return { clean, warnings };

    for (const [key, value] of Object.entries(overrides)) {
        if (!value || value === 'any') continue;

        // Handle array or single value
        const values = Array.isArray(value) ? value : [value];
        const normalizedValues = values.map(v => {
            if (typeof v === 'string' && v.includes(':')) {
                const rawSlug = v.split(':').pop();
                warnings.push(`Deprecated prefix format for ${key} override '${v}' normalized to '${rawSlug}'. Please use raw slug.`);
                return rawSlug;
            }
            return v;
        });

        clean[key] = Array.isArray(value) ? normalizedValues : normalizedValues[0];
    }
    return { clean, warnings };
}

// Module 2: Validate Overrides
function validate_overrides({ clean, pools, worldConfig, lang }) {
    const validated = {};
    const errors = [];
    const dropped = [];
    const internalWarnings = [];

    // Helper for checking a single dimension
    const checkDimension = (dim, val, pool, idKey = 'id') => {
        if (!pool) return null; // Should ideally error if pool missing but strict P0 flow might ignore
        const vals = Array.isArray(val) ? val : [val];
        const validItems = [];

        for (const v of vals) {
            let candidate = null;
            if (dim === 'subject_kit') {
                candidate = pool.find(item => {
                    const stableId = getStableOptionId(null, 'subject_kit', item, lang);
                    const rawSlug = typeof v === 'string' ? slugify(v) : v;
                    if (stableId === v || stableId === `subject_kit:${rawSlug}`) return true;
                    const primarySubject = getVal(item.primary_subject, 'en');
                    if (slugify(primarySubject) === rawSlug) return true;
                    return false;
                });
            } else {
                candidate = pool.find(p => {
                    const pId = p[idKey];
                    if (pId === v || pId === `${dim}:${v}`) return true;
                    const rawVal = (p && typeof p === 'object') ? (p.en || p.zh) : p;
                    if (rawVal) {
                        const slug = slugify(String(rawVal));
                        if (slug === v) return true;
                    }
                    return false;
                });
            }

            if (candidate) {
                const candidateStr = JSON.stringify(candidate);
                const forbiddenTerms = worldConfig.forbidden_visual_terms || [];
                if (containsForbiddenTerm(candidateStr, forbiddenTerms)) {
                    internalWarnings.push(`Override '${v}' contains forbidden terms. Accepted with warning.`);
                }
                validItems.push(candidate);
            } else {
                dropped.push({
                    field: dim,
                    user_input: v,
                    reason: 'Not found in candidate pool',
                    fallback_used: true
                });
                errors.push(`Invalid override for ${dim}: '${v}' (Not found in candidate pool). Fallback applied.`);
            }
        }
        return validItems.length > 0 ? (Array.isArray(val) ? validItems : validItems[0]) : null;
    };

    const paramMap = {
        'intent': { pool: pools.creation_intent, dim: 'creation_intent' },
        'creation_intent': { pool: pools.creation_intent, dim: 'creation_intent' },
        'logic': { pool: pools.generation_logic, dim: 'generation_logic' },
        'generation_logic': { pool: pools.generation_logic, dim: 'generation_logic' },
        'core_tension': { pool: pools.core_tension, dim: 'core_tension' },
        'twist_mechanisms': { pool: pools.twist_mechanisms, dim: 'twist_mechanisms' },
        'subject_kit': { pool: pools.subject_kit, dim: 'subject_kit' },
        'stage_context': { pool: pools.stage_context, dim: 'stage_context' },
        'composition_rule': { pool: pools.composition_rule, dim: 'composition_rule' },
        'lighting_rule': { pool: pools.lighting_rule, dim: 'lighting_rule' }
    };

    for (const [key, val] of Object.entries(clean)) {
        if (paramMap[key]) {
            const { pool, dim } = paramMap[key];
            const result = checkDimension(dim, val, pool);
            if (result) validated[dim] = result;
        }
    }

    return { validated, errors, dropped, warnings: internalWarnings };
}

// Module 3: Rule Engine (L1, L2, L3)
function apply_logic_constraints({ validated, logicObj, inspirationWeights, highLevelContext }) {
    const fixed = { ...validated };
    const warnings = [];
    let required_twist_append = null;

    // Build context for rule engine
    // highLevelContext has { intent, logic, imaging } (objects)
    const context = {
        generation_logic: highLevelContext.logic,
        creation_intent: highLevelContext.intent,
        imaging_assumption: highLevelContext.imaging,
        ...fixed // Overrides might control triggers too
    };

    const ruleResult = evaluateRules(context);

    // Apply Requirements
    // Currently only supporting 'twist_mechanisms' requirement for simplicity in v0
    // But engine supports generic.
    if (ruleResult.requirements.twist_mechanisms) {
        // We only support ONE required category mainly in current logic flow (required_twist_append)
        // If multiple, we might need to change architecture. For now pick first.
        required_twist_append = ruleResult.requirements.twist_mechanisms[0];
        warnings.push(...ruleResult.warnings);
    }

    return {
        fixed,
        required_twist_append,
        forbidden: ruleResult.forbidden, // Pass forbidden list to sampler
        warnings
    };
}

// Module 4: Sample Candidates (with Density & Rules)
function sample_candidates({ constraints, pools, rng, worldId, lang, highLevel, inspirationWeights, debugStore, strategy, density = 'medium' }) {
    const selection = {};
    const governanceUpdates = { rule_hits: [], warnings: [] };
    const { intent, logic, imaging } = highLevel;
    selection.creation_intent = intent;
    selection.generation_logic = logic;
    selection.imaging_assumption = imaging;

    const densitySettings = DENSITY_CONFIG[density] || DENSITY_CONFIG.medium;

    function resolve(dim, pool, matchValue, isMulti = false, kRange = null) {
        const tempGov = { selected_fields: {}, source_refs: {}, rule_hits: [], warnings: [] };
        let override = matchValue;

        // Apply Candidate Filtering Strategy hook
        let activePool = pool;
        if (strategy && strategy.filter) {
            activePool = strategy.filter(pool, dim);
        }

        // --- Density Check for Optional Dimensions ---
        // If it's an optional dimension (stage, composition, lighting) and no override is present,
        // we might skip it based on density to reduce "Element Stacking".
        const optionalDims = ['stage_context', 'composition_rule', 'lighting_rule'];
        if (optionalDims.includes(dim) && !override && !isMulti) {
            const roll = rng();
            if (roll > densitySettings.optional_dimension_prob) {
                // Return null implies "Default/Unspecified" -> Cleaner prompt
                return null;
            }
        }

        if (dim === 'twist_mechanisms') {
            if (override && constraints.required_twist_append) {
                const reqId = constraints.required_twist_append;
                const reqTwist = activePool.find(t => t.id === reqId);
                if (reqTwist) {
                    const currentArr = Array.isArray(override) ? override : [override];
                    const hasIt = currentArr.some(t => t.id === reqTwist.id);
                    if (!hasIt) {
                        override = [...currentArr, reqTwist];
                        governanceUpdates.warnings.push(`Logic required twist '${reqId}' was appended to your overrides.`);
                    }
                }
            }

            if (override) {
                return Array.isArray(override) ? override : [override];
            }

            // Density controls Twist Count
            const effectiveKRange = kRange || densitySettings.twist_k_range || [1, 2];
            const minK = effectiveKRange[0], maxK = effectiveKRange[1];
            const k = Math.max(minK, Math.min(maxK, getRandomInt(minK, maxK, rng)));

            const forbiddenTerms = pools.forbidden_visual_terms || [];
            let available = activePool.filter(t => !containsForbiddenTerm(t.en, forbiddenTerms));

            // Filter out forbidden twists based on Intent (L3 Rule)
            // L3 Rules from Rule Engine (constraints.forbidden) + Hardcoded intent.forbidden_twists (migration pending)
            if (intent.forbidden_twists) {
                available = available.filter(t => !intent.forbidden_twists.includes(t.id));
            }
            if (constraints.forbidden && constraints.forbidden.twist_mechanisms) {
                const forbiddenIds = constraints.forbidden.twist_mechanisms;
                available = available.filter(t => !forbiddenIds.includes(t.id));
            }

            let twistSelection = pickKUnique(available, k, rng);

            if (inspirationWeights && inspirationWeights.mechanisms.length > 0) {
                const preferred = inspirationWeights.mechanisms.map(id => activePool.find(m => m.id === id)).filter(Boolean);
                // Mix in preferred
                for (let i = 0; i < Math.min(preferred.length, twistSelection.length); i++) twistSelection[i] = preferred[i];
            }

            if (constraints.required_twist_append) {
                const reqTwist = activePool.find(t => t.id === constraints.required_twist_append);
                if (reqTwist && !twistSelection.includes(reqTwist)) {
                    if (twistSelection.length > 0) twistSelection[0] = reqTwist; // Replace first
                    else twistSelection.push(reqTwist);
                }
            }
            return twistSelection;
        }

        if (dim !== 'twist_mechanisms' && dim !== 'subject_kit') {
            const res = selectWithRecording({
                dimension: dim,
                pool: activePool,
                rng,
                lang,
                worldId,
                governance: tempGov,
                debugStore,
                matchValue: override
            });
            if (tempGov.rule_hits) governanceUpdates.rule_hits.push(...tempGov.rule_hits);
            return res.raw;
        }

        // Subject Kit is special (Composite)
        if (dim === 'subject_kit') {
            // If override is present, use it completely (assume user knows what they want)
            if (override) {
                // Logic to hydrate partial object could go here, but for now strict override
                return override;
            }

            // Pick a primary kit first
            const res = selectWithRecording({
                dimension: 'subject_kit',
                pool: activePool,
                rng,
                lang,
                worldId,
                governance: tempGov,
                debugStore,
                matchValue: override
            });

            const rawKit = res.raw;
            if (!rawKit) return null;

            // Density controls Secondary Elements
            let finalSecondary = [];
            if (rawKit.secondary_elements) {
                const secCountRange = densitySettings.secondary_element_count_range;
                const count = getRandomInt(secCountRange[0], secCountRange[1], rng);
                const candidates = [...rawKit.secondary_elements];

                // Shuffle and pick 'count' elements
                for (let i = candidates.length - 1; i > 0; i--) {
                    const j = Math.floor(rng() * (i + 1));
                    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
                }
                finalSecondary = candidates.slice(0, count);
            }

            return {
                primary_subject: rawKit.primary_subject,
                secondary_elements: finalSecondary,
                id: res.selected.id // Keep ref
            };
        }
    }

    selection.core_tension = resolve('core_tension', pools.core_tension, constraints.fixed.core_tension);
    selection.twist_mechanisms = resolve('twist_mechanisms', pools.twist_mechanisms, constraints.fixed.twist_mechanisms, true, pools.twistKRange || [2, 3]);
    selection.subject_kit = resolve('subject_kit', pools.subject_kit, constraints.fixed.subject_kit);
    selection.stage_context = resolve('stage_context', pools.stage_context, constraints.fixed.stage_context);
    selection.composition_rule = resolve('composition_rule', pools.composition_rule, constraints.fixed.composition_rule);
    selection.lighting_rule = resolve('lighting_rule', pools.lighting_rule, constraints.fixed.lighting_rule);

    // Apply Post-Process Strategy hook
    if (strategy && strategy.apply) {
        strategy.apply(selection, WORLDS);
    }

    return { selection, governanceUpdates };
}

// Module 5: Assemble Prompt
function assemble_prompt({ selection, worldConfig, lang }) {
    const governance = {
        deliverable_type: getVal(worldConfig.deliverable_type[0], lang),
        core_tension: getVal(selection.core_tension, lang),
        twist_mechanisms: selection.twist_mechanisms.map(t => getVal(t, lang)),
        subject_kit: {
            primary_subject: getVal(selection.subject_kit.primary_subject, lang),
            secondary_elements: (selection.subject_kit.secondary_elements || []).map(e => getVal(e, lang))
        },
        stage_context: getVal(selection.stage_context, lang),
        composition_rule: getVal(selection.composition_rule, lang),
        lighting_rule: getVal(selection.lighting_rule, lang)
    };
    return assemblePrompt(governance);
}

// -----------------------------
// Orchestrator
// -----------------------------

function generateCreativeSkeleton(options = {}) {
    const {
        world: forcedWorld = null,
        lang = 'en',
        twistKRange = [2, 3],
        intent: forcedIntent = null,
        logic: forcedLogic = null,
        imaging_assumption: forcedImagingAssumption = null,
        seed = null,
        inspirationSeed = null,
        overrides: rawOverrides = {},
        oblique_strategy_enabled = false,
        provocative_directive_enabled = false,
        density = 'medium'
    } = options;

    const rng = createRNG(seed);
    const debugStore = { selected_fields_verbose: {}, seed: rng.seed };
    const inspirationWeights = parseInspirationSeed(inspirationSeed);

    const allWorlds = Object.keys(WORLDS);
    let world = forcedWorld;
    if (!world || world === 'any' || !WORLDS[world]) {
        if (inspirationWeights && Object.keys(inspirationWeights.worlds).length > 0) {
            const weightPool = [];
            Object.entries(inspirationWeights.worlds).forEach(([w, weight]) => {
                for (let i = 0; i < weight * 2; i++) weightPool.push(w);
            });
            if (weightPool.length > 0) world = weightPool[Math.floor(rng() * weightPool.length)];
        }
        if (!world || world === 'any') {
            world = allWorlds[Math.floor(rng() * allWorlds.length)];
        }
    }
    if (!WORLDS[world]) world = 'advertising';

    const worldConfig = WORLDS[world];
    const pools = {
        creation_intent: Object.values(CREATION_INTENTS),
        generation_logic: Object.values(GENERATION_LOGICS),
        core_tension: worldConfig.core_tension,
        twist_mechanisms: worldConfig.twist_mechanisms_pool,
        subject_kit: worldConfig.subject_kits,
        stage_context: worldConfig.stage_context,
        composition_rule: worldConfig.composition_rule,
        lighting_rule: worldConfig.lighting_rule,
        forbidden_visual_terms: worldConfig.forbidden_visual_terms,
        twistKRange
    };

    const { clean: cleanOverrides, warnings: normWarnings } = normalize_overrides({ overrides: rawOverrides });
    const { validated, errors, dropped, warnings: valWarnings } = validate_overrides({ clean: cleanOverrides, pools, worldConfig, lang });

    function resolveHL(dim, pool, override, forced, inspMap, threshold) {
        if (override) return override;
        if (forced && forced !== 'any') {
            return pool.find(i => i.id === forced) || null;
        }
        if (inspMap && Object.keys(inspMap).length > 0) {
            const highest = Object.entries(inspMap).reduce((a, b) => a[1] > b[1] ? a : b);
            if (highest[1] >= threshold) {
                return pool.find(i => i.id === highest[0]) || null;
            }
        }
        return null;
    }

    const hlIntent = resolveHL('creation_intent', pools.creation_intent, validated.creation_intent, forcedIntent, inspirationWeights?.intents, 3);
    const hlLogic = resolveHL('generation_logic', pools.generation_logic, validated.generation_logic, forcedLogic, inspirationWeights?.logics, 2);

    let finalImagingId = forcedImagingAssumption;
    if (!finalImagingId && inspirationWeights?.imaging) finalImagingId = inspirationWeights.imaging;
    if (!finalImagingId || !IMAGING_ASSUMPTIONS[finalImagingId]) finalImagingId = 'industrial_product_photography';
    const hlImaging = IMAGING_ASSUMPTIONS[finalImagingId];

    let selectedLogic = hlLogic || pick(pools.generation_logic, rng);
    let selectedIntent = hlIntent || pick(pools.creation_intent, rng);

    // Pick Oblique Strategy
    let strategy = null;
    if (oblique_strategy_enabled) {
        strategy = OBLIQUE_STRATEGIES[Math.floor(rng() * OBLIQUE_STRATEGIES.length)];
    }

    const { fixed, required_twist_append, warnings: logicWarnings, forbidden } = apply_logic_constraints({
        validated,
        logicObj: selectedLogic,
        inspirationWeights,
        highLevelContext: { intent: selectedIntent, logic: selectedLogic, imaging: hlImaging }
    });

    const { selection, governanceUpdates } = sample_candidates({
        constraints: { fixed, required_twist_append, forbidden },
        pools,
        rng,
        worldId: world,
        lang,
        highLevel: { intent: selectedIntent, logic: selectedLogic, imaging: hlImaging },
        inspirationWeights,
        debugStore,
        strategies: strategy ? [strategy] : [],
        density
    });

    const finalPrompt = assemble_prompt({ selection, worldConfig, lang });

    // Pick Provocative Directive
    let directive = null;
    if (provocative_directive_enabled) {
        const intentDirectives = PROVOCATIVE_DIRECTIVES[selectedIntent.id] || [];
        if (intentDirectives.length > 0) {
            directive = intentDirectives[Math.floor(rng() * intentDirectives.length)];
        }
    }

    const allWarnings = [...normWarnings, ...valWarnings, ...logicWarnings, ...governanceUpdates.warnings];
    const safeT = (item) => getVal(item, lang);
    const safeSlug = (val) => slugify(val || 'unknown');
    const factId = (prefix, item) => {
        if (item && item.id) return `${prefix}:${item.id}`;
        const val = item && (item.en || item.zh || item);
        return `${prefix}:${safeSlug(val)}`;
    };

    const publicSkeleton = {
        _world: world,  // For UI functionality only
        creative_id: `${generateId()}`,
        creation_intent: safeT(selection.creation_intent.desc),
        creation_intent_id: selection.creation_intent.id,
        generation_logic: safeT(selection.generation_logic.desc),
        generation_logic_id: selection.generation_logic.id,
        subject_kit: {
            primary_subject: safeT(selection.subject_kit.primary_subject),
            primary_id: selection.subject_kit.primary_subject.id || safeSlug(getVal(selection.subject_kit.primary_subject)),
            secondary_elements: (selection.subject_kit.secondary_elements || []).map(e => safeT(e)),
            secondary_ids: (selection.subject_kit.secondary_elements || []).map(e => factId('element', e))
        },
        core_tension: safeT(selection.core_tension),
        core_tension_id: selection.core_tension.id || safeSlug(getVal(selection.core_tension)),
        twist_mechanisms: selection.twist_mechanisms.map(t => safeT(t)),
        twist_ids: selection.twist_mechanisms.map(t => t.id || safeSlug(getVal(t))),
        stage_context: safeT(selection.stage_context),
        stage_context_id: selection.stage_context?.id || (selection.stage_context ? safeSlug(getVal(selection.stage_context)) : null),
        composition_rule: safeT(selection.composition_rule),
        composition_rule_id: selection.composition_rule?.id || (selection.composition_rule ? safeSlug(getVal(selection.composition_rule)) : null),
        lighting_rule: safeT(selection.lighting_rule),
        lighting_rule_id: selection.lighting_rule?.id || (selection.lighting_rule ? safeSlug(getVal(selection.lighting_rule)) : null),
        imaging_assumption: safeT(selection.imaging_assumption.desc),
        imaging_assumption_id: selection.imaging_assumption.id,
        deliverable_type: safeT(worldConfig.deliverable_type[0]),
        creative_directive: directive ? safeT(directive) : null,
        oblique_strategy: strategy ? safeT(strategy.desc) : null
    };

    // Run post-generation evaluation
    const evaluation = evaluateSkeleton(publicSkeleton, {
        intent: selection.creation_intent,
        logic: selection.generation_logic,
        imaging: selection.imaging_assumption,
        density
    });

    return {
        public_skeleton: publicSkeleton,
        evaluation,
        debug: debugStore
    };
}




// Optional: Reverse Parse Helper (Minimal)
function reverseParseImagingAssumption(text) {
    if (!text) return "industrial_product_photography";
    const t = text.toLowerCase();

    if (t.includes("jewelry") || t.includes("macro") || t.includes("close-up")) return "jewelry_macro_photography";
    if (t.includes("portrait") || t.includes("skin") || t.includes("fashion")) return "soft_editorial_portrait";
    if (t.includes("documentary") || t.includes("street") || t.includes("candid")) return "documentary_available_light";

    return "industrial_product_photography";
}

function getAvailableWorlds() {
    return Object.keys(WORLDS);
}

// Generate a random ID (helper)
const generateId = () => Math.random().toString(36).substring(2, 10);

// Exports
module.exports = {
    generateCreativeSkeleton,
    getAvailableWorlds,
    reverseParseImagingAssumption,
    WORLDS,
    CREATION_INTENTS,
    GENERATION_LOGICS,
    IMAGING_ASSUMPTIONS,
    PromptAssemblyError,
    // Export pure functions for testing if needed
    normalize_overrides,
    validate_overrides,
    apply_logic_constraints,
    sample_candidates,
    assemble_prompt,
    DENSITY_CONFIG
};
