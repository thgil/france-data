// stories/commune-names/charts.js
// Chart.js bar charts + DOM table population for the commune-names story.
// Exports: buildCharts(stats), populateTables(stats)

const PAPER  = '#faf7f2';
const INK    = '#1a1a1a';
const MUTE   = '#888';
const ACCENT = '#b32020';
const BAR_A  = '#6b7fa0';
const BAR_B  = '#8b5e3c';
const BAR_C  = '#4a7a62';

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

Chart.defaults.font.family = FONT;
Chart.defaults.color = INK;

// ── Shared axis style ──────────────────────────────────────────────────
function baseScales(yLabel, xLabel) {
  return {
    x: {
      title: xLabel ? { display: true, text: xLabel, color: MUTE, font: { size: 11 } } : undefined,
      ticks: { color: MUTE, font: { size: 11 } },
      grid: { color: '#e8e2d8' },
    },
    y: {
      title: yLabel ? { display: true, text: yLabel, color: MUTE, font: { size: 11 } } : undefined,
      ticks: { color: INK, font: { size: 12 } },
      grid: { display: false },
    },
  };
}

// ── Chart A: Top saint-X names ─────────────────────────────────────────
function drawSaints(stats) {
  const ctx = document.getElementById('chart-saints');
  if (!ctx) return;
  const top = stats.topSaints.slice(0, 12);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top.map(d => `Saint(e)-${d.name}`),
      datasets: [{
        data: top.map(d => d.count),
        backgroundColor: BAR_A,
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.x} communes`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Number of communes', color: MUTE, font: { size: 11 } },
          ticks: { color: MUTE, font: { size: 11 }, stepSize: 1 },
          grid: { color: '#e8e2d8' },
          min: 0,
          max: 14,
        },
        y: {
          ticks: { color: INK, font: { size: 12 } },
          grid: { display: false },
        },
      },
    },
  });
}

// ── Chart B: Top rivers in -sur-X names ───────────────────────────────
function drawRivers(stats) {
  const ctx = document.getElementById('chart-rivers');
  if (!ctx) return;
  const top = stats.topRivers.slice(0, 12);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top.map(d => `-sur-${d.name}`),
      datasets: [{
        data: top.map(d => d.count),
        backgroundColor: BAR_C,
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.x} communes`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Number of communes', color: MUTE, font: { size: 11 } },
          ticks: { color: MUTE, font: { size: 11 } },
          grid: { color: '#e8e2d8' },
          min: 0,
        },
        y: {
          ticks: { color: INK, font: { size: 12 } },
          grid: { display: false },
        },
      },
    },
  });
}

// ── Chart C: Name length distribution ─────────────────────────────────
function drawLengths(stats) {
  const ctx = document.getElementById('chart-lengths');
  if (!ctx) return;
  const dist = stats.lengthDist;
  const maxLen = Math.max(...Object.keys(dist).map(Number));

  // Group lengths: 1–5, 6, 7, ..., 25, 26–30, 31+
  const buckets = [];
  const labels = [];
  for (let l = 1; l <= 25; l++) {
    buckets.push(dist[l] || 0);
    labels.push(String(l));
  }
  // 26–30
  let b2630 = 0;
  for (let l = 26; l <= 30; l++) b2630 += (dist[l] || 0);
  buckets.push(b2630);
  labels.push('26–30');
  // 31+
  let b31 = 0;
  for (let l = 31; l <= maxLen; l++) b31 += (dist[l] || 0);
  buckets.push(b31);
  labels.push('31+');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: buckets,
        backgroundColor: BAR_B,
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => `${ctx[0].label} characters`,
            label: ctx => `${ctx.parsed.y.toLocaleString('fr-FR')} communes`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Name length (characters)', color: MUTE, font: { size: 11 } },
          ticks: { color: MUTE, font: { size: 10 }, maxRotation: 0 },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: 'Communes', color: MUTE, font: { size: 11 } },
          ticks: {
            color: MUTE,
            font: { size: 11 },
            callback: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v,
          },
          grid: { color: '#e8e2d8' },
        },
      },
    },
  });
}

// ── Table helpers ──────────────────────────────────────────────────────
function fmtPop(n) {
  if (n == null || n === 0) return '—';
  return Number(n).toLocaleString('fr-FR');
}

function populateDupsTable(stats) {
  const tbody = document.querySelector('#table-dups tbody');
  if (!tbody) return;
  tbody.innerHTML = stats.topDuplicates.slice(0, 10).map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="commune-name">${d.name}</td>
      <td>${d.count}×</td>
    </tr>`
  ).join('');
}

function populateShortTable(stats) {
  const tbody = document.querySelector('#table-short tbody');
  if (!tbody) return;
  tbody.innerHTML = stats.shortest20.slice(0, 10).map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="commune-name">${d.name}</td>
      <td class="subdued">${d.name.length} chr · dept ${d.dept}</td>
    </tr>`
  ).join('');
}

function populateLongTable(stats) {
  const tbody = document.querySelector('#table-long tbody');
  if (!tbody) return;
  tbody.innerHTML = stats.longest10.slice(0, 8).map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="commune-name" style="font-size:11px">${d.name}</td>
      <td class="subdued">${d.name.length} chr</td>
    </tr>`
  ).join('');
}

function populateWordsTable(stats) {
  const tbody = document.querySelector('#table-words tbody');
  if (!tbody) return;
  // Skip very short/function words for display
  const skip = new Set(['les', 'lès', 'des', 'aux', 'sur', 'sous', 'val']);
  const words = stats.topWords.filter(d => d.word.length > 2 && !skip.has(d.word)).slice(0, 10);
  tbody.innerHTML = words.map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="commune-name">${d.word}</td>
      <td>${d.count.toLocaleString('fr-FR')}</td>
    </tr>`
  ).join('');
}

// ── Public API ─────────────────────────────────────────────────────────
export function buildCharts(stats) {
  drawSaints(stats);
  drawRivers(stats);
  drawLengths(stats);
}

export function populateTables(stats) {
  populateDupsTable(stats);
  populateShortTable(stats);
  populateLongTable(stats);
  populateWordsTable(stats);
}
