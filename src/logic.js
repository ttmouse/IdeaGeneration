
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
// 1.5) 成像主控层 (Imaging Assumptions)
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

// Main logic

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
        overrides = {}
    } = options;

    const normalizedOverrides = overrides || {};
    const rng = createRNG(seed);
    const debugStore = { selected_fields_verbose: {}, seed: rng.seed };
    const governance = {
        creative_id: `${generateId()}`,
        seed: rng.seed,
        ruleset_version: RULESET_VERSION,
        source_refs: {},
        selected_fields: {},
        rule_hits: [],
        rule_blocks: [],
        warnings: [],
        reject_reason: null
    };

    // 解析灵感种子
    const inspirationWeights = parseInspirationSeed(inspirationSeed);
    if (inspirationWeights) {
        governance.inspiration_seed = inspirationSeed;
        governance.rule_hits.push({ id: 'inspiration_seed:applied', detail: inspirationSeed });
    }

    // Creation Intent (应用灵感种子权重)
    const intentPool = Object.values(CREATION_INTENTS);
    let forcedIntentByInspiration = forcedIntent;
    if (!forcedIntentByInspiration && inspirationWeights && Object.keys(inspirationWeights.intents).length > 0) {
        // 选择权重最高的intent
        const highestIntent = Object.entries(inspirationWeights.intents).reduce((a, b) => a[1] > b[1] ? a : b);
        if (highestIntent[1] >= 3) { // 权重足够高才强制使用
            forcedIntentByInspiration = highestIntent[0];
            governance.rule_hits.push({ id: 'inspiration_seed:intent', detail: highestIntent[0] });
        }
    }
    const intentSelection = selectWithRecording({
        dimension: 'creation_intent',
        pool: intentPool,
        rng,
        lang,
        governance,
        debugStore,
        matchValue: forcedIntentByInspiration && forcedIntentByInspiration !== 'any' && CREATION_INTENTS[forcedIntentByInspiration] ? forcedIntentByInspiration : null
    });
    const intentKey = intentSelection.raw.id;
    const intentObj = intentSelection.raw;
    governance.creation_intent = intentKey;
    governance.creation_intent_desc = getVal(intentObj.desc, lang);

    // Generation Logic (应用灵感种子权重)
    const logicPool = Object.values(GENERATION_LOGICS);
    let forcedLogicByInspiration = forcedLogic;
    if (!forcedLogicByInspiration && inspirationWeights && Object.keys(inspirationWeights.logics).length > 0) {
        const highestLogic = Object.entries(inspirationWeights.logics).reduce((a, b) => a[1] > b[1] ? a : b);
        if (highestLogic[1] >= 2) {
            forcedLogicByInspiration = highestLogic[0];
            governance.rule_hits.push({ id: 'inspiration_seed:logic', detail: highestLogic[0] });
        }
    }
    const logicSelection = selectWithRecording({
        dimension: 'generation_logic',
        pool: logicPool,
        rng,
        lang,
        governance,
        debugStore,
        matchValue: forcedLogicByInspiration && forcedLogicByInspiration !== 'any' && GENERATION_LOGICS[forcedLogicByInspiration] ? forcedLogicByInspiration : null
    });
    const logicKey = logicSelection.raw.id;
    const logicObj = logicSelection.raw;
    governance.generation_logic = logicKey;
    governance.generation_logic_desc = getVal(logicObj.desc, lang);

    // Creative World (应用灵感种子权重)
    const allWorlds = Object.keys(WORLDS);
    const worldCandidates = buildCandidates(allWorlds, 'creative_world', 'global', lang);
    let world = forcedWorld && forcedWorld !== 'any' && WORLDS[forcedWorld] ? forcedWorld : null;
    if (!world) {
        // 合并intent的weight_bias和灵感种子的weights
        const weights = { ...(intentObj.weight_bias || {}) };

        // 应用灵感种子权重（优先级更高）
        if (inspirationWeights && Object.keys(inspirationWeights.worlds).length > 0) {
            Object.entries(inspirationWeights.worlds).forEach(([w, weight]) => {
                weights[w] = (weights[w] || 0) + weight * 2; // 灵感种子权重翻倍
            });
            governance.rule_hits.push({ id: 'inspiration_seed:world_weights', detail: Object.keys(inspirationWeights.worlds).join(',') });
        }

        const weightedPool = [];
        for (const w of allWorlds) {
            const weight = weights[w] || 1;
            for (let i = 0; i < weight; i++) {
                weightedPool.push(w);
            }
        }
        const idx = Math.floor(rng() * weightedPool.length);
        world = weightedPool[idx];
        governance.rule_hits.push({ id: `intent:${intentKey}:world_bias`, detail: `Weighted world selection` });
    }
    if (!WORLDS[world]) {
        throw new PromptAssemblyError('UNKNOWN_WORLD', `Unknown creative world: ${world}`);
    }
    const worldIdx = worldCandidates.findIndex(c => c.raw === world);
    recordSelection(governance, 'creative_world', worldCandidates, worldIdx >= 0 ? worldIdx : 0, debugStore);

    const cfg = WORLDS[world];
    const forbiddenTerms = cfg.forbidden_visual_terms || [];
    governance.imaging_profile = cfg.imaging_profile || null;

    // Imaging assumption metadata (应用灵感种子)
    let imagingAssumptionDesc = 'World Adaptive';
    let finalImagingAssumption = forcedImagingAssumption;
    if (!finalImagingAssumption && inspirationWeights && inspirationWeights.imaging) {
        finalImagingAssumption = inspirationWeights.imaging;
        governance.rule_hits.push({ id: 'inspiration_seed:imaging', detail: inspirationWeights.imaging });
    }
    if (finalImagingAssumption && IMAGING_ASSUMPTIONS[finalImagingAssumption]) {
        imagingAssumptionDesc = getVal(IMAGING_ASSUMPTIONS[finalImagingAssumption].desc, lang);
    }
    governance.imaging_assumption = finalImagingAssumption || 'auto_world_mapped';
    governance.imaging_assumption_desc = imagingAssumptionDesc;

    // Deliverable type (governance)
    const deliverableSelection = selectWithRecording({
        dimension: 'deliverable_type',
        pool: cfg.deliverable_type,
        rng,
        lang,
        worldId: world,
        governance,
        debugStore
    });
    governance.deliverable_type = getVal(deliverableSelection.raw, lang);

    // Entry point with logic preference
    let entryPool = [...cfg.entry_point];
    if (logicObj.preferred_entry) {
        const preferred = entryPool.filter(e => e.id === logicObj.preferred_entry);
        if (preferred.length && rng() < 0.8) {
            entryPool = preferred;
            governance.rule_hits.push({ id: `logic:${logicKey}:preferred_entry`, detail: logicObj.preferred_entry });
        }
    }
    const entrySelection = selectWithRecording({
        dimension: 'entry_point',
        pool: entryPool,
        rng,
        lang,
        worldId: world,
        governance,
        debugStore
    });
    governance.entry_point = getVal(entrySelection.raw, lang);

    // Core tension filtering (应用灵感种子偏好)
    let tensionPool = [...cfg.core_tension];
    if (intentObj.forbidden_tensions && intentObj.forbidden_tensions.length) {
        const blocked = tensionPool.filter(t => intentObj.forbidden_tensions.includes(t.id));
        if (blocked.length) {
            governance.rule_blocks.push({ id: `intent:${intentKey}:forbid_tension`, detail: blocked.map(b => b.id) });
        }
        tensionPool = tensionPool.filter(t => !intentObj.forbidden_tensions.includes(t.id));
        if (!tensionPool.length) tensionPool = [...cfg.core_tension];
    }

    // 优先选择灵感种子中的tensions
    if (inspirationWeights && inspirationWeights.tensions.length > 0) {
        const preferredTensions = tensionPool.filter(t => inspirationWeights.tensions.includes(t.id));
        if (preferredTensions.length > 0) {
            tensionPool = preferredTensions;
            governance.rule_hits.push({ id: 'inspiration_seed:preferred_tensions', detail: preferredTensions.map(t => t.id).join(',') });
        }
    }

    // Debug: log override value
    if (normalizedOverrides.core_tension) {
        console.log(`=== DEBUG: Core tension override = ${normalizedOverrides.core_tension} ===`);
    }
    const tensionSelection = selectWithRecording({
        dimension: 'core_tension',
        pool: tensionPool,
        rng,
        lang,
        worldId: world,
        governance,
        debugStore,
        matchValue: normalizedOverrides.core_tension
    });
    const coreTensionValue = sanitizeValue(getVal(tensionSelection.raw, lang), forbiddenTerms, governance, 'core_tension');

    // Twist mechanisms (应用灵感种子偏好)
    let twistPool = [...cfg.twist_mechanisms_pool];
    const forbiddenByWorld = FORBIDDEN_MECHANISMS_BY_WORLD[world] || [];
    if (forbiddenByWorld.length) {
        const blocked = twistPool.filter(m => forbiddenByWorld.includes(m.id));
        if (blocked.length) {
            governance.rule_blocks.push({ id: `world:${world}:forbid_twist`, detail: blocked.map(b => b.id) });
        }
        twistPool = twistPool.filter(m => !forbiddenByWorld.includes(m.id));
    }
    if (intentObj.forbidden_twists && intentObj.forbidden_twists.length) {
        const blocked = twistPool.filter(m => intentObj.forbidden_twists.includes(m.id));
        if (blocked.length) {
            governance.rule_blocks.push({ id: `intent:${intentKey}:forbid_twist`, detail: blocked.map(b => b.id) });
        }
        twistPool = twistPool.filter(m => !intentObj.forbidden_twists.includes(m.id));
    }
    if (!twistPool.length) {
        throw new PromptAssemblyError('NO_TWIST_OPTIONS', `World ${world} has no twist mechanisms after filtering.`);
    }
    const twistCandidates = buildCandidates(twistPool, 'twist_mechanisms', world, lang);
    const overrideTwists = Array.isArray(normalizedOverrides.twist_mechanisms)
        ? normalizedOverrides.twist_mechanisms.map(val => typeof val === 'string' ? val.trim() : val).filter(Boolean)
        : [];
    let twistMechanismsObjs = [];

    if (overrideTwists.length) {
        twistMechanismsObjs = overrideTwists.map(value => {
            const match = twistCandidates.find(c => c.value === value || c.id === value);
            return match ? match.raw : null;
        }).filter(Boolean);
        if (twistMechanismsObjs.length) {
            governance.rule_hits.push({ id: 'override:twist_mechanisms', detail: overrideTwists.join(',') });
        }
    }

    if (!twistMechanismsObjs.length) {
        const k = Math.max(twistKRange[0], Math.min(twistKRange[1], getRandomInt(twistKRange[0], twistKRange[1], rng)));
        twistMechanismsObjs = pickKUnique(twistPool, k, rng);

        // 应用灵感种子的mechanisms偏好
        if (inspirationWeights && inspirationWeights.mechanisms.length > 0) {
            const preferredMechanisms = inspirationWeights.mechanisms
                .map(id => twistPool.find(m => m.id === id))
                .filter(Boolean);

            if (preferredMechanisms.length > 0) {
                // 替换部分随机选择的mechanisms为偏好的mechanisms
                const replaceCount = Math.min(preferredMechanisms.length, twistMechanismsObjs.length);
                for (let i = 0; i < replaceCount; i++) {
                    twistMechanismsObjs[i] = preferredMechanisms[i];
                }
                governance.rule_hits.push({ id: 'inspiration_seed:preferred_mechanisms', detail: preferredMechanisms.map(m => m.id).join(',') });
            }
        }

        if (logicObj.required_twist_category && !overrideTwists.length) {
            const hasRequired = twistMechanismsObjs.some(m => m.id === logicObj.required_twist_category);
            if (!hasRequired) {
                const candidate = cfg.twist_mechanisms_pool.find(m => m.id === logicObj.required_twist_category);
                if (candidate && !forbiddenByWorld.includes(candidate.id)) {
                    if (twistMechanismsObjs.length) {
                        twistMechanismsObjs[0] = candidate;
                    } else {
                        twistMechanismsObjs = [candidate];
                    }
                    governance.rule_hits.push({ id: `logic:${logicKey}:required_twist`, detail: candidate.id });
                }
            }
        }
    }
    const twistSelectedEntries = twistMechanismsObjs.map(obj => {
        return twistCandidates.find(c => c.raw === obj) || {
            id: getStableOptionId(world, 'twist_mechanisms', obj, lang),
            value: getDisplayValue(obj, lang)
        };
    });
    governance.selected_fields.twist_mechanisms = {
        selected_ids: twistSelectedEntries.map(e => e.id),
        selected_values: twistSelectedEntries.map(e => e.value),
        candidate_ids: twistCandidates.map(c => c.id)
    };
    governance.source_refs.twist_mechanisms = governance.selected_fields.twist_mechanisms.selected_ids;
    debugStore.selected_fields_verbose.twist_mechanisms = twistCandidates.map(c => ({ id: c.id, value: c.value }));
    const twistMechanisms = twistMechanismsObjs
        .map(m => sanitizeValue(getVal(m, lang), forbiddenTerms, governance, 'twist_mechanisms'))
        .filter(Boolean);

    // Subject kit (应用灵感种子的subjects偏好)
    let subjectPool = cfg.subject_kits;
    const subjectOverride = normalizedOverrides.subject_kit || null;
    if (inspirationWeights && inspirationWeights.subjects.length > 0) {
        const matchedSubjects = cfg.subject_kits.filter(kit => {
            const primaryEn = getVal(kit.primary_subject, 'en').toLowerCase();
            return inspirationWeights.subjects.some(keyword =>
                primaryEn.includes(keyword.toLowerCase())
            );
        });
        if (!subjectOverride && matchedSubjects.length > 0) {
            subjectPool = matchedSubjects;
            governance.rule_hits.push({
                id: 'inspiration_seed:subject',
                detail: `matched ${matchedSubjects.length} subjects`
            });
        }
    }
    const subjectSelection = selectWithRecording({
        dimension: 'subject_kit',
        pool: subjectPool,
        rng,
        lang,
        worldId: world,
        governance,
        debugStore,
        matchValue: subjectOverride
    });
    const subjectKitObj = subjectSelection.raw;
    const subjectKit = {
        primary_subject: sanitizeValue(getVal(subjectKitObj.primary_subject, lang), forbiddenTerms, governance, 'subject_primary'),
        secondary_elements: subjectKitObj.secondary_elements
            .map(e => sanitizeValue(getVal(e, lang), forbiddenTerms, governance, 'subject_secondary'))
            .filter(Boolean)
    };

    // Stage / Composition / Lighting (应用灵感种子的stages偏好)
    let stagePool = cfg.stage_context;
    const stageOverride = normalizedOverrides.stage_context || null;
    if (inspirationWeights && inspirationWeights.stages.length > 0) {
        const matchedStages = cfg.stage_context.filter(stage => {
            const stageEn = getVal(stage, 'en').toLowerCase();
            return inspirationWeights.stages.some(keyword =>
                stageEn.includes(keyword.toLowerCase())
            );
        });
        if (!stageOverride && matchedStages.length > 0) {
            stagePool = matchedStages;
            governance.rule_hits.push({
                id: 'inspiration_seed:stage',
                detail: `matched ${matchedStages.length} stages`
            });
        }
    }
    const stageSelection = selectWithRecording({
        dimension: 'stage_context',
        pool: stagePool,
        rng,
        lang,
        worldId: world,
        governance,
        debugStore,
        matchValue: stageOverride
    });
    const compositionSelection = selectWithRecording({
        dimension: 'composition_rule',
        pool: cfg.composition_rule,
        rng,
        lang,
        worldId: world,
        governance,
        debugStore,
        matchValue: normalizedOverrides.composition_rule
    });
    const lightingSelection = selectWithRecording({
        dimension: 'lighting_rule',
        pool: cfg.lighting_rule,
        rng,
        lang,
        worldId: world,
        governance,
        debugStore,
        matchValue: normalizedOverrides.lighting_rule
    });

    const stageContext = sanitizeValue(getVal(stageSelection.raw, lang), forbiddenTerms, governance, 'stage_context');
    const compositionRule = sanitizeValue(getVal(compositionSelection.raw, lang), forbiddenTerms, governance, 'composition_rule');
    const lightingRule = sanitizeValue(getVal(lightingSelection.raw, lang), forbiddenTerms, governance, 'lighting_rule');

    // Build model input (only minimal fields)
    const modelInput = {
        creative_world: world,
        core_tension: coreTensionValue,
        twist_mechanisms: twistMechanisms,
        subject_kit: subjectKit,
        stage_context: stageContext,
        composition_rule: compositionRule,
        lighting_rule: lightingRule
    };

    governance.world_id = world;
    governance.core_tension = coreTensionValue;
    governance.twist_mechanisms = twistMechanisms;
    governance.subject_kit = subjectKit;
    governance.stage_context = stageContext;
    governance.composition_rule = compositionRule;
    governance.lighting_rule = lightingRule;

    // Assemble final prompt
    governance.final_prompt = assemblePrompt(governance);

    // Debug: log final overrides and results
    console.log('=== DEBUG: Final results ===');
    console.log('Normalized overrides:', normalizedOverrides);
    console.log('Core tension:', coreTensionValue);
    console.log('Twist mechanisms:', twistMechanisms);
    console.log('Subject kit:', subjectKit);
    console.log('Stage context:', stageContext);
    console.log('Composition rule:', compositionRule);
    console.log('Lighting rule:', lightingRule);
    console.log('Final Prompt:', governance.final_prompt);

    return {
        model_input: modelInput,
        governance_record: governance,
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

module.exports = {
    generateCreativeSkeleton,
    getAvailableWorlds,
    reverseParseImagingAssumption,
    WORLDS,
    CREATION_INTENTS,
    GENERATION_LOGICS,
    IMAGING_ASSUMPTIONS,
    PromptAssemblyError
};
