const ALL_CATEGORIES = "all";
const CATEGORIES = new Set(["all", "technology", "internet", "transport", "nature", "everyday"]);

function normalizeCategory(input) {
  const value = String(input?.trmnl?.plugin_settings?.custom_fields_values?.category || ALL_CATEGORIES).trim().toLowerCase();
  return CATEGORIES.has(value) ? value : ALL_CATEGORIES;
}

function getPool(items, category) {
  if (category === ALL_CATEGORIES) return items;
  const filtered = items.filter((item) => item.category_key === category);
  return filtered.length ? filtered : items;
}

function validHistory(history, poolIds) {
  if (!Array.isArray(history)) return [];
  const seen = new Set();
  return history.filter((id) => {
    if (typeof id !== "string" || !poolIds.has(id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

// Deterministic refresh-slot seed; history keeps the inherited no-repeat rotation.
function refreshSeed(now = Date.now()) {
  let n = Math.floor(now / (15 * 60 * 1000)) >>> 0;
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function selectEntry(input, randomValue = refreshSeed()) {
  const seen = new Set();
  // Contract: polling JSON object with top-level items array (see settings.yml).
  // Alternate shapes fail closed to the unavailable screen.
  const raw = Array.isArray(input?.items) ? input.items : [];
  const items = raw.filter((item) => {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || !item.id.trim() ||
        typeof item.name !== "string" || !item.name.trim() || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
  if (!items.length) return { selectedEntry: null, category: ALL_CATEGORIES, histories: {} };
  const category = normalizeCategory(input);
  const pool = getPool(items, category);
  const stored = input?.trmnl?.state?.histories;
  const histories = {};
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    for (const key of CATEGORIES) {
      if (stored[key]) histories[key] = validHistory(stored[key], new Set(getPool(items, key).map((item) => item.id)));
    }
  }
  let history = validHistory(histories[category], new Set(pool.map((item) => item.id)));
  let available = pool.filter((item) => !history.includes(item.id));
  if (!available.length) { history = []; available = pool; }
  const bounded = Number.isFinite(randomValue) ? Math.min(Math.max(randomValue, 0), 0.9999999999999999) : 0;
  const selectedEntry = available[Math.floor(bounded * available.length)];
  histories[category] = [...history, selectedEntry.id];
  return { selectedEntry, category, histories };
}

function run(input) {
  const safeInput = input && typeof input === "object" ? input : {};
  const selection = selectEntry(safeInput);
  return { ...safeInput, selected_entry: selection.selectedEntry, trmnl_state: { histories: selection.histories } };
}

if (typeof module !== "undefined") module.exports = { getPool, normalizeCategory, refreshSeed, run, selectEntry, validHistory };
