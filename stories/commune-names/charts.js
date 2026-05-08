/* commune-names/charts.js — inline SVG bar charts */

export function drawTopNamesChart(containerSelector, topNames) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const maxCount = topNames[0].count;
  const rows = topNames.map((d, i) => {
    const pct = (d.count / maxCount) * 100;
    return `
      <div class="bar-row">
        <span class="bar-rank">${i + 1}</span>
        <span class="bar-label">${d.name}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>
        <span class="bar-value">${d.count}×</span>
      </div>`;
  }).join('');

  container.innerHTML = `<div class="bar-chart">${rows}</div>`;
}

export function drawRelationalChart(containerSelector, relational) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const items = [
    { label: '‑sur‑', desc: 'on the river', count: relational.sur },
    { label: '‑lès‑', desc: 'near the town', count: relational.les },
    { label: '‑en‑',  desc: 'in the region', count: relational.en },
    { label: '‑sous‑', desc: 'under the hill', count: relational.sous },
  ];
  const maxCount = Math.max(...items.map(d => d.count));

  const rows = items.map(d => {
    const pct = (d.count / maxCount) * 100;
    return `
      <div class="bar-row">
        <span class="bar-label bar-label-mono">${d.label}</span>
        <span class="bar-desc">${d.desc}</span>
        <div class="bar-track">
          <div class="bar-fill bar-fill-muted" style="width:${pct}%"></div>
        </div>
        <span class="bar-value">${d.count.toLocaleString('fr-FR')}</span>
      </div>`;
  }).join('');

  container.innerHTML = `<div class="bar-chart">${rows}</div>`;
}
