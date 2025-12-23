const { v4: uuidv4 } = require('uuid'); // 我们稍后需要安装 uuid，或者简单的随机字符串生成

// 简单的 UUID 生成器，避免额外依赖，如果想更标准可以用 uuid 包
const generateId = () => Math.random().toString(36).substring(2, 10);

// -----------------------------
// 1) 变量库
// -----------------------------

const WORLDS = {
    "advertising": {
        "deliverable_type": ["ad_key_visual", "brand_poster", "social_ad", "launch_teaser"],
        "entry_point": ["object", "person", "text", "system"],
        "core_tension": ["desire_vs_control", "clean_vs_chaos", "luxury_vs_absurd", "promise_vs_reality"],
        "twist_mechanisms_pool": [
            "scale_mismatch",          // 尺度错位
            "function_misuse",         // 功能错配
            "label_lies",              // 标注说谎/反讽标签
            "material_swap",           // 材质错置
            "cutaway_logic",           // 剖面/结构可见
            "missing_essential",       // 缺席
        ],
        "stage_context": [
            "clean studio tabletop",
            "minimal seamless backdrop",
            "billboard mockup environment",
            "retail shelf close-up",
        ],
        "composition_rule": [
            "centered hero object, negative space",
            "bold asymmetry with clear hierarchy",
            "graphic layout, poster-like composition",
        ],
        "lighting_rule": [
            "soft directional studio light",
            "high-contrast rim light",
            "even commercial lighting",
        ],
        "subject_kits": [
            { "primary_subject": "a luxury fragrance bottle", "secondary_elements": ["price tag sticker", "micro scratch marks", "tiny warning label"] },
            { "primary_subject": "a fast-food burger", "secondary_elements": ["measuring tape", "sterile glove", "barcode label"] },
            { "primary_subject": "a credit card", "secondary_elements": ["receipt fragments", "fingerprint dust", "security seal"] },
            { "primary_subject": "a smartphone", "secondary_elements": ["cracked glass shards", "warranty card", "tiny screws"] },
        ]
    },

    "product_photography": {
        "deliverable_type": ["product_shot", "catalog_cover", "packshot_with_twist"],
        "entry_point": ["object"],
        "core_tension": ["premium_vs_raw", "precision_vs_decay", "comfort_vs_clinical"],
        "twist_mechanisms_pool": [
            "material_swap",
            "scale_mismatch",
            "function_misuse",
            "cutaway_logic",
            "rule_breaking_packaging",  // 包装规则被打断
        ],
        "stage_context": [
            "clean studio tabletop",
            "white cyclorama",
            "matte stone surface",
            "soft fabric surface",
        ],
        "composition_rule": [
            "centered, calm framing, high detail",
            "tight macro crop on materials",
            "two-object comparison layout",
        ],
        "lighting_rule": [
            "soft directional studio light, strong material definition",
            "diffused top light, minimal shadows",
        ],
        "subject_kits": [
            { "primary_subject": "a premium supplement bottle", "secondary_elements": ["tamper seal", "tiny lounge chair", "warning label sticker"] },
            { "primary_subject": "a ceramic coffee mug", "secondary_elements": ["receipt", "stirring spoon", "micro cracks"] },
            { "primary_subject": "a mechanical keyboard keycap set", "secondary_elements": ["dust", "tiny gears", "spec label"] },
            { "primary_subject": "a luxury watch", "secondary_elements": ["micro tools", "gear fragments", "calibration card"] },
        ]
    },

    "concept_art": {
        "deliverable_type": ["concept_frame", "gallery_print", "visual_metaphor"],
        "entry_point": ["object", "person", "absence", "system"],
        "core_tension": ["identity_slippage", "memory_corruption", "control_breakdown", "ritual_without_reason"],
        "twist_mechanisms_pool": [
            "scale_mismatch",
            "label_lies",
            "missing_essential",
            "impossible_but_physical",
            "cutaway_logic",
            "time_discontinuity",
        ],
        "stage_context": [
            "empty room with subtle institutional feel",
            "archive storage aisle",
            "silent exhibition space",
            "abandoned office corner",
        ],
        "composition_rule": [
            "deadpan centered framing",
            "wide shot with small subject",
            "symmetrical, clinical composition",
        ],
        "lighting_rule": [
            "cool ambient light with a single warm source",
            "overcast soft light",
            "institutional fluorescent light",
        ],
        "subject_kits": [
            { "primary_subject": "a stack of documents", "secondary_elements": ["redacted lines", "misaligned stamps", "binder clip"] },
            { "primary_subject": "a chair", "secondary_elements": ["torn fabric", "number tag", "dust outline"] },
            { "primary_subject": "a mirror", "secondary_elements": ["cracked corner", "inventory label", "fingerprint smears"] },
            { "primary_subject": "a human portrait photo", "secondary_elements": ["missing face area", "annotation marks", "archival sleeve"] },
        ]
    },

    "documentary": {
        "deliverable_type": ["street_photo", "documentary_frame", "found_moment"],
        "entry_point": ["person", "action", "system"],
        "core_tension": ["ordinary_vs_uncanny", "routine_vs_glitch", "public_vs_private"],
        "twist_mechanisms_pool": [
            "rule_breaking_signage",
            "scale_mismatch",
            "missing_essential",
        ],
        "stage_context": [
            "busy street corner",
            "subway platform",
            "night market alley",
            "office lobby",
        ],
        "composition_rule": [
            "35mm street photography framing",
            "candid mid-shot with context",
            "wide environmental portrait",
        ],
        "lighting_rule": [
            "natural light, slightly imperfect exposure",
            "mixed urban lighting at night",
        ],
        "subject_kits": [
            { "primary_subject": "a commuter", "secondary_elements": ["misprinted poster", "odd queue markers", "taped arrows"] },
            { "primary_subject": "a vendor stall", "secondary_elements": ["handwritten price tags", "broken neon sign", "mismatched numbers"] },
            { "primary_subject": "a security guard", "secondary_elements": ["empty badge holder", "strange floor markings", "warning tape"] },
        ]
    },

    "meme_logic": {
        "deliverable_type": ["screenshot_meme", "fake_ui_post", "internet_poster"],
        "entry_point": ["text", "system", "object"],
        "core_tension": ["deadpan_absurd", "overexplained_simple", "corporate_voice_glitch"],
        "twist_mechanisms_pool": [
            "label_lies",
            "rule_breaking_ui",
            "function_misuse",
            "missing_essential",
        ],
        "stage_context": [
            "mobile app screenshot",
            "fake system dialog overlay",
            "social feed card",
        ],
        "composition_rule": [
            "screenshot framing, UI-first",
            "poster with bold text blocks",
        ],
        "lighting_rule": [
            "flat UI lighting (no cinematic)"
        ],
        "subject_kits": [
            { "primary_subject": "a system notification", "secondary_elements": ["oddly specific timestamp", "contradictory buttons", "tiny watermark"] },
            { "primary_subject": "a product listing", "secondary_elements": ["absurd feature bullets", "wrong category tags", "broken rating stars"] },
            { "primary_subject": "a chat screenshot", "secondary_elements": ["overly formal apology", "glitched emoji", "misaligned bubbles"] },
        ]
    },

    "miniature_fantasy": {
        "deliverable_type": ["miniature_scene", "diorama_shot", "toy_world_frame"],
        "entry_point": ["object", "action"],
        "core_tension": ["tiny_labor_vs_giant_object", "whimsical_vs_real_materials"],
        "twist_mechanisms_pool": [
            "scale_mismatch",
            "cutaway_logic",
            "function_misuse",
            "material_swap",
        ],
        "stage_context": [
            "tabletop diorama",
            "kitchen counter macro scene",
            "workbench miniature set",
        ],
        "composition_rule": [
            "macro lens, shallow depth of field",
            "hero object with tiny workers",
        ],
        "lighting_rule": [
            "warm practical light with soft shadows",
            "studio macro light, controlled highlights",
        ],
        "subject_kits": [
            { "primary_subject": "a macaron", "secondary_elements": ["tiny ladders", "mini workers", "sugar dust"] },
            { "primary_subject": "a pocket watch", "secondary_elements": ["tiny ropes", "mini repair tools", "gears"] },
            { "primary_subject": "a lipstick", "secondary_elements": ["mini scaffolding", "tiny paint rollers", "gloss reflections"] },
            { "primary_subject": "a tea cup", "secondary_elements": ["mini boats", "steam as fog", "spoons as bridges"] },
        ]
    },
};

// -----------------------------
// 2) 互斥/白名单规则
// -----------------------------

const FORBIDDEN_MECHANISMS_BY_WORLD = {
    "documentary": ["material_swap", "impossible_but_physical", "time_discontinuity"],
    "meme_logic": ["cinematic_lighting", "ultra_photoreal_macro"],
};

// Helper functions

function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function pickKUnique(items, k) {
    if (k <= 0) return [];
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(k, items.length));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Main logic

function generateCreativeSkeleton(world, twistKRange = [2, 3]) {
    if (!WORLDS[world]) {
        throw new Error(`Unknown world: ${world}`);
    }
    
    const cfg = WORLDS[world];

    const deliverableType = pick(cfg.deliverable_type);
    const entryPoint = pick(cfg.entry_point);
    const coreTension = pick(cfg.core_tension);

    let pool = [...cfg.twist_mechanisms_pool];
    const forbidden = FORBIDDEN_MECHANISMS_BY_WORLD[world] || [];
    pool = pool.filter(m => !forbidden.includes(m));

    const k = getRandomInt(twistKRange[0], twistKRange[1]);
    const twistMechanisms = pickKUnique(pool, k);

    const subjectKit = pick(cfg.subject_kits);
    const stageContext = pick(cfg.stage_context);
    const compositionRule = pick(cfg.composition_rule);
    const lightingRule = pick(cfg.lighting_rule);

    return {
        creative_id: `${world}-${generateId()}`,
        creative_world: world,
        deliverable_type: deliverableType,
        entry_point: entryPoint,
        core_tension: coreTension,
        twist_mechanisms: twistMechanisms,
        subject_kit: subjectKit,
        stage_context: stageContext,
        composition_rule: compositionRule,
        lighting_rule: lightingRule,
    };
}

function getAvailableWorlds() {
    return Object.keys(WORLDS);
}

module.exports = {
    generateCreativeSkeleton,
    getAvailableWorlds,
    WORLDS
};
