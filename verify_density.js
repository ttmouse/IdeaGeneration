
const { generateCreativeSkeleton } = require('./src/logic');

function verifyDensity() {
    console.log("=== Verifying Density Module ===");

    const iterations = 20;
    const densities = ['sparse', 'medium', 'dense'];
    const results = {};

    densities.forEach(d => {
        results[d] = {
            totalSecondary: 0,
            totalTwists: 0,
            totalOptional: 0 // stage, lighting, composition
        };

        for (let i = 0; i < iterations; i++) {
            const res = generateCreativeSkeleton({ density: d });
            const skel = res.public_skeleton;

            // Count Secondary Elements
            results[d].totalSecondary += skel.subject_kit.secondary_elements.length;

            // Count Twists
            results[d].totalTwists += skel.twist_mechanisms.length;

            // Count Optional Dimensions (if they are not generic placeholders or null/undefined, though logic guarantees strings)
            // But my logic returns full strings now. 
            // The "null" return in sampling converts to "standard" in assemble_prompt or just disappears? 
            // Wait, assemble_prompt uses getVal. If selection is null, getVal might crash or return something.
            // Let's check logic.js: assemble_prompt accesses selection properties.
            // if selection.stage_context is null, assemble_prompt might fail.
            // I need to check if I handled nulls in assemble_prompt.
        }
    });

    console.table(results);

    // Simple Assertion
    const avgSparse = results.sparse.totalSecondary / iterations;
    const avgDense = results.dense.totalSecondary / iterations;

    console.log(`Avg Sparse Secondary: ${avgSparse}`);
    console.log(`Avg Dense Secondary: ${avgDense}`);

    if (avgDense > avgSparse) {
        console.log("✅ Density Check Passed: Dense > Sparse");
    } else {
        console.error("❌ Density Check Failed");
    }
}

function verifyRules() {
    console.log("\n=== Verifying Rules ===");

    // Test L1: Logic required twist
    // "process-driven" prefers "cutaway_logic", but technically logic doesn't *require* it in the old code, 
    // it was just preferred entry. But let's check if I can force a logic that has a requirement.
    // I need to mock a logic requirement or find one.
    // The current GENERATION_LOGICS definition:
    // "process-driven": { ... required_twist_category: "cutaway_logic" } <-- Yes!

    const resL1 = generateCreativeSkeleton({ logic: "process-driven", density: 'medium' });
    const twists = resL1.public_skeleton.twist_ids; // My updated code exposes twist_ids? 
    // logic.js: twist_ids: selection.twist_mechanisms.map(t => t.id || safeSlug(getVal(t)))

    console.log("Logic: process-driven. Required: cutaway_logic. Got:", twists);
    if (twists.some(t => t.includes('cutaway_logic'))) {
        console.log("✅ L1 Rule Passed: Required twist present");
    } else {
        console.log("❌ L1 Rule Failed: Required twist missing");
    }

    // Test L3: Intent forbidden twists
    // Intent "document" forbids "impossible_but_physical"
    // I will try to FORCE "impossible_but_physical" via override with intent "document".
    // If L3 works, it might just allow it (since override is king?) OR reject it.
    // In my code: "If I force override, does it respect L3?"
    // The logic says: "override = matchValue ... if override return ...". 
    // It seems overrides BYPASS L3 filtering. This is debatable but usually overrides are "God Mode".
    // So to test L3, I should just generate MANY "document" intents and ensure "impossible_but_physical" never appears naturally.

    let violationCount = 0;
    for (let i = 0; i < 50; i++) {
        const res = generateCreativeSkeleton({ intent: "document", density: 'dense' });
        // Use dense to maximize twist count, increasing chance of hitting forbidden if not filtered
        const ids = res.public_skeleton.twist_ids;
        if (ids.includes('impossible_but_physical')) violationCount++;
    }

    console.log(`Generated 50 "Document" intent samples. Violations: ${violationCount}`);
    if (violationCount === 0) {
        console.log("✅ L3 Rule Passed: Forbidden twist not found");
    } else {
        console.log("❌ L3 Rule Failed: Forbidden twist found");
    }
}

try {
    verifyDensity();
    verifyRules();
} catch (e) {
    console.error(e);
}
