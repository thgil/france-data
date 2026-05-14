/**
 * Commune Names story — chart renderers
 *
 * Exports:
 *   drawNameChart(containerSel, stats) — horizontal bar chart of top names
 *   drawLengthChart(containerSel, stats) — length distribution histogram
 */

export function drawNameChart(containerSel, stats) {
  const container = document.querySelector(containerSel);
  if (!container) return;

  const top = stats.top30.slice(0, 20);
  const maxCount = top[0].count;

  const table = document.createElement('table');
  table.className = 'name-chart-table';

  top.forEach((row, i) => {
    const pct = (row.count / maxCount * 100).toFixed(1);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="nc-rank">${i + 1}</td>
      <td class="nc-name">${row.name}</td>
      <td class="nc-bar-cell">
        <div class="nc-bar-wrap">
          <div class="nc-bar" style="width:${pct}%"></div>
        </div>
      </td>
      <td class="nc-count">${row.count}</td>
    `;
    table.appendChild(tr);
  });

  container.appendChild(table);
}

export function drawLengthChart(containerSel, stats) {
  const container = document.querySelector(containerSel);
  if (!container) return;

  const shortNames = stats.shortest.filter(s => s.len <= 3);

  const wrapper = document.createElement('div');
  wrapper.className = 'length-extremes';

  const shortDiv = document.createElement('div');
  shortDiv.className = 'extreme-block';
  shortDiv.innerHTML = `
    <h4 class="extreme-label">Shortest</h4>
    <table class="extreme-table">
      <tbody>
        ${shortNames.map(s => `
          <tr>
            <td class="et-name">${s.name}</td>
            <td class="et-len">${s.len} letter${s.len === 1 ? '' : 's'}</td>
            <td class="et-dept">Dept. ${s.depts.join(', ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const longDiv = document.createElement('div');
  longDiv.className = 'extreme-block';
  longDiv.innerHTML = `
    <h4 class="extreme-label">Longest</h4>
    <table class="extreme-table">
      <tbody>
        ${stats.longest.slice(0, 5).map(s => `
          <tr>
            <td class="et-name et-long">${s.name}</td>
            <td class="et-len">${s.len} letters</td>
            <td class="et-dept">Dept. ${s.depts.join(', ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  wrapper.appendChild(shortDiv);
  wrapper.appendChild(longDiv);
  container.appendChild(wrapper);
}
