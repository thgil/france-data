// charts.js — zinc-per-head

export function renderDeptChart(container, stats) {
  const { depts, natAvg } = stats;
  const sorted = [...depts].sort((a, b) => b.per10k - a.per10k);
  const max = sorted[0].per10k;

  const SPOTLIGHT = new Set(['2B', '48', '2A', '15', '75', '91', '92', '78', '95', '77']);

  const rows = sorted.map((d, i) => {
    const frac = d.per10k / max;
    const above = d.per10k >= natAvg;
    const spot = SPOTLIGHT.has(d.dept) ? ' spot' : '';
    return `<div class="dr${spot}" data-dept="${d.dept}">
      <span class="dr-rank">${i + 1}</span>
      <span class="dr-name">${d.name}</span>
      <div class="dr-track">
        <div class="dr-fill ${above ? 'fill-hi' : 'fill-lo'}" style="width:${(frac * 100).toFixed(2)}%"></div>
      </div>
      <span class="dr-val">${d.per10k.toFixed(1)}</span>
    </div>`;
  }).join('');

  const avgFrac = ((natAvg / max) * 100).toFixed(2);

  container.innerHTML = `
    <div class="dc-meta">
      <span class="dc-avg-label" style="left:calc(${avgFrac}% + 200px)">
        ← avg&nbsp;${natAvg}
      </span>
    </div>
    <div class="dc-rows">
      <div class="dc-avg-line" style="left:calc(${avgFrac}% + 200px)"></div>
      ${rows}
    </div>
  `;
}

export function renderTopTable(tbody, communes) {
  tbody.innerHTML = communes.slice(0, 12).map((c, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${c.name}</td>
      <td class="place-sub">${c.deptName}</td>
      <td>${c.per10k.toFixed(1)}</td>
    </tr>
  `).join('');
}

export function renderDesertTable(tbody, communes) {
  tbody.innerHTML = communes.slice(0, 8).map((c, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${c.name}</td>
      <td class="place-sub">${c.deptName}</td>
      <td>${c.per10k.toFixed(1)}</td>
    </tr>
  `).join('');
}
