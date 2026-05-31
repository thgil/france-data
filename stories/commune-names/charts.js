/* charts.js — commune-names story */

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#d8d0c0';
const ACCENT = '#b32020';
const BAR_COLOR = '#a0624a';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(text, attrs = {}) {
  const el = svgEl('text', attrs);
  el.textContent = text;
  return el;
}

// ── Name-length histogram ────────────────────────────────────────────────
export function drawLengthHistogram(containerSel, lengthData) {
  const container = document.querySelector(containerSel);
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 240;
  const margin = { top: 20, right: 20, bottom: 36, left: 48 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;

  // lengthData: Array<{length, count}>, lengths 1..45
  const maxCount = Math.max(...lengthData.map(d => d.count));
  const maxLen   = Math.max(...lengthData.map(d => d.length));

  const xScale = l => ((l - 1) / (maxLen)) * innerW;
  const barW   = Math.max(1, (innerW / maxLen) - 1);
  const yScale = c => innerH - (c / maxCount) * innerH;

  const svg = svgEl('svg', { width: W, height: H, role: 'img',
    'aria-label': 'Histogram of French commune name lengths' });
  svg.style.display = 'block';

  const g = svgEl('g', { transform: `translate(${margin.left},${margin.top})` });
  svg.appendChild(g);

  // Grid lines
  const gridCounts = [1000, 2000, 3000];
  for (const gc of gridCounts) {
    const y = yScale(gc);
    const line = svgEl('line', { x1: 0, x2: innerW, y1: y, y2: y,
      stroke: RULE, 'stroke-width': 1 });
    g.appendChild(line);
    const label = svgText(gc.toLocaleString('fr-FR'), {
      x: -6, y: y + 4, 'text-anchor': 'end',
      'font-family': 'Helvetica Neue, sans-serif', 'font-size': 10,
      fill: MUTE });
    g.appendChild(label);
  }

  // Bars
  for (const d of lengthData) {
    const x = xScale(d.length);
    const y = yScale(d.count);
    const h = innerH - y;
    const rect = svgEl('rect', {
      x, y, width: barW, height: h,
      fill: d.length <= 2 ? ACCENT : BAR_COLOR,
      opacity: 0.85
    });
    rect.setAttribute('aria-label', `Length ${d.length}: ${d.count} communes`);
    g.appendChild(rect);
  }

  // Axis baseline
  const baseline = svgEl('line', { x1: 0, x2: innerW, y1: innerH, y2: innerH,
    stroke: INK, 'stroke-width': 1 });
  g.appendChild(baseline);

  // X-axis labels at key positions
  for (const l of [1, 5, 10, 15, 20, 25, 30, 35, 40, 45]) {
    const x = xScale(l) + barW / 2;
    const label = svgText(l, {
      x, y: innerH + 16, 'text-anchor': 'middle',
      'font-family': 'Helvetica Neue, sans-serif', 'font-size': 10,
      fill: MUTE });
    g.appendChild(label);
  }

  // Axis title
  const xTitle = svgText('Number of characters in commune name', {
    x: innerW / 2, y: innerH + 32, 'text-anchor': 'middle',
    'font-family': 'Helvetica Neue, sans-serif', 'font-size': 11,
    fill: MUTE });
  g.appendChild(xTitle);

  // Y-axis title
  const yTitle = svgText('Communes', {
    x: -innerH / 2, y: -36, 'text-anchor': 'middle',
    'font-family': 'Helvetica Neue, sans-serif', 'font-size': 11,
    fill: MUTE,
    transform: 'rotate(-90)' });
  g.appendChild(yTitle);

  // Annotation: the "Y" bar
  const yBar = lengthData.find(d => d.length === 1);
  if (yBar) {
    const ax = xScale(1) + barW / 2;
    const ay = yScale(yBar.count) - 6;
    const ann = svgText('Y', { x: ax, y: ay, 'text-anchor': 'middle',
      'font-family': 'Georgia, serif', 'font-size': 11,
      fill: ACCENT });
    g.appendChild(ann);
  }

  container.appendChild(svg);
}

// ── Top duplicate names horizontal bar chart ─────────────────────────────
export function drawTopNamesChart(containerSel, topNames) {
  const container = document.querySelector(containerSel);
  if (!container) return;

  const W = container.clientWidth || 680;
  const rowH = 28;
  const labelW = 260;
  const margin = { top: 12, right: 60, bottom: 16, left: labelW };
  const barAreaW = W - margin.left - margin.right;
  const H = margin.top + topNames.length * rowH + margin.bottom;

  const maxCount = Math.max(...topNames.map(d => d.count));
  const xScale = c => (c / maxCount) * barAreaW;

  const svg = svgEl('svg', { width: W, height: H, role: 'img',
    'aria-label': 'Top most-shared commune names in France' });
  svg.style.display = 'block';

  const g = svgEl('g', { transform: `translate(${margin.left},${margin.top})` });
  svg.appendChild(g);

  topNames.forEach((d, i) => {
    const y = i * rowH;
    const barW = xScale(d.count);

    // Alternating row background
    if (i % 2 === 0) {
      const bg = svgEl('rect', { x: -labelW, y: y, width: W, height: rowH,
        fill: '#f5f1e8' });
      g.appendChild(bg);
    }

    // Name label
    const nameLabel = svgText(d.name, {
      x: -8, y: y + rowH / 2 + 5, 'text-anchor': 'end',
      'font-family': 'Georgia, serif', 'font-size': 13, fill: INK });
    g.appendChild(nameLabel);

    // Bar
    const rect = svgEl('rect', {
      x: 0, y: y + 5, width: barW, height: rowH - 10,
      fill: BAR_COLOR, opacity: 0.85 });
    g.appendChild(rect);

    // Count label
    const countLabel = svgText(d.count, {
      x: barW + 6, y: y + rowH / 2 + 5,
      'font-family': 'Helvetica Neue, sans-serif', 'font-size': 12,
      fill: MUTE });
    g.appendChild(countLabel);
  });

  container.appendChild(svg);
}
