
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

const INSPIRATION_KEYWORDS = {
    // ========== 情绪/氛围 ==========
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
        logics: { "composition-study": 2 }
    },
    "真实|realistic|纪实": {
        worlds: { documentary: 4, product_photography: 2 },
        intents: { document: 3, demonstrate: 2 },
        imaging: "documentary_available_light"
    },
    "科技|tech|technology|未来": {
        worlds: { advertising: 3, product_photography: 2 },
        intents: { demonstrate: 3, sell: 2 },
        subjects: ["smartphone", "luxury watch"],
        imaging: "industrial_product_photography"
    },
    "复古|vintage|retro|怀旧": {
        worlds: { documentary: 3, concept_art: 2 },
        intents: { evoke: 3, document: 2 },
        tensions: ["memory_corruption", "precision_vs_decay"],
        mechanisms: ["time_discontinuity"]
    },
    "温暖|warm|cozy": {
        worlds: { miniature_fantasy: 3, documentary: 2 },
        intents: { evoke: 3 },
        tensions: ["comfort_vs_clinical"],
        imaging: "documentary_available_light"
    },
    "冷酷|cold|clinical|极简": {
        worlds: { advertising: 3, product_photography: 3 },
        intents: { demonstrate: 3 },
        stages: ["white cyclorama", "clean studio tabletop"],
        tensions: ["comfort_vs_clinical"],
        imaging: "industrial_product_photography"
    },
    "神秘|mysterious|enigmatic": {
        worlds: { concept_art: 4, miniature_fantasy: 2 },
        intents: { evoke: 3, explore: 2 },
        mechanisms: ["missing_essential", "label_lies"]
    },
    "诗意|poetic|artistic": {
        worlds: { concept_art: 3, miniature_fantasy: 2 },
        intents: { evoke: 4, explore: 2 },
        logics: { "composition-study": 3 }
    },
    "幽默|humorous|funny|搞笑": {
        worlds: { meme_logic: 4, concept_art: 2 },
        intents: { entertain: 4, evoke: 2 },
        tensions: ["deadpan_absurd", "ritual_without_reason"],
        mechanisms: ["label_lies", "role_swap"]
    },
    "戏剧|dramatic|theatrical": {
        worlds: { advertising: 3, concept_art: 2 },
        intents: { evoke: 3, sell: 2 },
        logics: { "narrative-moment": 3 }
    },

    // ========== 材质 ==========
    "金属|metal|metallic": {
        mechanisms: ["material_swap", "cutaway_logic"],
        subjects: ["luxury watch", "smartphone", "fragrance bottle"],
        imaging: "industrial_product_photography"
    },
    "玻璃|glass|transparent": {
        imaging: "jewelry_macro_photography",
        mechanisms: ["cutaway_logic"],
        subjects: ["fragrance bottle"]
    },
    "织物|fabric|textile|布料": {
        subjects: ["chair"],
        mechanisms: ["material_swap"],
        tensions: ["comfort_vs_clinical"]
    },
    "木头|wood|wooden": {
        mechanisms: ["material_swap"],
        subjects: ["chair"],
        intents: { demonstrate: 2, evoke: 2 },
        tensions: ["precision_vs_decay"]
    },
    "塑料|plastic": {
        mechanisms: ["material_swap"],
        subjects: ["smartphone", "chair"],
        worlds: { product_photography: 2, concept_art: 2 }
    },
    "陶瓷|ceramic|porcelain": {
        imaging: "jewelry_macro_photography",
        mechanisms: ["material_swap"],
        intents: { demonstrate: 2 }
    },
    "纸张|paper": {
        mechanisms: ["material_swap", "cutaway_logic"],
        tensions: ["precision_vs_decay"]
    },
    "液体|liquid|fluid": {
        mechanisms: ["phase_violation"],
        imaging: "jewelry_macro_photography",
        subjects: ["fragrance bottle"]
    },
    "石头|stone|rock": {
        mechanisms: ["material_swap"],
        tensions: ["precision_vs_decay"],
        subjects: ["chair"]
    },
    "水晶|crystal": {
        imaging: "jewelry_macro_photography",
        mechanisms: ["cutaway_logic"],
        intents: { demonstrate: 3 }
    },

    // ========== 尺度 ==========
    "微观|micro|macro|细节": {
        worlds: { miniature_fantasy: 4, product_photography: 3 },
        mechanisms: ["scale_mismatch", "cutaway_logic"],
        imaging: "jewelry_macro_photography",
        logics: { "composition-study": 2 }
    },
    "巨大|giant|massive|庞大": {
        mechanisms: ["scale_mismatch"],
        tensions: ["tiny_labor_vs_giant_object"]
    },
    "微小|tiny|miniature": {
        worlds: { miniature_fantasy: 4 },
        mechanisms: ["scale_mismatch"],
        intents: { explore: 3, evoke: 2 }
    },

    // ========== 概念/状态 ==========
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
    "精确|precision|accurate": {
        worlds: { product_photography: 3, advertising: 2 },
        intents: { demonstrate: 3 },
        imaging: "industrial_product_photography",
        tensions: ["precision_vs_decay"]
    },
    "爆炸|explosion|burst": {
        mechanisms: ["explosion_diagram"],
        intents: { demonstrate: 3, explore: 2 },
        worlds: { concept_art: 2, product_photography: 2 }
    },
    "融化|melting|dissolve": {
        mechanisms: ["phase_violation"],
        tensions: ["precision_vs_decay"],
        intents: { evoke: 3 }
    },
    "冻结|frozen|freeze": {
        mechanisms: ["time_discontinuity"],
        intents: { evoke: 2, demonstrate: 2 }
    },
    "悬浮|floating|levitate": {
        mechanisms: ["gravity_defiance"],
        intents: { evoke: 3, demonstrate: 2 },
        worlds: { concept_art: 2, advertising: 2 }
    },
    "透明|transparent|see-through": {
        mechanisms: ["cutaway_logic"],
        imaging: "jewelry_macro_photography",
        intents: { demonstrate: 3 }
    },
    "对称|symmetry|symmetric": {
        logics: { "composition-study": 3 },
        intents: { demonstrate: 2 }
    },
    "重复|repeat|pattern": {
        logics: { "system-driven": 3 },
        mechanisms: ["infinite_mirror"],
        intents: { explore: 2 }
    },

    // ========== 场景/环境 ==========
    "街头|street|urban": {
        worlds: { documentary: 4 },
        stages: ["busy street corner", "subway platform"],
        logics: { "narrative-moment": 2 }
    },
    "工作室|studio|clean": {
        worlds: { advertising: 3, product_photography: 3 },
        stages: ["clean studio tabletop", "white cyclorama"],
        imaging: "industrial_product_photography"
    },
    "自然|nature|outdoor": {
        worlds: { documentary: 3, miniature_fantasy: 2 },
        stages: ["forest clearing", "lakeside"],
        imaging: "documentary_available_light",
        intents: { evoke: 2, document: 2 }
    },
    "室内|indoor|interior": {
        worlds: { documentary: 2, miniature_fantasy: 2 },
        stages: ["domestic kitchen", "living room corner"],
        intents: { evoke: 2, document: 2 }
    },
    "地下|underground|subway": {
        worlds: { documentary: 3, concept_art: 2 },
        stages: ["subway platform"],
        intents: { document: 2, evoke: 2 }
    },
    "空中|aerial|sky": {
        mechanisms: ["gravity_defiance"],
        intents: { evoke: 3 },
        worlds: { concept_art: 2, miniature_fantasy: 2 }
    },
    "水下|underwater": {
        mechanisms: ["phase_violation", "gravity_defiance"],
        intents: { evoke: 3, explore: 2 },
        worlds: { concept_art: 3 }
    },

    // ========== 颜色主题 ==========
    "黑白|monochrome|bw": {
        intents: { evoke: 3, document: 2 },
        worlds: { documentary: 3, concept_art: 2 },
        imaging: "documentary_available_light"
    },
    "彩色|colorful|vibrant": {
        worlds: { advertising: 3, miniature_fantasy: 2 },
        intents: { sell: 3, evoke: 2 }
    },
    "金色|golden|gold": {
        subjects: ["luxury watch", "fragrance bottle"],
        intents: { sell: 3 },
        tensions: ["luxury_vs_absurd"]
    },
    "蓝色|blue": {
        intents: { evoke: 2 },
        worlds: { concept_art: 2 }
    },
    "红色|red": {
        intents: { evoke: 2, sell: 2 },
        worlds: { advertising: 2, concept_art: 2 }
    },

    // ========== 时间概念 ==========
    "瞬间|moment|instant": {
        logics: { "narrative-moment": 4 },
        intents: { document: 3, evoke: 2 },
        mechanisms: ["time_discontinuity"]
    },
    "永恒|eternal|timeless": {
        intents: { evoke: 4 },
        tensions: ["memory_corruption"],
        worlds: { concept_art: 3 }
    },
    "流动|flowing|motion": {
        mechanisms: ["time_discontinuity"],
        intents: { evoke: 3 },
        logics: { "narrative-moment": 2 }
    },
    "静止|still|static": {
        worlds: { product_photography: 3, advertising: 2 },
        intents: { demonstrate: 3 },
        imaging: "industrial_product_photography"
    },

    // ========== 人物/角色 ==========
    "人物|people|human": {
        worlds: { documentary: 3, advertising: 2 },
        logics: { "narrative-moment": 3 },
        intents: { document: 2, sell: 2 }
    },
    "孤独|lonely|alone": {
        intents: { evoke: 4 },
        tensions: ["desire_vs_control"],
        worlds: { documentary: 2, concept_art: 2 }
    },
    "群体|crowd|group": {
        worlds: { documentary: 3 },
        stages: ["busy street corner"],
        logics: { "narrative-moment": 2 }
    },

    // ========== 光影 ==========
    "明亮|bright|light": {
        imaging: "industrial_product_photography",
        intents: { demonstrate: 2, sell: 2 },
        worlds: { advertising: 2, product_photography: 2 }
    },
    "黑暗|dark|shadow": {
        intents: { evoke: 3 },
        worlds: { concept_art: 3, documentary: 2 },
        imaging: "documentary_available_light"
    },
    "逆光|backlight": {
        imaging: "documentary_available_light",
        intents: { evoke: 3 },
        logics: { "composition-study": 2 }
    },
    "聚光|spotlight": {
        worlds: { advertising: 3 },
        imaging: "industrial_product_photography",
        intents: { demonstrate: 3 }
    }
};

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

const IMAGING_ASSUMPTIONS = {
    "industrial_product_photography": {
        id: "industrial_product_photography",
        desc: { en: "Industrial Product Photography", zh: "工业产品摄影" },
        template: "Industrial product photography, extremely high resolution, sharp focus, studio lighting, realistic textures, 8k, unreal engine 5 render style avoided, no cgi, no 3d render, authentic camera noise."
    },
    "jewelry_macro_photography": {
        id: "jewelry_macro_photography",
        desc: { en: "Jewelry Macro Photography", zh: "珠宝微距摄影" },
        template: "Jewelry macro photography, extreme close-up, sharp details, luxury lighting, caustics, dispersion, 8k, no cgi, highly detailed metal and gems."
    },
    "soft_editorial_portrait": {
        id: "soft_editorial_portrait",
        desc: { en: "Soft Editorial Portrait", zh: "柔和社论人像" },
        template: "Soft editorial portrait photography, natural skin texture, soft diffused lighting, fashion magazine style, 85mm lens, 8k, photorealistic."
    },
    "documentary_available_light": {
        id: "documentary_available_light",
        desc: { en: "Documentary Available Light", zh: "纪实自然光" },
        template: "Documentary photography, available light, candid moment, leica m style, slight grain, high dynamic range, storytelling, 35mm lens."
    }
};

// -----------------------------
// 2) 变量库 (Legacy Worlds, Retained but Managed)
// -----------------------------

const RULESET_VERSION = 'structured-v1';

const WORLDS = {
    "advertising": {
        "name": { en: "Advertising", zh: "广告" },
        "imaging_profile": "High-end commercial advertising photography, polished, persuasive, 8k, professional color grading",
        "forbidden_visual_terms": ["dirty", "broken", "amateur", "blurry"],
        "deliverable_type": [
            { id: "ad_key_visual", en: "Ad Key Visual", zh: "广告主视觉" },
            { id: "brand_poster", en: "Brand Poster", zh: "品牌海报" },
            { id: "social_ad", en: "Social Ad", zh: "社交媒体广告" },
            { id: "launch_teaser", en: "Launch Teaser", zh: "发布预告" }
        ],
        "entry_point": [
            { id: "object", en: "Object", zh: "物体" },
            { id: "person", en: "Person", zh: "人物" },
            { id: "text", en: "Text", zh: "文字" },
            { id: "system", en: "System", zh: "系统" }
        ],
        "core_tension": [
            { id: "desire_vs_control", en: "Desire vs Control", zh: "欲望 vs 控制" },
            { id: "clean_vs_chaos", en: "Clean vs Chaos", zh: "整洁 vs 混乱" },
            { id: "luxury_vs_absurd", en: "Luxury vs Absurd", zh: "奢华 vs 荒诞" },
            { id: "promise_vs_reality", en: "Promise vs Reality", zh: "承诺 vs 现实" }
        ],
        "twist_mechanisms_pool": [
            { id: "scale_mismatch", en: "Scale Mismatch", zh: "尺度错位" },
            { id: "function_misuse", en: "Function Misuse", zh: "功能错配" },
            { id: "label_lies", en: "Label Lies", zh: "标注反讽" },
            { id: "material_swap", en: "Material Swap", zh: "材质错置" },
            { id: "cutaway_logic", en: "Cutaway Logic", zh: "剖面逻辑" },
            { id: "missing_essential", en: "Missing Essential", zh: "关键缺失" }
        ],
        "stage_context": [
            { en: "clean studio tabletop", zh: "干净的摄影棚桌面" },
            { en: "minimal seamless backdrop", zh: "极简无缝背景" },
            { en: "billboard mockup environment", zh: "广告牌模拟环境" },
            { en: "retail shelf close-up", zh: "零售货架特写" },
            { en: "luxury marble surface", zh: "奢华大理石表面" },
            { en: "white infinity cove", zh: "白色无限背景" },
            { en: "urban rooftop sunset", zh: "城市屋顶日落" },
            { en: "high-end showroom floor", zh: "高端展厅地面" },
            { en: "polished black acrylic", zh: "抛光黑色亚克力" },
            { en: "floating on water surface", zh: "漂浮水面" },
            { en: "suspended in mid-air", zh: "悬浮空中" },
            { en: "neon-lit night scene", zh: "霓虹灯夜景" }
        ],
        "composition_rule": [
            { en: "centered hero object, negative space", zh: "中心主体，留白" },
            { en: "bold asymmetry with clear hierarchy", zh: "大胆不对称，层级分明" },
            { en: "graphic layout, poster-like composition", zh: "平面设计感，海报式构图" },
            { en: "golden ratio placement", zh: "黄金比例布局" },
            { en: "diagonal dynamic composition", zh: "对角线动态构图" },
            { en: "rule of thirds hero shot", zh: "三分法主体构图" },
            { en: "floating elements arrangement", zh: "漂浮元素排列" },
            { en: "tight crop extreme close-up", zh: "紧凑裁切极特写" },
            { en: "layered depth with foreground blur", zh: "多层景深前景虚化" },
            { en: "symmetrical mirror composition", zh: "对称镜像构图" }
        ],
        "lighting_rule": [
            { en: "soft directional studio light", zh: "柔和定向影棚光" },
            { en: "high-contrast rim light", zh: "高反差轮廓光" },
            { en: "even commercial lighting", zh: "均匀商业照明" },
            { en: "dramatic side lighting", zh: "戏剧性侧光" },
            { en: "golden hour warm glow", zh: "黄金时段暖光" },
            { en: "backlit with lens flare", zh: "逆光带镜头光晕" },
            { en: "colored gel accent lights", zh: "彩色滤光片重点光" },
            { en: "soft box overhead beauty light", zh: "柔光箱顶部美妆光" },
            { en: "split lighting dramatic shadows", zh: "分离式打光戏剧阴影" },
            { en: "neon colored accent lighting", zh: "霓虹彩色重点照明" }
        ],
        "subject_kits": [
            {
                primary_subject: { en: "a luxury fragrance bottle", zh: "奢华香水瓶" },
                secondary_elements: [
                    { en: "price tag sticker", zh: "价格标签" },
                    { en: "micro scratch marks", zh: "微小划痕" },
                    { en: "tiny warning label", zh: "微型警告标贴" }
                ]
            },
            {
                primary_subject: { en: "a fast-food burger", zh: "快餐汉堡" },
                secondary_elements: [
                    { en: "measuring tape", zh: "卷尺" },
                    { en: "sterile glove", zh: "无菌手套" },
                    { en: "barcode label", zh: "条形码标签" }
                ]
            },
            {
                primary_subject: { en: "a credit card", zh: "信用卡" },
                secondary_elements: [
                    { en: "receipt fragments", zh: "收据碎片" },
                    { en: "fingerprint dust", zh: "指纹粉末" },
                    { en: "security seal", zh: "安全封条" }
                ]
            },
            {
                primary_subject: { en: "a smartphone", zh: "智能手机" },
                secondary_elements: [
                    { en: "cracked glass shards", zh: "碎玻璃片" },
                    { en: "warranty card", zh: "保修卡" },
                    { en: "tiny screws", zh: "微型螺丝" }
                ]
            },
            {
                primary_subject: { en: "a luxury watch", zh: "奢华手表" },
                secondary_elements: [
                    { en: "authentication certificate", zh: "认证证书" },
                    { en: "jeweler's loupe", zh: "珠宝放大镜" },
                    { en: "velvet cushion", zh: "天鹅绒垫" }
                ]
            },
            {
                primary_subject: { en: "designer sunglasses", zh: "设计师太阳镜" },
                secondary_elements: [
                    { en: "lens cleaning cloth", zh: "镜片清洁布" },
                    { en: "brand embossing", zh: "品牌压印" },
                    { en: "protective case", zh: "保护盒" }
                ]
            },
            {
                primary_subject: { en: "premium headphones", zh: "高端耳机" },
                secondary_elements: [
                    { en: "coiled cable", zh: "盘绕线缆" },
                    { en: "noise cancellation badge", zh: "降噪标识" },
                    { en: "leather ear pads", zh: "皮革耳垫" }
                ]
            },
            {
                primary_subject: { en: "sports car model", zh: "跑车模型" },
                secondary_elements: [
                    { en: "carbon fiber texture", zh: "碳纤维纹理" },
                    { en: "brand emblem", zh: "品牌徽标" },
                    { en: "tire tread detail", zh: "轮胎花纹细节" }
                ]
            },
            {
                primary_subject: { en: "coffee bag packaging", zh: "咖啡袋包装" },
                secondary_elements: [
                    { en: "freshness valve", zh: "新鲜度阀" },
                    { en: "origin label", zh: "产地标签" },
                    { en: "roasting date stamp", zh: "烘焙日期戳" }
                ]
            },
            {
                primary_subject: { en: "athletic sneakers", zh: "运动鞋" },
                secondary_elements: [
                    { en: "reflective strips", zh: "反光条" },
                    { en: "air cushion detail", zh: "气垫细节" },
                    { en: "lacing pattern", zh: "鞋带花纹" }
                ]
            },
            {
                primary_subject: { en: "wine bottle", zh: "葡萄酒瓶" },
                secondary_elements: [
                    { en: "wax seal", zh: "蜡封" },
                    { en: "vintage label", zh: "年份标签" },
                    { en: "cork detail", zh: "软木塞细节" }
                ]
            },
            {
                primary_subject: { en: "lipstick tube", zh: "口红管" },
                secondary_elements: [
                    { en: "gold trim", zh: "金色装饰边" },
                    { en: "shade number", zh: "色号标识" },
                    { en: "magnetic cap", zh: "磁吸盖" }
                ]
            }
        ]
    },

    "product_photography": {
        "name": { en: "Product Photography", zh: "产品摄影" },
        "imaging_profile": "Industrial product photography, studio lighting, sharp focus, realistic textures, controlled reflections, authentic camera noise",
        "forbidden_visual_terms": ["illustration", "painting", "drawing", "sketch", "low quality"],
        "deliverable_type": [
            { id: "product_shot", en: "Product Shot", zh: "产品照" },
            { id: "catalog_cover", en: "Catalog Cover", zh: "目录封面" },
            { id: "packshot_with_twist", en: "Packshot with Twist", zh: "带反转的产品包装照" }
        ],
        "entry_point": [
            { id: "object", en: "Object", zh: "物体" }
        ],
        "core_tension": [
            { id: "premium_vs_raw", en: "Premium vs Raw", zh: "高端 vs 粗糙" },
            { id: "precision_vs_decay", en: "Precision vs Decay", zh: "精密 vs 腐朽" },
            { id: "comfort_vs_clinical", en: "Comfort vs Clinical", zh: "舒适 vs 临床感" }
        ],
        "twist_mechanisms_pool": [
            { id: "material_swap", en: "Material Swap", zh: "材质错置" },
            { id: "scale_mismatch", en: "Scale Mismatch", zh: "尺度错位" },
            { id: "function_misuse", en: "Function Misuse", zh: "功能错配" },
            { id: "cutaway_logic", en: "Cutaway Logic", zh: "剖面逻辑" },
            { id: "rule_breaking_packaging", en: "Rule Breaking Packaging", zh: "打破规则的包装" }
        ],
        "stage_context": [
            { en: "clean studio tabletop", zh: "干净的摄影棚桌面" },
            { en: "white cyclorama", zh: "白色无影墙" },
            { en: "matte stone surface", zh: "哑光石材表面" },
            { en: "soft fabric surface", zh: "柔软织物表面" },
            { en: "polished wood platform", zh: "抛光木质平台" },
            { en: "brushed metal sheet", zh: "拉丝金属板" },
            { en: "concrete textured base", zh: "混凝土纹理底座" },
            { en: "frosted glass panel", zh: "磨砂玻璃板" },
            { en: "leather desk mat", zh: "皮革桌垫" },
            { en: "minimalist grid surface", zh: "极简网格表面" }
        ],
        "composition_rule": [
            { en: "centered, calm framing, high detail", zh: "中心平稳构图，高细节" },
            { en: "tight macro crop on materials", zh: "材质微距特写" },
            { en: "two-object comparison layout", zh: "双物体对比布局" },
            { en: "exploded view arrangement", zh: "爆炸图排列" },
            { en: "360-degree rotation sequence", zh: "360度旋转序列" },
            { en: "grid pattern multiple angles", zh: "网格模式多角度" },
            { en: "diagonal perspective showcase", zh: "对角透视展示" },
            { en: "floating overhead flat lay", zh: "悬浮俯拍平铺" },
            { en: "sequential assembly steps", zh: "顺序组装步骤" }
        ],
        "lighting_rule": [
            { en: "soft directional studio light, strong material definition", zh: "柔和定向影棚光，强调材质" },
            { en: "diffused top light, minimal shadows", zh: "漫射顶光，极少阴影" },
            { en: "three-point professional lighting", zh: "三点专业布光" },
            { en: "cross-lighting for texture", zh: "交叉光突出纹理" },
            { en: "tent lighting soft wrap", zh: "灯箱柔和包裹光" },
            { en: "raking light side emphasis", zh: "侧扫光侧面强调" },
            { en: "beauty dish overhead", zh: "美碟顶光" },
            { en: "strip box edge lighting", zh: "条形柔光箱边缘光" }
        ],
        "subject_kits": [
            {
                primary_subject: { en: "a premium supplement bottle", zh: "高端保健品瓶" },
                secondary_elements: [
                    { en: "tamper seal", zh: "防伪封条" },
                    { en: "tiny lounge chair", zh: "微型躺椅" },
                    { en: "warning label sticker", zh: "警告标签贴纸" }
                ]
            },
            {
                primary_subject: { en: "a ceramic coffee mug", zh: "陶瓷咖啡杯" },
                secondary_elements: [
                    { en: "receipt", zh: "收据" },
                    { en: "stirring spoon", zh: "搅拌勺" },
                    { en: "micro cracks", zh: "微裂纹" }
                ]
            },
            {
                primary_subject: { en: "a mechanical keyboard keycap set", zh: "机械键盘键帽" },
                secondary_elements: [
                    { en: "dust", zh: "灰尘" },
                    { en: "tiny gears", zh: "微型齿轮" },
                    { en: "spec label", zh: "规格标签" }
                ]
            },
            {
                primary_subject: { en: "a luxury watch", zh: "奢华手表" },
                secondary_elements: [
                    { en: "micro tools", zh: "微型工具" },
                    { en: "gear fragments", zh: "齿轮碎片" },
                    { en: "calibration card", zh: "校准卡" }
                ]
            },
            {
                primary_subject: { en: "fountain pen", zh: "钢笔" },
                secondary_elements: [
                    { en: "ink cartridge", zh: "墨水芯" },
                    { en: "nib close-up", zh: "笔尖特写" },
                    { en: "engraved details", zh: "雕刻细节" }
                ]
            },
            {
                primary_subject: { en: "leather wallet", zh: "皮革钱包" },
                secondary_elements: [
                    { en: "stitching detail", zh: "缝线细节" },
                    { en: "embossed logo", zh: "压印标志" },
                    { en: "card slots", zh: "卡槽" }
                ]
            },
            {
                primary_subject: { en: "chef's knife", zh: "厨师刀" },
                secondary_elements: [
                    { en: "Damascus pattern", zh: "大马士革纹理" },
                    { en: "handle grain", zh: "手柄纹理" },
                    { en: "blade edge reflection", zh: "刀刃反光" }
                ]
            },
            {
                primary_subject: { en: "camera lens", zh: "相机镜头" },
                secondary_elements: [
                    { en: "lens hood", zh: "遮光罩" },
                    { en: "aperture blades", zh: "光圈叶片" },
                    { en: "lens cap", zh: "镜头盖" }
                ]
            },
            {
                primary_subject: { en: "wireless earbuds case", zh: "无线耳机盒" },
                secondary_elements: [
                    { en: "charging indicator", zh: "充电指示灯" },
                    { en: "hinge mechanism", zh: "铰链机构" },
                    { en: "pairing button", zh: "配对按钮" }
                ]
            },
            {
                primary_subject: { en: "Swiss army knife", zh: "瑞士军刀" },
                secondary_elements: [
                    { en: "tool assortment", zh: "工具组合" },
                    { en: "shield emblem", zh: "盾牌徽章" },
                    { en: "folded configuration", zh: "折叠构造" }
                ]
            }
        ]
    },

    "concept_art": {
        "name": { en: "Concept Art", zh: "概念艺术" },
        "imaging_profile": "Concept artwork, gallery print, mixed-media or staged installation feel, material emphasis over realism, no catalog, no studio product lighting",
        "forbidden_visual_terms": ["commercial product shot", "perfect studio lighting", "stock photo"],
        "deliverable_type": [
            { id: "concept_frame", en: "Concept Frame", zh: "概念帧" },
            { id: "gallery_print", en: "Gallery Print", zh: "画廊版画" },
            { id: "visual_metaphor", en: "Visual Metaphor", zh: "视觉隐喻" }
        ],
        "entry_point": [
            { id: "object", en: "Object", zh: "物体" },
            { id: "person", en: "Person", zh: "人物" },
            { id: "absence", en: "Absence", zh: "缺席" },
            { id: "system", en: "System", zh: "系统" }
        ],
        "core_tension": [
            { id: "identity_slippage", en: "Identity Slippage", zh: "身份滑落" },
            { id: "memory_corruption", en: "Memory Corruption", zh: "记忆腐蚀" },
            { id: "control_breakdown", en: "Control Breakdown", zh: "控制崩溃" },
            { id: "ritual_without_reason", en: "Ritual Without Reason", zh: "无理仪式" }
        ],
        "twist_mechanisms_pool": [
            { id: "scale_mismatch", en: "Scale Mismatch", zh: "尺度错位" },
            { id: "label_lies", en: "Label Lies", zh: "标注反讽" },
            { id: "missing_essential", en: "Missing Essential", zh: "关键缺失" },
            { id: "impossible_but_physical", en: "Impossible but Physical", zh: "不可能但物理真实" },
            { id: "cutaway_logic", en: "Cutaway Logic", zh: "剖面逻辑" },
            { id: "time_discontinuity", en: "Time Discontinuity", zh: "时间断裂" }
        ],
        "stage_context": [
            { en: "empty room with subtle institutional feel", zh: "带有微妙机构感的空房间" },
            { en: "archive storage aisle", zh: "档案存储过道" },
            { en: "silent exhibition space", zh: "寂静的展览空间" },
            { en: "abandoned office corner", zh: "废弃的办公室角落" },
            { en: "sterile laboratory setting", zh: "无菌实验室环境" },
            { en: "waiting room with expired magazines", zh: "放着过期杂志的候诊室" },
            { en: "museum conservation workspace", zh: "博物馆修复工作间" },
            { en: "basement archive", zh: "地下档案室" },
            { en: "minimalist gallery pedestal", zh: "极简画廊展台" },
            { en: "government office hallway", zh: "政府办公室走廊" }
        ],
        "composition_rule": [
            { en: "deadpan centered framing", zh: "呆板中心构图" },
            { en: "wide shot with small subject", zh: "广角小主体" },
            { en: "symmetrical, clinical composition", zh: "对称、临床感构图" },
            { en: "grid-based systematic arrangement", zh: "网格系统排列" },
            { en: "architectural perspective", zh: "建筑透视" },
            { en: "formal frontal documentation", zh: "正式正面记录" },
            { en: "isolated object on neutral", zh: "中性背景隔离物体" },
            { en: "typological series layout", zh: "类型学序列布局" }
        ],
        "lighting_rule": [
            { en: "cool ambient light with a single warm source", zh: "冷环境光配单一暖源" },
            { en: "overcast soft light", zh: "阴天柔光" },
            { en: "institutional fluorescent light", zh: "机构荧光灯" },
            { en: "window light sharp shadow", zh: "窗光锐利阴影" },
            { en: "dim overhead industrial", zh: "暗淡工业顶灯" },
            { en: "cold LED strips", zh: "冷色LED灯带" },
            { en: "single bare bulb", zh: "单个裸灯泡" },
            { en: "filtered daylight gray cast", zh: "过滤日光灰调" }
        ],
        "subject_kits": [
            {
                primary_subject: { en: "a stack of documents", zh: "一叠文件" },
                secondary_elements: [
                    { en: "redacted lines", zh: "涂黑行" },
                    { en: "misaligned stamps", zh: "错位印章" },
                    { en: "binder clip", zh: "长尾夹" }
                ]
            },
            {
                primary_subject: { en: "a chair", zh: "一把椅子" },
                secondary_elements: [
                    { en: "torn fabric", zh: "撕裂的织物" },
                    { en: "number tag", zh: "数字标签" },
                    { en: "dust outline", zh: "灰尘轮廓" }
                ]
            },
            {
                primary_subject: { en: "a mirror", zh: "一面镜子" },
                secondary_elements: [
                    { en: "cracked corner", zh: "碎角" },
                    { en: "inventory label", zh: "库存标签" },
                    { en: "fingerprint smears", zh: "指纹污渍" }
                ]
            },
            {
                primary_subject: { en: "a human portrait photo", zh: "人像照片" },
                secondary_elements: [
                    { en: "missing face area", zh: "面部缺失" },
                    { en: "annotation marks", zh: "批注标记" },
                    { en: "archival sleeve", zh: "档案袋" }
                ]
            },
            {
                primary_subject: { en: "filing cabinet", zh: "文件柜" },
                secondary_elements: [
                    { en: "peeling label", zh: "剥落标签" },
                    { en: "stuck drawer", zh: "卡住的抽屉" },
                    { en: "rust spots", zh: "锈斑" }
                ]
            },
            {
                primary_subject: { en: "clock without hands", zh: "无指针的时钟" },
                secondary_elements: [
                    { en: "disconnected wire", zh: "断开的电线" },
                    { en: "faded numbers", zh: "褪色数字" },
                    { en: "dust ring", zh: "灰尘圈" }
                ]
            },
            {
                primary_subject: { en: "empty picture frame", zh: "空相框" },
                secondary_elements: [
                    { en: "mounting tape residue", zh: "安装胶带残留" },
                    { en: "nail hole", zh: "钉孔" },
                    { en: "faded outline", zh: "褪色轮廓" }
                ]
            },
            {
                primary_subject: { en: "typewriter", zh: "打字机" },
                secondary_elements: [
                    { en: "stuck keys", zh: "卡住的按键" },
                    { en: "ribbon spool", zh: "色带卷" },
                    { en: "correction fluid spots", zh: "涂改液斑点" }
                ]
            },
            {
                primary_subject: { en: "specimen jar", zh: "标本罐" },
                secondary_elements: [
                    { en: "handwritten label", zh: "手写标签" },
                    { en: "cloudy liquid", zh: "浑浊液体" },
                    { en: "cork seal", zh: "软木塞封" }
                ]
            }
        ]
    },

    "documentary": {
        "name": { en: "Documentary", zh: "纪实摄影" },
        "imaging_profile": "Candid documentary frame, available light, motion blur allowed, ISO noise allowed, storytelling moment, 35mm lens",
        "forbidden_visual_terms": ["studio lighting", "softbox", "perfectly staged", "3d render", "cgi", "hero product framing"],
        "deliverable_type": [
            { id: "street_photo", en: "Street Photo", zh: "街头摄影" },
            { id: "documentary_frame", en: "Documentary Frame", zh: "纪录片帧" },
            { id: "found_moment", en: "Found Moment", zh: "偶得瞬间" }
        ],
        "entry_point": [
            { id: "person", en: "Person", zh: "人物" },
            { id: "action", en: "Action", zh: "动作" },
            { id: "system", en: "System", zh: "系统" }
        ],
        "core_tension": [
            { id: "ordinary_vs_uncanny", en: "Ordinary vs Uncanny", zh: "平凡 vs 诡异" },
            { id: "routine_vs_glitch", en: "Routine vs Glitch", zh: "日常 vs 故障" },
            { id: "public_vs_private", en: "Public vs Private", zh: "公共 vs 私密" }
        ],
        "twist_mechanisms_pool": [
            { id: "rule_breaking_signage", en: "Rule Breaking Signage", zh: "违规标识" },
            { id: "scale_mismatch", en: "Scale Mismatch", zh: "尺度错位" },
            { id: "missing_essential", en: "Missing Essential", zh: "关键缺失" }
        ],
        "stage_context": [
            { en: "busy street corner", zh: "繁忙街角" },
            { en: "subway platform", zh: "地铁站台" },
            { en: "night market alley", zh: "夜市巷弄" },
            { en: "office lobby", zh: "办公大楼大堂" },
            { en: "laundromat at closing time", zh: "打烊时的自助洗衣店" },
            { en: "convenience store aisle", zh: "便利店货架走道" },
            { en: "bus terminal waiting area", zh: "公交总站候车区" },
            { en: "construction site fence", zh: "施工围栏边" },
            { en: "parking garage level 3", zh: "停车场三层" },
            { en: "hospital corridor", zh: "医院走廊" },
            { en: "shopping mall food court", zh: "商场美食广场" },
            { en: "public park bench area", zh: "公园长椅区" }
        ],
        "composition_rule": [
            { en: "35mm street photography framing", zh: "35mm 街头摄影构图" },
            { en: "candid mid-shot with context", zh: "抓拍中景带环境" },
            { en: "wide environmental portrait", zh: "广角环境人像" },
            { en: "off-center decisive moment", zh: "偏心决定性瞬间" },
            { en: "layered depth street scene", zh: "分层街景景深" },
            { en: "through-the-window framing", zh: "透过窗户取景" },
            { en: "compressed telephoto crowd", zh: "长焦压缩人群" },
            { en: "low angle ground level", zh: "低角度地面视角" },
            { en: "observational bird's eye", zh: "观察式鸟瞰" }
        ],
        "lighting_rule": [
            { en: "natural light, slightly imperfect exposure", zh: "自然光，略微曝光不足" },
            { en: "mixed urban lighting at night", zh: "夜间混合城市光" },
            { en: "harsh midday sun contrast", zh: "正午烈日对比" },
            { en: "overcast soft diffused gray", zh: "阴天柔和漫射灰调" },
            { en: "fluorescent indoor ambient", zh: "室内荧光环境光" },
            { en: "golden hour warm side light", zh: "黄金时段温暖侧光" },
            { en: "silhouette backlit window", zh: "剪影逆光窗户" },
            { en: "street lamp pools at dusk", zh: "黄昏路灯光池" }
        ],
        "subject_kits": [
            {
                primary_subject: { en: "a commuter", zh: "通勤者" },
                secondary_elements: [
                    { en: "misprinted poster", zh: "印刷错误的各种海报" },
                    { en: "odd queue markers", zh: "奇怪的排队标记" },
                    { en: "taped arrows", zh: "胶带贴出的箭头" }
                ]
            },
            {
                primary_subject: { en: "a vendor stall", zh: "小贩摊位" },
                secondary_elements: [
                    { en: "handwritten price tags", zh: "手写价格标签" },
                    { en: "broken neon sign", zh: "坏掉的霓虹灯牌" },
                    { en: "mismatched numbers", zh: "不匹配的数字" }
                ]
            },
            {
                primary_subject: { en: "a security guard", zh: "保安" },
                secondary_elements: [
                    { en: "empty badge holder", zh: "空的工牌套" },
                    { en: "strange floor markings", zh: "奇怪的地板标记" },
                    { en: "warning tape", zh: "警戒胶带" }
                ]
            },
            {
                primary_subject: { en: "street musician", zh: "街头艺人" },
                secondary_elements: [
                    { en: "instrument case with coins", zh: "装硬币的乐器盒" },
                    { en: "faded permit card", zh: "褪色许可证" },
                    { en: "handwritten setlist", zh: "手写曲目单" }
                ]
            },
            {
                primary_subject: { en: "delivery worker", zh: "送货员" },
                secondary_elements: [
                    { en: "stacked boxes", zh: "堆叠纸箱" },
                    { en: "phone with map", zh: "显示地图的手机" },
                    { en: "reflective vest", zh: "反光背心" }
                ]
            },
            {
                primary_subject: { en: "elderly person waiting", zh: "等候的老人" },
                secondary_elements: [
                    { en: "worn shopping bag", zh: "破旧购物袋" },
                    { en: "bus schedule", zh: "公交时刻表" },
                    { en: "folding chair", zh: "折叠椅" }
                ]
            },
            {
                primary_subject: { en: "construction worker on break", zh: "休息的工人" },
                secondary_elements: [
                    { en: "hard hat", zh: "安全帽" },
                    { en: "thermos", zh: "保温杯" },
                    { en: "safety notice board", zh: "安全告示牌" }
                ]
            },
            {
                primary_subject: { en: "kids playing", zh: "玩耍的孩子" },
                secondary_elements: [
                    { en: "chalk drawings", zh: "粉笔画" },
                    { en: "discarded toy", zh: "丢弃的玩具" },
                    { en: "bicycle wheel", zh: "自行车轮" }
                ]
            },
            {
                primary_subject: { en: "shop owner closing", zh: "关店的店主" },
                secondary_elements: [
                    { en: "metal shutter half-down", zh: "半拉的金属卷帘" },
                    { en: "today's sales note", zh: "今日营业额笔记" },
                    { en: "keys in hand", zh: "手中钥匙" }
                ]
            }
        ]
    },

    "meme_logic": {
        "name": { en: "Meme Logic", zh: "迷因逻辑" },
        "imaging_profile": "Realistic UI screenshot OR screen capture, flat lighting, system fonts, vector edges, compression artifacts",
        "forbidden_visual_terms": ["cinematic lighting", "depth of field", "bokeh", "studio photography", "8k", "high resolution"],
        "deliverable_type": [
            { id: "screenshot_meme", en: "Screenshot Meme", zh: "截图迷因" },
            { id: "fake_ui_post", en: "Fake UI Post", zh: "伪 UI 帖子" },
            { id: "internet_poster", en: "Internet Poster", zh: "网络海报" }
        ],
        "entry_point": [
            { id: "text", en: "Text", zh: "文字" },
            { id: "system", en: "System", zh: "系统" },
            { id: "object", en: "Object", zh: "物体" }
        ],
        "core_tension": [
            { id: "deadpan_absurd", en: "Deadpan Absurd", zh: "一本正经的荒谬" },
            { id: "overexplained_simple", en: "Overexplained Simple", zh: "过度解释简单事物" },
            { id: "corporate_voice_glitch", en: "Corporate Voice Glitch", zh: "企业腔调故障" }
        ],
        "twist_mechanisms_pool": [
            { id: "label_lies", en: "Label Lies", zh: "标注反讽" },
            { id: "rule_breaking_ui", en: "Rule Breaking UI", zh: "打破规则的 UI" },
            { id: "function_misuse", en: "Function Misuse", zh: "功能错配" },
            { id: "missing_essential", en: "Missing Essential", zh: "关键缺失" }
        ],
        "stage_context": [
            { en: "mobile app screenshot", zh: "手机 App 截图" },
            { en: "fake system dialog overlay", zh: "伪系统对话框弹窗" },
            { en: "social feed card", zh: "社交媒体信息流卡片" },
            { en: "error message screen", zh: "错误信息屏幕" },
            { en: "loading screen stuck", zh: "卡住的加载界面" },
            { en: "settings menu chaos", zh: "混乱的设置菜单" },
            { en: "fake tweet composition", zh: "伪推文编辑界面" },
            { en: "corporate email signature", zh: "企业邮件签名" },
            { en: "search results page", zh: "搜索结果页面" },
            { en: "captcha challenge absurd", zh: "荒谬的验证码挑战" }
        ],
        "composition_rule": [
            { en: "screenshot framing, UI-first", zh: "截图构图，UI 优先" },
            { en: "poster with bold text blocks", zh: "带有粗体文本块的海报" },
            { en: "phone screen centered vertical", zh: "居中垂直手机屏幕" },
            { en: "browser window with tabs", zh: "带标签页的浏览器窗口" },
            { en: "modal popup overlay", zh: "弹出模态框覆盖层" },
            { en: "notification stack cascade", zh: "通知堆叠级联" },
            { en: "split screen comparison", zh: "分屏对比" },
            { en: "meme template grid", zh: "表情包模板网格" }
        ],
        "lighting_rule": [
            { en: "flat UI lighting (no cinematic)", zh: "扁平 UI 光照 (无电影感)" },
            { en: "screen glow in dark room", zh: "暗室屏幕发光" },
            { en: "high contrast UI elements", zh: "高对比度 UI 元素" },
            { en: "dark mode inverted", zh: "深色模式反转" },
            { en: "compression artifacts visible", zh: "可见压缩伪影" }
        ],
        "subject_kits": [
            {
                primary_subject: { en: "a system notification", zh: "系统通知" },
                secondary_elements: [
                    { en: "oddly specific timestamp", zh: "奇怪的具体时间戳" },
                    { en: "contradictory buttons", zh: "自相矛盾的按钮" },
                    { en: "tiny watermark", zh: "微小水印" }
                ]
            },
            {
                primary_subject: { en: "a product listing", zh: "产品列表" },
                secondary_elements: [
                    { en: "absurd feature bullets", zh: "荒谬的功能要点" },
                    { en: "wrong category tags", zh: "错误的分类标签" },
                    { en: "broken rating stars", zh: "破碎的评分星级" }
                ]
            },
            {
                primary_subject: { en: "a chat screenshot", zh: "聊天截图" },
                secondary_elements: [
                    { en: "overly formal apology", zh: "过度正式的道歉" },
                    { en: "glitched emoji", zh: "故障的表情符号" },
                    { en: "misaligned bubbles", zh: "错位的气泡" }
                ]
            },
            {
                primary_subject: { en: "terms and conditions popup", zh: "服务条款弹窗" },
                secondary_elements: [
                    { en: "unchecked mandatory checkbox", zh: "未勾选的必选框" },
                    { en: "scroll bar at 0.01%", zh: "滚动条在 0.01%" },
                    { en: "legal text in Comic Sans", zh: "Comic Sans 字体法律文本" }
                ]
            },
            {
                primary_subject: { en: "app update prompt", zh: "应用更新提示" },
                secondary_elements: [
                    { en: "later button missing", zh: "没有稍后按钮" },
                    { en: "update size: 99.9GB", zh: "更新大小: 99.9GB" },
                    { en: "mandatory restart", zh: "强制重启" }
                ]
            },
            {
                primary_subject: { en: "email unsubscribe page", zh: "退订邮件页面" },
                secondary_elements: [
                    { en: "200 checkboxes", zh: "200 个复选框" },
                    { en: "captcha after captcha", zh: "验证码后还有验证码" },
                    { en: "unsubscribe from unsubscribe", zh: "退订退订功能" }
                ]
            },
            {
                primary_subject: { en: "loading spinner", zh: "加载转圈" },
                secondary_elements: [
                    { en: "progress bar going backwards", zh: "倒退的进度条" },
                    { en: "time remaining: calculating", zh: "剩余时间: 计算中" },
                    { en: "cancel button grayed out", zh: "灰色的取消按钮" }
                ]
            },
            {
                primary_subject: { en: "cookie consent banner", zh: "Cookie 同意横幅" },
                secondary_elements: [
                    { en: "reject requires 47 clicks", zh: "拒绝需要点击 47 次" },
                    { en: "legitimate interest toggle", zh: "合法利益切换" },
                    { en: "privacy partners: 742", zh: "隐私合作伙伴: 742" }
                ]
            },
            {
                primary_subject: { en: "password requirements", zh: "密码要求" },
                secondary_elements: [
                    { en: "contradictory rules", zh: "自相矛盾的规则" },
                    { en: "special characters forbidden", zh: "禁止特殊字符" },
                    { en: "must contain emoji", zh: "必须包含表情符号" }
                ]
            }
        ]
    },

    "miniature_fantasy": {
        "name": { en: "Miniature Fantasy", zh: "微缩奇幻" },
        "imaging_profile": "Macro photography, tilt-shift effect, shallow depth of field, miniature world, vibrant colors",
        "forbidden_visual_terms": ["wide angle", "telephoto", "realistic human scale"],
        "deliverable_type": [
            { id: "miniature_scene", en: "Miniature Scene", zh: "微缩场景" },
            { id: "diorama_shot", en: "Diorama Shot", zh: "透视画摄影" },
            { id: "toy_world_frame", en: "Toy World Frame", zh: "玩具世界定格" }
        ],
        "entry_point": [
            { id: "object", en: "Object", zh: "物体" },
            { id: "action", en: "Action", zh: "动作" }
        ],
        "core_tension": [
            { id: "tiny_labor_vs_giant_object", en: "Tiny Labor vs Giant Object", zh: "微小劳作 vs 巨大物体" },
            { id: "whimsical_vs_real_materials", en: "Whimsical vs Real Materials", zh: "异想天开 vs 真实材质" }
        ],
        "twist_mechanisms_pool": [
            { id: "scale_mismatch", en: "Scale Mismatch", zh: "尺度错位" },
            { id: "cutaway_logic", en: "Cutaway Logic", zh: "剖面逻辑" },
            { id: "function_misuse", en: "Function Misuse", zh: "功能错配" },
            { id: "material_swap", en: "Material Swap", zh: "材质错置" }
        ],
        "stage_context": [
            { en: "tabletop diorama", zh: "桌面透视画" },
            { en: "kitchen counter macro scene", zh: "厨房台面微距场景" },
            { en: "workbench miniature set", zh: "工作台微缩布景" },
            { en: "garden soil miniature landscape", zh: "花园泥土微缩景观" },
            { en: "office desk corner world", zh: "办公桌角落世界" },
            { en: "bookshelf level mini city", zh: "书架层级迷你城市" },
            { en: "bathroom sink port scene", zh: "浴室水槽港口场景" },
            { en: "wooden cutting board terrain", zh: "木质砧板地形" },
            { en: "window sill miniature farm", zh: "窗台微缩农场" },
            { en: "coffee table tilt-shift", zh: "咖啡桌移轴效果" }
        ],
        "composition_rule": [
            { en: "macro lens, shallow depth of field", zh: "微距镜头，浅景深" },
            { en: "hero object with tiny workers", zh: "主体物体配微小工人" },
            { en: "tilt-shift perspective", zh: "移轴透视" },
            { en: "extreme close-up scale play", zh: "极特写尺度游戏" },
            { en: "diorama box framing", zh: "透视箱取景" },
            { en: "forced perspective layers", zh: "强制透视分层" },
            { en: "miniature world aerial view", zh: "微缩世界俯瞰" },
            { en: "bokeh background isolation", zh: "焦外虚化隔离背景" }
        ],
        "lighting_rule": [
            { en: "warm practical light with soft shadows", zh: "温暖实用光配柔和阴影" },
            { en: "studio macro light, controlled highlights", zh: "影棚微距光，控制高光" },
            { en: "natural window light diffused", zh: "自然窗光漫射" },
            { en: "LED ring light macro", zh: "LED 环形微距光" },
            { en: "fairy lights miniature ambiance", zh: "灯串微缩氛围" },
            { en: "golden hour warm glow tiny world", zh: "黄金时段温暖微型世界" },
            { en: "spotlight dramatic mini scene", zh: "聚光灯戏剧性迷你场景" }
        ],
        "subject_kits": [
            {
                primary_subject: { en: "a macaron", zh: "马卡龙" },
                secondary_elements: [
                    { en: "tiny ladders", zh: "微型梯子" },
                    { en: "mini workers", zh: "迷你工人" },
                    { en: "sugar dust", zh: "糖粉" }
                ]
            },
            {
                primary_subject: { en: "a pocket watch", zh: "怀表" },
                secondary_elements: [
                    { en: "tiny ropes", zh: "微型绳索" },
                    { en: "mini repair tools", zh: "迷你维修工具" },
                    { en: "gears", zh: "齿轮" }
                ]
            },
            {
                primary_subject: { en: "a lipstick", zh: "口红" },
                secondary_elements: [
                    { en: "mini scaffolding", zh: "迷你脚手架" },
                    { en: "tiny paint rollers", zh: "微型油漆滚筒" },
                    { en: "gloss reflections", zh: "光泽反射" }
                ]
            },
            {
                primary_subject: { en: "a tea cup", zh: "茶杯" },
                secondary_elements: [
                    { en: "mini boats", zh: "迷你船" },
                    { en: "steam as fog", zh: "蒸汽如雾" },
                    { en: "spoons as bridges", zh: "勺子桥" }
                ]
            },
            {
                primary_subject: { en: "a sneaker", zh: "运动鞋" },
                secondary_elements: [
                    { en: "tiny mountain climbers", zh: "微型登山者" },
                    { en: "shoelace ropes", zh: "鞋带绳索" },
                    { en: "sole texture terrain", zh: "鞋底纹理地形" }
                ]
            },
            {
                primary_subject: { en: "a vinyl record", zh: "黑胶唱片" },
                secondary_elements: [
                    { en: "mini racing cars on grooves", zh: "沟槽上的迷你赛车" },
                    { en: "tiny pit crew", zh: "微型维修团队" },
                    { en: "circular track", zh: "环形赛道" }
                ]
            },
            {
                primary_subject: { en: "a hamburger", zh: "汉堡" },
                secondary_elements: [
                    { en: "tiny construction workers", zh: "微型建筑工人" },
                    { en: "sesame seed boulders", zh: "芝麻巨石" },
                    { en: "lettuce as forest", zh: "生菜森林" }
                ]
            },
            {
                primary_subject: { en: "a cactus plant", zh: "仙人掌" },
                secondary_elements: [
                    { en: "mini rock climbers", zh: "迷你攀岩者" },
                    { en: "safety ropes on spines", zh: "刺上的安全绳" },
                    { en: "tiny camping tents", zh: "微型帐篷" }
                ]
            },
            {
                primary_subject: { en: "a computer keyboard", zh: "电脑键盘" },
                secondary_elements: [
                    { en: "mini office workers", zh: "迷你办公人员" },
                    { en: "keys as buildings", zh: "按键作为建筑" },
                    { en: "cable highways", zh: "线缆高速路" }
                ]
            },
            {
                primary_subject: { en: "an ice cream cone", zh: "冰淇淋甜筒" },
                secondary_elements: [
                    { en: "tiny skiers", zh: "微型滑雪者" },
                    { en: "sprinkles as obstacles", zh: "糖粒作为障碍" },
                    { en: "melting as avalanche", zh: "融化如雪崩" }
                ]
            }
        ]
    },
};

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
        `featuring ${subjects}`,
        `inspired by ${core_tension}`,
        twists ? `with ${twists}` : '',
        `set in ${stage_context}`,
        `following ${composition_rule}`,
        `lit by ${lighting_rule}`
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

// Module 3: Apply Logic Constraints
function apply_logic_constraints({ validated, logicObj, inspirationWeights }) {
    const fixed = { ...validated };
    const warnings = [];

    return {
        fixed,
        required_twist_append: logicObj && logicObj.required_twist_category ? logicObj.required_twist_category : null,
        warnings
    };
}

// Module 4: Sample Candidates
function sample_candidates({ constraints, pools, rng, worldId, lang, highLevel, inspirationWeights, debugStore, strategy }) {
    const selection = {};
    const governanceUpdates = { rule_hits: [], warnings: [] };
    const { intent, logic, imaging } = highLevel;
    selection.creation_intent = intent;
    selection.generation_logic = logic;
    selection.imaging_assumption = imaging;

    function resolve(dim, pool, matchValue, isMulti = false, kRange = null) {
        const tempGov = { selected_fields: {}, source_refs: {}, rule_hits: [], warnings: [] };
        let override = matchValue;

        // Apply Candidate Filtering Strategy hook
        let activePool = pool;
        if (strategy && strategy.filter) {
            activePool = strategy.filter(pool, dim);
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

            const minK = kRange[0], maxK = kRange[1];
            const k = Math.max(minK, Math.min(maxK, getRandomInt(minK, maxK, rng)));
            const forbiddenTerms = pools.forbidden_visual_terms || [];
            let available = activePool.filter(t => !containsForbiddenTerm(t.en, forbiddenTerms));
            let twistSelection = pickKUnique(available, k, rng);

            if (inspirationWeights && inspirationWeights.mechanisms.length > 0) {
                const preferred = inspirationWeights.mechanisms.map(id => activePool.find(m => m.id === id)).filter(Boolean);
                for (let i = 0; i < Math.min(preferred.length, twistSelection.length); i++) twistSelection[i] = preferred[i];
            }

            if (constraints.required_twist_append) {
                const reqTwist = activePool.find(t => t.id === constraints.required_twist_append);
                if (reqTwist && !twistSelection.includes(reqTwist)) {
                    if (twistSelection.length > 0) twistSelection[0] = reqTwist;
                    else twistSelection.push(reqTwist);
                }
            }
            return twistSelection;
        }

        if (dim !== 'twist_mechanisms') {
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
        provocative_directive_enabled = false
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

    const { fixed, required_twist_append, warnings: logicWarnings } = apply_logic_constraints({ validated, logicObj: selectedLogic, inspirationWeights });

    const { selection, governanceUpdates } = sample_candidates({
        constraints: { fixed, required_twist_append },
        pools,
        rng,
        worldId: world,
        lang,
        highLevel: { intent: selectedIntent, logic: selectedLogic, imaging: hlImaging },
        inspirationWeights,
        debugStore,
        strategy
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

    return {
        public_skeleton: {
            schema_version: 'v1',
            creative_id: `${generateId()}`,
            creative_world: `world:${world}`,
            creation_intent: safeT(selection.creation_intent.desc),
            creation_intent_id: selection.creation_intent.id,
            generation_logic: safeT(selection.generation_logic.desc),
            generation_logic_id: selection.generation_logic.id,
            twist_mechanisms: selection.twist_mechanisms.map(t => safeT(t)),
            twist_ids: selection.twist_mechanisms.map(t => t.id || safeSlug(getVal(t))),
            subject_kit: {
                primary_subject: safeT(selection.subject_kit.primary_subject),
                primary_id: selection.subject_kit.primary_subject.id || safeSlug(getVal(selection.subject_kit.primary_subject)),
                secondary_elements: (selection.subject_kit.secondary_elements || []).map(e => safeT(e)),
                secondary_ids: (selection.subject_kit.secondary_elements || []).map(e => factId('element', e))
            },
            core_tension: safeT(selection.core_tension),
            core_tension_id: selection.core_tension.id || safeSlug(getVal(selection.core_tension)),
            stage_context: safeT(selection.stage_context),
            stage_context_id: selection.stage_context.id || safeSlug(getVal(selection.stage_context)),
            composition_rule: safeT(selection.composition_rule),
            composition_rule_id: selection.composition_rule.id || safeSlug(getVal(selection.composition_rule)),
            lighting_rule: safeT(selection.lighting_rule),
            lighting_rule_id: selection.lighting_rule.id || safeSlug(getVal(selection.lighting_rule)),
            imaging_assumption: safeT(selection.imaging_assumption.desc),
            imaging_assumption_id: selection.imaging_assumption.id,
            deliverable_type: safeT(worldConfig.deliverable_type[0]),
            emergence: evaluateEmergence({
                creative_world: `world:${world}`,
                core_tension: selection.core_tension.id || selection.core_tension,
                twist_mechanisms: selection.twist_mechanisms.map(t => t.id || t),
                imaging_assumption: selection.imaging_assumption.id,
                creation_intent: selectedIntent.id
            }),
            final_prompt: finalPrompt,
            creative_directive: directive ? safeT(directive) : null,
            oblique_strategy: strategy ? { id: strategy.id, desc: safeT(strategy.desc) } : null,
            validation: {
                errors: errors,
                warnings: allWarnings,
                dropped_overrides: dropped
            }
        },
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
    assemble_prompt
};
