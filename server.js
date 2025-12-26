const express = require('express');
const path = require('path');
const {
    generateCreativeSkeleton,
    getAvailableWorlds,
    CREATION_INTENTS,
    GENERATION_LOGICS,
    IMAGING_ASSUMPTIONS,
    WORLDS,
    PromptAssemblyError
} = require('./src/logic');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: 获取配置信息 (Intents, Logics, Worlds)
app.get('/api/config', (req, res) => {
    res.json({
        worlds: WORLDS,
        intents: CREATION_INTENTS,
        logics: GENERATION_LOGICS,
        imaging_assumptions: IMAGING_ASSUMPTIONS
    });
});

// API: 获取可用世界列表 (Legacy, but kept for compatibility if needed)
app.get('/api/worlds', (req, res) => {
    res.json(getAvailableWorlds());
});

// API: 生成创意
const VALID_MODES = new Set(['model', 'full', 'debug']);

function shapeResult(payload, mode) {
    if (mode === 'model') {
        return payload.model_input;
    }
    if (mode === 'debug') {
        return {
            model_input: payload.model_input,
            governance_record: payload.governance_record,
            debug: payload.debug
        };
    }
    return {
        ...payload.governance_record,
        model_input: payload.model_input
    };
}

app.post('/api/generate', (req, res) => {
    try {
        const { world, intent, logic, imaging_assumption, n = 1, lang = 'en', mode = 'full', seed, inspirationSeed, overrides = {} } = req.body;
        const availableWorlds = getAvailableWorlds();

        let targetWorld = world;
        if (targetWorld && targetWorld !== 'any' && !availableWorlds.includes(targetWorld)) {
            return res.status(400).json({ error: `Invalid world. Available: ${availableWorlds.join(', ')}` });
        }

        const normalizedMode = VALID_MODES.has(mode) ? mode : 'full';
        const count = Math.max(1, Math.min(20, parseInt(n, 10) || 1));
        const results = [];

        for (let i = 0; i < count; i++) {
            const payload = generateCreativeSkeleton({
                world: targetWorld,
                lang,
                twistKRange: [2, 3],
                intent,
                logic,
                imaging_assumption,
                seed: typeof seed === 'number' ? seed + i : null,
                inspirationSeed: inspirationSeed || null,
                overrides
            });
            results.push(shapeResult(payload, normalizedMode));
        }

        res.json(results);
    } catch (error) {
        console.error(error);
        if (error instanceof PromptAssemblyError) {
            return res.status(422).json({ error: error.message, code: error.code });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 修改成3003 端口
app.listen(3003, () => {
    console.log(`Server is running on http://localhost:${3003}`);
});


// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
