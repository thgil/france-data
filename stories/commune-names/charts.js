// stories/commune-names/charts.js
// SVG bar charts for the commune-names story.
// All charts are drawn with vanilla SVG — no external library needed.

const ACCENT  = '#b32020';
const BAR_CLR = '#b32020';
const BAR_DIM = '#d0c8b8';
const GRID    = '#e0d8cc';
const SERIF   = "Georgia, 'Times New Roman', serif";
const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ── Horizontal bar chart ──────────────────────────────────────────────────────
// data: [{label, value, highlight?}]
export function drawHorizBars(selector, data, { maxLabelLen = 22, unit = '', color = BAR_CLR, dimColor = BAR_DIM } = {}) {
  const container = document.querySelector(selector);
  if (!container) return;

  const ROW_H   = 28;
  const PAD_L   = 4;
  const PAD_R   = 48;
  const PAD_T   = 8;
  const PAD_B   = 8;
  const LABEL_W = 180;
  const BAR_GAP = 6;

  const W = container.clientWidth || 660;
  const barAreaW = W - LABEL_W - PAD_L - PAD_R;
  const H = PAD_T + data.length * ROW_H + PAD_B;

  const maxVal = Math.max(...data.map(d => d.value));

  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });

  data.forEach((d, i) => {
    const y = PAD_T + i * ROW_H;
    const barW = clamp((d.value / maxVal) * barAreaW, 2, barAreaW);
    const barX = PAD_L + LABEL_W;
    const barY = y + BAR_GAP;
    const barH = ROW_H - BAR_GAP * 2;
    const fill = d.highlight ? color : (d.dim ? dimColor : color);

    // Label
    const label = svgEl('text', {
      x: PAD_L + LABEL_W - 8,
      y: y + ROW_H / 2 + 5,
      'text-anchor': 'end',
      fill: '#1a1a1a',
      'font-family': SERIF,
      'font-size': '13',
    });
    const displayLabel = d.label.length > maxLabelLen ? d.label.slice(0, maxLabelLen - 1) + '…' : d.label;
    label.textContent = displayLabel;
    svg.appendChild(label);

    // Bar
    const rect = svgEl('rect', {
      x: barX, y: barY, width: barW, height: barH,
      fill,
      rx: 2,
    });
    svg.appendChild(rect);

    // Value
    const valLabel = svgEl('text', {
      x: barX + barW + 5,
      y: y + ROW_H / 2 + 5,
      fill: '#555',
      'font-family': SANS,
      'font-size': '12',
    });
    valLabel.textContent = d.value + (unit ? ' ' + unit : '');
    svg.appendChild(valLabel);
  });

  container.appendChild(svg);
}

// ── Length distribution chart ─────────────────────────────────────────────────
// data: [{length, count}] — histogram-like vertical bars
export function drawLengthHist(selector, data, { highlight = [] } = {}) {
  const container = document.querySelector(selector);
  if (!container) return;

  const PAD = { top: 20, right: 20, bottom: 36, left: 44 };
  const W = container.clientWidth || 660;
  const H = 200;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const filtered = data.filter(d => d.length >= 1 && d.length <= 40);
  const maxCount = Math.max(...filtered.map(d => d.count));
  const lengths  = filtered.map(d => d.length);
  const minL = Math.min(...lengths);
  const maxL = Math.max(...lengths);

  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
  const g   = svgEl('g',   { transform: `translate(${PAD.left},${PAD.top})` });
  svg.appendChild(g);

  // Grid lines
  [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = innerH * (1 - frac);
    const line = svgEl('line', { x1: 0, y1: y, x2: innerW, y2: y, stroke: GRID, 'stroke-width': 1 });
    g.appendChild(line);
    if (frac > 0) {
      const t = svgEl('text', { x: -4, y: y + 4, 'text-anchor': 'end', fill: '#aaa', 'font-family': SANS, 'font-size': '10' });
      t.textContent = Math.round(maxCount * frac).toLocaleString('fr-FR');
      g.appendChild(t);
    }
  });

  // Bars
  const barW = Math.max(2, innerW / (maxL - minL + 1) - 1);
  filtered.forEach(d => {
    const x   = ((d.length - minL) / (maxL - minL)) * innerW;
    const barH = (d.count / maxCount) * innerH;
    const y   = innerH - barH;
    const isHL = highlight.includes(d.length);
    const rect = svgEl('rect', {
      x: x - barW / 2, y, width: barW, height: barH,
      fill: isHL ? ACCENT : BAR_CLR,
      opacity: isHL ? 1 : 0.6,
      rx: 1,
    });
    g.appendChild(rect);
  });

  // X-axis labels (every 5)
  for (let l = Math.ceil(minL / 5) * 5; l <= maxL; l += 5) {
    const x = ((l - minL) / (maxL - minL)) * innerW;
    const t = svgEl('text', { x, y: innerH + 16, 'text-anchor': 'middle', fill: '#888', 'font-family': SANS, 'font-size': '11' });
    t.textContent = l;
    g.appendChild(t);
  }

  // X-axis line
  const xLine = svgEl('line', { x1: 0, y1: innerH, x2: innerW, y2: innerH, stroke: '#ccc', 'stroke-width': 1 });
  g.appendChild(xLine);

  // Axis label
  const xLabel = svgEl('text', {
    x: innerW / 2, y: innerH + 30,
    'text-anchor': 'middle', fill: '#888',
    'font-family': SANS, 'font-size': '11',
  });
  xLabel.textContent = 'Name length (characters)';
  g.appendChild(xLabel);

  container.appendChild(svg);
}

// ── First-letter chart ────────────────────────────────────────────────────────
export function drawLetterChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const PAD  = { top: 20, right: 16, bottom: 48, left: 44 };
  const W    = container.clientWidth || 660;
  const H    = 180;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Only A-Z
  const letters = data.filter(d => /^[A-Z]$/.test(d.letter));
  const maxCount = Math.max(...letters.map(d => d.count));

  const svg  = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
  const g    = svgEl('g',   { transform: `translate(${PAD.left},${PAD.top})` });
  svg.appendChild(g);

  // Grid lines
  [0.5, 1].forEach(frac => {
    const y    = innerH * (1 - frac);
    const line = svgEl('line', { x1: 0, y1: y, x2: innerW, y2: y, stroke: GRID, 'stroke-width': 1 });
    g.appendChild(line);
    const t = svgEl('text', { x: -4, y: y + 4, 'text-anchor': 'end', fill: '#aaa', 'font-family': SANS, 'font-size': '10' });
    t.textContent = Math.round(maxCount * frac).toLocaleString('fr-FR');
    g.appendChild(t);
  });

  const barW = innerW / letters.length;
  letters.forEach((d, i) => {
    const x    = i * barW;
    const barH = (d.count / maxCount) * innerH;
    const y    = innerH - barH;

    const rect = svgEl('rect', {
      x: x + 1, y, width: Math.max(1, barW - 2), height: barH,
      fill: d.letter === 'S' ? ACCENT : BAR_CLR,
      opacity: d.letter === 'S' ? 1 : 0.65,
      rx: 1,
    });
    g.appendChild(rect);

    const label = svgEl('text', {
      x: x + barW / 2, y: innerH + 14,
      'text-anchor': 'middle', fill: d.letter === 'S' ? ACCENT : '#888',
      'font-family': SANS, 'font-size': '10',
      'font-weight': d.letter === 'S' ? '700' : '400',
    });
    label.textContent = d.letter;
    g.appendChild(label);
  });

  const xLine = svgEl('line', { x1: 0, y1: innerH, x2: innerW, y2: innerH, stroke: '#ccc', 'stroke-width': 1 });
  g.appendChild(xLine);

  container.appendChild(svg);
}
