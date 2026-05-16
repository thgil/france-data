// stories/baguette-capital/charts.js
// Renders three horizontal bar charts:
//   #chart-count    — top 15 communes by raw bakery count
//   #chart-density  — top 15 communes by bakeries per 10k (pop ≥ 2000)
//   #chart-depts    — 8 IDF départements by bakeries per 10k

export async function drawCharts() {
  const res = await fetch('./stats.json');
  const data = await res.json();

  drawBarChart('#chart-count', data.topByCount, (d) => d.bakeries, (d) => d.bakeries.toString(), '#b32020');
  drawBarChart('#chart-density', data.topByDensity, (d) => d.per10k, (d) => d.per10k.toFixed(1), '#c67c00');
  drawDeptChart('#chart-depts', data.departements, data.idfPer10k);
}

function shortName(name) {
  return name
    .replace('Arrondissement', 'arr.')
    .replace('Paris ', 'Paris ')
    .trim();
}

function drawBarChart(selector, rows, getValue, formatValue, color) {
  const el = document.querySelector(selector);
  if (!el) return;

  const max = Math.max(...rows.map(getValue));

  el.innerHTML = rows.map((row, i) => {
    const val = getValue(row);
    const pct = (val / max * 100).toFixed(1);
    return `
      <div class="bc-row">
        <span class="bc-rank">${i + 1}</span>
        <span class="bc-label" title="${row.name}">${shortName(row.name)}</span>
        <div class="bc-track">
          <div class="bc-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <span class="bc-value">${formatValue(row)}</span>
      </div>`;
  }).join('');
}

function drawDeptChart(selector, rows, idfAvg) {
  const el = document.querySelector(selector);
  if (!el) return;

  const max = Math.max(...rows.map((d) => d.per10k));

  el.innerHTML = rows.map((dept) => {
    const pct = (dept.per10k / max * 100).toFixed(1);
    const avgPct = (idfAvg / max * 100).toFixed(1);
    return `
      <div class="bc-row">
        <span class="bc-label bc-label-dept">${dept.name}</span>
        <div class="bc-track" style="position:relative">
          <div class="bc-fill" style="width:${pct}%;background:#b32020"></div>
          <div class="bc-avg-line" style="left:${avgPct}%"></div>
        </div>
        <span class="bc-value">${dept.per10k.toFixed(1)}</span>
      </div>`;
  }).join('');

  const legend = document.querySelector('#dept-avg-label');
  if (legend) legend.textContent = `IDF avg: ${idfAvg.toFixed(1)}/10k`;
}
