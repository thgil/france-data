/* commune-names/charts.js — Chart.js visualisations */

const PAPER   = '#faf7f2';
const INK     = '#1a1a1a';
const INK_MUTE = '#888';
const ACCENT  = '#b32020';
const WARM    = '#c67c00';

const BASE_FONT = {
  family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  size: 12,
  color: INK,
};

Chart.defaults.font = BASE_FONT;
Chart.defaults.color = INK;

/* ── Top-names horizontal bar chart ─────────────────────────── */
export function drawTopNamesChart(canvasId, topNames) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const top20 = topNames.slice(0, 20);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: top20.map(d => d.name),
      datasets: [{
        data: top20.map(d => d.count),
        backgroundColor: top20.map(d =>
          d.name.toLowerCase().startsWith('saint') || d.name.toLowerCase().startsWith('sainte')
            ? ACCENT : WARM
        ),
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw} communes named "${ctx.label}"`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: '#e8e2d8' },
          ticks: { stepSize: 1, precision: 0, font: { size: 11 } },
          title: { display: true, text: 'number of communes with this name', font: { size: 11 }, color: INK_MUTE },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 12, family: 'Georgia, serif' } },
        },
      },
    },
  });
}

/* ── Name-length histogram ───────────────────────────────────── */
export function drawLengthHistogram(canvasId, lengthDist) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  /* Group lengths ≥ 30 into a single ">29" bucket */
  const MAX_EXPLICIT = 29;
  const grouped = [];
  let overflow = 0;
  for (const { length, count } of lengthDist) {
    if (length <= MAX_EXPLICIT) grouped.push({ length, count });
    else overflow += count;
  }
  if (overflow) grouped.push({ length: 30, count: overflow, label: '≥30' });

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: grouped.map(d => d.label ?? String(d.length)),
      datasets: [{
        data: grouped.map(d => d.count),
        backgroundColor: grouped.map(d => {
          if (d.length === 1) return '#c00';       /* Y */
          if (d.length <= 3)  return '#e05c2a';
          if (d.length >= 30) return ACCENT;
          return WARM;
        }),
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const d = grouped[ctx.dataIndex];
              const label = d.label ?? `${d.length} chars`;
              return ` ${ctx.raw.toLocaleString('fr-FR')} communes (name length: ${label})`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          title: { display: true, text: 'characters in commune name', font: { size: 11 }, color: INK_MUTE },
          ticks: { font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#e8e2d8' },
          title: { display: true, text: 'number of communes', font: { size: 11 }, color: INK_MUTE },
          ticks: { font: { size: 11 } },
        },
      },
    },
  });
}
