const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const items = JSON.parse(fs.readFileSync('data/trmnl.json')).items;

(async () => {
  const browser = await chromium.launch();
  fs.mkdirSync('website-previews', { recursive: true });
  try {
    for (const [device, width, height, exhibit] of [
      ['desktop', 1440, 1100, 'wollemi-pine'],
      ['mobile', 390, 900, 'solent-hovercraft']
    ]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:8000/#${exhibit}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.querySelector('#feature-image').naturalWidth > 0);
      assert.equal(await page.locator('.archive-card').count(), items.length);
      assert.equal(await page.locator('#feature-name').textContent(), items.find(item => item.id === exhibit).name);
      for (const item of items) {
        await page.getByRole('button', { name: `Open exhibit ${item.exhibit}: ${item.name}`, exact: true }).click();
        await page.waitForFunction(() => document.querySelector('#feature-image').complete && document.querySelector('#feature-image').naturalWidth > 0);
        assert.equal(await page.locator('#feature-name').textContent(), item.name);
        assert.equal(await page.locator('#feature-source').getAttribute('href'), item.source_url);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${device}: overflow for ${item.id}`);
      }
      for (const category of new Set(items.map(item => item.category_key))) {
        const matches = items.filter(item => item.category_key === category);
        await page.locator(`.filter-button[data-category="${category}"]`).click();
        assert.equal(await page.locator('.archive-card').count(), matches.length);
      }
      await page.locator('.filter-button[data-category="all"]').click();
      await page.getByRole('button', { name: 'Today’s exhibit', exact: true }).click();
      const today = await page.locator('#feature-name').textContent();
      await page.getByRole('button', { name: 'Random exhibit', exact: true }).click();
      if (items.length > 1) assert.notEqual(await page.locator('#feature-name').textContent(), today);
      const selected = items.find(item => item.id === exhibit);
      await page.getByRole('button', { name: `Open exhibit ${selected.exhibit}: ${selected.name}`, exact: true }).click();
      await page.waitForFunction(() => document.querySelector('#feature-image').complete && document.querySelector('#feature-image').naturalWidth > 0);
      // Load every lazy card image before making the full-page review artifact.
      for (const image of await page.locator('.archive-image').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(image => image.decode());
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `website-previews/${device}.png`, fullPage: true });
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Website checks passed: all exhibits, images, sources, filters, today/random, desktop and mobile overflow.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
