/* charts.js — commune names story */

export function drawCharts(stats) {
  renderShortestTable(stats);
  renderTopNamesChart(stats);
  renderSaintDeptsChart(stats);
  renderLengthBins(stats);
}

function renderShortestTable(stats) {
  const el = document.getElementById('table-shortest');
  if (!el) return;
  const rows = stats.shortestNames.map(d => {
    const isStar = d.chars === 1;
    return `<tr${isStar ? ' class="row-star"' : ''}>
      <td class="td-name">${isStar ? '<strong>' : ''}${d.name}${isStar ? '</strong>' : ''}</td>
      <td class="td-chars">${d.chars}</td>
      <td class="td-dept">${d.deptName}</td>
      <td class="td-pop">${d.pop.toLocaleString('fr-FR')}</td>
    </tr>`;
  });
  el.querySelector('tbody').innerHTML = rows.join('');
}

function renderTopNamesChart(stats) {
  const el = document.getElementById('chart-top-names');
  if (!el) return;
  const max = stats.topNames[0].count;
  el.innerHTML = stats.topNames.map((d, i) => `
    <div class="bar-row">
      <span class="bar-label">${d.name}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(100 * d.count / max).toFixed(1)}%"></div>
        <span class="bar-value">${d.count}</span>
      </div>
    </div>`).join('');
}

function renderSaintDeptsChart(stats) {
  const el = document.getElementById('chart-saint-depts');
  if (!el) return;
  const max = stats.topSaintDepts[0].count;
  el.innerHTML = stats.topSaintDepts.map(d => `
    <div class="bar-row">
      <span class="bar-label">${d.deptName}</span>
      <div class="bar-track">
        <div class="bar-fill bar-fill-saint" style="width:${(100 * d.count / max).toFixed(1)}%"></div>
        <span class="bar-value">${d.count}</span>
      </div>
    </div>`).join('');
}

function renderLengthBins(stats) {
  const el = document.getElementById('chart-length-bins');
  if (!el) return;
  const max = Math.max(...stats.lengthBins.map(d => d.count));
  el.innerHTML = stats.lengthBins.map(d => `
    <div class="bin-col">
      <div class="bin-bar-wrap">
        <div class="bin-bar" style="height:${(100 * d.count / max).toFixed(1)}%"></div>
      </div>
      <span class="bin-label">${d.label}</span>
      <span class="bin-value">${d.count.toLocaleString('fr-FR')}</span>
    </div>`).join('');
}
