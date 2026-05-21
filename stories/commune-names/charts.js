// stories/commune-names/charts.js
// SVG bar charts for commune name statistics.
// Exports: drawSaintChart(selector, saints), drawLengthChart(selector, lengthDist)

export function drawSaintChart(selector, saints) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 640;
  const barHeight = 28;
  const labelW = 148;
  const countW = 52;
  const barMaxW = W - labelW - countW - 24;
  const H = saints.length * (barHeight + 6) + 24;
  const maxCount = saints[0].count;

  const BLUE = '#2563a8';
  const BLUE_MUTE = '#93b4d8';

  let rows = saints.map((s, i) => {
    const bw = Math.round((s.count / maxCount) * barMaxW);
    const y = i * (barHeight + 6) + 4;
    const label = `Saint(e)-${s.name}`;
    return `
      <g class="bar-row">
        <text x="${labelW - 8}" y="${y + barHeight / 2 + 5}" text-anchor="end"
              font-family="Georgia,serif" font-size="13" fill="#1a1a1a">${label}</text>
        <rect x="${labelW}" y="${y}" width="${bw}" height="${barHeight}"
              fill="${i === 0 ? BLUE : BLUE_MUTE}" rx="2"/>
        <text x="${labelW + bw + 6}" y="${y + barHeight / 2 + 5}"
              font-family="'Helvetica Neue',sans-serif" font-size="12" fill="#555">${s.count}</text>
      </g>`;
  }).join('');

  container.innerHTML = `<svg width="100%" viewBox="0 0 ${W} ${H}" aria-label="Top saint names in French communes">
    ${rows}
  </svg>`;
}

export function drawLengthChart(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Filter to reasonable range (1–45)
  const dist = lengthDist.filter(d => d.len >= 1 && d.len <= 45);
  const maxCount = Math.max(...dist.map(d => d.count));

  const W = container.clientWidth || 640;
  const H = 160;
  const padL = 40;
  const padR = 12;
  const padT = 8;
  const padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const nBins = dist.length;
  const binW = Math.floor(chartW / nBins) - 1;

  const GOLD = '#c67c00';
  const GOLD_MUTE = '#e0b87a';

  // Find median bin (by total communes)
  const total = dist.reduce((s, d) => s + d.count, 0);
  let cum = 0;
  let medianLen = 0;
  for (const d of dist) {
    cum += d.count;
    if (cum >= total / 2) { medianLen = d.len; break; }
  }

  const bars = dist.map((d, i) => {
    const bh = Math.round((d.count / maxCount) * chartH);
    const x = padL + i * (binW + 1);
    const y = padT + chartH - bh;
    const highlight = (d.len === 1 || d.len === medianLen || d.len === 45);
    return `<rect x="${x}" y="${y}" width="${binW}" height="${bh}"
              fill="${highlight ? GOLD : GOLD_MUTE}" rx="1"
              title="${d.len} chars: ${d.count} communes"/>`;
  }).join('');

  // Y-axis tick labels
  const yLabels = [0, Math.round(maxCount / 2), maxCount].map(v => {
    const y = padT + chartH - Math.round((v / maxCount) * chartH);
    return `<text x="${padL - 4}" y="${y + 4}" text-anchor="end"
              font-family="'Helvetica Neue',sans-serif" font-size="10" fill="#888">${v.toLocaleString('fr-FR')}</text>`;
  }).join('');

  // X-axis tick labels (every 5)
  const xLabels = dist.filter(d => d.len % 5 === 0 || d.len === 1).map((d, _) => {
    const i = dist.indexOf(d);
    const x = padL + i * (binW + 1) + binW / 2;
    return `<text x="${x}" y="${H - 6}" text-anchor="middle"
              font-family="'Helvetica Neue',sans-serif" font-size="10" fill="#888">${d.len}</text>`;
  }).join('');

  // Annotation: median
  const medI = dist.findIndex(d => d.len === medianLen);
  const medX = padL + medI * (binW + 1) + binW / 2;
  const annotation = `
    <line x1="${medX}" y1="${padT}" x2="${medX}" y2="${padT + chartH}"
          stroke="#b32020" stroke-width="1" stroke-dasharray="3,3"/>
    <text x="${medX + 4}" y="${padT + 14}"
          font-family="'Helvetica Neue',sans-serif" font-size="10" fill="#b32020">median: ${medianLen}</text>`;

  container.innerHTML = `<svg width="100%" viewBox="0 0 ${W} ${H}" aria-label="Name length distribution">
    <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + chartH}" stroke="#ccc" stroke-width="1"/>
    <line x1="${padL}" y1="${padT + chartH}" x2="${W - padR}" y2="${padT + chartH}" stroke="#ccc" stroke-width="1"/>
    ${yLabels}
    ${bars}
    ${annotation}
    ${xLabels}
    <text x="${W / 2}" y="${H}" text-anchor="middle"
          font-family="'Helvetica Neue',sans-serif" font-size="10" fill="#888">name length (characters)</text>
  </svg>`;
}
