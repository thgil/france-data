// charts.js — commune-names story
// Renders two SVG charts: top names bar chart and name-length histogram.

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#e0d8cc';
const RED   = '#b32020';
const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

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

export function drawTopNamesChart(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = topNames.slice(0, 15);
  const maxCount = data[0].count;

  const margin = { top: 16, right: 60, bottom: 24, left: 210 };
  const barH = 26;
  const gap = 6;
  const height = data.length * (barH + gap) - gap + margin.top + margin.bottom;
  const width = container.clientWidth || 680;
  const plotW = width - margin.left - margin.right;

  const svg = svgEl('svg', { width, height, viewBox: `0 0 ${width} ${height}` });
  svg.style.fontFamily = SANS;
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  const g = svgEl('g', { transform: `translate(${margin.left},${margin.top})` });
  svg.appendChild(g);

  data.forEach((d, i) => {
    const y = i * (barH + gap);
    const barW = Math.max(2, (d.count / maxCount) * plotW);

    // Bar
    const rect = svgEl('rect', {
      x: 0, y, width: barW, height: barH,
      fill: d.count === maxCount ? RED : '#c8b89a',
      rx: 2,
    });
    g.appendChild(rect);

    // Count label inside/outside bar
    const labelX = barW + 6;
    const countLabel = textEl('text', `${d.count}×`, {
      x: labelX, y: y + barH / 2 + 5,
      'font-size': '13',
      'font-variant-numeric': 'tabular-nums',
      fill: INK,
    });
    g.appendChild(countLabel);

    // Name label (left side)
    const nameLabel = textEl('text', d.name, {
      x: -8, y: y + barH / 2 + 5,
      'text-anchor': 'end',
      'font-size': '13',
      fill: d.count === maxCount ? RED : INK,
      'font-weight': d.count === maxCount ? '600' : '400',
    });
    g.appendChild(nameLabel);
  });

  // X axis line
  const axis = svgEl('line', {
    x1: 0, x2: plotW,
    y1: data.length * (barH + gap) - gap,
    y2: data.length * (barH + gap) - gap,
    stroke: RULE, 'stroke-width': 1,
  });
  g.appendChild(axis);

  container.appendChild(svg);
}

export function drawLengthHistogram(selector, lengthHist) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Bin the data: group lengths 1-5, 6-10, 11-15, 16-20, 21-25, 26+
  const bins = [
    { label: '1–5',  min: 1,  max: 5  },
    { label: '6–10', min: 6,  max: 10 },
    { label: '11–15',min: 11, max: 15 },
    { label: '16–20',min: 16, max: 20 },
    { label: '21–25',min: 21, max: 25 },
    { label: '26–30',min: 26, max: 30 },
    { label: '31+',  min: 31, max: 999 },
  ];

  const binned = bins.map(b => ({
    label: b.label,
    count: lengthHist
      .filter(h => h.len >= b.min && h.len <= b.max)
      .reduce((s, h) => s + h.count, 0),
  }));

  const maxCount = Math.max(...binned.map(b => b.count));
  const width = container.clientWidth || 680;
  const margin = { top: 24, right: 24, bottom: 40, left: 60 };
  const plotH = 180;
  const height = plotH + margin.top + margin.bottom;
  const plotW = width - margin.left - margin.right;
  const binW = plotW / binned.length;
  const barPad = 8;

  const svg = svgEl('svg', { width, height, viewBox: `0 0 ${width} ${height}` });
  svg.style.fontFamily = SANS;
  svg.style.display = 'block';

  const g = svgEl('g', { transform: `translate(${margin.left},${margin.top})` });
  svg.appendChild(g);

  // Y-axis gridlines
  [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = plotH - frac * plotH;
    const gridLine = svgEl('line', {
      x1: 0, x2: plotW, y1: y, y2: y,
      stroke: RULE, 'stroke-width': 1,
      'stroke-dasharray': frac === 0 ? 'none' : '3,3',
    });
    g.appendChild(gridLine);

    if (frac > 0) {
      const val = Math.round(frac * maxCount);
      const yLabel = textEl('text', val.toLocaleString('fr-FR'), {
        x: -8, y: y + 4,
        'text-anchor': 'end',
        'font-size': '11',
        fill: MUTE,
      });
      g.appendChild(yLabel);
    }
  });

  // Bars
  binned.forEach((b, i) => {
    const barH = (b.count / maxCount) * plotH;
    const x = i * binW + barPad;
    const bw = binW - barPad * 2;

    const rect = svgEl('rect', {
      x, y: plotH - barH, width: bw, height: barH,
      fill: '#c8b89a', rx: 2,
    });
    g.appendChild(rect);

    // X label
    const xLabel = textEl('text', b.label, {
      x: x + bw / 2, y: plotH + 20,
      'text-anchor': 'middle',
      'font-size': '11',
      fill: MUTE,
    });
    g.appendChild(xLabel);

    // Count label on bar
    if (b.count > 0) {
      const countLabel = textEl('text', b.count.toLocaleString('fr-FR'), {
        x: x + bw / 2, y: plotH - barH - 5,
        'text-anchor': 'middle',
        'font-size': '11',
        fill: INK,
      });
      g.appendChild(countLabel);
    }
  });

  // X axis label
  const xAxisLabel = textEl('text', 'Characters in commune name', {
    x: plotW / 2, y: plotH + 38,
    'text-anchor': 'middle',
    'font-size': '11',
    fill: MUTE,
    'letter-spacing': '0.5',
  });
  g.appendChild(xAxisLabel);

  container.appendChild(svg);
}
