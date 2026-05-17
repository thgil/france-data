// stories/commune-names/charts.js
// Pure SVG / D3-lite charts for the commune-names story.
// No external map library needed — text and bars are the medium.

// ── Tiny D3-lite helpers ──────────────────────────────────────────────────────

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function textEl(tag, text, attrs = {}) {
  const el = svgEl(tag, attrs);
  el.textContent = text;
  return el;
}

// ── Colour palette ────────────────────────────────────────────────────────────

const ACCENT  = '#b32020';
const MUTED   = '#ccc5b9';
const INK     = '#1a1a1a';
const PAPER   = '#faf7f2';
const GOLD    = '#c67c00';

// ── Length histogram ──────────────────────────────────────────────────────────

export function drawLengthHistogram(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const hist = stats.lengthHist;               // [{len, count}, ...]
  const maxCount = Math.max(...hist.map(d => d.count));

  const W = 680, H = 220;
  const pad = { top: 16, right: 16, bottom: 36, left: 48 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:680px;display:block;overflow:visible',
    'aria-label': 'Distribution of commune name lengths',
    role: 'img',
  });

  const g = svgEl('g', { transform: `translate(${pad.left},${pad.top})` });
  svg.appendChild(g);

  const barW = innerW / hist.length;

  // Y gridlines
  for (const pct of [0.25, 0.5, 0.75, 1.0]) {
    const y = innerH - pct * innerH;
    g.appendChild(svgEl('line', {
      x1: 0, x2: innerW, y1: y, y2: y,
      stroke: '#e0d8cc', 'stroke-width': 1,
    }));
    g.appendChild(textEl('text',
      (pct * maxCount / 1000).toFixed(1) + 'k',
      { x: -6, y: y + 4, 'text-anchor': 'end', fill: '#999', 'font-size': 11 }
    ));
  }

  // Bars
  hist.forEach((d, i) => {
    const barH = (d.count / maxCount) * innerH;
    const x = i * barW;
    const y = innerH - barH;
    const highlight = d.len === 1 || d.len === 45;
    g.appendChild(svgEl('rect', {
      x: x + 1, y, width: Math.max(barW - 2, 1), height: barH,
      fill: highlight ? ACCENT : MUTED,
    }));
  });

  // X axis ticks
  for (const len of [1, 5, 10, 15, 20, 25, 30, 35, 40, 45]) {
    const i = len - 1;
    const x = i * barW + barW / 2;
    g.appendChild(textEl('text', len, {
      x, y: innerH + 18,
      'text-anchor': 'middle', fill: '#666', 'font-size': 11,
    }));
  }

  // X axis label
  g.appendChild(textEl('text', 'characters in commune name', {
    x: innerW / 2, y: innerH + 34,
    'text-anchor': 'middle', fill: '#999', 'font-size': 11,
  }));

  // Annotations
  // Y (len=1) is bar index 0
  const yBarX = 0 * barW + barW / 2;
  const yBarTop = innerH - (hist[0].count / maxCount) * innerH;
  const ann1 = svgEl('g');
  ann1.appendChild(svgEl('line', { x1: yBarX, x2: yBarX, y1: yBarTop - 4, y2: yBarTop - 28, stroke: ACCENT, 'stroke-width': 1 }));
  ann1.appendChild(textEl('text', '"Y"', { x: yBarX, y: yBarTop - 32, 'text-anchor': 'middle', fill: ACCENT, 'font-size': 11, 'font-style': 'italic' }));
  g.appendChild(ann1);

  // Longest (len=45) is bar index 44
  if (hist[44] && hist[44].count > 0) {
    const longBarX = 44 * barW + barW / 2;
    const longBarTop = innerH - (hist[44].count / maxCount) * innerH;
    const ann2 = svgEl('g');
    ann2.appendChild(svgEl('line', { x1: longBarX, x2: longBarX, y1: longBarTop - 4, y2: longBarTop - 28, stroke: ACCENT, 'stroke-width': 1 }));
    ann2.appendChild(textEl('text', '45 chars', { x: longBarX - 2, y: longBarTop - 32, 'text-anchor': 'end', fill: ACCENT, 'font-size': 11 }));
    g.appendChild(ann2);
  }

  container.appendChild(svg);
}

// ── Top saint names horizontal bar chart ─────────────────────────────────────

export function drawSaintChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = stats.topSaints.slice(0, 12);
  const maxVal = data[0].count;

  const rowH = 28;
  const labelW = 90;
  const W = 640, H = data.length * rowH + 32;
  const barMaxW = W - labelW - 80;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:640px;display:block',
    'aria-label': 'Most common saints in French commune names',
    role: 'img',
  });

  data.forEach((d, i) => {
    const y = i * rowH + 16;
    const barW = (d.count / maxVal) * barMaxW;
    const isTop = i === 0;

    svg.appendChild(svgEl('rect', {
      x: labelW, y: y - 10, width: barW, height: 20,
      fill: isTop ? ACCENT : MUTED,
    }));

    svg.appendChild(textEl('text', `Saint-${d.saint}`, {
      x: labelW - 8, y: y + 4,
      'text-anchor': 'end', fill: INK, 'font-size': 13,
      'font-family': 'Georgia, serif',
    }));

    svg.appendChild(textEl('text', d.count, {
      x: labelW + barW + 8, y: y + 4,
      'text-anchor': 'start', fill: '#555', 'font-size': 12,
    }));
  });

  container.appendChild(svg);
}

// ── Top repeated names bar chart ──────────────────────────────────────────────

export function drawDuplicatesChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = stats.topNames.slice(0, 12);
  const maxVal = data[0].count;

  const rowH = 28;
  const labelW = 170;
  const W = 640, H = data.length * rowH + 32;
  const barMaxW = W - labelW - 60;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:640px;display:block',
    'aria-label': 'Most duplicated commune names in France',
    role: 'img',
  });

  data.forEach((d, i) => {
    const y = i * rowH + 16;
    const barW = (d.count / maxVal) * barMaxW;
    const isTop = i === 0;

    svg.appendChild(svgEl('rect', {
      x: labelW, y: y - 10, width: barW, height: 20,
      fill: isTop ? GOLD : MUTED,
    }));

    svg.appendChild(textEl('text', d.name, {
      x: labelW - 8, y: y + 4,
      'text-anchor': 'end', fill: INK, 'font-size': 13,
      'font-family': 'Georgia, serif',
    }));

    svg.appendChild(textEl('text', `×${d.count}`, {
      x: labelW + barW + 8, y: y + 4,
      'text-anchor': 'start', fill: '#555', 'font-size': 12,
    }));
  });

  container.appendChild(svg);
}
