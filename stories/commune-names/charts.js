/* commune-names/charts.js — SVG chart renderers */

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#666';
const RULE  = '#d8d0c0';
const RED   = '#b32020';
const GOLD  = '#c8860a';

function el(tag, attrs = {}, children = []) {
  const ns = 'http://www.w3.org/2000/svg';
  const e = document.createElementNS(ns, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  for (const c of children) {
    if (typeof c === 'string') e.textContent += c;
    else e.appendChild(c);
  }
  return e;
}

function txt(x, y, content, attrs = {}) {
  return el('text', { x, y, 'font-family': 'Helvetica Neue, sans-serif', ...attrs }, [content]);
}

/* ── Length histogram ─────────────────────────────────────────────── */
export function drawLengthHistogram(container, lengthDist) {
  const W = 700, H = 280;
  const mL = 52, mR = 20, mT = 20, mB = 46;
  const cW = W - mL - mR;
  const cH = H - mT - mB;

  // Filter to lengths 1–40 (45-char outliers noted in text)
  const entries = lengthDist.filter(([l]) => l >= 1 && l <= 40);
  const maxCount = Math.max(...entries.map(([, c]) => c));
  const barW = cW / 40;

  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'display:block;max-width:700px',
    'aria-label': 'Distribution of commune name lengths',
    role: 'img',
  });

  const g = el('g', { transform: `translate(${mL},${mT})` });
  svg.appendChild(g);

  // Y gridlines + labels
  const yTicks = [0, 1000, 2000, 3000, 4000];
  for (const v of yTicks) {
    const y = cH - (v / maxCount) * cH;
    g.appendChild(el('line', { x1: 0, x2: cW, y1: y, y2: y, stroke: RULE, 'stroke-width': 1 }));
    g.appendChild(txt(-6, y + 4, v === 0 ? '' : v.toLocaleString('fr-FR'), {
      'font-size': 11, fill: MUTE, 'text-anchor': 'end',
    }));
  }

  // Bars
  for (const [len, count] of entries) {
    const x = (len - 1) * barW;
    const bH = (count / maxCount) * cH;
    const y = cH - bH;
    const fill = len <= 2 ? RED : len >= 35 ? GOLD : '#5a7fa0';
    g.appendChild(el('rect', { x: x + 1, y, width: barW - 2, height: bH, fill }));
  }

  // X axis labels (every 5)
  for (let l = 5; l <= 40; l += 5) {
    const x = (l - 0.5) * barW;
    g.appendChild(txt(x, cH + 18, String(l), {
      'font-size': 11, fill: MUTE, 'text-anchor': 'middle',
    }));
  }

  // Axis lines
  g.appendChild(el('line', { x1: 0, x2: cW, y1: cH, y2: cH, stroke: INK, 'stroke-width': 1.5 }));

  // Axis labels
  g.appendChild(txt(cW / 2, cH + 38, 'characters in name', {
    'font-size': 12, fill: MUTE, 'text-anchor': 'middle',
  }));
  const yLabel = txt(-38, cH / 2, 'communes', {
    'font-size': 12, fill: MUTE, 'text-anchor': 'middle',
    transform: `rotate(-90, -38, ${cH / 2})`,
  });
  g.appendChild(yLabel);

  // Annotation: Y commune
  const yX = 0 * barW + barW / 2;
  g.appendChild(el('line', {
    x1: yX, x2: yX, y1: cH - 5, y2: cH - 25,
    stroke: RED, 'stroke-width': 1.5, 'stroke-dasharray': '3,2',
  }));
  g.appendChild(txt(yX + 4, cH - 27, '"Y"', { 'font-size': 11, fill: RED, 'font-weight': '600' }));

  container.appendChild(svg);
}

/* ── Top-N horizontal bar chart ───────────────────────────────────── */
export function drawHorizontalBars(container, items, { color = '#5a7fa0', unit = '' } = {}) {
  const rowH = 32, padLeft = 200, padRight = 100, mT = 12, mB = 8;
  const W = 700;
  const H = mT + items.length * rowH + mB;
  const maxVal = Math.max(...items.map(([, v]) => v));
  const barZone = W - padLeft - padRight;

  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'display:block;max-width:700px',
    role: 'img',
  });

  const g = el('g', { transform: `translate(0,${mT})` });
  svg.appendChild(g);

  items.forEach(([label, value], i) => {
    const y = i * rowH;
    const bW = (value / maxVal) * barZone;

    // Row background for zebra
    if (i % 2 === 0) {
      g.appendChild(el('rect', { x: 0, y, width: W, height: rowH, fill: '#f2ede5', opacity: 0.5 }));
    }

    // Name label
    g.appendChild(txt(padLeft - 10, y + rowH / 2 + 5, label, {
      'font-size': 13, fill: INK, 'text-anchor': 'end', 'font-family': 'Georgia, serif',
    }));

    // Bar
    g.appendChild(el('rect', {
      x: padLeft, y: y + 6, width: bW, height: rowH - 12,
      fill: color, rx: 2,
    }));

    // Value label
    g.appendChild(txt(padLeft + bW + 6, y + rowH / 2 + 5, `${value}${unit}`, {
      'font-size': 12, fill: MUTE, 'font-weight': '600',
    }));
  });

  container.appendChild(svg);
}

/* ── Short names table ────────────────────────────────────────────── */
export function drawShortNamesTable(container, shortNames) {
  const shown = shortNames.filter(c => c.name.length <= 4).slice(0, 16);

  const table = document.createElement('table');
  table.className = 'names-table';

  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Name</th><th>Dept</th><th>Population</th></tr>';
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const c of shown) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="name-cell">${c.name}</td>
      <td>${c.dept}</td>
      <td>${(c.pop || 0).toLocaleString('fr-FR')}</td>
    `;
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);
}
