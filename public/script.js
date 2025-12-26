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

    // Tab switching logic (Nav Links)
    document.querySelectorAll('.tab-btn').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.dataset.tab;

            // Update link active state
            document.querySelectorAll('.tab-btn').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === `tab-${tabId}`);
            });

            if (tabId === 'favorites') {
                loadFavorites();
            }

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
                lighting_rule: "Lighting Rule"
            },
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
                lighting_rule: "布光规则"
            },
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

        if (intentSelect) {
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

        if (logicSelect) {
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

        if (worldSelect) {
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
        const inspirationSeed = null;
        const lang = document.getElementById('lang-select').value;
        const overrides = collectOverrides(world);

        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.7';
        generateBtn.style.cursor = 'wait';

        fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ world, intent, logic, imaging_assumption, n: 3, lang, mode: 'full', inspirationSeed, overrides })
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    resultsArea.innerHTML = '';
                    renderResults(data);
                    resultsArea.scrollIntoView({ behavior: 'smooth' });
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
            if (item.id) return `${dimension}:${item.id}`;
            const val = item.en || item.zh || (item.primary_subject ? item.primary_subject.en : null);
            if (val) return `${dimension}:${slugify(val)}`;
        }
        return `${dimension}:${slugify(String(item))}`;
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
        if (item.primary_subject) return t(item.primary_subject, lang);
        return t(item, lang);
    }

    function createCardElement(item) {
        const lang = localStorage.getItem('idea_lang') || 'en';
        const labels = i18n[lang].card_labels;
        const selected = item.selected_fields || {};
        const card = document.createElement('div');
        card.className = 'card';

        const clean = (val) => {
            if (typeof val === 'string' && val.includes(':')) {
                return val.split(':').slice(1).join(':');
            }
            return val;
        };

        const deliverableValue = clean(selected.deliverable_type?.selected_value || item.deliverable_type);
        const coreValue = clean(selected.core_tension?.selected_value || item.core_tension);
        const stageValue = clean(selected.stage_context?.selected_value || item.stage_context);
        const compositionValue = clean(selected.composition_rule?.selected_value || item.composition_rule);
        const lightingValue = clean(selected.lighting_rule?.selected_value || item.lighting_rule);

        let twistData = selected.twist_mechanisms || item.twist_mechanisms || [];
        if (twistData.selected_values && Array.isArray(twistData.selected_values)) {
            twistData = twistData.selected_values;
        } else if (twistData.selected_ids && Array.isArray(twistData.selected_ids)) {
            twistData = twistData.selected_ids;
        }

        const twistList = Array.isArray(twistData) ? twistData : [twistData];
        const twistTags = twistList
            .map(entry => {
                let val = (typeof entry === 'object' && entry) ? (entry.selected_value || entry.value || entry) : entry;
                return val && `<span class="tag">${t(clean(val), lang)}</span>`;
            })
            .filter(Boolean)
            .join(' ') || '<span class="tag">-</span>';

        const subjectKit = selected.subject_kit?.selected_value || item.subject_kit;
        let subjectHtml = '';
        if (subjectKit) {
            const primary = t(subjectKit.primary_subject || subjectKit.primary || subjectKit, lang);
            const secondaryList = (subjectKit.secondary_elements || subjectKit.secondary || []);
            const secondary = secondaryList.map(el => `<span class="tag" style="background:#e8f5e9; color:#2e7d32;">${t(el, lang)}</span>`).join('');

            if (secondary) {
                subjectHtml = `<div class="card-value"><strong>${primary}</strong></div><div class="tags" style="margin-top:5px;">${secondary}</div>`;
            } else {
                subjectHtml = `<div class="card-value">${primary}</div>`;
            }
        } else {
            subjectHtml = `<div class="card-value">-</div>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <h3>${formatWorldName(item.world_id || item.creative_world)}</h3>
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
            
            <!-- 1. Imaging Assumption (Gold) -->
            <div class="card-item item-imaging">
                <span class="card-label" data-i18n-label="imaging_assumption">${labels.imaging_assumption}</span>
                <span class="card-value">${t(clean(selected.imaging_assumption?.selected_value || item.imaging_assumption), lang)}</span>
            </div>

            <!-- 2. Creation Intent -->
            <div class="card-item">
                <span class="card-label" data-i18n-label="creation_intent">${labels.creation_intent}</span>
                <span class="card-value">${t(clean(selected.creation_intent?.selected_value || item.creation_intent), lang)}</span>
            </div>

            <!-- 3. Generation Logic -->
            <div class="card-item">
                <span class="card-label" data-i18n-label="generation_logic">${labels.generation_logic}</span>
                <span class="card-value">${t(clean(selected.generation_logic?.selected_value || item.generation_logic), lang)}</span>
            </div>

            <!-- 4. Deliverable Type -->
             <div class="card-item">
                <span class="card-label" data-i18n-label="deliverable_type">${labels.deliverable_type}</span>
                <span class="card-value">${t(deliverableValue, lang)}</span>
            </div>

            <!-- 5. Core Tension -->
            <div class="card-item item-tension">
                <span class="card-label" data-i18n-label="core_tension">${labels.core_tension}</span>
                <span class="card-value">${t(coreValue, lang)}</span>
            </div>

            <!-- 6. Twist Mechanisms -->
             <div class="card-item">
                <span class="card-label" data-i18n-label="twist_mechanisms">${labels.twist_mechanisms}</span>
                <div class="tags">${twistTags}</div>
            </div>

            <!-- 7. Subject Kit -->
            <div class="card-item">
                <span class="card-label" data-i18n-label="subject_kit">${labels.subject_kit}</span>
                ${subjectHtml}
            </div>

            <!-- 8. Stage Context -->
             <div class="card-item">
                <span class="card-label" data-i18n-label="stage_context">${labels.stage_context}</span>
                <span class="card-value">${t(stageValue, lang)}</span>
            </div>

            <!-- 9. Composition Rule -->
            <div class="card-item">
                <span class="card-label" data-i18n-label="composition_rule">${labels.composition_rule}</span>
                <span class="card-value">${t(compositionValue, lang)}</span>
            </div>

            <!-- 10. Lighting Rule -->
             <div class="card-item">
                <span class="card-label" data-i18n-label="lighting_rule">${labels.lighting_rule}</span>
                <span class="card-value">${t(lightingValue, lang)}</span>
            </div>

             <!-- 11. Rule Hits (Visible only if populated) -->
             ${item.rule_hits && item.rule_hits.length > 0 ? `
             <div class="card-item">
                <span class="card-label" style="margin-bottom:0.5rem;">RULE HITS</span>
                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                    ${item.rule_hits.map(hit => `
                        <div style="font-size:0.75rem; letter-spacing:0.05em; border-bottom:1px solid rgba(0,0,0,0.1); padding-bottom:0.25rem;">
                            ${hit}
                        </div>
                    `).join('')}
                </div>
             </div>` : ''}

            <!-- 12. ID (Moved to bottom) -->
            <div class="card-item item-id" style="margin-top: auto; margin-bottom: 0;">
                <span class="card-label" data-i18n-label="id">${labels.id}</span>
                <span class="card-value" style="font-family:monospace; color:#888; font-size: 0.825rem;">${item.creative_id}</span>
            </div>
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
            favoritesArea.innerHTML = `< p style = "width:100%; text-align:center; color:#999; margin-top:2rem;" > ${i18n[lang].no_favorites}</p > `;
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
            resultsArea.innerHTML = `< p style = "width:100%; text-align:center;" > ${i18n[lang].no_results}</p > `;
            return;
        }
        results.forEach(item => resultsArea.appendChild(createCardElement(item)));
    }
});
