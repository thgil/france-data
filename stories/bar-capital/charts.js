// stories/bar-capital/charts.js
// Bar charts for the bar-capital story.
// No map — this is a text + chart story.
// Exports: drawCommuneChart, drawDeptCharts

const AMBER = '#c67c00';
const GREY  = '#d0c8b8';

function fmtNum(n) {
  return Number(n).toLocaleString('fr-FR');
}

// Draws a horizontal bar chart of top communes by bars per 1,000.
// selector: CSS selector for the container element
// communes: array of { name, deptName, bars, pop, per_1000 }
export function drawCommuneChart(selector, communes) {
  const container = document.querySelector(selector);
  if (!container) return;

  const max = communes[0].per_1000;
  const nationalAvg = 0.75;

  const rows = communes.map((c, i) => {
    const widthPct = (c.per_1000 / (max * 1.08) * 100).toFixed(1);
    const label = `${c.name} <span class="chart-sub">${c.deptName}</span>`;
    return `
      <div class="hbar-row${i === 0 ? ' hbar-row--top' : ''}">
        <div class="hbar-label">${label}</div>
        <div class="hbar-track">
          <div class="hbar-fill" style="width:${widthPct}%"></div>
        </div>
        <div class="hbar-value">${c.per_1000}</div>
      </div>`;
  }).join('');

  const avgWidthPct = (nationalAvg / (max * 1.08) * 100).toFixed(1);
  const avgRow = `
    <div class="hbar-row hbar-row--avg">
      <div class="hbar-label">France average</div>
      <div class="hbar-track">
        <div class="hbar-fill hbar-fill--avg" style="width:${avgWidthPct}%"></div>
      </div>
      <div class="hbar-value">0.75</div>
    </div>`;

  container.innerHTML = `
    <div class="hbar-chart">
      <div class="hbar-unit">Bars per 1,000 residents (minimum 200 residents)</div>
      ${rows}
      ${avgRow}
    </div>`;
}

// Draws two dept tables: top N and bottom N by bars per 1,000.
// topSelector / bottomSelector: CSS selectors for tbody elements
export function drawDeptCharts(topSelector, bottomSelector, depts) {
  const topMax = depts[0].per_1000;

  const renderRow = (d, i, refMax, isBottom) => {
    const widthPct = (d.per_1000 / (refMax * 1.08) * 100).toFixed(1);
    const fillClass = isBottom ? 'hbar-fill hbar-fill--dim' : 'hbar-fill';
    return `
      <tr>
        <td class="dtbl-rank">${i + 1}</td>
        <td class="dtbl-name">${d.name}</td>
        <td class="dtbl-bar">
          <div class="hbar-track hbar-track--sm">
            <div class="${fillClass}" style="width:${widthPct}%"></div>
          </div>
        </td>
        <td class="dtbl-val">${d.per_1000}</td>
      </tr>`;
  };

  const topEl = document.querySelector(topSelector);
  if (topEl) {
    topEl.innerHTML = depts.slice(0, 10).map((d, i) => renderRow(d, i, topMax, false)).join('');
  }

  const bottomDepts = [...depts].sort((a, b) => a.per_1000 - b.per_1000);
  const bottomMax = bottomDepts[bottomDepts.length - 1].per_1000;
  const bottomEl = document.querySelector(bottomSelector);
  if (bottomEl) {
    bottomEl.innerHTML = bottomDepts.slice(0, 10).map((d, i) => renderRow(d, i, bottomMax, true)).join('');
  }
}
