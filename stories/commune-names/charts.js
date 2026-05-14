/* commune-names/charts.js — bar charts rendered as accessible HTML */

function makeHorizBar(container, rows, opts = {}) {
  const { valueKey = 'count', labelKey = 'name', color = '#8b1a1a', maxBars = 15 } = opts;
  const slice = rows.slice(0, maxBars);
  const maxVal = Math.max(...slice.map(r => r[valueKey]));

  const html = slice.map((row, i) => {
    const pct = (row[valueKey] / maxVal * 100).toFixed(1);
    return `
      <div class="hbar-row">
        <div class="hbar-label">${row[labelKey]}</div>
        <div class="hbar-track">
          <div class="hbar-fill" style="width:${pct}%;background:${color}" title="${row[valueKey]}"></div>
          <span class="hbar-value">${row[valueKey].toLocaleString('fr-FR')}</span>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = html;
}

export function drawSaintsChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const saints = stats.topSaints.slice(0, 15).map(d => ({
    name: `Saint-${d.name}`,
    count: d.count,
  }));
  const saintes = stats.topSaintes.slice(0, 5).map(d => ({
    name: `Sainte-${d.name}`,
    count: d.count,
  }));

  const combined = saints.concat(saintes).sort((a, b) => b.count - a.count).slice(0, 15);
  makeHorizBar(el, combined, { color: '#7a3a00' });
}

export function drawDuplicatesChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;
  makeHorizBar(el, stats.mostDuplicated, { color: '#1a4a7a' });
}
