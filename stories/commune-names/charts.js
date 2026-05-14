// charts.js — commune-names story visualisations
// Pure SVG, no external chart library.

const ACCENT = '#b32020';
const INK    = '#1a1a1a';
const MUTE   = '#888';
const RULE   = '#e0d8cc';
const BAR_FILL = '#c8a96e';
const BAR_SAINT = '#b32020';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function textEl(tag, attrs, text) {
  const el = svgEl(tag, attrs);
  el.textContent = text;
  return el;
}

// ── Chart 1: Horizontal bar — most common names ──────────────────────────────
export function drawMostCommonChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = stats.mostCommon.slice(0, 12);
  const maxCount = items[0].count;

  const ROW_H = 26;
  const LABEL_W = 196;
  const BAR_MAX = 280;
  const PAD = { top: 8, bottom: 24, left: 8, right: 16 };
  const W = PAD.left + LABEL_W + BAR_MAX + PAD.right;
  const H = PAD.top + items.length * ROW_H + PAD.bottom;

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', style: 'max-width:560px;display:block;' });

  items.forEach((item, i) => {
    const y = PAD.top + i * ROW_H;
    const barW = Math.round((item.count / maxCount) * BAR_MAX);
    const isSaint = item.name.startsWith('Saint');

    // bar
    svg.appendChild(svgEl('rect', {
      x: PAD.left + LABEL_W,
      y: y + 5,
      width: barW,
      height: ROW_H - 10,
      fill: isSaint ? BAR_SAINT : BAR_FILL,
      opacity: isSaint ? 0.85 : 0.7,
    }));

    // label
    svg.appendChild(textEl('text', {
      x: PAD.left + LABEL_W - 6,
      y: y + ROW_H / 2 + 4,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': '12',
      fill: INK,
    }, item.name));

    // count
    svg.appendChild(textEl('text', {
      x: PAD.left + LABEL_W + barW + 5,
      y: y + ROW_H / 2 + 4,
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '11',
      fill: MUTE,
    }, `${item.count}×`));
  });

  // axis line
  svg.appendChild(svgEl('line', {
    x1: PAD.left + LABEL_W, y1: PAD.top,
    x2: PAD.left + LABEL_W, y2: H - PAD.bottom,
    stroke: RULE, 'stroke-width': 1,
  }));

  // legend
  const legendY = H - 8;
  svg.appendChild(svgEl('rect', { x: PAD.left + LABEL_W, y: legendY - 10, width: 10, height: 10, fill: BAR_SAINT, opacity: 0.85 }));
  svg.appendChild(textEl('text', { x: PAD.left + LABEL_W + 14, y: legendY, 'font-family': "'Helvetica Neue', sans-serif", 'font-size': '10', fill: MUTE }, 'Saint/Sainte'));
  svg.appendChild(svgEl('rect', { x: PAD.left + LABEL_W + 90, y: legendY - 10, width: 10, height: 10, fill: BAR_FILL, opacity: 0.7 }));
  svg.appendChild(textEl('text', { x: PAD.left + LABEL_W + 104, y: legendY, 'font-family': "'Helvetica Neue', sans-serif", 'font-size': '10', fill: MUTE }, 'Other'));

  container.appendChild(svg);
}

// ── Chart 2: Name length histogram ──────────────────────────────────────────
export function drawLengthHistogram(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const hist = stats.lengthHist;
  const maxN = Math.max(...hist.map(h => h.n));

  const BAR_W = 26;
  const GAP   = 4;
  const CHART_H = 140;
  const PAD = { top: 12, bottom: 32, left: 24, right: 8 };
  const W = PAD.left + hist.length * (BAR_W + GAP) + PAD.right;
  const H = PAD.top + CHART_H + PAD.bottom;

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', style: `max-width:${W * 1.5}px;display:block;` });

  // y-axis ticks
  [0, 0.25, 0.5, 0.75, 1].forEach(pct => {
    const y = PAD.top + CHART_H * (1 - pct);
    const val = Math.round(pct * maxN);
    svg.appendChild(svgEl('line', {
      x1: PAD.left - 4, y1: y,
      x2: PAD.left + hist.length * (BAR_W + GAP), y2: y,
      stroke: RULE, 'stroke-width': 1,
    }));
    if (val > 0) {
      svg.appendChild(textEl('text', {
        x: PAD.left - 6, y: y + 4,
        'text-anchor': 'end',
        'font-family': "'Helvetica Neue', sans-serif",
        'font-size': '9', fill: MUTE,
      }, val >= 1000 ? `${(val/1000).toFixed(1)}k` : val));
    }
  });

  hist.forEach((bin, i) => {
    const barH = Math.round((bin.n / maxN) * CHART_H);
    const x = PAD.left + i * (BAR_W + GAP);
    const y = PAD.top + CHART_H - barH;

    // highlight single-char bar
    const isSpecial = bin.l === 1 || bin.l === 2;

    svg.appendChild(svgEl('rect', {
      x, y,
      width: BAR_W,
      height: barH,
      fill: isSpecial ? ACCENT : BAR_FILL,
      opacity: isSpecial ? 1 : 0.7,
    }));

    // x label
    svg.appendChild(textEl('text', {
      x: x + BAR_W / 2,
      y: PAD.top + CHART_H + 14,
      'text-anchor': 'middle',
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '9', fill: MUTE,
    }, String(bin.l)));
  });

  // axis
  svg.appendChild(svgEl('line', {
    x1: PAD.left, y1: PAD.top + CHART_H,
    x2: PAD.left + hist.length * (BAR_W + GAP), y2: PAD.top + CHART_H,
    stroke: INK, 'stroke-width': 1,
  }));

  // x-axis label
  svg.appendChild(textEl('text', {
    x: W / 2, y: H,
    'text-anchor': 'middle',
    'font-family': "'Helvetica Neue', sans-serif",
    'font-size': '10', fill: MUTE,
  }, 'Name length (characters)'));

  container.appendChild(svg);
}

// ── Chart 3: Short names table ───────────────────────────────────────────────
export function drawShortNamesTable(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const rows = [
    ...stats.shortNames1.map(r => ({ ...r, chars: 1 })),
    ...stats.shortNames2.map(r => ({ ...r, chars: 2 })),
  ];

  const table = document.createElement('table');
  table.className = 'names-table';
  table.innerHTML = `
    <thead>
      <tr><th>Name</th><th>Length</th><th>Département</th><th>Population</th></tr>
    </thead>
    <tbody>
      ${rows.map(r => `
        <tr>
          <td class="name-cell">${r.name}</td>
          <td class="num-cell">${r.chars}</td>
          <td>${r.deptName}</td>
          <td class="num-cell">${r.pop.toLocaleString('fr-FR')}</td>
        </tr>
      `).join('')}
    </tbody>`;
  container.appendChild(table);
}

// ── Chart 4: Top duplicates table ───────────────────────────────────────────
export function drawDuplicatesTable(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const table = document.createElement('table');
  table.className = 'names-table';
  table.innerHTML = `
    <thead>
      <tr><th>Name</th><th>Count</th><th>Départements</th></tr>
    </thead>
    <tbody>
      ${stats.topDuplicates.map(r => `
        <tr>
          <td class="name-cell">${r.name}</td>
          <td class="num-cell">${r.count}</td>
          <td class="dept-list">${r.depts.join(', ')}</td>
        </tr>
      `).join('')}
    </tbody>`;
  container.appendChild(table);
}

// ── Chart 5: Long names ──────────────────────────────────────────────────────
export function drawLongNamesTable(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const table = document.createElement('table');
  table.className = 'names-table';
  table.innerHTML = `
    <thead>
      <tr><th>#</th><th>Name</th><th>Characters</th></tr>
    </thead>
    <tbody>
      ${stats.longNames.map((r, i) => `
        <tr>
          <td class="rank-cell">${i + 1}</td>
          <td class="name-cell name-long">${r.name}</td>
          <td class="num-cell">${r.chars}</td>
        </tr>
      `).join('')}
    </tbody>`;
  container.appendChild(table);
}
