// [IN]: dimension JSON files from src/dimensions/
// [OUT]: loaded dimension data, reload functions
// [POS]: 维度数据加载器，被 logic.js 调用 / Dimension data loader, called by logic.js
// Protocol: When updated, sync this header + parent .folder.md

const fs = require('fs');
const path = require('path');

const DIMENSIONS_DIR = path.join(__dirname, 'dimensions');

// Cache for loaded data
let _cache = {
    imaging_assumptions: null,
    inspiration_keywords: null,
    worlds: {}
};

// Timestamps for hot-reload detection
let _timestamps = {};

/**
 * Load a JSON file with optional caching
 */
function loadJSON(relativePath, useCache = true) {
    const fullPath = path.join(DIMENSIONS_DIR, relativePath);

    try {
        const stats = fs.statSync(fullPath);
        const mtime = stats.mtimeMs;

        // Check if we need to reload
        if (useCache && _timestamps[relativePath] === mtime) {
            return null; // No change
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(content);
        _timestamps[relativePath] = mtime;

        return data;
    } catch (err) {
        console.error(`[DimensionLoader] Failed to load ${fullPath}:`, err.message);
        return null;
    }
}

/**
 * Load shared imaging assumptions
 */
function loadImagingAssumptions(force = false) {
    if (!force && _cache.imaging_assumptions) {
        const fresh = loadJSON('shared/imaging_assumptions.json');
        if (fresh) {
            _cache.imaging_assumptions = fresh;
            console.log('[DimensionLoader] Reloaded imaging_assumptions.json');
        }
    } else {
        _cache.imaging_assumptions = loadJSON('shared/imaging_assumptions.json', false) || {};
    }
    return _cache.imaging_assumptions;
}

/**
 * Load shared inspiration keywords
 */
function loadInspirationKeywords(force = false) {
    if (!force && _cache.inspiration_keywords) {
        const fresh = loadJSON('shared/inspiration_keywords.json');
        if (fresh) {
            _cache.inspiration_keywords = fresh;
            console.log('[DimensionLoader] Reloaded inspiration_keywords.json');
        }
    } else {
        _cache.inspiration_keywords = loadJSON('shared/inspiration_keywords.json', false) || {};
    }
    return _cache.inspiration_keywords;
}

/**
 * Load a specific world's dimension data
 */
function loadWorld(worldId, force = false) {
    const relativePath = `worlds/${worldId}.json`;

    if (!force && _cache.worlds[worldId]) {
        const fresh = loadJSON(relativePath);
        if (fresh) {
            _cache.worlds[worldId] = fresh;
            console.log(`[DimensionLoader] Reloaded ${worldId}.json`);
        }
    } else {
        _cache.worlds[worldId] = loadJSON(relativePath, false);
    }
    return _cache.worlds[worldId];
}

/**
 * Load all worlds
 */
function loadAllWorlds(force = false) {
    const worldsDir = path.join(DIMENSIONS_DIR, 'worlds');

    try {
        const files = fs.readdirSync(worldsDir).filter(f => f.endsWith('.json'));
        const worlds = {};

        for (const file of files) {
            const worldId = file.replace('.json', '');
            worlds[worldId] = loadWorld(worldId, force);
        }

        return worlds;
    } catch (err) {
        console.error('[DimensionLoader] Failed to load worlds:', err.message);
        return {};
    }
}

/**
 * Reload all dimensions (for hot-reload)
 */
function reloadAll() {
    console.log('[DimensionLoader] Reloading all dimensions...');
    loadImagingAssumptions(true);
    loadInspirationKeywords(true);
    loadAllWorlds(true);
    return getAll();
}

/**
 * Get all loaded dimensions
 */
function getAll() {
    return {
        imaging_assumptions: _cache.imaging_assumptions || loadImagingAssumptions(),
        inspiration_keywords: _cache.inspiration_keywords || loadInspirationKeywords(),
        worlds: Object.keys(_cache.worlds).length > 0 ? _cache.worlds : loadAllWorlds()
    };
}

/**
 * Check if dimension files exist (for fallback to inline data)
 */
function hasExternalData() {
    const imagingPath = path.join(DIMENSIONS_DIR, 'shared/imaging_assumptions.json');
    return fs.existsSync(imagingPath);
}

module.exports = {
    loadImagingAssumptions,
    loadInspirationKeywords,
    loadWorld,
    loadAllWorlds,
    reloadAll,
    getAll,
    hasExternalData,
    DIMENSIONS_DIR
};
