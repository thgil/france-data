async function main() {
  const res = await fetch('./name-stats.json');
  if (!res.ok) { console.error('Failed to load name-stats.json'); return; }
  const data = await res.json();

  renderSharedChart(data.top_shared);
  renderSaintsChart(data.top_saints);
  updateStats(data.stats);
  initSearch();
}

function updateStats(stats) {
  const total = document.getElementById('stat-total');
  if (total) total.textContent = stats.total.toLocaleString('fr-FR');
  const shared = document.getElementById('stat-shared');
  if (shared) shared.textContent = stats.communes_sharing_name.toLocaleString('fr-FR');
  const pct = document.getElementById('stat-saint-pct');
  if (pct) pct.textContent = stats.saint_pct + '%';
}

function renderSharedChart(topShared) {
  const el = document.getElementById('chart-shared');
  if (!el) return;
  const items = topShared.slice(0, 20);
  const max = items[0].count;
  el.innerHTML = items.map(item => {
    const pct = (item.count / max) * 100;
    const depts = item.communes.map(c => c.dept).join(', ');
    return `<div class="bar-row" title="Départements: ${depts}">
      <span class="bar-label">${item.name}</span>
      <span class="bar-track">
        <span class="bar-fill" style="width:${pct}%"></span>
        <span class="bar-value">${item.count} communes</span>
      </span>
    </div>`;
  }).join('');
}

function renderSaintsChart(topSaints) {
  const el = document.getElementById('chart-saints');
  if (!el) return;
  const items = topSaints.slice(0, 15);
  const max = items[0].count;
  el.innerHTML = items.map(item => {
    const pct = (item.count / max) * 100;
    return `<div class="bar-row">
      <span class="bar-label">Saint(e)-${item.saint}</span>
      <span class="bar-track">
        <span class="bar-fill saint" style="width:${pct}%"></span>
        <span class="bar-value">${item.count} communes</span>
      </span>
    </div>`;
  }).join('');
}

let communeIndex = null;

async function loadIndex() {
  if (communeIndex) return communeIndex;
  const res = await fetch('./communes-index.json');
  if (!res.ok) throw new Error('Could not load communes-index.json');
  communeIndex = await res.json();
  return communeIndex;
}

function initSearch() {
  const input = document.getElementById('commune-search');
  const resultsEl = document.getElementById('search-results');
  const noteEl = document.getElementById('search-note');
  if (!input || !resultsEl) return;

  let debounce = null;
  let indexLoaded = false;

  input.addEventListener('focus', () => {
    if (!indexLoaded) {
      noteEl.textContent = 'Loading commune index…';
      loadIndex().then(() => {
        indexLoaded = true;
        noteEl.textContent = '';
      }).catch(() => {
        noteEl.textContent = 'Could not load commune data.';
      });
    }
  });

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => runSearch(input.value.trim()), 150);
  });

  function runSearch(query) {
    resultsEl.innerHTML = '';
    noteEl.textContent = '';
    if (!query || query.length < 2) return;
    if (!communeIndex) {
      noteEl.textContent = 'Still loading…';
      return;
    }

    const q = query.toLowerCase();
    const matches = communeIndex.filter(c => c.name.toLowerCase().includes(q));
    const total = matches.length;

    if (total === 0) {
      noteEl.textContent = 'No communes found.';
      return;
    }

    const shown = matches.slice(0, 50);
    resultsEl.innerHTML = shown.map(c =>
      `<div class="result-row">
        <span class="r-name">${c.name}</span>
        <span class="r-dept">Dept. ${c.dept}</span>
        <span class="r-pop">${c.pop > 0 ? c.pop.toLocaleString('fr-FR') + ' residents' : '—'}</span>
      </div>`
    ).join('');

    if (total > 50) {
      noteEl.textContent = `Showing 50 of ${total.toLocaleString('fr-FR')} matches — type more to narrow down.`;
    } else if (total > 1) {
      noteEl.textContent = `${total} communes match "${query}".`;
    }
  }
}

main().catch(err => console.error('Commune-names story error:', err));
