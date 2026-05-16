// charts.js — commune-names story visualisations
// Draws two horizontal bar charts as inline SVGs.

export function drawSaintChart(mountId, topSaints) {
  const el = document.getElementById(mountId);
  if (!el) return;

  const items = topSaints.slice(0, 15);
  const maxCount = items[0].count;

  const barHeight = 28;
  const labelWidth = 130;
  const countWidth = 44;
  const barMaxWidth = 320;
  const gap = 6;
  const height = items.length * (barHeight + gap) + 24;
  const width = labelWidth + barMaxWidth + countWidth + 16;

  const rows = items.map((item, i) => {
    const y = i * (barHeight + gap);
    const barW = Math.round((item.count / maxCount) * barMaxWidth);
    const barColor = '#b32020';
    const labelX = labelWidth - 8;
    const barX = labelWidth;
    const countX = labelWidth + barMaxWidth + 8;

    return `
      <g transform="translate(0,${y})">
        <text x="${labelX}" y="${barHeight / 2 + 5}"
          text-anchor="end"
          font-family="Georgia, serif" font-size="13" fill="#1a1a1a">${item.pattern}</text>
        <rect x="${barX}" y="4" width="${barW}" height="${barHeight - 8}"
          fill="${barColor}" opacity="0.85" rx="2"/>
        <text x="${countX}" y="${barHeight / 2 + 5}"
          font-family="'Helvetica Neue', sans-serif" font-size="12" fill="#444">${item.count}</text>
      </g>`;
  }).join('');

  el.innerHTML = `<svg
    viewBox="0 0 ${width} ${height}"
    style="width:100%;max-width:${width}px;display:block;overflow:visible"
    aria-label="Most common saint patterns in French commune names">
    ${rows}
  </svg>`;
}

export function drawTopNamesChart(mountId, topNames) {
  const el = document.getElementById(mountId);
  if (!el) return;

  const items = topNames.slice(0, 15);
  const maxCount = items[0].count;

  const barHeight = 26;
  const labelWidth = 150;
  const countWidth = 32;
  const barMaxWidth = 260;
  const gap = 5;
  const height = items.length * (barHeight + gap) + 16;
  const width = labelWidth + barMaxWidth + countWidth + 16;

  const rows = items.map((item, i) => {
    const y = i * (barHeight + gap);
    const barW = Math.max(2, Math.round((item.count / maxCount) * barMaxWidth));
    const labelX = labelWidth - 8;
    const barX = labelWidth;
    const countX = labelWidth + barMaxWidth + 8;

    return `
      <g transform="translate(0,${y})">
        <text x="${labelX}" y="${barHeight / 2 + 5}"
          text-anchor="end"
          font-family="Georgia, serif" font-size="13" fill="#1a1a1a">${item.name}</text>
        <rect x="${barX}" y="3" width="${barW}" height="${barHeight - 6}"
          fill="#2a5f8f" opacity="0.8" rx="2"/>
        <text x="${countX}" y="${barHeight / 2 + 5}"
          font-family="'Helvetica Neue', sans-serif" font-size="12" fill="#444">${item.count}</text>
      </g>`;
  }).join('');

  el.innerHTML = `<svg
    viewBox="0 0 ${width} ${height}"
    style="width:100%;max-width:${width}px;display:block;overflow:visible"
    aria-label="Most common commune names in France">
    ${rows}
  </svg>`;
}

export function drawSaintDeptChart(mountId, topSaintDepts) {
  const el = document.getElementById(mountId);
  if (!el) return;

  // Dept code to name map (partial — the ones that appear in the top 10)
  const deptNames = {
    '23': 'Creuse', '07': 'Ardèche', '24': 'Dordogne',
    '87': 'Haute-Vienne', '42': 'Loire', '85': 'Vendée',
    '43': 'Haute-Loire', '48': 'Lozère', '30': 'Gard',
    '19': 'Corrèze', '17': 'Charente-Maritime', '38': 'Isère',
    '71': 'Saône-et-Loire', '76': 'Seine-Maritime', '27': 'Eure',
  };

  const items = topSaintDepts.slice(0, 10).map(d => ({
    label: deptNames[d.dept] || `Dept ${d.dept}`,
    pct: d.pct,
    count: d.saint_count,
    total: d.total,
    dept: d.dept,
  }));
  const maxPct = items[0].pct;

  const barHeight = 28;
  const labelWidth = 140;
  const barMaxWidth = 280;
  const annotWidth = 90;
  const gap = 6;
  const height = items.length * (barHeight + gap) + 16;
  const width = labelWidth + barMaxWidth + annotWidth;

  const rows = items.map((item, i) => {
    const y = i * (barHeight + gap);
    const barW = Math.round((item.pct / maxPct) * barMaxWidth);
    const labelX = labelWidth - 8;
    const barX = labelWidth;
    const annotX = labelWidth + barMaxWidth + 8;

    return `
      <g transform="translate(0,${y})">
        <text x="${labelX}" y="${barHeight / 2 + 5}"
          text-anchor="end"
          font-family="Georgia, serif" font-size="13" fill="#1a1a1a">${item.label}</text>
        <rect x="${barX}" y="4" width="${barW}" height="${barHeight - 8}"
          fill="#7a5c2e" opacity="0.8" rx="2"/>
        <text x="${annotX}" y="${barHeight / 2 + 5}"
          font-family="'Helvetica Neue', sans-serif" font-size="12" fill="#444">${item.pct}%</text>
      </g>`;
  }).join('');

  el.innerHTML = `<svg
    viewBox="0 0 ${width} ${height}"
    style="width:100%;max-width:${width}px;display:block;overflow:visible"
    aria-label="French départements with the highest share of saint-named communes">
    ${rows}
  </svg>`;
}
