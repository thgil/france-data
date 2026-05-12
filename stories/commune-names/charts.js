// stories/commune-names/charts.js
// Draws two SVG charts: name-length histogram and top-names bar chart.

const CREAM  = '#faf7f2';
const INK    = '#1a1a1a';
const MUTED  = '#888';
const ACCENT = '#b32020';
const RULE   = '#e0d8cc';
const BAR_CLR = '#c67c00';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ── Histogram: name length distribution ──────────────────────────────────────
export function drawLengthHistogram(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const hist = stats.lenHistogram; // [{len, count}]
  const maxCount = Math.max(...hist.map(d => d.count));

  const W = 680, H = 220;
  const marginL = 48, marginR = 16, marginT = 16, marginB = 40;
  const innerW = W - marginL - marginR;
  const innerH = H - marginT - marginB;
  const barW = Math.floor(innerW / hist.length) - 1;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:680px;display:block;overflow:visible',
    role: 'img',
    'aria-label': 'Histogram of commune name lengths in characters',
  });

  // Y-axis ticks
  const yTicks = [0, 1000, 2000, 3000, 4000];
  for (const t of yTicks) {
    const y = marginT + innerH - (t / maxCount) * innerH;
    const line = svgEl('line', { x1: marginL, x2: W - marginR, y1: y, y2: y, stroke: RULE, 'stroke-width': 1 });
    svg.appendChild(line);
    const label = svgEl('text', {
      x: marginL - 6, y: y + 4,
      'font-size': 10, 'text-anchor': 'end', fill: MUTED,
      'font-family': "Helvetica Neue, sans-serif",
    });
    label.textContent = t === 0 ? '0' : `${t / 1000}k`;
    svg.appendChild(label);
  }

  // Bars
  hist.forEach((d, i) => {
    const x = marginL + i * (innerW / hist.length);
    const barH = (d.count / maxCount) * innerH;
    const y = marginT + innerH - barH;

    const rect = svgEl('rect', {
      x: x + 1, y, width: Math.max(barW, 2), height: barH,
      fill: d.len <= 2 ? ACCENT : BAR_CLR,
      opacity: d.count === 0 ? 0 : 1,
    });
    // Tooltip via title
    const title = svgEl('title');
    title.textContent = `${d.len} char${d.len !== 1 ? 's' : ''}: ${d.count.toLocaleString('fr-FR')} communes`;
    rect.appendChild(title);
    svg.appendChild(rect);
  });

  // X-axis labels (every 5 chars)
  for (let l = 5; l <= 45; l += 5) {
    const idx = hist.findIndex(d => d.len === l);
    if (idx < 0) continue;
    const x = marginL + idx * (innerW / hist.length) + barW / 2;
    const label = svgEl('text', {
      x, y: H - marginB + 14,
      'font-size': 10, 'text-anchor': 'middle', fill: MUTED,
      'font-family': "Helvetica Neue, sans-serif",
    });
    label.textContent = l;
    svg.appendChild(label);
  }

  // Axis label
  const axisLabel = svgEl('text', {
    x: marginL + innerW / 2, y: H - 4,
    'font-size': 10, 'text-anchor': 'middle', fill: MUTED,
    'font-family': "Helvetica Neue, sans-serif",
  });
  axisLabel.textContent = 'Name length (characters)';
  svg.appendChild(axisLabel);

  // Annotation: Y (1 char)
  const yIdx = hist.findIndex(d => d.len === 1);
  if (yIdx >= 0) {
    const x = marginL + yIdx * (innerW / hist.length) + barW / 2;
    const barH = (hist[yIdx].count / maxCount) * innerH;
    const barTop = marginT + innerH - barH;
    const ann = svgEl('text', {
      x: x + 12, y: barTop + 4,
      'font-size': 10, fill: ACCENT,
      'font-family': "Helvetica Neue, sans-serif",
      'font-style': 'italic',
    });
    ann.textContent = '"Y" — 1 commune';
    svg.appendChild(ann);
  }

  container.appendChild(svg);
}

// ── Horizontal bar chart: top commune names ──────────────────────────────────
export function drawTopNames(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = stats.mostCommon.slice(0, 10);
  const maxCount = data[0].count;

  const W = 560, rowH = 28, marginL = 160, marginR = 60;
  const H = data.length * rowH + 16;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:560px;display:block',
    role: 'img',
    'aria-label': 'Top 10 most common commune names in France',
  });

  data.forEach((d, i) => {
    const y = i * rowH + 8;
    const innerW = W - marginL - marginR;
    const barLen = (d.count / maxCount) * innerW;

    // Name label
    const label = svgEl('text', {
      x: marginL - 8, y: y + rowH / 2 + 4,
      'font-size': 12, 'text-anchor': 'end', fill: INK,
      'font-family': "Georgia, serif",
    });
    label.textContent = d.name;
    svg.appendChild(label);

    // Bar
    const rect = svgEl('rect', {
      x: marginL, y: y + 4,
      width: Math.max(barLen, 2), height: rowH - 10,
      fill: BAR_CLR,
    });
    svg.appendChild(rect);

    // Count label
    const countLabel = svgEl('text', {
      x: marginL + barLen + 5, y: y + rowH / 2 + 4,
      'font-size': 11, fill: MUTED,
      'font-family': "Helvetica Neue, sans-serif",
    });
    countLabel.textContent = `× ${d.count}`;
    svg.appendChild(countLabel);
  });

  container.appendChild(svg);
}
