// stories/commune-names/charts.js
// SVG bar charts for commune-names story.
// Exports: drawNamesChart, drawLengthChart, drawPrefixChart

const BAR_COLOR  = '#7a5c3a';
const BAR_BG     = '#f5f0e8';
const LABEL_FONT = "Georgia, 'Times New Roman', serif";
const NUM_FONT   = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// Generic horizontal bar chart
// items: [{label, value}], container: DOM element
function drawHBar(container, items, { maxVal, color = BAR_COLOR, unit = '' } = {}) {
  const W = container.clientWidth || 640;
  const ROW_H    = 28;
  const LABEL_W  = Math.min(Math.floor(W * 0.42), 220);
  const NUM_W    = 52;
  const BAR_AREA = W - LABEL_W - NUM_W - 24;
  const H        = items.length * ROW_H + 8;
  const mx       = maxVal || Math.max(...items.map(d => d.value));

  const svg = svgEl('svg', { width: '100%', viewBox: `0 0 ${W} ${H}`, role: 'img' });

  items.forEach((d, i) => {
    const y   = i * ROW_H + 4;
    const barW = Math.max(2, (d.value / mx) * BAR_AREA);

    // Row background (alternating)
    if (i % 2 === 0) {
      const bg = svgEl('rect', { x: 0, y, width: W, height: ROW_H, fill: BAR_BG, opacity: '0.5' });
      svg.appendChild(bg);
    }

    // Label
    const lbl = svgEl('text', {
      x: LABEL_W - 8,
      y: y + ROW_H / 2 + 1,
      'text-anchor': 'end',
      'dominant-baseline': 'middle',
      'font-family': LABEL_FONT,
      'font-size': '13',
      fill: '#1a1a1a',
    });
    lbl.textContent = d.label;
    svg.appendChild(lbl);

    // Bar
    const bar = svgEl('rect', {
      x: LABEL_W,
      y: y + 7,
      width: barW,
      height: ROW_H - 14,
      fill: color,
      rx: 2,
    });
    svg.appendChild(bar);

    // Value
    const num = svgEl('text', {
      x: LABEL_W + barW + 6,
      y: y + ROW_H / 2 + 1,
      'dominant-baseline': 'middle',
      'font-family': NUM_FONT,
      'font-size': '12',
      fill: '#555',
      'font-variant-numeric': 'tabular-nums',
    });
    num.textContent = d.value.toLocaleString('fr-FR') + (unit ? ' ' + unit : '');
    svg.appendChild(num);
  });

  container.appendChild(svg);
}

// Top commune names chart
export function drawNamesChart(selector, stats) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!el) return;

  const items = stats.topNames.map(d => ({ label: d.name, value: d.count }));
  drawHBar(el, items, { unit: 'communes' });
}

// Name length distribution
export function drawLengthChart(selector, stats) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!el) return;

  const items = stats.lengthDist.map(d => ({ label: d.range + ' chars', value: d.count }));
  drawHBar(el, items, { color: '#4a7856' });
}

// Prefix / saint breakdown
export function drawPrefixChart(selector, stats) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!el) return;

  const items = stats.prefixes.map(d => ({ label: d.prefix, value: d.count }));
  drawHBar(el, items, { color: '#7a5c3a', unit: 'communes' });
}
