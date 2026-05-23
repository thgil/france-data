/**
 * Charts for the commune-names story.
 * Two inline SVG charts: top common names + saint depts.
 */

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#e0d8cc';
const RED   = '#b32020';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(parent, x, y, text, attrs = {}) {
  const el = svgEl('text', { x, y, ...attrs });
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

/**
 * Horizontal bar chart.
 * @param {string} selector - CSS selector for container
 * @param {Array<{label: string, value: number}>} rows
 * @param {object} opts
 */
export function drawHBar(selector, rows, opts = {}) {
  const container = document.querySelector(selector);
  if (!container) return;

  const {
    barColor = RED,
    labelWidth = 220,
    rowH = 26,
    fontSize = 13,
    valueLabel = v => v,
  } = opts;

  const W = container.clientWidth || 680;
  const margin = { top: 10, right: 60, bottom: 10, left: labelWidth };
  const innerW = W - margin.left - margin.right;
  const H = rows.length * rowH + margin.top + margin.bottom;

  const maxVal = Math.max(...rows.map(r => r.value));

  const svg = svgEl('svg', {
    width: W,
    height: H,
    viewBox: `0 0 ${W} ${H}`,
    style: 'display:block;overflow:visible',
  });

  rows.forEach((row, i) => {
    const y = margin.top + i * rowH;
    const barW = (row.value / maxVal) * innerW;
    const barY = y + rowH * 0.15;
    const barH = rowH * 0.7;

    // Row background on hover
    const bg = svgEl('rect', {
      x: 0, y,
      width: W, height: rowH,
      fill: 'transparent',
    });
    svg.appendChild(bg);

    // Label
    svgText(svg, margin.left - 8, y + rowH * 0.65, row.label, {
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': fontSize,
      fill: INK,
    });

    // Bar
    const bar = svgEl('rect', {
      x: margin.left, y: barY,
      width: Math.max(barW, 2), height: barH,
      fill: barColor,
      opacity: 0.85,
    });
    svg.appendChild(bar);

    // Value label
    svgText(svg, margin.left + barW + 6, y + rowH * 0.65, valueLabel(row.value), {
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': 11,
      fill: MUTE,
    });
  });

  // Axis line
  const axis = svgEl('line', {
    x1: margin.left, y1: margin.top,
    x2: margin.left, y2: H - margin.bottom,
    stroke: RULE, 'stroke-width': 1,
  });
  svg.appendChild(axis);

  container.innerHTML = '';
  container.appendChild(svg);
}

/**
 * Name-length distribution — small area/bar sparkline.
 */
export function drawLengthDist(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const entries = Object.entries(lengthDist)
    .map(([k, v]) => ({ len: +k, count: v }))
    .filter(e => e.len >= 1 && e.len <= 25)
    .sort((a, b) => a.len - b.len);

  const W = container.clientWidth || 680;
  const H = 120;
  const margin = { top: 16, right: 16, bottom: 32, left: 40 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;

  const maxCount = Math.max(...entries.map(e => e.count));
  const barW = innerW / entries.length;

  const svg = svgEl('svg', {
    width: W, height: H,
    viewBox: `0 0 ${W} ${H}`,
    style: 'display:block',
  });

  // Y axis label
  svgText(svg, 8, margin.top + innerH / 2, 'communes', {
    'font-family': "'Helvetica Neue', sans-serif",
    'font-size': 10,
    fill: MUTE,
    transform: `rotate(-90, 8, ${margin.top + innerH / 2})`,
    'text-anchor': 'middle',
  });

  entries.forEach((e, i) => {
    const x = margin.left + i * barW;
    const bh = (e.count / maxCount) * innerH;
    const by = margin.top + innerH - bh;

    // Highlight peak bar
    const isPeak = e.count === maxCount;

    const bar = svgEl('rect', {
      x: x + 1, y: by,
      width: Math.max(barW - 2, 1), height: bh,
      fill: isPeak ? RED : '#c0b8a8',
      opacity: isPeak ? 0.9 : 0.6,
    });
    svg.appendChild(bar);

    // X axis labels at every 5
    if (e.len % 5 === 0 || e.len === 1) {
      svgText(svg, x + barW / 2, H - 6, e.len, {
        'font-family': "'Helvetica Neue', sans-serif",
        'font-size': 10,
        fill: MUTE,
        'text-anchor': 'middle',
      });
    }
  });

  // Axis
  svg.appendChild(svgEl('line', {
    x1: margin.left, y1: margin.top + innerH,
    x2: margin.left + innerW, y2: margin.top + innerH,
    stroke: RULE, 'stroke-width': 1,
  }));

  // Peak annotation
  const peakEntry = entries.reduce((a, b) => a.count > b.count ? a : b);
  const pi = entries.findIndex(e => e.len === peakEntry.len);
  const px = margin.left + pi * barW + barW / 2;
  svgText(svg, px, margin.top - 2, `peak: ${peakEntry.len} chars`, {
    'font-family': "'Helvetica Neue', sans-serif",
    'font-size': 10,
    fill: RED,
    'text-anchor': 'middle',
  });

  container.innerHTML = '';
  container.appendChild(svg);
}
