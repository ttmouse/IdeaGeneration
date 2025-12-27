document.addEventListener('DOMContentLoaded', () => {
    const worldSelect = document.getElementById('world-select');
    const intentSelect = document.getElementById('intent-select');
    const logicSelect = document.getElementById('logic-select');
    const imagingSelect = document.getElementById('imaging-select');
    const generateBtn = document.getElementById('generate-btn');
    const resultsArea = document.getElementById('results-area');
    const favoritesArea = document.getElementById('favorites-area');
    const langSelect = document.getElementById('lang-select');
    const coreSelect = document.getElementById('core-select');
    const twistSelect = document.getElementById('twist-select');
    const subjectSelect = document.getElementById('subject-select');
    const stageSelect = document.getElementById('stage-select');
    const compositionSelect = document.getElementById('composition-select');
    const lightingSelect = document.getElementById('lighting-select');


    // 存储全局配置以便语言切换时使用
    let globalConfig = null;

    // View State Management
    let activeView = 'generator';

    window.setView = function (viewName) {
        if (!['generator', 'favorites', 'graph'].includes(viewName)) return;
        activeView = viewName;

        // 1. Update Tab UI
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === viewName);
        });

        // 2. toggle Content Visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${viewName}`);
        });

        // 3. Trigger Loaders
        if (viewName === 'favorites') {
            loadFavorites();
        }
        if (viewName === 'graph') {
            visualizeExplorationMap(); // Ensure map is updated when graph tab is active
        }

        // Optional: Update URL hash for persistence
        // history.replaceState(null, null, `#${viewName}`);
    };

    // Bind Click Events
    document.querySelectorAll('.tab-btn').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            setView(link.dataset.tab);
        });
    });



    // Removed tabBtns click listener as it's handled by .nav-link above

    if (worldSelect) {
        worldSelect.addEventListener('change', () => {
            populateWorldDimensionControls(worldSelect.value);
            const triggerText = document.querySelector('.custom-select__trigger span');
            if (triggerText) triggerText.textContent = worldSelect.selectedOptions[0].textContent;
        });
    }

    /**
     * Centralized translation helper
     * @param {string|object} item - The item to translate
     * @param {string} lang - The target language ('en' or 'zh')
     * @returns {string} - The translated string
     */
    function t(item, lang) {
        if (!item) return '';

        // 1. Handle object format { en: '...', zh: '...' }
        if (typeof item === 'object' && item !== null) {
            if (item[lang]) return item[lang];
            return item.en || Object.values(item)[0] || '';
        }

        // 2. Handle string format (possibly "En / Zh")
        if (typeof item === 'string') {
            if (item.includes('/')) {
                const parts = item.split('/');
                const result = lang === 'zh' && parts[1] ? parts[1].trim() : parts[0].trim();
                return result || item;
            }
            return item;
        }

        return `${item}`;
    }

    const i18n = {
        en: {
            document_title: "MetaGeny - Creative Random Extractor",
            app_title: "MetaGeny",
            app_subtitle: "Randomly extract inspiration skeletons from 'Creative Worlds'",
            tab_generator: "Generator",
            tab_favorites: "Favorites",
            tab_graph: "Graph",
            world_names: {
                advertising: "Advertising",
                product_photography: "Product Photography",
                concept_art: "Concept Art",
                documentary: "Documentary",
                meme_logic: "Meme Logic",
                miniature_fantasy: "Miniature Fantasy"
            },
            label_imaging: "Imaging Assumption:",
            label_world: "Select Creative World:",
            label_intent: "Creation Intent:",
            label_logic: "Generation Logic:",
            option_any: "Random",
            label_lang: "Language:",
            btn_generate: "Generate Creative Skeleton",
            btn_generating: "Generating...",
            copy_json: "Copy JSON",
            label_core_tension: "Core Tension",
            label_twist_mechanisms: "Twist Mechanisms",
            hint_twist_select: "(Select multiple, leave empty for random)",
            label_subject_kit: "Subject Kit",
            label_stage_context: "Stage Context",
            label_composition_rule: "Composition Rule",
            label_lighting_rule: "Lighting Rule",
            hint_world_locked: "Pick a specific world to unlock manual controls.",
            fav_add: "Add to Favorites",
            fav_remove: "Remove from Favorites",
            label_inspiration_seed: "Inspiration Seed",
            hint_inspiration_seed: "(Enter keywords like: luxury, micro, metal, absurd, etc.)",
            placeholder_inspiration_seed: "luxury metal micro / 奢华 金属 微观",
            system_overview_eyebrow: "Variables Library",
            system_overview_title: "Sub-dimension Overview",
            system_total_label: "Total variable entries",
            system_dimension_labels: {
                core_tension: "Core tensions",
                twist_mechanisms: "Twist mechanisms",
                subject_kits: "Subject kits",
                stage_context: "Stage options",
                composition_rule: "Composition rules",
                lighting_rule: "Lighting rules"
            },
            card_labels: {
                imaging_assumption: "Imaging Assumption",
                creation_intent: "Creation Intent",
                generation_logic: "Generation Logic",
                id: "ID",
                deliverable_type: "Deliverable Type",
                core_tension: "Core Tension",
                twist_mechanisms: "Twist Mechanisms",
                subject_kit: "Subject Kit",
                stage_context: "Stage Context",
                composition_rule: "Composition Rule",
                lighting_rule: "Lighting Rule",
                oblique_strategy: "Oblique Strategy",
                creative_directive: "Provocative Directive"
            },
            label_oblique_strategy: "Enable Oblique Strategies",
            label_provocative_directive: "Enable Provocative Directives",
            exploration_map_title: "Exploration Map",
            btn_explore_unknown: "Explore Unknown Areas",
            graph_subtitle: "Network",
            graph_title: "Radial Atlas",
            graph_scope_label: "All creative worlds",
            graph_root_label: "MetaGeny Atlas",
            graph_hint: "The star graph reveals each world's tensions, twists, and staging presets, forming one animated network.",
            graph_empty: "Loading graph…",
            graph_categories: {
                core_tension: "Core Tension",
                twist_mechanisms_pool: "Twist Mechanisms",
                stage_context: "Stage Context",
                composition_rule: "Composition Rule",
                lighting_rule: "Lighting Rule",
                deliverable_type: "Deliverables",
                entry_point: "Entry Points",
                subject_kits: "Subject Kits"
            }
        },
        zh: {
            document_title: "MetaGeny - 创意随机抽取器",
            app_title: "MetaGeny",
            app_subtitle: "从“创意世界”中随机抽取灵感骨架",
            label_imaging: "成像档位:",
            label_world: "创意世界:",
            label_intent: "创作动机:",
            label_logic: "生成逻辑:",
            option_any: "随机",
            label_lang: "语言:",
            btn_generate: "重新生成",
            tab_generator: "生成器",
            tab_favorites: "收藏夹",
            tab_graph: "图谱",
            favorites_title: "收藏夹",
            favorites_view: "收藏夹",
            no_results: "未生成结果。",
            no_favorites: "暂无收藏创意",
            btn_generating: "生成中...",
            copy_json: "复制 JSON",
            label_core_tension: "核心张力",
            label_twist_mechanisms: "反转机制",
            hint_twist_select: "可多选，留空则随机",
            label_subject_kit: "主体套件",
            label_stage_context: "场景语境",
            label_composition_rule: "构图规则",
            label_lighting_rule: "布光规则",
            hint_world_locked: "选择具体创意世界后可手动锁定上述维度。",
            fav_add: "收藏",
            fav_remove: "取消收藏",
            label_inspiration_seed: "灵感种子",
            hint_inspiration_seed: "(输入关键词如：奢华、微观、金属、荒诞等)",
            placeholder_inspiration_seed: "luxury metal micro / 奢华 金属 微观",
            system_overview_eyebrow: "变量库",
            system_overview_title: "子维度变量总览",
            system_total_label: "变量条目总数",
            system_dimension_labels: {
                core_tension: "核心张力",
                twist_mechanisms: "反转机制",
                subject_kits: "主体套件",
                stage_context: "场景语境",
                composition_rule: "构图规则",
                lighting_rule: "布光规则"
            },
            card_labels: {
                imaging_assumption: "成像假设",
                creation_intent: "创作动机",
                generation_logic: "生成逻辑",
                id: "ID",
                deliverable_type: "交付类型",
                core_tension: "核心张力",
                twist_mechanisms: "反转机制",
                subject_kit: "主体套件",
                stage_context: "场景语境",
                composition_rule: "构图规则",
                lighting_rule: "布光规则",
                oblique_strategy: "斜行策略",
                creative_directive: "挑衅指令"
            },
            label_oblique_strategy: "启用斜行策略 (Oblique Strategies)",
            label_provocative_directive: "启用挑衅指令 (Provocative Directives)",
            exploration_map_title: "探索图谱 (Exploration Map)",
            btn_explore_unknown: "探索未知领域",
            world_names: {
                advertising: "广告",
                product_photography: "产品摄影",
                concept_art: "概念艺术",
                documentary: "纪实摄影",
                meme_logic: "迷因逻辑",
                miniature_fantasy: "微缩奇幻"
            },
            graph_subtitle: "维度网络",
            graph_title: "图谱视角",
            graph_scope_label: "全量创意世界",
            graph_root_label: "MetaGeny 图谱",
            graph_hint: "图谱以星型方式呈现场景、张力、反转等要素，所有世界共同组成动态网状结构。",
            graph_empty: "图谱加载中…",
            graph_categories: {
                core_tension: "核心张力",
                twist_mechanisms_pool: "反转机制",
                stage_context: "场景语境",
                composition_rule: "构图规则",
                lighting_rule: "布光规则",
                deliverable_type: "交付类型",
                entry_point: "切入方式",
                subject_kits: "主体套件"
            }
        }
    };



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
        // 重新生成卡片以应用新语言
        if (resultsArea && resultsArea.children.length > 0) {
            generateIdeas();
        }
    });

    function updateUILanguage(lang) {
        const texts = i18n[lang];
        if (texts.document_title) document.title = texts.document_title;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (texts[key]) el.textContent = texts[key];
        });

        document.querySelectorAll('.card').forEach(card => updateCardLabels(card, lang));
        document.querySelectorAll('.copy-btn').forEach(btn => btn.title = texts.copy_json);
        document.querySelectorAll('.fav-btn').forEach(btn => {
            const isFav = btn.querySelector('svg').getAttribute('fill') === '#D4AF37';
            btn.title = isFav ? texts.fav_remove : texts.fav_add;
        });

        if (resultsArea && resultsArea.innerHTML.includes('<p')) {
            if (resultsArea.textContent.trim() === i18n.en.no_results || resultsArea.textContent.trim() === i18n.zh.no_results) {
                resultsArea.innerHTML = `<p style="width:100%; text-align:center;">${texts.no_results}</p>`;
            }
        }
        if (favoritesArea && favoritesArea.innerHTML.includes('<p')) {
            favoritesArea.innerHTML = `<p style="width:100%; text-align:center; color:#999;">${texts.no_favorites}</p>`;
        }

        if (globalConfig) {
            populateDropdowns(globalConfig);
            renderSystemSummary(globalConfig);
            populateWorldDimensionControls(worldSelect ? worldSelect.value : 'any', true);
            visualizeExplorationMap();


        } else {
            resetWorldDimensionControls();

        }

        if (worldSelect) {
            if (!globalConfig) {
                Array.from(worldSelect.options).forEach(option => {
                    if (option.value === 'any') {
                        option.textContent = texts.option_any;
                    } else {
                        option.textContent = formatWorldName(option.value);
                    }
                });
            }
            const customTriggerText = document.querySelector('.custom-select__trigger span');
            if (customTriggerText && worldSelect.selectedOptions[0]) {
                customTriggerText.textContent = worldSelect.selectedOptions[0].textContent;
            }
            const customSelect = document.querySelector('.custom-select');
            if (customSelect) {
                const optionsContainer = customSelect.querySelector('.custom-options');
                if (optionsContainer) {
                    optionsContainer.innerHTML = '';
                    Array.from(worldSelect.options).forEach(option => {
                        const customOption = document.createElement('span');
                        customOption.className = 'custom-option';
                        if (option.selected) customOption.classList.add('selected');
                        customOption.dataset.value = option.value;
                        customOption.textContent = option.textContent;
                        customOption.addEventListener('click', function () {
                            worldSelect.value = this.dataset.value;
                            const triggerText = customSelect.querySelector('.custom-select__trigger span');
                            if (triggerText) triggerText.textContent = this.textContent;
                            customSelect.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
                            this.classList.add('selected');
                            customSelect.classList.remove('open');
                        });
                        optionsContainer.appendChild(customOption);
                    });
                }
            }
        }
    }

    function updateCardLabels(card, lang) {
        const labels = i18n[lang].card_labels;
        card.querySelectorAll('[data-i18n-label]').forEach(labelEl => {
            const key = labelEl.getAttribute('data-i18n-label');
            if (labels[key]) labelEl.textContent = labels[key];
        });
    }

    fetch('/api/config')
        .then(res => res.json())
        .then(config => {
            if (config && Array.isArray(config.worlds)) {
                const worldMap = {};
                config.worlds.forEach(name => { worldMap[name] = null; });
                config.worlds = worldMap;
            }
            globalConfig = config;
            populateDropdowns(config);
            renderSystemSummary(config);
            const worldValue = worldSelect ? worldSelect.value : 'any';
            populateWorldDimensionControls(worldValue);

            // 自动生成3个默认卡片
            generateIdeas();
        })
        .catch(err => console.error('Failed to load config:', err));

    function populateDropdowns(config) {
        if (!config) return;
        const { worlds, intents, logics, imaging_assumptions } = config;
        const worldKeys = Array.isArray(worlds) ? worlds : Object.keys(worlds || {});
        const lang = localStorage.getItem('idea_lang') || 'en';

        // 1. Populate Imaging Assumptions
        if (imagingSelect && imaging_assumptions) {
            const currentVal = imagingSelect.value;
            imagingSelect.innerHTML = '';
            Object.values(imaging_assumptions).forEach(img => {
                const option = document.createElement('option');
                option.value = img.id;
                option.textContent = t(img.desc, lang);
                imagingSelect.appendChild(option);
            });
            if (currentVal && imagingSelect.querySelector(`option[value="${currentVal}"]`)) {
                imagingSelect.value = currentVal;
            } else if (imagingSelect.options.length > 0) {
                imagingSelect.selectedIndex = 0;
            }
        }

        // 2. Populate Intents
        if (intentSelect && intents) {
            const currentVal = intentSelect.value;
            intentSelect.innerHTML = `<option value="any">${i18n[lang].option_any}</option>`;
            Object.values(intents).forEach(intent => {
                const option = document.createElement('option');
                option.value = intent.id;
                option.textContent = t(intent.desc, lang);
                intentSelect.appendChild(option);
            });
            if (currentVal && intentSelect.querySelector(`option[value="${currentVal}"]`)) {
                intentSelect.value = currentVal;
            }
        }

        // 3. Populate Logics
        if (logicSelect && logics) {
            const currentVal = logicSelect.value;
            logicSelect.innerHTML = `<option value="any">${i18n[lang].option_any}</option>`;
            Object.values(logics).forEach(logic => {
                const option = document.createElement('option');
                option.value = logic.id;
                option.textContent = t(logic.desc, lang);
                logicSelect.appendChild(option);
            });
            if (currentVal && logicSelect.querySelector(`option[value="${currentVal}"]`)) {
                logicSelect.value = currentVal;
            }
        }

        // 4. Populate Worlds
        if (worldSelect && worldKeys.length > 0) {
            const currentVal = worldSelect.value;
            worldSelect.innerHTML = `<option value="any">${i18n[lang].option_any}</option>`;
            worldKeys.forEach(world => {
                const option = document.createElement('option');
                option.value = world;
                option.textContent = formatWorldName(world);
                worldSelect.appendChild(option);
            });
            if (currentVal && worldSelect.querySelector(`option[value="${currentVal}"]`)) {
                worldSelect.value = currentVal;
            }
        }
    }







    function truncateLabel(label, maxLength) {
        if (!label) return '';
        if (label.length <= maxLength) return label;
        return `${label.substring(0, maxLength - 1)}…`;
    }



    function renderSystemSummary(config) {
        if (!config || !config.worlds) return;
        const summaryEl = document.getElementById('system-summary');
        const totalEl = document.getElementById('system-total');
        if (!summaryEl || !totalEl) return;
        const lang = localStorage.getItem('idea_lang') || 'en';
        const dimensionLabels = (i18n[lang] && i18n[lang].system_dimension_labels) || {};
        const dimensions = [
            { key: 'core_tension', label: dimensionLabels.core_tension || 'Core tensions' },
            { key: 'twist_mechanisms_pool', label: dimensionLabels.twist_mechanisms || 'Twist mechanisms' },
            { key: 'subject_kits', label: dimensionLabels.subject_kits || 'Subject kits' },
            { key: 'stage_context', label: dimensionLabels.stage_context || 'Stage context' },
            { key: 'composition_rule', label: dimensionLabels.composition_rule || 'Composition' },
            { key: 'lighting_rule', label: dimensionLabels.lighting_rule || 'Lighting' }
        ];
        summaryEl.innerHTML = '';
        let totalCount = 0;
        Object.entries(config.worlds).forEach(([worldId, worldCfg]) => {
            const card = document.createElement('div');
            card.className = 'system-card';
            const title = document.createElement('div');
            title.className = 'system-card__title';
            title.textContent = formatWorldName(worldId);
            card.appendChild(title);
            const list = document.createElement('ul');
            list.className = 'system-card__list';
            dimensions.forEach(dimension => {
                const pool = worldCfg[dimension.key];
                const count = Array.isArray(pool) ? pool.length : 0;
                totalCount += count;
                const li = document.createElement('li');
                li.innerHTML = `<span>${dimension.label}</span><strong>${count}</strong>`;
                list.appendChild(li);
            });
            card.appendChild(list);
            summaryEl.appendChild(card);
        });
        totalEl.textContent = totalCount;
    }

    function generateIdeas() {
        const world = worldSelect ? worldSelect.value : 'any';
        const intent = intentSelect ? intentSelect.value : 'any';
        const logic = logicSelect ? logicSelect.value : 'any';
        const imaging_assumption = imagingSelect ? imagingSelect.value : 'industrial_product_photography';
        const inspirationSeed = document.getElementById('inspiration-seed-input')?.value || null;
        const lang = document.getElementById('lang-select').value;
        const overrides = collectOverrides(world);
        const oblique_strategy_enabled = document.getElementById('oblique-strategy-toggle')?.checked || false;
        const provocative_directive_enabled = document.getElementById('provocative-directive-toggle')?.checked || false;

        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.7';
        generateBtn.style.cursor = 'wait';

        fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ world, intent, logic, imaging_assumption, n: 3, lang, mode: 'full', inspirationSeed, overrides, oblique_strategy_enabled, provocative_directive_enabled })
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    resultsArea.innerHTML = '';
                    renderResults(data);
                    resultsArea.scrollIntoView({ behavior: 'smooth' });

                    // Track world frequency for exploration map
                    data.forEach(item => {
                        const worldId = item.creative_world.replace('world:', '');
                        trackExploration(worldId);
                    });
                    visualizeExplorationMap();
                }
            })
            .catch(err => console.error('Generation Error:', err))
            .finally(() => {
                generateBtn.disabled = false;
                generateBtn.style.opacity = '1';
                generateBtn.style.cursor = 'pointer';
            });
    }

    if (generateBtn) generateBtn.addEventListener('click', generateIdeas);

    function collectOverrides(worldId) {
        if (worldId === 'any') return {};
        const overrides = {};
        if (coreSelect && coreSelect.value !== 'any') overrides.core_tension = coreSelect.value;
        if (twistSelect) {
            const selected = Array.from(twistSelect.selectedOptions).map(o => o.value).filter(v => v !== 'any');
            if (selected.length > 0) overrides.twist_mechanisms = selected;
        }
        if (subjectSelect && subjectSelect.value !== 'any') overrides.subject_kit = subjectSelect.value;
        if (stageSelect && stageSelect.value !== 'any') overrides.stage_context = stageSelect.value;
        if (compositionSelect && compositionSelect.value !== 'any') overrides.composition_rule = compositionSelect.value;
        if (lightingSelect && lightingSelect.value !== 'any') overrides.lighting_rule = lightingSelect.value;
        return overrides;
    }

    function populateWorldDimensionControls(worldId, preserveSelection = false) {
        if (!globalConfig || !globalConfig.worlds) return;
        const dimensions = [
            { id: 'core', key: 'core_tension', el: coreSelect },
            { id: 'twist', key: 'twist_mechanisms_pool', el: twistSelect },
            { id: 'subject', key: 'subject_kits', el: subjectSelect },
            { id: 'stage', key: 'stage_context', el: stageSelect },
            { id: 'composition', key: 'composition_rule', el: compositionSelect },
            { id: 'lighting', key: 'lighting_rule', el: lightingSelect }
        ];
        const controlsContainer = document.querySelector('.world-controls');
        const lang = localStorage.getItem('idea_lang') || 'en';

        if (worldId === 'any') {
            controlsContainer?.classList.add('locked');
            dimensions.forEach(dim => { if (dim.el) { dim.el.innerHTML = `<option value="any">${i18n[lang].option_any}</option>`; dim.el.disabled = true; } });
            return;
        }

        controlsContainer?.classList.remove('locked');
        const worldData = globalConfig.worlds[worldId];
        dimensions.forEach(dim => {
            if (!dim.el) return;
            const prevValue = preserveSelection ? dim.el.value : 'any';
            dim.el.innerHTML = `<option value="any">${i18n[lang].option_any}</option>`;
            dim.el.disabled = false;

            if (!worldData) {
                console.warn(`World data not found for ID: ${worldId}`);
                return;
            }

            const pool = worldData[dim.key] || [];
            pool.forEach(item => {
                const option = document.createElement('option');
                option.value = getOptionId(dim.key, item);
                option.textContent = getDisplayText(item, lang);
                dim.el.appendChild(option);
            });
            dim.el.value = (Array.from(dim.el.options).some(o => o.value === prevValue)) ? prevValue : 'any';
        });
    }

    function resetWorldDimensionControls() {
        const dimensions = [
            { el: coreSelect },
            { el: twistSelect },
            { el: subjectSelect },
            { el: stageSelect },
            { el: compositionSelect },
            { el: lightingSelect }
        ];
        const controlsContainer = document.querySelector('.world-controls');
        const lang = localStorage.getItem('idea_lang') || 'en';

        controlsContainer?.classList.add('locked');
        dimensions.forEach(dim => {
            if (dim.el) {
                dim.el.innerHTML = `<option value="any">${i18n[lang].option_any}</option>`;
                dim.el.disabled = true;
            }
        });
    }

    function getOptionId(dimension, item) {
        if (item && typeof item === 'object') {
            if (item.id) return item.id;
            const val = item.en || item.zh || (item.primary_subject ? item.primary_subject.en : null);
            if (val) return slugify(val);
        }
        if (dimension === 'twist_mechanisms') return String(item);
        return slugify(String(item));
    }

    function slugify(text) {
        return text.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    function formatWorldName(name) {
        const lang = localStorage.getItem('idea_lang') || 'en';
        if (!name) return 'Unknown World';
        if (globalConfig && globalConfig.worlds && globalConfig.worlds[name] && globalConfig.worlds[name].name) return t(globalConfig.worlds[name].name, lang);
        if (i18n[lang]?.world_names?.[name]) return i18n[lang].world_names[name];
        return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function getVal(item, lang) { return t(item, lang); }

    function getDisplayText(item, lang) {
        if (!item) return '';
        if (typeof item === 'string') return t(item, lang);
        if (item.desc) return t(item.desc, lang);
        if (item.primary_subject) return t(item.primary_subject, lang);
        return t(item, lang);
    }

    function createCardElement(item) {
        const lang = localStorage.getItem('idea_lang') || 'en';
        const labels = i18n[lang].card_labels;

        const card = document.createElement('div');
        card.className = 'card';
        if (item.validation && item.validation.errors.length > 0) {
            card.className += ' card--has-errors';
        }

        const clean = (val) => {
            if (typeof val === 'string' && val.includes(':')) {
                return val.split(':').slice(1).join(':');
            }
            return val;
        };

        // Twist Mechanisms: Guaranteed String[]
        const twistList = item.twist_mechanisms || [];
        const twistTags = twistList.map(text =>
            `<span class="tag">${t(text, lang)}</span>`
        ).join(' ') || '<span class="tag">-</span>';

        // Subject Kit: Guaranteed Object { primary_subject, secondary_elements: [] }
        let subjectHtml = '';
        if (item.subject_kit) {
            const primary = t(item.subject_kit.primary_subject, lang);
            const secondaryList = item.subject_kit.secondary_elements || [];
            const secondary = secondaryList.map(el =>
                `<span class="tag tag--secondary">${t(el, lang)}</span>`
            ).join('');

            subjectHtml = `
                <div class="editable-value-container">
                    <div class="card-value editable-value" data-dimension="subject_kit" data-world="${item.creative_world}">${primary}</div>
                    <button class="quick-random-btn" title="Quick Randomize"><i class="ri-shuffle-line"></i></button>
                </div>
                ${secondary ? `<div class="tags" style="margin-top:0.25rem;">${secondary}</div>` : ''}
            `;
        } else {
            subjectHtml = `<div class="card-value">-</div>`;
        } // Fallback if server fails: -

        // Validation Feedback
        let validationHtml = '';
        if (item.validation) {
            if (item.validation.errors && item.validation.errors.length > 0) {
                validationHtml += `<div class="card-alert card-alert--error" style="color:red; font-size:0.8em; padding:5px; background:#ffeeee; border-radius:4px; margin-bottom:10px;">⚠️ ${item.validation.errors.join('<br>')}</div>`;
            }
            if (item.validation.warnings && item.validation.warnings.length > 0) {
                validationHtml += `<div class="card-alert card-alert--warning" style="color:orange; font-size:0.8em; padding:5px; background:#fff8e0; border-radius:4px; margin-bottom:10px;">⚠️ ${item.validation.warnings.join('<br>')}</div>`;
            }
        }

        // Emergence Display
        let emergenceHtml = '';
        if (item.emergence) {
            emergenceHtml = `<div class="emergence-badge" title="Emergence Score: ${item.emergence.score}">${t(item.emergence.label, lang)}</div>`;
        }

        card.innerHTML = `
            <div class="card-header" data-world-id="${item.creative_world ? item.creative_world.replace('world:', '') : ''}">
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <h3>${formatWorldName(item.creative_world ? item.creative_world.replace('world:', '') : 'Unknown')}</h3>
                    ${emergenceHtml}
                </div>
                <div class="card-header-actions" style="display:flex; gap:10px;">
                     <button class="icon-btn fav-btn" title="${i18n[lang].fav_add}" style="background:none; border:none; cursor:pointer; color:#95a5a6;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn copy-btn" title="${i18n[lang].copy_json}" style="background:none; border:none; cursor:pointer; color:#95a5a6;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            </div>

            ${validationHtml}


            <div class="card-item">
                <span class="card-label" data-i18n-label="imaging_assumption">${labels.imaging_assumption}</span>
                <div class="editable-value-container">
                    <span class="card-value editable-value" data-dimension="imaging_assumption" data-id="${item.imaging_assumption_id || ''}">${t(item.imaging_assumption, lang)}</span>
                    <button class="quick-random-btn" title="Quick Randomize"><i class="ri-shuffle-line"></i></button>
                </div>
            </div>
            <div class="card-item">
                <span class="card-label" data-i18n-label="creation_intent">${labels.creation_intent}</span>
                <div class="editable-value-container">
                    <span class="card-value editable-value" data-dimension="creation_intent" data-id="${item.creation_intent_id || ''}">${t(item.creation_intent, lang)}</span>
                    <button class="quick-random-btn" title="Quick Randomize"><i class="ri-shuffle-line"></i></button>
                </div>
            </div>
            <div class="card-item">
                <span class="card-label" data-i18n-label="generation_logic">${labels.generation_logic}</span>
                <div class="editable-value-container">
                    <span class="card-value editable-value" data-dimension="generation_logic" data-id="${item.generation_logic_id || ''}">${t(item.generation_logic, lang)}</span>
                    <button class="quick-random-btn" title="Quick Randomize"><i class="ri-shuffle-line"></i></button>
                </div>
            </div>


            <div class="card-item item--hero" style="background:transparent; border-left:none; padding-left:0; margin-bottom:0.5rem;">
                <span class="card-label" style="display:none;" data-i18n-label="subject_kit">${labels.subject_kit}</span>
                <div class="editable-value-container">
                     <!-- Primary Subject (Large) -->
                    <div class="card-value editable-value" data-dimension="subject_kit" data-world="${item.creative_world}" data-id="${item.subject_kit ? item.subject_kit.primary_id : ''}" style="font-size:1.4rem; font-weight:600; color:#000;">${item.subject_kit ? t(item.subject_kit.primary_subject, lang) : '-'}</div>
                    <button class="quick-random-btn" title="Quick Randomize"><i class="ri-shuffle-line"></i></button>
                </div>
                <!-- Secondary Tags -->
                ${item.subject_kit && item.subject_kit.secondary_elements ?
                `<div class="tags" style="margin-top:0.25rem;">${item.subject_kit.secondary_elements.map(el => `<span class="tag tag--secondary">${t(el, lang)}</span>`).join('')}</div>`
                : ''}
            </div>


            <div class="card-item item--hero" style="background:transparent; border-left:3px solid var(--accent-color); padding-left:0.5rem;">
                <span class="card-label" style="color:var(--accent-color); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;" data-i18n-label="core_tension">${labels.core_tension}</span>
                <div class="editable-value-container">
                    <span class="card-value editable-value" data-dimension="core_tension" data-world="${item.creative_world}" data-id="${item.core_tension_id || ''}" style="font-size:1.1rem; font-family:var(--font-heading); color:#2c3e50;">${t(item.core_tension, lang)}</span>
                    <button class="quick-random-btn" title="Quick Randomize"><i class="ri-shuffle-line"></i></button>
                </div>
            </div>


            <div class="card-item">
                <span class="card-label" data-i18n-label="twist_mechanisms">${labels.twist_mechanisms}</span>
                <div class="editable-value-container">
                    <div class="tags editable-value" data-dimension="twist_mechanisms" data-world="${item.creative_world}" data-ids='${JSON.stringify(item.twist_ids || [])}'>${twistTags}</div>
                    <button class="quick-random-btn" title="Quick Randomize"><i class="ri-shuffle-line"></i></button>
                </div>
            </div>

            <div class="card-item">
                <span class="card-label" data-i18n-label="deliverable_type">${labels.deliverable_type}</span>
                <div class="editable-value-container">
                    <span class="card-value editable-value" data-dimension="deliverable_type" data-world="${item.creative_world}">${t(item.deliverable_type, lang)}</span>
                    <button class="quick-random-btn" title="Quick Randomize"><i class="ri-shuffle-line"></i></button>
                </div>
            </div>
            
            <div class="card-item">
                <span class="card-label" data-i18n-label="stage_context">${labels.stage_context}</span>
                <div class="editable-value-container">
                    <span class="card-value editable-value" data-dimension="stage_context" data-world="${item.creative_world}" data-id="${item.stage_context_id || ''}">${t(item.stage_context, lang)}</span>
                     <button class="quick-random-btn" title="Quick Randomize"><i class="ri-shuffle-line"></i></button>
                </div>
            </div>

            <div class="card-item">
                <span class="card-label" data-i18n-label="composition_rule">${labels.composition_rule}</span>
                <div class="editable-value-container">
                    <span class="card-value editable-value" data-dimension="composition_rule" data-world="${item.creative_world}" data-id="${item.composition_rule_id || ''}">${t(item.composition_rule, lang)}</span>
                     <button class="quick-random-btn" title="Quick Randomize"><i class="ri-shuffle-line"></i></button>
                </div>
            </div>

            <div class="card-item">
                <span class="card-label" data-i18n-label="lighting_rule">${labels.lighting_rule}</span>
                <div class="editable-value-container">
                    <span class="card-value editable-value" data-dimension="lighting_rule" data-world="${item.creative_world}" data-id="${item.lighting_rule_id || ''}">${t(item.lighting_rule, lang)}</span>
                     <button class="quick-random-btn" title="Quick Randomize"><i class="ri-shuffle-line"></i></button>
                </div>
            </div>

            ${item.oblique_strategy ? `
            <div class="card-breakout">
                <strong data-i18n="label_oblique_strategy">${i18n[lang].card_labels.oblique_strategy}</strong>
                <div class="card-value">${item.oblique_strategy.desc}</div>
            </div>
            ` : ''}

            ${item.creative_directive ? `
            <div class="card-breakout">
                <strong data-i18n="label_provocative_directive">${i18n[lang].card_labels.creative_directive}</strong>
                <div class="card-value">${item.creative_directive}</div>
            </div>
            ` : ''}

            <div class="card-item item--id">
                <span class="card-label" data-i18n-label="id">${labels.id}</span>
                <span class="card-value">${item.creative_id}</span>
            </div>

            ${item.final_prompt ? `
            <div class="card-item item--prompt">
                <span class="card-label">Prompt Preview</span>
                <div class="prompt-preview" style="margin-bottom:10px;">${item.final_prompt}</div>
                <button class="icon-btn copy-prompt-btn" title="Copy Prompt" style="background:none; border:none; cursor:pointer; color:#95a5a6; padding:0; height:auto; display:flex; align-items:center; gap:5px;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span style="font-size:0.7em;">COPY PROMPT</span>
                </button>
            </div>` : ''
            }
        `;

        const favBtn = card.querySelector('.fav-btn');
        const favorites = JSON.parse(localStorage.getItem('idea_favorites') || '[]');
        const isAlreadyFav = favorites.some(f => f.creative_id === item.creative_id);
        if (isAlreadyFav) {
            favBtn.querySelector('svg').setAttribute('fill', '#D4AF37');
            favBtn.querySelector('svg').setAttribute('stroke', '#D4AF37');
            favBtn.title = i18n[lang].fav_remove;
        }

        favBtn.addEventListener('click', () => toggleFavorite(item, favBtn));
        card.querySelector('.copy-btn').addEventListener('click', function () {
            navigator.clipboard.writeText(JSON.stringify(item, null, 2));
            showToast('JSON Copied');
            const originalHtml = this.innerHTML;
            this.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2e7d32" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            setTimeout(() => this.innerHTML = originalHtml, 2000);
        });

        return card;
    }

    function toggleFavorite(item, btn) {
        const lang = localStorage.getItem('idea_lang') || 'en';
        let favorites = JSON.parse(localStorage.getItem('idea_favorites') || '[]');
        const idx = favorites.findIndex(f => f.creative_id === item.creative_id);
        const svg = btn.querySelector('svg');

        if (idx > -1) {
            favorites.splice(idx, 1);
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            btn.title = i18n[lang].fav_add;
            showToast('Removed from Favorites');
        } else {
            favorites.unshift(item);
            svg.setAttribute('fill', '#D4AF37');
            svg.setAttribute('stroke', '#D4AF37');
            btn.title = i18n[lang].fav_remove;
            showToast('Added to Favorites');
        }
        localStorage.setItem('idea_favorites', JSON.stringify(favorites));
        if (document.getElementById('tab-favorites').classList.contains('active')) loadFavorites();
    }

    function loadFavorites() {
        if (!favoritesArea) return;
        const lang = localStorage.getItem('idea_lang') || 'en';
        const favorites = JSON.parse(localStorage.getItem('idea_favorites') || '[]');
        favoritesArea.innerHTML = '';
        if (favorites.length === 0) {
            favoritesArea.innerHTML = `<p style="width:100%; text-align:center; color:#999; margin-top:2rem;">${i18n[lang].no_favorites}</p>`;
            return;
        }
        favorites.forEach(item => {
            if (!item.selected_fields) {
                item.selected_fields = {
                    deliverable_type: { selected_value: 'unknown' },
                    core_tension: { selected_value: 'unknown' },
                    twist_mechanisms: [],
                    subject_kit: { selected_value: 'unknown' },
                    stage_context: { selected_value: 'unknown' },
                    composition_rule: { selected_value: 'unknown' },
                    lighting_rule: { selected_value: 'unknown' }
                };
            }
            favoritesArea.appendChild(createCardElement(item));
        });
    }

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2000);
    }



    function renderResults(results) {
        if (!results || results.length === 0) {
            const lang = localStorage.getItem('idea_lang') || 'en';
            resultsArea.innerHTML = `<p style="width:100%; text-align:center;">${i18n[lang].no_results}</p>`;
            return;
        }
        results.forEach(item => resultsArea.appendChild(createCardElement(item)));

        // Re-attach event listeners for editable fields
        setTimeout(() => bindEditableEvents(), 100);
    }

    /* ===== POPOVER LOGIC ===== */
    let activeEditableConfig = null;
    let activeEditableElement = null;

    // Create Popover DOM
    const popoverDiv = document.createElement('div');
    popoverDiv.className = 'edit-popover';
    popoverDiv.innerHTML = `
        <div class="popover-header">
            <input type="text" class="popover-search" placeholder="Search...">
            <button class="popover-random-btn" title="Randomize"><i class="ri-shuffle-line"></i></button>
        </div>
        <div class="popover-list"></div>
    `;
    document.body.appendChild(popoverDiv);

    const popoverSearch = popoverDiv.querySelector('.popover-search');
    const popoverList = popoverDiv.querySelector('.popover-list');
    const popoverRandomBtn = popoverDiv.querySelector('.popover-random-btn');

    // Close popover on click outside
    document.addEventListener('click', (e) => {
        if (!popoverDiv.contains(e.target) && !e.target.classList.contains('editable-value')) {
            popoverDiv.classList.remove('active');
        }
    });

    function bindEditableEvents() {
        // 1. Text Click -> Open Popover
        document.querySelectorAll('.editable-value').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                openPopover(el);
            });
        });

        // 2. Random Button Click -> Quick Randomize
        document.querySelectorAll('.quick-random-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Find sibling editable value
                const container = btn.closest('.editable-value-container');
                const valueEl = container.querySelector('.editable-value');
                if (valueEl) quickRandomize(valueEl, btn);
            });
        });
    }

    function quickRandomize(el, btn) {
        // No animation, just logic
        const dimension = el.dataset.dimension;
        let pool = [];

        // 1. Check Global Pools
        const globalMapping = {
            'imaging_assumption': 'imaging_assumptions',
            'creation_intent': 'intents',
            'generation_logic': 'logics'
        };

        if (globalMapping[dimension]) {
            const key = globalMapping[dimension];
            if (globalConfig[key]) pool = Object.values(globalConfig[key]);
        } else {
            // 2. Check World-Specific Pools
            let worldPrefix = el.dataset.world || '';
            if (!worldPrefix) {
                const card = el.closest('.card');
                if (card) {
                    const header = card.querySelector('.card-header');
                    if (header && header.dataset.worldId) worldPrefix = header.dataset.worldId;
                }
            }
            if (worldPrefix.includes(':')) worldPrefix = worldPrefix.split(':')[1];
            if (!globalConfig || !globalConfig.worlds || !globalConfig.worlds[worldPrefix]) return;

            let poolKey = dimension;
            if (dimension === 'twist_mechanisms') poolKey = 'twist_mechanisms_pool';
            if (dimension === 'subject_kit') poolKey = 'subject_kits';

            pool = globalConfig.worlds[worldPrefix][poolKey];
        }

        if (!pool || !Array.isArray(pool) || pool.length === 0) return;

        // Pick random
        const randomItem = pool[Math.floor(Math.random() * pool.length)];

        // Update DOM
        activeEditableElement = el;
        updateEditableValue(randomItem);
        activeEditableElement = null;
    }

    function openPopover(el) {
        const dimension = el.dataset.dimension;
        let pool = [];

        // 1. Check Global Pools
        const globalMapping = {
            'imaging_assumption': 'imaging_assumptions',
            'creation_intent': 'intents',
            'generation_logic': 'logics'
        };

        if (globalMapping[dimension]) {
            const key = globalMapping[dimension];
            if (globalConfig[key]) pool = Object.values(globalConfig[key]);
        } else {
            // 2. Check World-Specific Pools
            let worldPrefix = el.dataset.world || '';
            if (!worldPrefix) {
                const card = el.closest('.card');
                if (card) {
                    const header = card.querySelector('.card-header');
                    if (header && header.dataset.worldId) worldPrefix = header.dataset.worldId;
                }
            }
            if (worldPrefix.includes(':')) worldPrefix = worldPrefix.split(':')[1];

            if (!globalConfig || !globalConfig.worlds || !globalConfig.worlds[worldPrefix]) {
                console.warn('World data not found for popover:', worldPrefix);
                return;
            }

            let poolKey = dimension;
            if (dimension === 'twist_mechanisms') poolKey = 'twist_mechanisms_pool';
            if (dimension === 'subject_kit') poolKey = 'subject_kits';

            pool = globalConfig.worlds[worldPrefix][poolKey];
        }

        if (!pool || !Array.isArray(pool)) {
            console.warn('Pool not found:', dimension);
            return;
        }

        activeEditableConfig = pool;
        activeEditableElement = el;

        // Postioning
        const rect = el.getBoundingClientRect();
        popoverDiv.style.top = `${window.scrollY + rect.bottom + 5}px`;
        popoverDiv.style.left = `${window.scrollX + rect.left}px`;

        // Reset Search
        popoverSearch.value = '';
        renderPopoverList(pool);

        popoverDiv.classList.add('active');
        setTimeout(() => popoverSearch.focus(), 50);
    }

    function renderPopoverList(items, filter = '') {
        popoverList.innerHTML = '';
        const lang = localStorage.getItem('idea_lang') || 'en';

        const filtered = items.filter(item => {
            const text = getDisplayText(item, lang).toLowerCase();
            return text.includes(filter.toLowerCase());
        });

        filtered.forEach(item => {
            const div = document.createElement('div');
            div.className = 'popover-item';
            div.textContent = getDisplayText(item, lang);
            div.addEventListener('click', () => {
                updateEditableValue(item);
                popoverDiv.classList.remove('active');
            });
            popoverList.appendChild(div);
        });

        if (filtered.length === 0) {
            popoverList.innerHTML = '<div style="padding:0.5rem; color:#999; font-size:0.8rem;">No matches</div>';
        }
    }

    // Search Handler
    popoverSearch.addEventListener('input', (e) => {
        if (activeEditableConfig) renderPopoverList(activeEditableConfig, e.target.value);
    });

    // Random Handler
    popoverRandomBtn.addEventListener('click', () => {
        if (activeEditableConfig && activeEditableConfig.length > 0) {
            const randomItem = activeEditableConfig[Math.floor(Math.random() * activeEditableConfig.length)];
            updateEditableValue(randomItem);
            // Optional: don't close popover to allow re-roll
            // popoverDiv.classList.remove('active');
        }
    });

    function updateEditableValue(newItem) {
        if (!activeEditableElement) return;
        const lang = localStorage.getItem('idea_lang') || 'en';
        const dimension = activeEditableElement.dataset.dimension;

        // Special handling for Subject Kit (object update)
        if (dimension === 'subject_kit' && typeof newItem === 'object') {
            const primary = t(newItem.primary_subject, lang);
            activeEditableElement.textContent = primary;

            // Find sibling tags container
            const container = activeEditableElement.closest('.card-item');
            const tagsDiv = container.querySelector('.tags:not(.editable-value)');

            const secondaryList = newItem.secondary_elements || [];
            const tagsHtml = secondaryList.map(el =>
                `<span class="tag tag--secondary">${t(el, lang)}</span>`
            ).join('');

            if (tagsDiv) {
                tagsDiv.innerHTML = tagsHtml;
                tagsDiv.style.display = tagsHtml ? 'flex' : 'none';
            } else if (tagsHtml) {
                // If tags div doesn't exist but we have tags now
                const newTagsDiv = document.createElement('div');
                newTagsDiv.className = 'tags';
                newTagsDiv.style.marginTop = '0.25rem';
                newTagsDiv.innerHTML = tagsHtml;
                container.appendChild(newTagsDiv);
            }
        } else if (dimension === 'twist_mechanisms') {
            const list = Array.isArray(newItem) ? newItem : [newItem];
            const tagsHtml = list.map(text =>
                `<span class="tag">${t(text, lang)}</span>`
            ).join(' ') || '<span class="tag">-</span>';
            activeEditableElement.innerHTML = tagsHtml;
        } else {
            // Plain string update
            activeEditableElement.textContent = getDisplayText(newItem, lang);
        }

        // Real-time regeneration
        const card = activeEditableElement.closest('.card');
        if (card) {
            regenerateCardWithConstraint(card, dimension, newItem);
        }

        // Flash effect
        const targetEl = activeEditableElement;
        targetEl.style.color = 'var(--accent-color)';
        setTimeout(() => targetEl.style.color = '', 300);
    }

    function regenerateCardWithConstraint(card, dimension, newItem) {
        // Collect current values from card
        const currentData = {
            world: card.querySelector('.card-header')?.dataset.worldId || 'unknown',
            overrides: {}
        };

        // Try to get more accurate world from an editable element
        const firstEditable = card.querySelector('.editable-value');
        if (firstEditable && firstEditable.dataset.world) {
            currentData.world = firstEditable.dataset.world.replace('world:', '');
        }

        card.querySelectorAll('.editable-value').forEach(el => {
            const dim = el.dataset.dimension;
            if (!dim) return;

            // Use the text content as a fallback or ID if available in dataset?
            // Existing cards might not have the ID stored in the DOM easily.
            // But we can pass the dimension being changed.

            // For the dimension being changed, use newItem
            if (dim === dimension) {
                currentData.overrides[dim] = getOptionId(dim, newItem);
            } else {
                // Preserve existing state using stored data-id
                if (dim === 'twist_mechanisms') {
                    if (el.dataset.ids) {
                        try {
                            currentData.overrides[dim] = JSON.parse(el.dataset.ids);
                        } catch (e) {
                            console.warn('Failed to parse twist IDs');
                        }
                    }
                } else if (el.dataset.id) {
                    const rawId = el.dataset.id;
                    // Strip legacy prefixes like 'subject:' if present
                    currentData.overrides[dim] = rawId.includes(':') ? rawId.split(':').pop() : rawId;
                }
            }
        });

        // Simplified: Just regenerate with the NEW constraint. 
        // If the user wanted to lock others, they should have used the top controls.
        // But the requirement says "保持其他维度不变，只更新这个维度".
        // This implies we should send ALL current values as overrides.

        const lang = localStorage.getItem('idea_lang') || 'en';

        // Let's try to find the IDs from the globalConfig if we only have text
        // This is complex. A better way would be storing IDs on the elements.
        // Looking at createCardElement, I didn't add data-id. Let's fix that.

        const payload = {
            world: currentData.world,
            n: 1,
            lang: lang,
            mode: 'full',
            overrides: currentData.overrides
        };

        // Show loading state on card
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';

        fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const newData = data[0];
                    // Diff-based Update to avoid flash

                    // 1. Update Emergence Badge (if changed)
                    const header = card.querySelector('.card-header');
                    const oldBadge = header.querySelector('.emergence-badge');
                    if (newData.emergence) {
                        const newBadgeHtml = `<div class="emergence-badge" title="Emergence Score: ${newData.emergence.score}">${t(newData.emergence.label, lang)}</div>`;
                        if (oldBadge) {
                            if (oldBadge.outerHTML !== newBadgeHtml) oldBadge.outerHTML = newBadgeHtml;
                        } else {
                            // Insert after title
                            const titleDiv = header.querySelector('div');
                            if (titleDiv) titleDiv.insertAdjacentHTML('beforeend', newBadgeHtml);
                        }
                    } else if (oldBadge) {
                        oldBadge.remove();
                    }

                    // 2. Update Validation Messages (rebuild container)
                    let validationHtml = '';
                    if (newData.validation) {
                        if (newData.validation.errors && newData.validation.errors.length > 0) {
                            validationHtml += `<div class="card-alert card-alert--error" style="color:red; font-size:0.8em; padding:5px; background:#ffeeee; border-radius:4px; margin-bottom:10px;">⚠️ ${newData.validation.errors.join('<br>')}</div>`;
                        }
                        if (newData.validation.warnings && newData.validation.warnings.length > 0) {
                            validationHtml += `<div class="card-alert card-alert--warning" style="color:orange; font-size:0.8em; padding:5px; background:#fff8e0; border-radius:4px; margin-bottom:10px;">⚠️ ${newData.validation.warnings.join('<br>')}</div>`;
                        }
                    }
                    // Find existing validation container or insert after header
                    let valContainer = card.querySelector('.card-alert');
                    if (valContainer) {
                        // If multiple alerts, remove all first
                        card.querySelectorAll('.card-alert').forEach(el => el.remove());
                    }
                    if (validationHtml) {
                        header.insertAdjacentHTML('afterend', validationHtml);
                    }

                    // 3. Update Editable Values
                    card.querySelectorAll('.editable-value').forEach(el => {
                        const dim = el.dataset.dimension;
                        if (!dim) return;

                        // Subject Kit Special Handling
                        if (dim === 'subject_kit') {
                            if (newData.subject_kit) {
                                const newPrimary = t(newData.subject_kit.primary_subject, lang);

                                // Update primary text if changed
                                if (el.textContent !== newPrimary) {
                                    el.textContent = newPrimary;
                                    el.dataset.id = newData.subject_kit.primary_id;
                                    flashElement(el);
                                }

                                // Update secondary tags
                                const container = el.closest('.card-item');
                                let tagsDiv = container.querySelector('.tags:not(.editable-value)');
                                const secondaryList = newData.subject_kit.secondary_elements || [];
                                const tagsHtml = secondaryList.map(item =>
                                    `<span class="tag tag--secondary">${t(item, lang)}</span>`
                                ).join('');

                                if (tagsDiv) {
                                    if (tagsDiv.innerHTML !== tagsHtml) tagsDiv.innerHTML = tagsHtml;
                                } else if (tagsHtml) {
                                    const newTagsDiv = document.createElement('div');
                                    newTagsDiv.className = 'tags';
                                    newTagsDiv.style.marginTop = '0.25rem';
                                    newTagsDiv.innerHTML = tagsHtml;
                                    container.appendChild(newTagsDiv);
                                }
                            }
                        }
                        // Twist Mechanisms Special Handling
                        else if (dim === 'twist_mechanisms') {
                            const newTwists = newData.twist_mechanisms || [];
                            const newIds = newData.twist_ids || [];
                            const newHtml = newTwists.map(text => `<span class="tag">${t(text, lang)}</span>`).join(' ') || '<span class="tag">-</span>';

                            if (el.innerHTML !== newHtml) {
                                el.innerHTML = newHtml;
                                el.dataset.ids = JSON.stringify(newIds);
                                flashElement(el);
                            }
                        }
                        // Standard Fields
                        else {
                            const valKey = dim; // field name matches dimension for most
                            let newVal = newData[valKey];
                            let newId = newData[`${valKey}_id`];

                            // Handling object structure if raw json returned (should actally be flattened by server for these fields usually, but checking)
                            if (typeof newVal === 'object' && newVal !== null) {
                                newVal = t(newVal, lang);
                            }

                            if (el.textContent !== newVal) {
                                el.textContent = newVal || '-';
                                if (newId) el.dataset.id = newId;
                                flashElement(el);
                            }
                        }
                    });

                    // 4. Update Prompts / Breakouts (Optional, if they change)
                    const promptEl = card.querySelector('.prompt-preview');
                    if (promptEl && newData.final_prompt && promptEl.textContent !== newData.final_prompt) {
                        promptEl.textContent = newData.final_prompt;
                    }

                    // Done. Remove loading state.
                    card.style.opacity = '1';
                    card.style.pointerEvents = 'auto';
                }
            })
            .catch(err => {
                console.error('Regeneration error:', err);
                card.style.opacity = '1';
                card.style.pointerEvents = 'auto';
            });
    }

    function flashElement(el) {
        el.style.transition = 'color 0.3s ease, background-color 0.3s ease';
        el.style.color = 'var(--accent-color)';
        setTimeout(() => {
            el.style.color = '';
        }, 500);
    }
});
