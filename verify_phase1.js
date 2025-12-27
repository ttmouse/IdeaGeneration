const { generateCreativeSkeleton } = require('./src/logic.js');

console.log('--- Testing Inspiration Seed ---');
try {
    const seedResult = generateCreativeSkeleton({ inspirationSeed: 'luxury metal' });
    console.log('Seed "luxury metal" world:', seedResult.public_skeleton.creative_world);
    console.log('Emergence:', seedResult.public_skeleton.emergence);
} catch (e) {
    console.error('Inspiration Seed Test Failed:', e);
}

console.log('\n--- Testing Synergy (Miniature Fantasy + Scale Mismatch) ---');
try {
    const synergyResult = generateCreativeSkeleton({ 
        world: 'miniature_fantasy',
        overrides: {
            core_tension: 'tiny_labor_vs_giant_object',
            twist_mechanisms: ['scale_mismatch']
        }
    });
    console.log('Synergy Score:', synergyResult.public_skeleton.emergence.score);
    console.log('Synergy Label:', synergyResult.public_skeleton.emergence.label);
} catch (e) {
    console.error('Synergy Test Failed:', e);
}

console.log('\n--- Testing Cliche (Advertising + Sell) ---');
try {
    const clicheResult = generateCreativeSkeleton({ 
        world: 'advertising',
        intent: 'sell',
        overrides: {
            core_tension: 'desire_vs_control'
        }
    });
    console.log('Cliche Score:', clicheResult.public_skeleton.emergence.score);
    console.log('Cliche Label:', clicheResult.public_skeleton.emergence.label);
} catch (e) {
    console.error('Cliche Test Failed:', e);
}
