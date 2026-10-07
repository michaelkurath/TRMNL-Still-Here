const fs = require('node:fs');
const path = require('node:path');
fs.rmSync('_site', { recursive: true, force: true });
fs.mkdirSync('_site/assets', { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js']) fs.copyFileSync(path.join('website', file), path.join('_site', file));
fs.copyFileSync('data/trmnl.json', '_site/catalogue.json');
fs.copyFileSync('assets/icon/still-here-icon.svg', '_site/assets/still-here-icon.svg');
for (const item of JSON.parse(fs.readFileSync('data/trmnl.json')).items) {
 const filename = item.image_url_standard.split('/').pop();
 fs.copyFileSync(path.join('assets/exhibits/responsive-v2', filename), path.join('_site/assets', filename));
}
console.log('Built companion catalogue in _site/');
