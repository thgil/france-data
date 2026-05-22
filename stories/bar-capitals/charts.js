// stories/bar-capitals/charts.js
// Horizontal bar chart renderer for bar-capitals story.
// Draws SVG bar charts for resort and city rankings.

export function drawBarChart(containerSelector, data, opts = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const {
    valueKey = 'per10k',
    labelKey = 'name',
    color = '#c67c00',
    unit = '/10k',
    maxItems = 12,
    formatVal = v => v.toFixed(1),
  } = opts;

  const items = data.slice(0, maxItems);
  const maxVal = Math.max(...items.map(d => d[valueKey]));

  const rows = items.map((d, i) => {
    const pct = (d[valueKey] / maxVal * 100).toFixed(1);
    const val = formatVal(d[valueKey]);
    const barWidth = Math.max(2, pct);
    return `
      <div class="bc-row">
        <div class="bc-rank">${i + 1}</div>
        <div class="bc-label">
          <span class="bc-name">${d[labelKey]}</span>
          <span class="bc-meta">${d.dept ? 'dept. ' + d.dept : ''}</span>
        </div>
        <div class="bc-bar-wrap">
          <div class="bc-bar" style="width:${barWidth}%;background:${color}"></div>
        </div>
        <div class="bc-val">${val}${unit}</div>
      </div>`;
  }).join('');

  container.innerHTML = `<div class="bc-chart">${rows}</div>`;
}

export function drawPopTable(containerSelector, data, opts = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const { maxItems = 10 } = opts;
  const items = data.slice(0, maxItems);

  const rows = items.map((d, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${d.name}</td>
      <td class="num">${d.pop.toLocaleString('fr-FR')}</td>
    </tr>`).join('');

  container.innerHTML = rows;
}
