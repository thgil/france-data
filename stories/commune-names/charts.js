/* charts.js — commune-names story — pure SVG bar charts */

const COLORS = {
  primary: '#b32020',
  secondary: '#555',
  bar:    '#b32020',
  histBar: '#444',
  axis:   '#ccc',
  text:   '#1a1a1a',
  muted:  '#888',
};

function el(sel) {
  return typeof sel === 'string' ? document.querySelector(sel) : sel;
}

function setSVGAttrs(svgEl, width, height) {
  svgEl.setAttribute('width', width);
  svgEl.setAttribute('height', height);
  svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
}

function svgNS(tag, attrs = {}) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

/* ── Horizontal bar chart ─────────────────────────────────────────── */
function drawHorizBar(selector, items, { labelKey, valueKey, color = COLORS.bar, subtitle } = {}) {
  const svg = el(selector);
  if (!svg) return;

  const rowH = 28;
  const labelW = 220;
  const valueW = 48;
  const barAreaW = 360;
  const marginLeft = 24;
  const marginRight = 24;
  const marginTop = 8;

  const W = marginLeft + labelW + barAreaW + valueW + marginRight;
  const H = marginTop + items.length * rowH + 4;

  setSVGAttrs(svg, W, H);

  const maxVal = Math.max(...items.map(d => d[valueKey]));

  items.forEach((d, i) => {
    const y = marginTop + i * rowH;
    const barW = (d[valueKey] / maxVal) * barAreaW;
    const barX = marginLeft + labelW;
    const midY = y + rowH * 0.5;

    // Row bg on hover (rect behind everything)
    const bg = svgNS('rect', {
      x: 0, y, width: W, height: rowH - 2,
      fill: 'transparent',
    });
    svg.appendChild(bg);

    // Label
    const label = svgNS('text', {
      x: marginLeft + labelW - 8,
      y: midY,
      'text-anchor': 'end',
      'dominant-baseline': 'middle',
      'font-family': 'Georgia, serif',
      'font-size': '12',
      fill: COLORS.text,
    });
    label.textContent = d[labelKey];
    svg.appendChild(label);

    // Bar
    const bar = svgNS('rect', {
      x: barX, y: y + 5,
      width: Math.max(barW, 2),
      height: rowH - 12,
      fill: color,
      opacity: 0.82,
      rx: 1,
    });
    svg.appendChild(bar);

    // Value
    const val = svgNS('text', {
      x: barX + barW + 6,
      y: midY,
      'dominant-baseline': 'middle',
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '11',
      fill: COLORS.muted,
    });
    val.textContent = d[valueKey].toLocaleString('fr-FR');
    svg.appendChild(val);
  });

  // Axis line
  const axisX = marginLeft + labelW;
  const axis = svgNS('line', {
    x1: axisX, y1: marginTop,
    x2: axisX, y2: H,
    stroke: COLORS.axis,
    'stroke-width': 1,
  });
  svg.appendChild(axis);
}

/* ── Length histogram ─────────────────────────────────────────────── */
function drawLengthHistogram(selector, lengthDist) {
  const svg = el(selector);
  if (!svg) return;

  // Bucket into ranges 1-5, then individual 6-20, then 21-25, 26-30, 31+
  const buckets = [];
  const raw = {};
  for (const d of lengthDist) raw[d.len] = d.count;

  // Bucket 1-5
  let b15 = 0; for (let i = 1; i <= 5; i++) b15 += raw[i] || 0;
  buckets.push({ label: '1–5', count: b15 });

  // Individual 6-25
  for (let i = 6; i <= 25; i++) {
    buckets.push({ label: String(i), count: raw[i] || 0 });
  }

  // 26-30
  let b2630 = 0; for (let i = 26; i <= 30; i++) b2630 += raw[i] || 0;
  buckets.push({ label: '26–30', count: b2630 });

  // 31+
  let b31p = 0; for (let i = 31; i <= 99; i++) b31p += raw[i] || 0;
  buckets.push({ label: '31+', count: b31p });

  const marginLeft = 24;
  const marginRight = 24;
  const marginTop = 12;
  const marginBottom = 28;

  const containerWidth = svg.closest('.chart-container')?.clientWidth || 720;
  const W = Math.max(containerWidth, 480);
  const H = 180;
  const innerW = W - marginLeft - marginRight;
  const innerH = H - marginTop - marginBottom;

  setSVGAttrs(svg, W, H);

  const maxVal = Math.max(...buckets.map(b => b.count));
  const bw = innerW / buckets.length;
  const gap = 1;

  buckets.forEach((b, i) => {
    const barH = (b.count / maxVal) * innerH;
    const x = marginLeft + i * bw;
    const y = marginTop + innerH - barH;

    const bar = svgNS('rect', {
      x: x + gap,
      y,
      width: Math.max(bw - gap * 2, 1),
      height: barH,
      fill: COLORS.histBar,
      opacity: 0.72,
    });
    svg.appendChild(bar);

    // Label every other bucket to avoid crowding
    if (i % 2 === 0 || i === buckets.length - 1 || b.label.includes('–') || b.label === '31+') {
      const lbl = svgNS('text', {
        x: x + bw / 2,
        y: marginTop + innerH + 14,
        'text-anchor': 'middle',
        'font-family': "'Helvetica Neue', sans-serif",
        'font-size': '9',
        fill: COLORS.muted,
      });
      lbl.textContent = b.label;
      svg.appendChild(lbl);
    }
  });

  // X axis
  const xAxis = svgNS('line', {
    x1: marginLeft, y1: marginTop + innerH,
    x2: W - marginRight, y2: marginTop + innerH,
    stroke: COLORS.axis,
    'stroke-width': 1,
  });
  svg.appendChild(xAxis);

  // Y axis tick labels: 0 and max
  const yMax = svgNS('text', {
    x: marginLeft - 4,
    y: marginTop,
    'text-anchor': 'end',
    'dominant-baseline': 'hanging',
    'font-family': "'Helvetica Neue', sans-serif",
    'font-size': '9',
    fill: COLORS.muted,
  });
  yMax.textContent = maxVal.toLocaleString('fr-FR');
  svg.appendChild(yMax);

  const yZero = svgNS('text', {
    x: marginLeft - 4,
    y: marginTop + innerH,
    'text-anchor': 'end',
    'dominant-baseline': 'auto',
    'font-family': "'Helvetica Neue', sans-serif",
    'font-size': '9',
    fill: COLORS.muted,
  });
  yZero.textContent = '0';
  svg.appendChild(yZero);
}

/* ── Public API ───────────────────────────────────────────────────── */

export function drawSaintChart(selector, items) {
  drawHorizBar(selector, items, {
    labelKey: 'base',
    valueKey: 'count',
    color: COLORS.bar,
  });
}

export function drawRiversChart(selector, items) {
  const mapped = items.map(d => ({ label: `-sur-${d.river}`, count: d.count }));
  drawHorizBar(selector, mapped, {
    labelKey: 'label',
    valueKey: 'count',
    color: '#2255aa',
  });
}

export function drawLengthChart(selector, lengthDist) {
  drawLengthHistogram(selector, lengthDist);
}
