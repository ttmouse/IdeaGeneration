# 创意随机抽取器（JSON驱动）
# - 目标：从“创意世界/规则层”到“实例细节层”随机抽取一份创意骨架 JSON
# - 设计：creative_world 作为总开关；每个 world 有各自白名单；扭曲器选 2~3 个；保证互斥与自洽
# - 用法：
#   python creative_sampler.py --seed 42 --world any --n 1
#   python creative_sampler.py --world product_photography --n 5
# 输出：严格 JSON（可直接喂给后续“AI提示词编剧器”Meta Prompt）

from __future__ import annotations

import argparse
import json
import random
import uuid
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence, Tuple


# -----------------------------
# 1) 变量库（先给最小可用MVP：6个世界）
#    你后续可以继续往每个列表里加几十个变量。
# -----------------------------

WORLDS: Dict[str, Dict[str, Any]] = {
    "advertising": {
        "deliverable_type": ["ad_key_visual", "brand_poster", "social_ad", "launch_teaser"],
        "entry_point": ["object", "person", "text", "system"],
        "core_tension": ["desire_vs_control", "clean_vs_chaos", "luxury_vs_absurd", "promise_vs_reality"],
        "twist_mechanisms_pool": [
            "scale_mismatch",          # 尺度错位
            "function_misuse",         # 功能错配
            "label_lies",              # 标注说谎/反讽标签
            "material_swap",           # 材质错置
            "cutaway_logic",           # 剖面/结构可见
            "missing_essential",       # 缺席
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
            {"primary_subject": "a luxury fragrance bottle", "secondary_elements": ["price tag sticker", "micro scratch marks", "tiny warning label"]},
            {"primary_subject": "a fast-food burger", "secondary_elements": ["measuring tape", "sterile glove", "barcode label"]},
            {"primary_subject": "a credit card", "secondary_elements": ["receipt fragments", "fingerprint dust", "security seal"]},
            {"primary_subject": "a smartphone", "secondary_elements": ["cracked glass shards", "warranty card", "tiny screws"]},
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
            "rule_breaking_packaging",  # 包装规则被打断
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
            {"primary_subject": "a premium supplement bottle", "secondary_elements": ["tamper seal", "tiny lounge chair", "warning label sticker"]},
            {"primary_subject": "a ceramic coffee mug", "secondary_elements": ["receipt", "stirring spoon", "micro cracks"]},
            {"primary_subject": "a mechanical keyboard keycap set", "secondary_elements": ["dust", "tiny gears", "spec label"]},
            {"primary_subject": "a luxury watch", "secondary_elements": ["micro tools", "gear fragments", "calibration card"]},
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
            "impossible_but_physical",  # 不可能但物理可信
            "cutaway_logic",
            "time_discontinuity",       # 时间断裂（不等于冻结）
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
            {"primary_subject": "a stack of documents", "secondary_elements": ["redacted lines", "misaligned stamps", "binder clip"]},
            {"primary_subject": "a chair", "secondary_elements": ["torn fabric", "number tag", "dust outline"]},
            {"primary_subject": "a mirror", "secondary_elements": ["cracked corner", "inventory label", "fingerprint smears"]},
            {"primary_subject": "a human portrait photo", "secondary_elements": ["missing face area", "annotation marks", "archival sleeve"]},
        ]
    },

    "documentary": {
        "deliverable_type": ["street_photo", "documentary_frame", "found_moment"],
        "entry_point": ["person", "action", "system"],
        "core_tension": ["ordinary_vs_uncanny", "routine_vs_glitch", "public_vs_private"],
        "twist_mechanisms_pool": [
            "rule_breaking_signage",    # 标识/告示规则异常
            "scale_mismatch",           # 轻度尺度错位（更克制）
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
            {"primary_subject": "a commuter", "secondary_elements": ["misprinted poster", "odd queue markers", "taped arrows"]},
            {"primary_subject": "a vendor stall", "secondary_elements": ["handwritten price tags", "broken neon sign", "mismatched numbers"]},
            {"primary_subject": "a security guard", "secondary_elements": ["empty badge holder", "strange floor markings", "warning tape"]},
        ]
    },

    "meme_logic": {
        "deliverable_type": ["screenshot_meme", "fake_ui_post", "internet_poster"],
        "entry_point": ["text", "system", "object"],
        "core_tension": ["deadpan_absurd", "overexplained_simple", "corporate_voice_glitch"],
        "twist_mechanisms_pool": [
            "label_lies",
            "rule_breaking_ui",          # UI规则异常
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
            {"primary_subject": "a system notification", "secondary_elements": ["oddly specific timestamp", "contradictory buttons", "tiny watermark"]},
            {"primary_subject": "a product listing", "secondary_elements": ["absurd feature bullets", "wrong category tags", "broken rating stars"]},
            {"primary_subject": "a chat screenshot", "secondary_elements": ["overly formal apology", "glitched emoji", "misaligned bubbles"]},
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
            {"primary_subject": "a macaron", "secondary_elements": ["tiny ladders", "mini workers", "sugar dust"]},
            {"primary_subject": "a pocket watch", "secondary_elements": ["tiny ropes", "mini repair tools", "gears"]},
            {"primary_subject": "a lipstick", "secondary_elements": ["mini scaffolding", "tiny paint rollers", "gloss reflections"]},
            {"primary_subject": "a tea cup", "secondary_elements": ["mini boats", "steam as fog", "spoons as bridges"]},
        ]
    },
}


# -----------------------------
# 1.5) 成像主控层 (Imaging Assumptions)
# -----------------------------

IMAGING_ASSUMPTIONS: Dict[str, Dict[str, str]] = {
    "industrial_product_photography": {
        "id": "industrial_product_photography",
        "desc": "Industrial Product Photography (Default)",
        "template": "Industrial product photography, extremely high resolution, sharp focus, studio lighting, realistic textures, 8k, unreal engine 5 render style avoided, no cgi, no 3d render, authentic camera noise."
    },
    "jewelry_macro_photography": {
        "id": "jewelry_macro_photography",
        "desc": "Jewelry Macro Photography",
        "template": "Jewelry macro photography, extreme close-up, sharp details, luxury lighting, caustics, dispersion, 8k, no cgi, highly detailed metal and gems."
    },
    "soft_editorial_portrait": {
        "id": "soft_editorial_portrait",
        "desc": "Soft Editorial Portrait",
        "template": "Soft editorial portrait photography, natural skin texture, soft diffused lighting, fashion magazine style, 85mm lens, 8k, photorealistic."
    },
    "documentary_available_light": {
        "id": "documentary_available_light",
        "desc": "Documentary Available Light",
        "template": "Documentary photography, available light, candid moment, leica m style, slight grain, high dynamic range, storytelling, 35mm lens."
    }
}


# -----------------------------
# 2) 互斥/白名单规则（避免乱配）
# -----------------------------

# 某些机制在某些世界里应被避免（你可扩展）
FORBIDDEN_MECHANISMS_BY_WORLD: Dict[str, List[str]] = {
    "documentary": ["material_swap", "impossible_but_physical", "time_discontinuity"],
    "meme_logic": ["cinematic_lighting", "ultra_photoreal_macro"],
}


def _pick(rng: random.Random, items: Sequence[Any]) -> Any:
    return items[rng.randrange(len(items))]


def _pick_k_unique(rng: random.Random, items: Sequence[Any], k: int) -> List[Any]:
    if k <= 0:
        return []
    items = list(items)
    rng.shuffle(items)
    return items[: min(k, len(items))]


def generate_creative_skeleton(
    rng: random.Random,
    world: str,
    twist_k_range: Tuple[int, int] = (2, 3),
    imaging_assumption_key: str = "industrial_product_photography"
) -> Dict[str, Any]:
    cfg = WORLDS[world]

    # Validate Imaging Assumption
    if imaging_assumption_key not in IMAGING_ASSUMPTIONS:
        imaging_assumption_key = "industrial_product_photography"
    imaging_obj = IMAGING_ASSUMPTIONS[imaging_assumption_key]
    
    deliverable_type = _pick(rng, cfg["deliverable_type"])
    entry_point = _pick(rng, cfg["entry_point"])
    core_tension = _pick(rng, cfg["core_tension"])

    pool = list(cfg["twist_mechanisms_pool"])
    forbidden = set(FORBIDDEN_MECHANISMS_BY_WORLD.get(world, []))
    pool = [m for m in pool if m not in forbidden]

    k = rng.randint(twist_k_range[0], twist_k_range[1])
    twist_mechanisms = _pick_k_unique(rng, pool, k)

    subject_kit = _pick(rng, cfg["subject_kits"])
    stage_context = _pick(rng, cfg["stage_context"])
    composition_rule = _pick(rng, cfg["composition_rule"])
    lighting_rule = _pick(rng, cfg["lighting_rule"])

    skeleton = {
        "creative_id": f"{world}-{uuid.uuid4().hex[:8]}",
        "creative_world": world,
        "deliverable_type": deliverable_type,
        "entry_point": entry_point,
        "core_tension": core_tension,
        "twist_mechanisms": twist_mechanisms,
        "subject_kit": subject_kit,
        "stage_context": stage_context,
        "composition_rule": composition_rule,
        "lighting_rule": lighting_rule,
    }

    return skeleton


def choose_world(rng: random.Random, requested: str) -> str:
    if requested == "any":
        return _pick(rng, list(WORLDS.keys()))
    if requested not in WORLDS:
        raise ValueError(f"Unknown world: {requested}. Available: {', '.join(WORLDS.keys())}")
    return requested


def main() -> None:
    parser = argparse.ArgumentParser(description="Creative skeleton sampler")
    parser.add_argument("--seed", type=int, default=None, help="Random seed")
    parser.add_argument("--world", type=str, default="any", help=f"World name or 'any'. Options: {', '.join(WORLDS.keys())}")
    parser.add_argument("--n", type=int, default=1, help="How many skeletons to generate")
    parser.add_argument("--imaging", type=str, default="industrial_product_photography", help="Imaging assumption key")
    args = parser.parse_args()

    rng = random.Random(args.seed)

    results: List[Dict[str, Any]] = []
    for _ in range(args.n):
        world = choose_world(rng, args.world)
        results.append(generate_creative_skeleton(rng, world, imaging_assumption_key=args.imaging))

    # 输出严格 JSON
    if args.n == 1:
        print(json.dumps(results[0], ensure_ascii=False, indent=2))
    else:
        print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
