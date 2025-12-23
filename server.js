const express = require('express');
const path = require('path');
const { generateCreativeSkeleton, getAvailableWorlds } = require('./src/logic');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: 获取可用世界列表
app.get('/api/worlds', (req, res) => {
    res.json(getAvailableWorlds());
});

// API: 生成创意
app.post('/api/generate', (req, res) => {
    try {
        const { world, n = 1, lang = 'en' } = req.body;
        const availableWorlds = getAvailableWorlds();
        
        // 验证 world 参数
        let targetWorld = world;
        if (!targetWorld || targetWorld === 'any') {
            targetWorld = availableWorlds[Math.floor(Math.random() * availableWorlds.length)];
        } else if (!availableWorlds.includes(targetWorld)) {
            return res.status(400).json({ error: `Invalid world. Available: ${availableWorlds.join(', ')}` });
        }

        const count = Math.max(1, Math.min(20, parseInt(n) || 1)); // 限制生成数量 1-20
        const results = [];

        for (let i = 0; i < count; i++) {
            // 如果用户选了 'any'，我们可以为每一个生成选择不同的随机世界，或者统一用同一个随机世界。
            // 原 Python 逻辑是：如果 'any'，每次循环重新随机选一个 world。
            // 让我们保持一致。
            let currentWorld = targetWorld;
            if (world === 'any' || !world) {
                currentWorld = availableWorlds[Math.floor(Math.random() * availableWorlds.length)];
            }
            
            results.push(generateCreativeSkeleton(currentWorld, lang));
        }

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
