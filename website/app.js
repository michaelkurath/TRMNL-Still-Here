const state = { items: [], activeCategory: 'all', currentId: null };

const els = {
  count: document.querySelector('#collection-count'),
  image: document.querySelector('#feature-image'),
  frameArtwork: document.querySelector('#frame-artwork'),
  frameVersions: document.querySelector('#frame-versions'),
  index: document.querySelector('#image-index'),
  status: document.querySelector('#feature-status'),
  category: document.querySelector('#feature-category'),
  lifespan: document.querySelector('#feature-lifespan'),
  name: document.querySelector('#feature-name'),
  epitaph: document.querySelector('#feature-epitaph'),
  why: document.querySelector('#feature-why'),
  afterlife: document.querySelector('#feature-afterlife'),
  note: document.querySelector('#feature-note'),
  source: document.querySelector('#feature-source'),
  filters: document.querySelector('#filters'),
  grid: document.querySelector('#card-grid'),
  results: document.querySelector('#results-status'),
  template: document.querySelector('#card-template')
};

function imagePath(item) {
  const source = item.image_url_standard || item.image_url;
  const filename = source ? source.split('/').pop() : `${item.id}-standard-4x3.jpg`;
  return `assets/${filename}`;
}

function frameImagePath(item, orientation) {
  const source = item[`image_url_frame_${orientation}`];
  return source ? `assets/frame/${source.split('/').pop()}` : '';
}

function setExhibitImage(image, item) {
  const frame = frameImagePath(item, 'landscape');
  image.toggleAttribute('data-frame', Boolean(frame));
  image.src = frame || imagePath(item);
  image.alt = frame ? (item.frame_photo?.landscape?.alt || `Artistic reconstruction of ${item.name}`) : item.image_alt;
}

function showFrameArtwork(item) {
  els.frameVersions.replaceChildren();
  for (const [orientation, label] of [['landscape', 'Landscape'], ['portrait', 'Portrait']]) {
    const path = frameImagePath(item, orientation);
    if (!path) continue;
    const version = document.createElement('span');
    version.className = 'frame-version';
    const link = document.createElement('a');
    link.href = path;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = label;
    version.appendChild(link);
    const credit = item.frame_photo?.[orientation];
    if (credit) {
      const original = document.createElement('a');
      original.href = credit.source;
      original.textContent = credit.author;
      const license = document.createElement('a');
      license.href = credit.license_url;
      license.textContent = credit.license;
      version.append(' · ', original, ' · ', license, ' · adapted for Frame');
    }
    els.frameVersions.appendChild(version);
  }
  els.frameArtwork.hidden = !els.frameVersions.childElementCount;
}

function dayNumber() {
  const now = new Date();
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86400000);
}

function todayItem() {
  return state.items[dayNumber() % state.items.length];
}

function showItem(item, moveFocus = false) {
  state.currentId = item.id;
  setExhibitImage(els.image, item);
  showFrameArtwork(item);
  els.index.textContent = `EXHIBIT ${item.exhibit}`;
  els.status.textContent = item.status;
  els.category.textContent = item.category;
  els.lifespan.textContent = item.timeline.replace('–', '—');
  els.name.textContent = item.name;
  els.epitaph.textContent = item.headline;
  els.why.textContent = item.why_survives;
  els.afterlife.textContent = item.where_now;
  els.note.textContent = item.note;
  els.source.href = item.source_url;
  els.source.firstChild.textContent = `${item.source_name} `;
  document.title = `${item.name} — STILL HERE`;
  history.replaceState(null, '', `#${item.id}`);
  document.querySelectorAll('.archive-card').forEach(card => {
    card.toggleAttribute('data-current', card.dataset.id === item.id);
  });
  if (moveFocus) {
    document.querySelector('#exhibit').scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelector('#feature-name').setAttribute('tabindex', '-1');
    window.setTimeout(() => document.querySelector('#feature-name').focus({ preventScroll: true }), 350);
  }
}

function makeFilters() {
  const counts = state.items.reduce((acc, item) => {
    acc[item.category_key] = (acc[item.category_key] || 0) + 1;
    return acc;
  }, {});
  const categories = [
    ['all', 'All', state.items.length],
    ...Object.entries(counts).map(([key, count]) => [key, state.items.find(item => item.category_key === key).category, count])
  ];
  const frameCount = state.items.filter(item => item.image_url_frame_landscape).length;
  if (frameCount) categories.splice(1, 0, ['frame', 'TRMNL Frame', frameCount]);
  categories.forEach(([key, label, count]) => {
    const button = document.createElement('button');
    button.className = 'filter-button';
    button.type = 'button';
    button.dataset.category = key;
    button.setAttribute('aria-pressed', String(key === state.activeCategory));
    button.textContent = `${label} · ${count}`;
    button.addEventListener('click', () => {
      state.activeCategory = key;
      els.filters.querySelectorAll('button').forEach(filter => {
        filter.setAttribute('aria-pressed', String(filter.dataset.category === key));
      });
      renderCards();
    });
    els.filters.appendChild(button);
  });
}

function renderCards() {
  const visible = state.activeCategory === 'all'
    ? state.items
    : state.items.filter(item => state.activeCategory === 'frame'
      ? item.image_url_frame_landscape
      : item.category_key === state.activeCategory);
  els.grid.replaceChildren();
  visible.forEach(item => {
    const card = els.template.content.firstElementChild.cloneNode(true);
    card.dataset.id = item.id;
    card.setAttribute('aria-label', `Open exhibit ${item.exhibit}: ${item.name}`);
    setExhibitImage(card.querySelector('.archive-image'), item);
    card.querySelector('.archive-number').textContent = `No. ${item.exhibit}`;
    card.querySelector('.archive-category').textContent = item.category;
    card.querySelector('.archive-year').textContent = `Verified ${item.verified_on}`;
    card.querySelector('.archive-name').textContent = item.name;
    card.querySelector('.archive-epitaph').textContent = item.headline;
    card.toggleAttribute('data-current', item.id === state.currentId);
    card.addEventListener('click', () => showItem(item, true));
    els.grid.appendChild(card);
  });
  const label = state.activeCategory === 'all'
    ? 'the full collection'
    : state.activeCategory === 'frame' ? 'TRMNL Frame' : visible[0].category;
  els.results.textContent = `${visible.length} exhibits · ${label}`;
}

function randomItem() {
  const candidates = state.items.filter(item => item.id !== state.currentId);
  return candidates[Math.floor(Math.random() * candidates.length)] || state.items[0];
}

async function init() {
  try {
    const response = await fetch('catalogue.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Catalogue unavailable');
    const data = await response.json();
    state.items = Array.isArray(data.items) ? data.items : [];
    if (!state.items.length) throw new Error("Empty catalogue");
    els.count.textContent = state.items.length;
    const frameView = new URLSearchParams(location.search).get('view') === 'frame';
    const firstFrame = frameView && state.items.find(item => item.image_url_frame_landscape);
    if (firstFrame) state.activeCategory = 'frame';
    makeFilters();
    renderCards();

    const requested = location.hash.slice(1);
    const initial = state.items.find(item => item.id === requested) || firstFrame || todayItem();
    showItem(initial);

    document.querySelector('#today-button').addEventListener('click', () => showItem(todayItem(), true));
    document.querySelector('#random-button').addEventListener('click', () => showItem(randomItem(), true));
  } catch (error) {
    document.querySelector('#exhibit').innerHTML = '<p class="load-error">The museum is temporarily closed. Please try again.</p>';
    document.querySelector('#today-button').disabled = true;
    document.querySelector('#random-button').disabled = true;
    console.error(error);
  }
}

init();
