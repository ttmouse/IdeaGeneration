/**
 * Evaluator Module - Post-generation adjudicator
 * 
 * [IN]: Generated skeleton, context (intent, logic, density)
 * [OUT]: { verdict: PASS|DEGRADED|BLOCK, violations: [], warnings: [] }
 * [POS]: Validation layer that runs AFTER generation to detect rule violations
 */

const fs = require('fs');
const path = require('path');

const RULES_PATH = path.join(__dirname, 'rules.json');

let cachedRules = null;

function loadRules() {
    try {
        const data = fs.readFileSync(RULES_PATH, 'utf8');
        cachedRules = JSON.parse(data);
        return cachedRules;
    } catch (err) {
        console.error('Evaluator: Failed to load rules:', err.message);
        return [];
    }
}

function getRules() {
    if (!cachedRules) loadRules();
    return cachedRules || [];
}

/**
 * Evaluate a generated skeleton against all active rules
 * @param {Object} skeleton - The public_skeleton object from generation
 * @param {Object} context - Additional context { intent, logic, imaging, density }
 * @returns {Object} EvaluationResult
 */
function evaluate(skeleton, context = {}) {
    const rules = getRules().filter(r => r.active);
    const violations = [];
    const warnings = [];

    // Build a normalized context map for matching
    const ctx = {
        creation_intent: context.intent?.id || skeleton.creation_intent_id,
        generation_logic: context.logic?.id || skeleton.generation_logic_id,
        imaging_assumption: context.imaging?.id || skeleton.imaging_assumption_id,
        creative_world: skeleton._world
    };

    // Extract actual values from skeleton for checking
    const actualValues = {
        twist_mechanisms: skeleton.twist_ids || [],
        secondary_elements: skeleton.subject_kit?.secondary_ids || [],
        core_tension: skeleton.core_tension_id,
        stage_context: skeleton.stage_context_id,
        composition_rule: skeleton.composition_rule_id,
        lighting_rule: skeleton.lighting_rule_id
    };

    // Check each rule
    rules.forEach(rule => {
        const triggerDim = rule.trigger.dimension;
        const triggerVal = rule.trigger.value;

        // Check if trigger condition is met
        if (ctx[triggerDim] !== triggerVal) return;

        const action = rule.consequence.action;
        const targetDim = rule.consequence.target;
        const targetVal = rule.consequence.value;
        const severity = rule.severity || 'warning'; // Default to warning

        const actualTargetValues = actualValues[targetDim];

        if (action === 'forbid') {
            // Check if forbidden value exists in actual output
            const isForbiddenPresent = Array.isArray(actualTargetValues)
                ? actualTargetValues.includes(targetVal)
                : actualTargetValues === targetVal;

            if (isForbiddenPresent) {
                violations.push({
                    ruleId: `${rule.type}:${rule.id}`,
                    severity,
                    message: `${rule.desc} - Found forbidden '${targetVal}' in '${targetDim}'`,
                    context: {
                        dimension: targetDim,
                        actual: targetVal,
                        expected: `NOT ${targetVal}`
                    }
                });
            }
        } else if (action === 'require') {
            // Check if required value is missing
            const isRequiredPresent = Array.isArray(actualTargetValues)
                ? actualTargetValues.includes(targetVal)
                : actualTargetValues === targetVal;

            if (!isRequiredPresent) {
                violations.push({
                    ruleId: `${rule.type}:${rule.id}`,
                    severity,
                    message: `${rule.desc} - Missing required '${targetVal}' in '${targetDim}'`,
                    context: {
                        dimension: targetDim,
                        actual: Array.isArray(actualTargetValues) ? actualTargetValues.join(', ') : actualTargetValues,
                        expected: targetVal
                    }
                });
            }
        }
    });

    // Determine verdict
    let verdict = 'PASS';
    if (violations.length > 0) {
        const hasError = violations.some(v => v.severity === 'error');
        verdict = hasError ? 'BLOCK' : 'DEGRADED';
    }

    // Add informational warnings (non-blocking)
    if (context.density === 'dense' && (skeleton.twist_ids?.length || 0) < 3) {
        warnings.push('Dense mode requested but fewer than 3 twists generated.');
    }
    if (context.density === 'sparse' && (skeleton.subject_kit?.secondary_elements?.length || 0) > 2) {
        warnings.push('Sparse mode requested but more than 2 secondary elements present.');
    }

    return {
        verdict,
        violations,
        warnings
    };
}

// Reload rules (for hot-reload after UI edits)
function reloadRules() {
    cachedRules = null;
    loadRules();
}

module.exports = {
    evaluate,
    reloadRules,
    getRules
};
