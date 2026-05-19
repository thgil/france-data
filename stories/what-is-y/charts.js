// stories/what-is-y/charts.js
// Renders two inline horizontal bar charts for the commune-names story.
// No external dependencies.

const ACCENT = '#b32020';
const BAR_BG = '#ede8e0';

function hbar(container, items, { label = 'name', value = 'count', maxVal, color = ACCENT } = {}) {
  const max = maxVal || Math.max(...items.map(d => d[value]));
  const rows = items.map(d => {
    const pct = (d[value] / max * 100).toFixed(1);
    return `
      <div class="hbar-row">
        <div class="hbar-label">${d[label]}</div>
        <div class="hbar-track">
          <div class="hbar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="hbar-value">${d[value].toLocaleString('fr-FR')}</div>
      </div>`;
  });
  container.innerHTML = rows.join('');
}

export function drawSaintsChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;
  hbar(el, stats.topSaints, { label: 'name', value: 'count', color: ACCENT });
}

export function drawRepeatedChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;
  hbar(el, stats.topRepeated, { label: 'name', value: 'count', color: '#4a6e8a' });
}

export function drawLengthHist(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  // Group into buckets of 5 chars for readability
  const buckets = {};
  for (const { len, count } of stats.lengthDist) {
    const bucket = Math.floor((len - 1) / 5) * 5 + 1;
    const key = `${bucket}–${bucket + 4}`;
    buckets[key] = (buckets[key] || 0) + count;
  }
  const items = Object.entries(buckets).map(([name, count]) => ({ name, count }));
  hbar(el, items, { label: 'name', value: 'count', color: '#7a8c5e' });
}
