const ALL_CATEGORIES = "all";
const CATALOGUE_URL = "https://raw.githubusercontent.com/michaelkurath/TRMNL-Still-Here/main/data/trmnl.json";
const DISPLAY_FIELDS = [
  "id",
  "exhibit",
  "name",
  "timeline",
  "verified_year",
  "status",
  "headline",
  "category",
  "image_url",
  "image_url_standard",
  "image_url_wide",
  "image_url_frame_landscape",
  "image_url_frame_portrait",
  "frame_photo",
  "image_alt",
  "why_survives",
  "where_now",
  "note"
];

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

function getSelectedPool(items, settings) {
  if (settings?.exhibit_mode !== "selected") return [];

  const frame = settings.display_edition === "frame";
  const value = frame ? settings.frame_exhibit_ids : settings.exhibit_ids;
  const ids = Array.isArray(value) ? value : String(value ?? "").split(",");
  const selectedIds = new Set(ids.map((id) => String(id).trim()));
  return items.filter((item) => selectedIds.has(item.id) && (
    !frame ||
    (item.image_url_frame_landscape && item.image_url_frame_portrait)
  ));
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
  // Contract: catalogue JSON object with top-level items array.
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
  const selectedPool = getSelectedPool(items, input?.trmnl?.plugin_settings?.custom_fields_values);
  const pool = selectedPool.length ? selectedPool : getPool(items, category);
  const historyKey = selectedPool.length ? "my_selection" : category;
  const stored = input?.trmnl?.state?.histories;
  const histories = {};
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    for (const key of CATEGORIES) {
      if (stored[key]) histories[key] = validHistory(stored[key], new Set(getPool(items, key).map((item) => item.id)));
    }
    if (stored.my_selection) histories.my_selection = validHistory(stored.my_selection, seen);
  }
  let history = validHistory(histories[historyKey], new Set(pool.map((item) => item.id)));
  let available = pool.filter((item) => !history.includes(item.id));
  if (!available.length) { history = []; available = pool; }
  const bounded = Number.isFinite(randomValue) ? Math.min(Math.max(randomValue, 0), 0.9999999999999999) : 0;
  const selectedEntry = available[Math.floor(bounded * available.length)];
  histories[historyKey] = [...history, selectedEntry.id];
  return { selectedEntry, category, histories };
}

async function loadItems(input) {
  // Explicit items are supported by local test/render fixtures.
  if (Object.prototype.hasOwnProperty.call(input, "items")) {
    return Array.isArray(input.items) ? input.items : [];
  }

  // TRMNL polling retrieves only data/poll.json (small manifest).
  // Fetch the full catalogue inside Serverless, not through Polling.
  const response = await fetch(CATALOGUE_URL);
  if (!response.ok) throw new Error("Catalogue fetch failed: HTTP " + response.status);
  const payload = await response.json();
  if (!Array.isArray(payload?.items) || payload.items.length === 0) {
    throw new Error("Catalogue response contains no exhibits");
  }
  return payload.items;
}

function compactEntry(entry) {
  if (!entry) return null;
  return Object.fromEntries(
    DISPLAY_FIELDS.filter((key) => entry[key] !== undefined).map((key) => [key, entry[key]])
  );
}

async function run(input) {
  const safeInput = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const items = await loadItems(safeInput);
  const selection = selectEntry({ ...safeInput, items });

  // No entire catalogue, polling manifest or unnecessary editorial metadata.
  return {
    selected_entry: compactEntry(selection.selectedEntry),
    trmnl_state: { histories: selection.histories },
  };
}

if (typeof module !== "undefined") module.exports = { compactEntry, getPool, loadItems, normalizeCategory, refreshSeed, run, selectEntry, validHistory };
