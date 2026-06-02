// stories/commune-names/charts.js
// SVG-based bar charts for the commune-names story.
// Exports: drawHorizBar(selector, data, opts), drawLengthHist(selector, data)

const PALETTE = {
  primary:  '#c67c00',
  bar:      '#8b5e00',
  barLight: '#e8a84a',
  label:    '#1a1a1a',
  muted:    '#888',
  grid:     '#e8e0d4',
};

function svg(tag, attrs = {}, children = []) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child) {
      el.appendChild(child);
    }
  }
  return el;
}

function text(content, attrs = {}) {
  return svg('text', attrs, [content]);
}

// Horizontal bar chart
// data: [{label, value}], opts: {title, unit, maxLabelLen, color}
export function drawHorizBar(selector, data, opts = {}) {
  const container = document.querySelector(selector);
  if (!container) return;

  const ROW_H   = 28;
  const MARGIN  = { top: 8, right: 60, bottom: 24, left: 4 };
  const LABEL_W = opts.labelWidth || 200;
  const BAR_AREA_W = opts.barWidth || 340;
  const W = LABEL_W + BAR_AREA_W + MARGIN.right;
  const H = data.length * ROW_H + MARGIN.top + MARGIN.bottom;

  const maxVal = Math.max(...data.map(d => d.value));

  const root = svg('svg', {
    viewBox: `0 0 ${W} ${H}`,
    role: 'img',
    'aria-label': opts.title || 'Bar chart',
    style: 'width:100%;max-width:' + W + 'px;display:block;overflow:visible',
  });

  const g = svg('g', { transform: `translate(${MARGIN.left},${MARGIN.top})` });

  data.forEach((d, i) => {
    const y = i * ROW_H;
    const barW = (d.value / maxVal) * BAR_AREA_W;
    const color = opts.color || PALETTE.primary;

    // Label
    g.appendChild(text(d.label, {
      x: LABEL_W - 8,
      y: y + ROW_H * 0.65,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': '12.5',
      fill: PALETTE.label,
    }));

    // Bar
    g.appendChild(svg('rect', {
      x: LABEL_W,
      y: y + 5,
      width: Math.max(barW, 2),
      height: ROW_H - 10,
      fill: color,
      rx: 2,
    }));

    // Value label
    g.appendChild(text(d.value.toString(), {
      x: LABEL_W + barW + 6,
      y: y + ROW_H * 0.65,
      'font-family': 'var(--sans, Helvetica Neue, sans-serif)',
      'font-size': '11.5',
      'font-weight': '600',
      fill: PALETTE.muted,
    }));
  });

  root.appendChild(g);
  container.innerHTML = '';
  container.appendChild(root);
}

// Length distribution histogram
// data: [{bucket, count}]
export function drawLengthHist(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const MARGIN = { top: 16, right: 16, bottom: 40, left: 56 };
  const W      = 600;
  const H      = 240;
  const innerW = W - MARGIN.left - MARGIN.right;
  const innerH = H - MARGIN.top - MARGIN.bottom;

  const maxCount = Math.max(...data.map(d => d.count));
  const barW = innerW / data.length;

  const root = svg('svg', {
    viewBox: `0 0 ${W} ${H}`,
    role: 'img',
    'aria-label': 'Commune name length distribution',
    style: 'width:100%;max-width:' + W + 'px;display:block',
  });

  const g = svg('g', { transform: `translate(${MARGIN.left},${MARGIN.top})` });

  // Horizontal grid lines
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const y = innerH * (1 - t);
    const val = Math.round(maxCount * t);
    g.appendChild(svg('line', { x1: 0, y1: y, x2: innerW, y2: y, stroke: PALETTE.grid, 'stroke-width': 1 }));
    if (t > 0) {
      g.appendChild(text(val.toLocaleString('fr-FR'), {
        x: -6, y: y + 4,
        'text-anchor': 'end',
        'font-family': 'var(--sans, Helvetica Neue, sans-serif)',
        'font-size': '10',
        fill: PALETTE.muted,
      }));
    }
  });

  // Bars
  data.forEach((d, i) => {
    const barH = (d.count / maxCount) * innerH;
    const x    = i * barW;
    const y    = innerH - barH;

    g.appendChild(svg('rect', {
      x: x + 1,
      y,
      width: barW - 2,
      height: barH,
      fill: PALETTE.primary,
      rx: 1,
    }));

    // Axis label
    g.appendChild(text(d.bucket, {
      x: x + barW / 2,
      y: innerH + 14,
      'text-anchor': 'middle',
      'font-family': 'var(--sans, Helvetica Neue, sans-serif)',
      'font-size': '10',
      fill: PALETTE.muted,
    }));
  });

  // Axis
  g.appendChild(svg('line', { x1: 0, y1: 0, x2: 0, y2: innerH, stroke: '#ccc', 'stroke-width': 1 }));
  g.appendChild(svg('line', { x1: 0, y1: innerH, x2: innerW, y2: innerH, stroke: '#ccc', 'stroke-width': 1 }));

  // X-axis title
  g.appendChild(text('characters in name', {
    x: innerW / 2,
    y: innerH + 32,
    'text-anchor': 'middle',
    'font-family': 'var(--sans, Helvetica Neue, sans-serif)',
    'font-size': '10',
    fill: PALETTE.muted,
  }));

  root.appendChild(g);
  container.innerHTML = '';
  container.appendChild(root);
}
