/* charts.js — commune name-game visualisations */

export function drawLengthHistogram(selector, lengthHist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const maxCount = Math.max(...lengthHist.map(d => d.count));
  const maxLen = Math.max(...lengthHist.map(d => d.len));

  /* SVG dimensions */
  const W = 640, H = 200;
  const padL = 48, padR = 16, padT = 16, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const barW = Math.max(1, chartW / (maxLen + 1));

  /* Y-axis ticks */
  const yTicks = [0, 2000, 4000, 6000, 8000, 10000, 12000];

  const paper = '#faf7f2';
  const ink = '#1a1a1a';
  const mute = '#999';
  const accent = '#b32020';

  function xPos(len) {
    return padL + (len / (maxLen + 1)) * chartW;
  }
  function yPos(count) {
    return padT + chartH - (count / maxCount) * chartH;
  }

  /* Build bars */
  const bars = lengthHist.map(d => {
    const x = xPos(d.len);
    const y = yPos(d.count);
    const h = padT + chartH - y;
    const col = d.len === 1 ? accent : '#a08c6e';
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(1, barW - 1).toFixed(1)}" height="${h.toFixed(1)}" fill="${col}" opacity="${d.len <= 3 ? '1' : '0.7'}"/>`;
  }).join('');

  /* Y-axis gridlines + labels */
  const gridLines = yTicks.map(v => {
    const y = yPos(Math.min(v, maxCount));
    return `
      <line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="${mute}" stroke-width="0.5" stroke-dasharray="3,3"/>
      <text x="${(padL - 6).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="${mute}" font-family="Helvetica Neue,sans-serif">${v >= 1000 ? (v / 1000) + 'k' : v}</text>
    `;
  }).join('');

  /* X-axis labels every 5 chars */
  const xLabels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45].map(v => {
    const x = xPos(v) + barW / 2;
    return `<text x="${x.toFixed(1)}" y="${(H - 6).toFixed(1)}" text-anchor="middle" font-size="10" fill="${mute}" font-family="Helvetica Neue,sans-serif">${v}</text>`;
  }).join('');

  /* Annotation for Y */
  const yAnnotX = xPos(1) + barW / 2;
  const yAnnotY = yPos(lengthHist.find(d => d.len === 1)?.count || 0) - 8;

  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${W}px;display:block;">
  <rect width="${W}" height="${H}" fill="${paper}"/>
  ${gridLines}
  ${bars}
  ${xLabels}
  <text x="${yAnnotX.toFixed(1)}" y="${yAnnotY.toFixed(1)}" text-anchor="middle" font-size="10" fill="${accent}" font-family="Helvetica Neue,sans-serif" font-weight="600">"Y"</text>
  <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + chartH}" stroke="${ink}" stroke-width="1"/>
  <line x1="${padL}" y1="${padT + chartH}" x2="${W - padR}" y2="${padT + chartH}" stroke="${ink}" stroke-width="1"/>
  <text x="${(W / 2).toFixed(1)}" y="${(H - 1).toFixed(1)}" text-anchor="middle" font-size="10" fill="${mute}" font-family="Helvetica Neue,sans-serif">characters in commune name →</text>
</svg>`;

  container.innerHTML = svg;
}

export function drawTopNamesChart(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const top20 = topNames.slice(0, 20);
  const maxCount = top20[0].count;

  const rowH = 28;
  const labelW = 240;
  const barMaxW = 320;
  const padL = 16, padR = 40, padT = 8;
  const W = padL + labelW + barMaxW + padR;
  const H = padT + top20.length * rowH + 16;

  const paper = '#faf7f2';
  const ink = '#1a1a1a';
  const mute = '#999';
  const barColor = '#7a6045';

  const rows = top20.map((d, i) => {
    const y = padT + i * rowH;
    const bw = (d.count / maxCount) * barMaxW;
    const cx = padL + labelW;
    return `
      <text x="${(padL + labelW - 8).toFixed(1)}" y="${(y + rowH * 0.65).toFixed(1)}" text-anchor="end" font-size="13" fill="${ink}" font-family="Georgia,serif">${d.name}</text>
      <rect x="${cx}" y="${(y + 5).toFixed(1)}" width="${bw.toFixed(1)}" height="${(rowH - 10).toFixed(1)}" fill="${barColor}" opacity="0.75"/>
      <text x="${(cx + bw + 6).toFixed(1)}" y="${(y + rowH * 0.65).toFixed(1)}" font-size="11" fill="${mute}" font-family="Helvetica Neue,sans-serif">${d.count}</text>
      ${i > 0 ? `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="${mute}" stroke-width="0.3"/>` : ''}
    `;
  }).join('');

  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${W}px;display:block;">
  <rect width="${W}" height="${H}" fill="${paper}"/>
  ${rows}
</svg>`;

  container.innerHTML = svg;
}
