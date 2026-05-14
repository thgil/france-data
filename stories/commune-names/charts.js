// stories/commune-names/charts.js
// SVG charts for commune name analysis.
// Exports: drawTopNamesChart, drawLengthHistogram

const TOP_NAMES = [
  {name: "Sainte-Colombe", count: 12},
  {name: "Saint-Sauveur",  count: 11},
  {name: "Saint-Aubin",    count: 10},
  {name: "Beaulieu",       count: 10},
  {name: "Saint-Marcel",   count:  9},
  {name: "Saint-Michel",   count:  9},
  {name: "Le Pin",         count:  9},
  {name: "Saint-Pierre",   count:  9},
  {name: "Sainte-Marie",   count:  9},
  {name: "Saint-Rémy",     count:  8},
  {name: "Saint-Clément",  count:  8},
  {name: "Saint-Hilaire",  count:  8},
  {name: "Saint-Loup",     count:  8},
  {name: "Beaumont",       count:  8},
  {name: "Saint-Georges",  count:  8},
];

const LENGTH_DATA = [
  {length:  1, count:     1},
  {length:  2, count:    13},
  {length:  3, count:   154},
  {length:  4, count:   720},
  {length:  5, count:  1969},
  {length:  6, count:  3223},
  {length:  7, count:  3695},
  {length:  8, count:  3695},
  {length:  9, count:  3000},
  {length: 10, count:  2522},
  {length: 11, count:  1884},
  {length: 12, count:  1435},
  {length: 13, count:  1167},
  {length: 14, count:  1018},
  {length: 15, count:  1095},
  {length: 16, count:  1177},
  {length: 17, count:  1186},
  {length: 18, count:  1202},
  {length: 19, count:  1117},
  {length: 20, count:  1028},
  {length: 21, count:   923},
  {length: 22, count:   819},
  {length: 23, count:   649},
  {length: 24, count:   501},
  {length: 25, count:   329},
  {length: 26, count:   200},
  {length: 27, count:   105},
  {length: 28, count:    55},
  {length: 29, count:    53},
  {length: 30, count:    29},
  {length: 31, count:    12},
  {length: 32, count:     8},
  {length: 33, count:     2},
  {length: 34, count:     6},
  {length: 35, count:     7},
  {length: 36, count:     2},
  {length: 37, count:     3},
  {length: 38, count:     3},
  {length: 39, count:     1},
  {length: 40, count:     3},
  {length: 41, count:     1},
  {length: 43, count:     1},
  {length: 45, count:     1},
];

function svg(tag, attrs, children = []) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (const child of children) {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else el.appendChild(child);
  }
  return el;
}

export function drawTopNamesChart(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const ROW_H = 32;
  const LABEL_W = 160;
  const BAR_AREA = W - LABEL_W - 60;
  const H = TOP_NAMES.length * ROW_H + 20;

  const maxCount = TOP_NAMES[0].count;

  const root = svg('svg', {
    width: '100%',
    viewBox: `0 0 ${W} ${H}`,
    style: 'display:block;font-family:var(--sans,Helvetica,sans-serif);overflow:visible',
  });

  TOP_NAMES.forEach((d, i) => {
    const y = i * ROW_H + 4;
    const barW = (d.count / maxCount) * BAR_AREA;
    const isSaint = d.name.toLowerCase().startsWith('saint');

    // Row background (alternating)
    if (i % 2 === 0) {
      root.appendChild(svg('rect', {
        x: 0, y: y - 2, width: W, height: ROW_H,
        fill: '#f5f1ea', rx: 2,
      }));
    }

    // Name label
    const label = svg('text', {
      x: LABEL_W - 8, y: y + ROW_H / 2,
      'dominant-baseline': 'middle',
      'text-anchor': 'end',
      'font-size': '13',
      'font-family': 'Georgia, serif',
      fill: '#1a1a1a',
    });
    label.textContent = d.name;
    root.appendChild(label);

    // Bar
    root.appendChild(svg('rect', {
      x: LABEL_W, y: y + 6, width: Math.max(barW, 2), height: ROW_H - 14,
      fill: isSaint ? '#b32020' : '#8a7b5a',
      rx: 2,
    }));

    // Count label
    const countLabel = svg('text', {
      x: LABEL_W + barW + 6, y: y + ROW_H / 2,
      'dominant-baseline': 'middle',
      'font-size': '12',
      fill: '#666',
    });
    countLabel.textContent = `×${d.count}`;
    root.appendChild(countLabel);
  });

  container.appendChild(root);
}

export function drawLengthHistogram(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 200;
  const PAD = { top: 12, right: 20, bottom: 36, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxLen = LENGTH_DATA[LENGTH_DATA.length - 1].length;
  const maxCount = Math.max(...LENGTH_DATA.map(d => d.count));

  const xScale = l => ((l - 1) / (maxLen)) * innerW;
  const barW = Math.max(innerW / maxLen - 1, 2);
  const yScale = c => innerH - (c / maxCount) * innerH;

  const root = svg('svg', {
    width: '100%',
    viewBox: `0 0 ${W} ${H}`,
    style: 'display:block;font-family:var(--sans,Helvetica,sans-serif)',
  });

  const g = svg('g', { transform: `translate(${PAD.left},${PAD.top})` });

  // Gridlines
  [0, 1000, 2000, 3000].forEach(v => {
    const y = yScale(v);
    g.appendChild(svg('line', { x1: 0, y1: y, x2: innerW, y2: y, stroke: '#e0d8cc', 'stroke-width': 1 }));
    const t = svg('text', { x: -6, y: y, 'text-anchor': 'end', 'dominant-baseline': 'middle', 'font-size': '11', fill: '#888' });
    t.textContent = v === 0 ? '0' : `${v/1000}k`;
    g.appendChild(t);
  });

  // Bars
  LENGTH_DATA.forEach(d => {
    const x = xScale(d.length);
    const y = yScale(d.count);
    const h = innerH - y;
    // Highlight the 7-8 char peak
    const isPeak = d.length >= 7 && d.length <= 8;
    g.appendChild(svg('rect', {
      x, y, width: barW, height: h,
      fill: isPeak ? '#b32020' : '#8a7b5a',
      opacity: isPeak ? 1 : 0.7,
    }));
  });

  // X axis labels: 1, 5, 10, 15, 20, 25, 30, 35, 40, 45
  [1, 5, 10, 15, 20, 25, 30, 35, 40, 45].forEach(l => {
    const x = xScale(l);
    g.appendChild(svg('line', { x1: x, y1: innerH, x2: x, y2: innerH + 4, stroke: '#aaa', 'stroke-width': 1 }));
    const t = svg('text', { x, y: innerH + 14, 'text-anchor': 'middle', 'font-size': '11', fill: '#666' });
    t.textContent = l;
    g.appendChild(t);
  });

  // Axis label
  const axLabel = svg('text', {
    x: innerW / 2, y: innerH + 30,
    'text-anchor': 'middle', 'font-size': '11', fill: '#888',
  });
  axLabel.textContent = 'name length (characters)';
  g.appendChild(axLabel);

  // Annotation for Y
  const xY = xScale(1);
  const annoLine = svg('line', {
    x1: xY + barW / 2, y1: yScale(1) - 2, x2: xY + barW / 2, y2: yScale(1) - 22,
    stroke: '#b32020', 'stroke-width': 1, 'stroke-dasharray': '3,2',
  });
  g.appendChild(annoLine);
  const annoText = svg('text', {
    x: xY + barW / 2 + 4, y: yScale(1) - 22,
    'font-size': '11', fill: '#b32020',
  });
  annoText.textContent = '"Y"';
  g.appendChild(annoText);

  // Annotation for peak
  const xPeak = xScale(7.5) + barW / 2;
  const peakText = svg('text', {
    x: xPeak, y: yScale(3695) - 6,
    'text-anchor': 'middle', 'font-size': '11', fill: '#b32020',
  });
  peakText.textContent = '3,695 at 7–8 chars';
  g.appendChild(peakText);

  root.appendChild(g);
  container.appendChild(root);
}
