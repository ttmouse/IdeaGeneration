
const generateId = () => Math.random().toString(36).substring(2, 10);


// -----------------------------
// 1) 变量库 (支持中英双语)
// -----------------------------

const WORLDS = {
    "advertising": {
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
            { en: "retail shelf close-up", zh: "零售货架特写" }
        ],
        "composition_rule": [
            { en: "centered hero object, negative space", zh: "中心主体，留白" },
            { en: "bold asymmetry with clear hierarchy", zh: "大胆不对称，层级分明" },
            { en: "graphic layout, poster-like composition", zh: "平面设计感，海报式构图" }
        ],
        "lighting_rule": [
            { en: "soft directional studio light", zh: "柔和定向影棚光" },
            { en: "high-contrast rim light", zh: "高反差轮廓光" },
            { en: "even commercial lighting", zh: "均匀商业照明" }
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
            }
        ]
    },

    "product_photography": {
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
            { en: "soft fabric surface", zh: "柔软织物表面" }
        ],
        "composition_rule": [
            { en: "centered, calm framing, high detail", zh: "中心平稳构图，高细节" },
            { en: "tight macro crop on materials", zh: "材质微距特写" },
            { en: "two-object comparison layout", zh: "双物体对比布局" }
        ],
        "lighting_rule": [
            { en: "soft directional studio light, strong material definition", zh: "柔和定向影棚光，强调材质" },
            { en: "diffused top light, minimal shadows", zh: "漫射顶光，极少阴影" }
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
            }
        ]
    },

    "concept_art": {
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
            { en: "abandoned office corner", zh: "废弃的办公室角落" }
        ],
        "composition_rule": [
            { en: "deadpan centered framing", zh: "呆板中心构图" },
            { en: "wide shot with small subject", zh: "广角小主体" },
            { en: "symmetrical, clinical composition", zh: "对称、临床感构图" }
        ],
        "lighting_rule": [
            { en: "cool ambient light with a single warm source", zh: "冷环境光配单一暖源" },
            { en: "overcast soft light", zh: "阴天柔光" },
            { en: "institutional fluorescent light", zh: "机构荧光灯" }
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
            }
        ]
    },

    "documentary": {
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
            { en: "office lobby", zh: "办公大楼大堂" }
        ],
        "composition_rule": [
            { en: "35mm street photography framing", zh: "35mm 街头摄影构图" },
            { en: "candid mid-shot with context", zh: "抓拍中景带环境" },
            { en: "wide environmental portrait", zh: "广角环境人像" }
        ],
        "lighting_rule": [
            { en: "natural light, slightly imperfect exposure", zh: "自然光，略微曝光不足" },
            { en: "mixed urban lighting at night", zh: "夜间混合城市光" }
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
            }
        ]
    },

    "meme_logic": {
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
            { en: "social feed card", zh: "社交媒体信息流卡片" }
        ],
        "composition_rule": [
            { en: "screenshot framing, UI-first", zh: "截图构图，UI 优先" },
            { en: "poster with bold text blocks", zh: "带有粗体文本块的海报" }
        ],
        "lighting_rule": [
            { en: "flat UI lighting (no cinematic)", zh: "扁平 UI 光照 (无电影感)" }
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
            }
        ]
    },

    "miniature_fantasy": {
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
            { en: "workbench miniature set", zh: "工作台微缩布景" }
        ],
        "composition_rule": [
            { en: "macro lens, shallow depth of field", zh: "微距镜头，浅景深" },
            { en: "hero object with tiny workers", zh: "主体物体配微小工人" }
        ],
        "lighting_rule": [
            { en: "warm practical light with soft shadows", zh: "温暖实用光配柔和阴影" },
            { en: "studio macro light, controlled highlights", zh: "影棚微距光，控制高光" }
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
            }
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

// Helper to get value based on lang
function getVal(item, lang) {
    if (typeof item === 'object' && item !== null) {
        if (item[lang]) return item[lang];
        // fallback to en or first key
        return item.en || Object.values(item)[0];
    }
    return item;
}

// Main logic

function generateCreativeSkeleton(world, lang = 'en', twistKRange = [2, 3]) {
    if (!WORLDS[world]) {
        throw new Error(`Unknown world: ${world}`);
    }
    
    const cfg = WORLDS[world];

    // Pick raw items first (which are objects now)
    const deliverableTypeObj = pick(cfg.deliverable_type);
    const entryPointObj = pick(cfg.entry_point);
    const coreTensionObj = pick(cfg.core_tension);

    // Filter forbidden mechanisms
    // The pool contains objects with IDs now. We need to check IDs against forbidden list.
    let pool = [...cfg.twist_mechanisms_pool];
    const forbidden = FORBIDDEN_MECHANISMS_BY_WORLD[world] || [];
    pool = pool.filter(m => !forbidden.includes(m.id));

    const k = getRandomInt(twistKRange[0], twistKRange[1]);
    const twistMechanismsObjs = pickKUnique(pool, k);

    const subjectKitObj = pick(cfg.subject_kits);
    const stageContextObj = pick(cfg.stage_context);
    const compositionRuleObj = pick(cfg.composition_rule);
    const lightingRuleObj = pick(cfg.lighting_rule);

    // Resolve to strings based on lang
    const deliverableType = getVal(deliverableTypeObj, lang);
    const entryPoint = getVal(entryPointObj, lang);
    const coreTension = getVal(coreTensionObj, lang);
    const twistMechanisms = twistMechanismsObjs.map(m => getVal(m, lang));
    const stageContext = getVal(stageContextObj, lang);
    const compositionRule = getVal(compositionRuleObj, lang);
    const lightingRule = getVal(lightingRuleObj, lang);

    const subjectKit = {
        primary_subject: getVal(subjectKitObj.primary_subject, lang),
        secondary_elements: subjectKitObj.secondary_elements.map(e => getVal(e, lang))
    };

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
