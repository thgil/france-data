/* commune-names/charts.js — all interactive elements for the commune names story */

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const ACCENT = '#b32020';
const BAR_COLOR = 'rgba(179, 32, 32, 0.25)';
const BAR_HOVER = 'rgba(179, 32, 32, 0.55)';

/* ── Histogram ───────────────────────────────────────────────────────── */
export function buildHistogram(canvasId, lengthDistribution) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Bin into groups of 1 — but show every other label to reduce clutter
  const labels = lengthDistribution.map(d => d.len);
  const counts = lengthDistribution.map(d => d.count);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: BAR_COLOR,
        hoverBackgroundColor: BAR_HOVER,
        borderWidth: 0,
        barPercentage: 0.95,
        categoryPercentage: 1.0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => `${ctx[0].label} characters`,
            label: ctx => `${ctx.parsed.y.toLocaleString('fr-FR')} communes`,
          },
          backgroundColor: PAPER,
          titleColor: INK,
          bodyColor: '#444',
          borderColor: '#d8d0c0',
          borderWidth: 1,
          titleFont: { family: 'Georgia, serif', size: 13 },
          bodyFont: { family: "'Helvetica Neue', sans-serif", size: 12 },
          padding: 10,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Name length (characters)',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: MUTE,
          },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: MUTE,
            maxRotation: 0,
            callback: (val, idx) => idx % 5 === 0 ? labels[idx] : '',
          },
          grid: { display: false },
        },
        y: {
          title: {
            display: true,
            text: 'Number of communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: MUTE,
          },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: MUTE,
            callback: val => val.toLocaleString('fr-FR'),
          },
          grid: {
            color: '#e8e0d4',
          },
          border: { dash: [3, 3] },
        },
      },
    },
  });
}

/* ── Short-name pills ────────────────────────────────────────────────── */
export function populateShortPills(shortNames) {
  const container = document.getElementById('short-pills');
  if (!container) return;

  // Show only 1-2 letter names
  const tiny = shortNames.filter(d => d.len <= 2);
  container.innerHTML = tiny.map(d =>
    `<span class="short-pill">
      <span class="sp-name">${d.name}</span>
      <span class="sp-dept">dept. ${d.dept}</span>
    </span>`
  ).join('');
}

/* ── Top names + longest names tables ───────────────────────────────── */
export function populateTables(topNames, longestNames) {
  const topTbody = document.querySelector('#top-names-table tbody');
  if (topTbody) {
    topTbody.innerHTML = topNames.slice(0, 10).map(d =>
      `<tr>
        <td class="nm">${d.name}</td>
        <td class="count-cell">${d.count} communes</td>
      </tr>`
    ).join('');
  }

  const longTbody = document.querySelector('#long-names-table tbody');
  if (longTbody) {
    longTbody.innerHTML = longestNames.slice(0, 8).map(d =>
      `<tr>
        <td class="nm" style="font-size:12px;line-height:1.4">${d.name}<span class="dept-tag">dept. ${d.dept}</span></td>
        <td class="count-cell">${d.len} chars</td>
      </tr>`
    ).join('');
  }
}

/* ── Saint grid ──────────────────────────────────────────────────────── */
export function populateSaintGrid(stats) {
  const container = document.getElementById('saint-grid');
  if (!container) return;

  const saintItems = [
    { name: 'Saint-Martin',  count: stats.saintMartinCount },
    { name: 'Saint-Jean',    count: stats.saintJeanCount },
    { name: 'Saint-Pierre',  count: stats.saintPierreCount },
  ];

  container.innerHTML = saintItems.map(d =>
    `<div class="sg-item">
      <span class="sg-name">${d.name}</span>
      <span class="sg-count">${d.count} communes</span>
    </div>`
  ).join('');
}

/* ── Commune search ──────────────────────────────────────────────────── */
export function setupSearch(index) {
  const input   = document.getElementById('commune-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runSearch(input.value.trim()), 120);
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      results.classList.remove('visible');
    }, 200);
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2) {
      results.classList.add('visible');
    }
  });

  function runSearch(query) {
    if (query.length < 2) {
      results.classList.remove('visible');
      results.innerHTML = '';
      return;
    }

    const q = query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const matches = [];

    for (const entry of index) {
      if (matches.length >= 30) break;
      const normalized = entry.n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (normalized.includes(q)) {
        matches.push(entry);
      }
    }

    if (matches.length === 0) {
      results.innerHTML = `<div class="search-no-results">No communes found for "${query}"</div>`;
    } else {
      results.innerHTML = matches.map(entry =>
        `<div class="search-result-item">
          <span class="sr-name">${entry.n}</span>
          <span class="sr-meta">Dept. ${entry.d} · pop. ${entry.p > 0 ? entry.p.toLocaleString('fr-FR') : '—'}</span>
        </div>`
      ).join('');
    }

    results.classList.add('visible');
  }
}
