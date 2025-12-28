const fs = require('fs');
const path = require('path');

const RULES_FILE = path.join(__dirname, 'rules.json');

// Memory Cache
let activeRules = [];

function loadRules() {
    try {
        if (fs.existsSync(RULES_FILE)) {
            const data = fs.readFileSync(RULES_FILE, 'utf8');
            activeRules = JSON.parse(data);
        } else {
            activeRules = [];
        }
    } catch (err) {
        console.error("Failed to load rules:", err);
        activeRules = [];
    }
    return activeRules;
}

function saveRules(rules) {
    try {
        fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2), 'utf8');
        activeRules = rules;
        return true;
    } catch (err) {
        console.error("Failed to save rules:", err);
        return false;
    }
}

function getRules() {
    if (activeRules.length === 0) loadRules();
    return activeRules;
}

// Evaluate rules against a partial or full skeleton context
// context format: { generation_logic: 'process-driven', creation_intent: 'sell', ... }
// Returns: { requirements: { twist_mechanisms: ['cutaway_logic'] }, forbidden: { twist_mechanisms: ['impossible_but_physical'] }, warnings: [] }
function evaluateRules(context) {
    if (activeRules.length === 0) loadRules();

    // Normalize context context to be keyed by ID strings for comparison
    const normContext = {};
    for (const key in context) {
        const val = context[key];
        // If val is object with id, use id. Otherwise use val.
        if (val && typeof val === 'object' && val.id) {
            normContext[key] = val.id;
        } else {
            normContext[key] = val;
        }
    }

    const result = {
        requirements: {}, // Key: dimension -> Array of required IDs
        forbidden: {},    // Key: dimension -> Array of forbidden IDs
        warnings: []
    };

    activeRules.forEach(rule => {
        if (!rule.active) return;

        // Check Trigger
        const trigDim = rule.trigger.dimension;
        const trigVal = rule.trigger.value;

        // Context might not have this dimension yet? 
        // We assume context has high-level decisions (Intent, Logic, World) before evaluating detailed rules.

        if (normContext[trigDim] === trigVal) {
            // Triggered! Apply Consequence
            const action = rule.consequence.action;
            const targetDim = rule.consequence.target;
            const targetVal = rule.consequence.value;

            if (action === 'require') {
                if (!result.requirements[targetDim]) result.requirements[targetDim] = [];
                if (!result.requirements[targetDim].includes(targetVal)) {
                    result.requirements[targetDim].push(targetVal);
                    result.warnings.push(`Rule '${rule.desc}' triggered: Required '${targetVal}' in '${targetDim}'.`);
                }
            } else if (action === 'forbid') {
                if (!result.forbidden[targetDim]) result.forbidden[targetDim] = [];
                if (!result.forbidden[targetDim].includes(targetVal)) {
                    result.forbidden[targetDim].push(targetVal);
                    // result.warnings.push(`Rule '${rule.desc}' triggered: Forbidden '${targetVal}' in '${targetDim}'.`);
                }
            }
        }
    });

    return result;
}

// Initial Load
loadRules();

module.exports = {
    loadRules,
    saveRules,
    getRules,
    evaluateRules
};
