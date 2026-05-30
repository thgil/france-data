// stories/commune-names/charts.js
// SVG charts for commune-names story.
// Exports: drawLengthHistogram, drawMostCommonChart

export function drawLengthHistogram(selector, lengthDist) {
  const el = document.querySelector(selector);
  if (!el) return;

  // Build array of {length, count} sorted by length
  const data = Object.entries(lengthDist)
    .map(([l, c]) => ({ length: parseInt(l), count: c }))
    .filter(d => d.length <= 30)  // clip outliers for readability
    .sort((a, b) => a.length - b.length);

  const W = el.clientWidth || 640;
  const H = 220;
  const MARGIN = { top: 16, right: 16, bottom: 40, left: 48 };
  const innerW = W - MARGIN.left - MARGIN.right;
  const innerH = H - MARGIN.top - MARGIN.bottom;

  const maxCount = Math.max(...data.map(d => d.count));
  const barW = Math.floor(innerW / data.length) - 1;

  const scaleX = (i) => MARGIN.left + i * (innerW / data.length) + 1;
  const scaleY = (c) => MARGIN.top + innerH - (c / maxCount) * innerH;

  const FILL = '#b8860b';
  const AXIS = '#888';
  const TEXT = '#444';
  const HIGHLIGHT = '#c0392b';  // highlight mode 7-8 (peak)

  let bars = '';
  let xLabels = '';

  data.forEach((d, i) => {
    const x = scaleX(i);
    const y = scaleY(d.count);
    const h = MARGIN.top + innerH - y;
    const isMode = d.length === 7 || d.length === 8;
    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="${isMode ? HIGHLIGHT : FILL}" opacity="0.85"/>`;
    if (d.length % 5 === 0 || d.length <= 4) {
      xLabels += `<text x="${x + barW / 2}" y="${H - MARGIN.bottom + 14}" text-anchor="middle" font-size="10" fill="${AXIS}">${d.length}</text>`;
    }
  });

  // Y axis ticks
  const yTicks = [0, 1000, 2000, 3000, 3695].filter(v => v <= maxCount);
  let yAxis = '';
  yTicks.forEach(v => {
    const y = scaleY(v);
    yAxis += `<line x1="${MARGIN.left - 4}" y1="${y}" x2="${MARGIN.left}" y2="${y}" stroke="${AXIS}" stroke-width="1"/>`;
    yAxis += `<text x="${MARGIN.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="${AXIS}">${v.toLocaleString('fr-FR')}</text>`;
    yAxis += `<line x1="${MARGIN.left}" y1="${y}" x2="${MARGIN.left + innerW}" y2="${y}" stroke="#e8e0d4" stroke-width="0.5"/>`;
  });

  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
    <g>${yAxis}</g>
    <g>${bars}</g>
    <line x1="${MARGIN.left}" y1="${MARGIN.top}" x2="${MARGIN.left}" y2="${MARGIN.top + innerH}" stroke="${AXIS}" stroke-width="1"/>
    <line x1="${MARGIN.left}" y1="${MARGIN.top + innerH}" x2="${MARGIN.left + innerW}" y2="${MARGIN.top + innerH}" stroke="${AXIS}" stroke-width="1"/>
    <g>${xLabels}</g>
    <text x="${MARGIN.left + innerW / 2}" y="${H}" text-anchor="middle" font-size="10" fill="${AXIS}">Name length (characters)</text>
  </svg>`;

  el.innerHTML = svg;
}

export function drawMostCommonChart(selector, mostCommon) {
  const el = document.querySelector(selector);
  if (!el) return;

  const data = mostCommon.slice(0, 15);
  const W = el.clientWidth || 640;
  const ROW_H = 28;
  const LABEL_W = 200;
  const BAR_MAX = W - LABEL_W - 60;
  const H = data.length * ROW_H + 32;
  const maxCount = data[0].count;

  const FILL = '#2c6e8a';
  const TEXT = '#1a1a1a';
  const MUTED = '#888';

  let rows = '';
  data.forEach((d, i) => {
    const y = 16 + i * ROW_H;
    const barW = Math.round((d.count / maxCount) * BAR_MAX);
    rows += `
      <text x="${LABEL_W - 8}" y="${y + 11}" text-anchor="end" font-size="12" font-family="Georgia,serif" fill="${TEXT}">${d.name}</text>
      <rect x="${LABEL_W}" y="${y}" width="${barW}" height="18" fill="${FILL}" opacity="0.8" rx="1"/>
      <text x="${LABEL_W + barW + 6}" y="${y + 11}" font-size="11" fill="${MUTED}">×${d.count}</text>`;
  });

  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
    ${rows}
  </svg>`;

  el.innerHTML = svg;
}
