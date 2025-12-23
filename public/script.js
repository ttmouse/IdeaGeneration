document.addEventListener('DOMContentLoaded', () => {
    const worldSelect = document.getElementById('world-select');
    // const countInput = document.getElementById('count-input'); // Removed
    const generateBtn = document.getElementById('generate-btn');
    const resultsArea = document.getElementById('results-area');
    const favoritesArea = document.getElementById('favorites-area'); // Re-added this line!
    const langSelect = document.getElementById('lang-select');

    // UI 翻译字典
    const i18n = {
        en: {
            document_title: "IdeaGeneration - Creative Random Extractor",
            app_title: "IdeaGeneration",
            app_subtitle: "Randomly extract inspiration skeletons from 'Creative Worlds'",
            label_world: "Select Creative World:",
            option_any: "Any (Random)",
            label_lang: "Language:",
            btn_generate: "Generate 3 Ideas",
            favorites_title: "Favorites",
            no_results: "No results generated.",
            no_favorites: "No favorite ideas yet.",
            btn_generating: "Generating...",
            copy_json: "Copy JSON",
            fav_add: "Add to Favorites",
            fav_remove: "Remove from Favorites",
            card_labels: {
                id: "ID",
                deliverable_type: "Deliverable Type",
                core_tension: "Core Tension",
                twist_mechanisms: "Twist Mechanisms",
                subject_kit: "Subject Kit",
                stage_context: "Stage Context",
                composition_rule: "Composition Rule",
                lighting_rule: "Lighting Rule"
            }
        },
        zh: {
            document_title: "IdeaGeneration - 创意随机抽取器",
            app_title: "IdeaGeneration",
            app_subtitle: "从“创意世界”中随机抽取灵感骨架",
            label_world: "选择创意世界 (World):",
            option_any: "Any (随机)",
            label_lang: "语言 (Language):",
            btn_generate: "生成 3 个创意",
            favorites_title: "收藏夹 (Favorites)",
            no_results: "未生成结果。",
            no_favorites: "暂无收藏创意",
            btn_generating: "生成中...",
            copy_json: "复制 JSON",
            copy_prefix: "生成一句话创意总结的同时用下面提示词生成图片\n",
            fav_add: "收藏",
            fav_remove: "取消收藏",
            card_labels: {
                id: "ID",
                deliverable_type: "交付类型",
                core_tension: "核心张力",
                twist_mechanisms: "反转机制",
                subject_kit: "主体套件",
                stage_context: "场景语境",
                composition_rule: "构图规则",
                lighting_rule: "布光规则"
            },
            world_names: {
                advertising: "Advertising (广告)",
                product_photography: "Product Photography (产品摄影)",
                concept_art: "Concept Art (概念艺术)",
                documentary: "Documentary (纪实摄影)",
                meme_logic: "Meme Logic (迷因逻辑)",
                miniature_fantasy: "Miniature Fantasy (微缩奇幻)"
            }
        }
    };

    // 补充英文的 world_names 和 copy_prefix
    i18n.en.world_names = {
        advertising: "Advertising",
        product_photography: "Product Photography",
        concept_art: "Concept Art",
        documentary: "Documentary",
        meme_logic: "Meme Logic",
        miniature_fantasy: "Miniature Fantasy"
    };
    i18n.en.copy_prefix = "Generate a one-sentence creative summary and then use the following prompt to generate an image:\n";

    
    // 加载收藏夹
    if (favoritesArea) {
        loadFavorites();
    }

    // 初始化语言
    const savedLang = localStorage.getItem('idea_lang') || 'en';
    langSelect.value = savedLang;
    updateUILanguage(savedLang);

    // 监听语言切换
    langSelect.addEventListener('change', (e) => {
        const newLang = e.target.value;
        localStorage.setItem('idea_lang', newLang);
        updateUILanguage(newLang);
    });

    function updateUILanguage(lang) {
        const texts = i18n[lang];
        
        // 更新页面标题
        if (texts.document_title) {
            document.title = texts.document_title;
        }

        // 更新静态文本
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (texts[key]) {
                el.textContent = texts[key];
            }
        });

        // 更新卡片中的标签 (如果存在)
        document.querySelectorAll('.card').forEach(card => {
            updateCardLabels(card, lang);
        });

        // 更新按钮 Title
        document.querySelectorAll('.copy-btn').forEach(btn => btn.title = texts.copy_json);
        document.querySelectorAll('.fav-btn').forEach(btn => {
            const isFav = btn.querySelector('svg').getAttribute('fill') === '#D4AF37';
            btn.title = isFav ? texts.fav_remove : texts.fav_add;
        });

        // 更新空状态文本
        if (resultsArea && resultsArea.innerHTML.includes('<p')) {
             if (resultsArea.textContent.trim() === i18n.en.no_results || resultsArea.textContent.trim() === i18n.zh.no_results) {
                 resultsArea.innerHTML = `<p style="width:100%; text-align:center;">${texts.no_results}</p>`;
             }
        }
        if (favoritesArea && favoritesArea.innerHTML.includes('<p')) {
             favoritesArea.innerHTML = `<p style="width:100%; text-align:center; color:#999;">${texts.no_favorites}</p>`;
        }

        // 更新 World 下拉菜单选项
        if (worldSelect) {
            Array.from(worldSelect.options).forEach(option => {
                if (option.value === 'any') {
                    option.textContent = texts.option_any;
                } else {
                    // 由于 formatWorldName 会读取 localStorage 中的当前语言，
                    // 而我们在调用 updateUILanguage 前已经更新了 localStorage，
                    // 所以这里直接调用 formatWorldName 即可得到正确语言的名称。
                    option.textContent = formatWorldName(option.value);
                }
            });
        }
    }

    function updateCardLabels(card, lang) {
        const labels = i18n[lang].card_labels;
        
        card.querySelectorAll('[data-i18n-label]').forEach(labelEl => {
            const key = labelEl.getAttribute('data-i18n-label');
            if (labels[key]) {
                labelEl.textContent = labels[key];
            }
        });
    }

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
        const n = 3; // 默认生成 3 个
        const lang = document.getElementById('lang-select').value; // 获取语言选择

        generateBtn.disabled = true;
        generateBtn.textContent = '生成中...';
        resultsArea.innerHTML = ''; // 清空之前的结果

        fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ world, n, lang }) // 发送 lang 参数
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

    // 辅助函数：格式化 World 名称
    function formatWorldName(name) {
        const lang = localStorage.getItem('idea_lang') || 'en';
        if (i18n[lang] && i18n[lang].world_names && i18n[lang].world_names[name]) {
            return i18n[lang].world_names[name];
        }
        return name.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // 收藏相关逻辑
    function getFavorites() {
        const favs = localStorage.getItem('idea_favorites');
        return favs ? JSON.parse(favs) : [];
    }

    function saveFavorite(item) {
        const favs = getFavorites();
        if (!favs.some(f => f.creative_id === item.creative_id)) {
            favs.push(item);
            localStorage.setItem('idea_favorites', JSON.stringify(favs));
            loadFavorites();
        }
    }

    function removeFavorite(id) {
        const favs = getFavorites();
        const newFavs = favs.filter(f => f.creative_id !== id);
        localStorage.setItem('idea_favorites', JSON.stringify(newFavs));
        loadFavorites();
    }

    function isFavorite(id) {
        const favs = getFavorites();
        return favs.some(f => f.creative_id === id);
    }

    function loadFavorites() {
        const favs = getFavorites();
        favoritesArea.innerHTML = '';
        if (favs.length === 0) {
            favoritesArea.innerHTML = '<p style="width:100%; text-align:center; color:#999;">暂无收藏创意</p>';
            return;
        }
        // 渲染收藏列表 (复用 createCardElement 逻辑)
        favs.forEach(item => {
            const card = createCardElement(item, true);
            favoritesArea.appendChild(card);
        });
    }

    // 创建卡片 DOM 元素的通用函数
    function createCardElement(item, isFavCard = false) {
        const card = document.createElement('div');
        card.className = 'card';
        const lang = localStorage.getItem('idea_lang') || 'en'; // 获取当前语言
        const labels = i18n[lang].card_labels;
        
        // 构造卡片内容
        let twistTags = item.twist_mechanisms.map(t => `<span class="tag">${t}</span>`).join('');
        
        // 处理 subject_kit 显示
        let subjectHtml = '';
        if (typeof item.subject_kit === 'object') {
            subjectHtml = `
                <div class="card-value"><strong>${item.subject_kit.primary_subject}</strong></div>
                <div class="tags" style="margin-top:5px;">
                    ${item.subject_kit.secondary_elements.map(e => `<span class="tag">${e}</span>`).join('')}
                </div>
            `;
        } else {
            subjectHtml = `<div class="card-value">${item.subject_kit}</div>`;
        }

        const isFav = isFavorite(item.creative_id);
        const favIconFill = isFav || isFavCard ? '#D4AF37' : 'none';
        const favIconStroke = isFav || isFavCard ? '#D4AF37' : 'currentColor';
        const favTitle = isFav || isFavCard ? i18n[lang].fav_remove : i18n[lang].fav_add;
        const copyTitle = i18n[lang].copy_json;

        card.innerHTML = `
            <div class="card-header">
                <h3>${formatWorldName(item.creative_world)}</h3>
                <div class="card-actions">
                    <button class="fav-btn" title="${favTitle}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${favIconFill}" stroke="${favIconStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    <button class="copy-btn" title="${copyTitle}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="card-item">
                <span class="card-label" data-i18n-label="id">${labels.id}</span>
                <span class="card-value" style="font-family:monospace; color:var(--muted-text);">${item.creative_id}</span>
            </div>
            <div class="card-item">
                <span class="card-label" data-i18n-label="deliverable_type">${labels.deliverable_type}</span>
                <span class="card-value">${item.deliverable_type}</span>
            </div>
            <div class="card-item">
                <span class="card-label" data-i18n-label="core_tension">${labels.core_tension}</span>
                <span class="card-value">${item.core_tension}</span>
            </div>
            <div class="card-item">
                <span class="card-label" data-i18n-label="twist_mechanisms">${labels.twist_mechanisms}</span>
                <div class="tags">${twistTags}</div>
            </div>
            <div class="card-item">
                <span class="card-label" data-i18n-label="subject_kit">${labels.subject_kit}</span>
                ${subjectHtml}
            </div>
            <div class="card-item">
                <span class="card-label" data-i18n-label="stage_context">${labels.stage_context}</span>
                <span class="card-value">${item.stage_context}</span>
            </div>
            <div class="card-item">
                <span class="card-label" data-i18n-label="composition_rule">${labels.composition_rule}</span>
                <span class="card-value">${item.composition_rule}</span>
            </div>
             <div class="card-item">
                <span class="card-label" data-i18n-label="lighting_rule">${labels.lighting_rule}</span>
                <span class="card-value">${item.lighting_rule}</span>
            </div>
        `;

        // 绑定复制事件
        const copyBtn = card.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
            const currentLang = localStorage.getItem('idea_lang') || 'en';
            const jsonStr = JSON.stringify(item, null, 2);
            const prefix = i18n[currentLang].copy_prefix || "";
            const copyText = `${prefix}${jsonStr}`;
            navigator.clipboard.writeText(copyText).then(() => {
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });

        // 绑定收藏事件
        const favBtn = card.querySelector('.fav-btn');
        favBtn.addEventListener('click', () => {
            if (isFavorite(item.creative_id)) {
                removeFavorite(item.creative_id);
                // 更新按钮状态
                favBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
                favBtn.title = "收藏";
            } else {
                saveFavorite(item);
                // 更新按钮状态
                favBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
                favBtn.title = "取消收藏";
            }
        });

        return card;
    }

    // 渲染卡片
    function renderResults(results) {
        if (!results || results.length === 0) {
            resultsArea.innerHTML = '<p style="width:100%; text-align:center;">未生成结果。</p>';
            return;
        }

        results.forEach(item => {
            const card = createCardElement(item);
            resultsArea.appendChild(card);
        });
    }
});
