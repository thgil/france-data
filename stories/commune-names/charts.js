/* charts.js — commune-names story */

export function drawDuplicatesChart(selector, topDuplicates) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = topDuplicates.slice(0, 12);
  const maxCount = data[0].count;

  container.innerHTML = data.map(d => {
    const pct = (d.count / maxCount * 100).toFixed(1);
    return `
      <div class="bar-row">
        <div class="bar-label">${d.name}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="bar-value">${d.count}×</div>
      </div>`;
  }).join('');
}

export function drawLengthChart(selector, lengthGroups) {
  const container = document.querySelector(selector);
  if (!container) return;

  const maxCount = Math.max(...lengthGroups.map(g => g.count));

  container.innerHTML = lengthGroups.map(g => {
    const pct = (g.count / maxCount * 100).toFixed(1);
    const formatted = g.count.toLocaleString('fr-FR');
    return `
      <div class="bar-row">
        <div class="bar-label mono">${g.range}</div>
        <div class="bar-track">
          <div class="bar-fill blue" style="width:${pct}%"></div>
        </div>
        <div class="bar-value">${formatted}</div>
      </div>`;
  }).join('');
}
