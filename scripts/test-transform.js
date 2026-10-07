const assert = require("node:assert/strict");
const { run, selectEntry } = require("../src/transform");

const items = [
  { name: "Technology one", id: "tech-one", category_key: "technology" },
  { name: "Technology two", id: "tech-two", category_key: "technology" },
  { name: "Nature one", id: "nature-one", category_key: "nature" },
];

function input(category = "all", histories = {}) {
  return {
    items,
    trmnl: {
      plugin_settings: { custom_fields_values: { category } },
      state: { histories },
    },
  };
}

const first = selectEntry(input(), 0);
assert.equal(first.selectedEntry.id, "tech-one");
assert.deepEqual(first.histories.all, ["tech-one"]);

const second = selectEntry(input("all", first.histories), 0);
assert.equal(second.selectedEntry.id, "tech-two");
assert.deepEqual(second.histories.all, ["tech-one", "tech-two"]);

const third = selectEntry(input("all", second.histories), 0);
assert.equal(third.selectedEntry.id, "nature-one");

const reset = selectEntry(input("all", third.histories), 0);
assert.equal(reset.selectedEntry.id, "tech-one");
assert.deepEqual(reset.histories.all, ["tech-one"]);

const filtered = selectEntry(input("technology", { technology: ["tech-one"] }), 0);
assert.equal(filtered.selectedEntry.id, "tech-two");
assert.deepEqual(filtered.histories.technology, ["tech-one", "tech-two"]);

const fallback = selectEntry(input("unknown"), 0.999);
assert.equal(fallback.selectedEntry.id, "nature-one");

const stale = selectEntry(input("all", { all: ["removed", "tech-one", "tech-one"] }), 0);
assert.equal(stale.selectedEntry.id, "tech-two");
assert.deepEqual(stale.histories.all, ["tech-one", "tech-two"]);

const empty = run({ items: [] });
assert.equal(empty.selected_entry, null);
assert.deepEqual(empty.trmnl_state, { histories: {} });

const output = run(input("nature"));
assert.equal(output.selected_entry.id, "nature-one");
assert.deepEqual(output.trmnl_state.histories.nature, ["nature-one"]);

console.log("Saved State transform tests passed.");

assert.equal(selectEntry(input(" TECHNOLOGY "), 0).category, "technology");
assert.equal(run(null).selected_entry, null);
assert.equal(run({ items: [null, {}, { id: "bad" }] }).selected_entry, null);
assert.equal(run({ items: [{ id: "only", name: "One" }] }).selected_entry.id, "only");
assert.equal(selectEntry(input(), NaN).selectedEntry.id, "tech-one");
const duplicate = selectEntry({ items: [items[0], items[0], items[1]] }, 0.99);
assert.equal(duplicate.selectedEntry.id, "tech-two");
assert.equal(selectEntry(input("__proto__"), 0).category, "all");
const { refreshSeed } = require("../src/transform");
assert.equal(refreshSeed(1000000), refreshSeed(1000001));
console.log("Malformed data, one-entry, duplicate and normalized-setting checks passed.");
