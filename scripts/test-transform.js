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


async function main() {
  const empty = await run({ items: [] });
  assert.equal(empty.selected_entry, null);
  assert.deepEqual(empty.trmnl_state, { histories: {} });

  const output = await run(input("nature"));
  assert.equal(output.selected_entry.id, "nature-one");
  assert.deepEqual(output.trmnl_state.histories.nature, ["nature-one"]);
  assert.equal(output.items, undefined);

  const originalFetch = global.fetch;
  try {
    // A catalogue too large for polling must be fetched inside Serverless.
    const bigItems = Array.from({ length: 300 }, (_, i) => ({
      id: "tech-" + i,
      name: "Technology " + i,
      category_key: "technology",
      caption: "x".repeat(1024),
      headline: "x".repeat(1024),
      source_url: "https://example.com/source",
    }));
    assert.ok(Buffer.byteLength(JSON.stringify({ items: bigItems })) > 100000);
    let calls = 0;
    global.fetch = async (url) => {
      calls += 1;
      assert.match(url, /\/data\/trmnl\.json$/);
      return { ok: true, json: async () => ({ items: bigItems }) };
    };

    const manifest = {
      catalogue_version: 1,
      trmnl: {
        plugin_settings: { custom_fields_values: { category: "technology" } },
        state: { histories: { "technology": ["tech-0"] } },
      },
    };
    const picked = await run(manifest);
    assert.equal(calls, 1);
    assert.ok(picked.selected_entry);
    assert.notEqual(picked.selected_entry.id, "tech-0");
    assert.equal(picked.items, undefined);
    assert.equal(picked.selected_entry.source_url, undefined);
    assert.ok(Buffer.byteLength(JSON.stringify(picked)) < 5000);

    // A failed or malformed fetch must not advance/erase Saved State.
    global.fetch = async () => ({ ok: false, status: 503 });
    await assert.rejects(run(manifest), /HTTP 503/);
    global.fetch = async () => ({ ok: true, json: async () => ({ results: bigItems }) });
    await assert.rejects(run(manifest), /no exhibits/);
  } finally {
    global.fetch = originalFetch;
  }

  assert.equal(selectEntry(input(" TECHNOLOGY "), 0).category, "technology");
  assert.equal(selectEntry(input(), NaN).selectedEntry.id, "tech-one");
  const duplicate = selectEntry({ items: [items[0], items[0], items[1]] }, 0.99);
  assert.equal(duplicate.selectedEntry.id, "tech-two");
  assert.equal(selectEntry(input("__proto__"), 0).category, "all");
  const { refreshSeed } = require("../src/transform");
  assert.equal(refreshSeed(1000000), refreshSeed(1000001));
  assert.equal((await run({ items: [null, {}, { id: "bad" }] })).selected_entry, null);
  assert.equal((await run({ items: [{ id: "only", name: "One" }] })).selected_entry.id, "only");
  for (const payload of [{ items: {} }, { items: [] }]) {
    assert.equal((await run(payload)).selected_entry, null);
  }

  console.log("Saved State, filtering and compact Serverless payload tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
