/* village-names/charts.js — bar charts for commune name analysis */

const BAR_COLOR = '#b32020';
const BAR_DIM   = '#d8c8c8';

function drawHorizBars(selector, items, { valueKey = 'count', labelKey = 'name', color = BAR_COLOR } = {}) {
  const el = document.querySelector(selector);
  if (!el) return;

  const max = Math.max(...items.map(d => d[valueKey]));

  el.innerHTML = items.map(d => {
    const pct = (d[valueKey] / max * 100).toFixed(1);
    return `<div class="hbar-row">
      <div class="hbar-label">${d[labelKey]}</div>
      <div class="hbar-track">
        <div class="hbar-fill" style="width:${pct}%;background:${color}"></div>
      </div>
      <div class="hbar-value">${d[valueKey]}</div>
    </div>`;
  }).join('');
}

function drawLengthDist(selector, dist) {
  const el = document.querySelector(selector);
  if (!el) return;

  const max = Math.max(...dist.map(d => d.count));
  const bins = dist.filter(d => d.len >= 1 && d.len <= 30);

  el.innerHTML = `<div class="hist-wrap">${bins.map(d => {
    const h = Math.max(2, Math.round((d.count / max) * 120));
    const highlight = d.len <= 2 || d.len >= 35;
    return `<div class="hist-col" title="${d.len} chars: ${d.count.toLocaleString('fr-FR')} communes">
      <div class="hist-bar" style="height:${h}px;background:${highlight ? BAR_COLOR : BAR_DIM}"></div>
      <div class="hist-tick">${d.len % 5 === 0 ? d.len : ''}</div>
    </div>`;
  }).join('')}</div>
  <div class="hist-xlabel">Name length (characters)</div>`;
}

export { drawHorizBars, drawLengthDist };
