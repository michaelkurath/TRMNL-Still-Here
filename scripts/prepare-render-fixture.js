// Render the newest exhibit from this checkout, including unpublished artwork.
// Run only in a disposable checkout: this replaces its local preview config.
const fs = require('node:fs');
const { items } = JSON.parse(fs.readFileSync('data/trmnl.json', 'utf8'));
const emptySelection = process.argv[2] === 'empty';
const offset = emptySelection ? 0 : Number(process.argv[2] || 0);
if (!Number.isInteger(offset) || offset < 0 || offset >= items.length) {
  throw new Error("Render offset must select an existing exhibit from the end of the catalogue.");
}
const selected = emptySelection ? null : { ...items.at(-1 - offset) };
for (const key of selected ? ['image_url', 'image_url_standard', 'image_url_wide'] : []) {
  const file = new URL(selected[key]).pathname.split('/main/')[1];
  if (!file || !fs.existsSync(file)) throw new Error(`Missing local artwork: ${file}`);
  selected[key] = `http://127.0.0.1:4568/${file}`;
}
fs.writeFileSync('.trmnlp.yml', JSON.stringify({
  watch: false,
  custom_fields: { category: 'all' },
  time_zone: 'UTC',
  transform_runtime: 'disabled',
  variables: { selected_entry: selected, items, trmnl: {} },
}, null, 2));
console.log(`Pinned render fixture: ${selected ? selected.id + ' (local artwork)' : 'empty selection with populated catalogue'}.`);
