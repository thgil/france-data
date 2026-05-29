/* charts.js — what's-in-a-name */

export function drawTopNames(containerId, data) {
  const el = document.querySelector(containerId);
  if (!el) return;

  const max = data[0].count;
  el.innerHTML = data.map((d, i) => `
    <div class="chart-row">
      <div class="chart-label">${escHtml(d.name)}</div>
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="width:${(d.count / max * 100).toFixed(1)}%"></div>
        <span class="chart-val">${d.count}</span>
      </div>
    </div>
  `).join('');
}

export function drawTopSaints(containerId, data) {
  const el = document.querySelector(containerId);
  if (!el) return;

  const max = data[0].count;
  el.innerHTML = data.map((d, i) => `
    <div class="chart-row">
      <div class="chart-label">Saint-${escHtml(d.saint)}</div>
      <div class="chart-bar-wrap">
        <div class="chart-bar chart-bar-saint" style="width:${(d.count / max * 100).toFixed(1)}%"></div>
        <span class="chart-val">${d.count}</span>
      </div>
    </div>
  `).join('');
}

export function drawLengthChart(containerId, data) {
  const el = document.querySelector(containerId);
  if (!el) return;

  const max = Math.max(...data.map(d => d.count));
  const items = data.filter(d => d.count > 0);

  el.innerHTML = items.map(d => `
    <div class="len-col" title="${d.chars} chars: ${d.count.toLocaleString('fr-FR')} communes">
      <div class="len-bar" style="height:${Math.max(2, (d.count / max * 120)).toFixed(0)}px"></div>
      ${String(d.chars).length <= 2 ? `<div class="len-label">${d.chars}</div>` : ''}
    </div>
  `).join('');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
