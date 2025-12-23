document.addEventListener('DOMContentLoaded', () => {
    const worldSelect = document.getElementById('world-select');
    const countInput = document.getElementById('count-input');
    const generateBtn = document.getElementById('generate-btn');
    const resultsArea = document.getElementById('results-area');

    // 1. 获取可用 World 列表
    fetch('/api/worlds')
        .then(res => res.json())
        .then(worlds => {
            worlds.forEach(world => {
                const option = document.createElement('option');
                option.value = world;
                option.textContent = formatWorldName(world);
                worldSelect.appendChild(option);
            });
        })
        .catch(err => console.error('Failed to load worlds:', err));

    // 2. 生成创意
    generateBtn.addEventListener('click', () => {
        const world = worldSelect.value;
        const n = parseInt(countInput.value);

        generateBtn.disabled = true;
        generateBtn.textContent = '生成中...';
        resultsArea.innerHTML = ''; // 清空之前的结果

        fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ world, n })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }
            renderResults(data);
        })
        .catch(err => {
            console.error('Error generating ideas:', err);
            resultsArea.innerHTML = '<p style="color:red; width:100%; text-align:center;">生成失败，请检查控制台或稍后重试。</p>';
        })
        .finally(() => {
            generateBtn.disabled = false;
            generateBtn.textContent = '生成创意';
        });
    });

    // 辅助函数：格式化 World 名称 (e.g., "product_photography" -> "Product Photography")
    function formatWorldName(name) {
        return name.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // 渲染卡片
    function renderResults(results) {
        if (!results || results.length === 0) {
            resultsArea.innerHTML = '<p style="width:100%; text-align:center;">未生成结果。</p>';
            return;
        }

        results.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // 构造卡片内容
            let twistTags = item.twist_mechanisms.map(t => `<span class="tag">${t}</span>`).join('');
            
            // 处理 subject_kit 显示
            let subjectHtml = '';
            if (typeof item.subject_kit === 'object') {
                subjectHtml = `
                    <div class="card-value"><strong>${item.subject_kit.primary_subject}</strong></div>
                    <div class="tags" style="margin-top:5px;">
                        ${item.subject_kit.secondary_elements.map(e => `<span class="tag" style="background:#e8f5e9; color:#2e7d32;">${e}</span>`).join('')}
                    </div>
                `;
            } else {
                subjectHtml = `<div class="card-value">${item.subject_kit}</div>`;
            }

            card.innerHTML = `
                <div class="card-header">
                    <h3>${formatWorldName(item.creative_world)}</h3>
                    <button class="copy-btn" title="复制 JSON">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
                <div class="card-item">
                    <span class="card-label">ID</span>
                    <span class="card-value" style="font-family:monospace; color:#888;">${item.creative_id}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Deliverable Type</span>
                    <span class="card-value">${item.deliverable_type}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Core Tension</span>
                    <span class="card-value">${item.core_tension}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Twist Mechanisms</span>
                    <div class="tags">${twistTags}</div>
                </div>
                <div class="card-item">
                    <span class="card-label">Subject Kit</span>
                    ${subjectHtml}
                </div>
                <div class="card-item">
                    <span class="card-label">Stage Context</span>
                    <span class="card-value">${item.stage_context}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Composition Rule</span>
                    <span class="card-value">${item.composition_rule}</span>
                </div>
                 <div class="card-item">
                    <span class="card-label">Lighting Rule</span>
                    <span class="card-value">${item.lighting_rule}</span>
                </div>
            `;

            // 绑定复制事件
            const copyBtn = card.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                const jsonStr = JSON.stringify(item, null, 2);
                navigator.clipboard.writeText(jsonStr).then(() => {
                    const originalIcon = copyBtn.innerHTML;
                    // 切换为勾选图标
                    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                    setTimeout(() => {
                        copyBtn.innerHTML = originalIcon;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            });
            
            resultsArea.appendChild(card);
        });
    }
});
