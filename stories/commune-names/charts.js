// stories/commune-names/charts.js
// SVG bar charts for the commune-names story.
// No external dependencies.

const ACCENT   = '#b32020';
const MUTED    = '#d8d0c0';
const INK      = '#1a1a1a';
const INK_MUTE = '#666';
const PAPER    = '#faf7f2';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// Horizontal bar chart
// data: [{label, value}]
export function drawHorizBar(selector, data, { maxValue, unitLabel = '', accentIndex = -1 } = {}) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W         = container.clientWidth || 640;
  const ROW_H     = 28;
  const LABEL_W   = 170;
  const VALUE_W   = 48;
  const BAR_MAX_W = W - LABEL_W - VALUE_W - 24;
  const H         = data.length * ROW_H + 8;
  const maxVal    = maxValue || Math.max(...data.map(d => d.value));

  const svg = svgEl('svg', { width: '100%', viewBox: `0 0 ${W} ${H}`, style: 'display:block;overflow:visible' });

  data.forEach((d, i) => {
    const y       = i * ROW_H;
    const barW    = Math.max(2, (d.value / maxVal) * BAR_MAX_W);
    const isAccent = i === accentIndex;
    const fill    = isAccent ? ACCENT : '#c8b89a';

    // background stripe
    const bg = svgEl('rect', { x: LABEL_W, y: y + 4, width: BAR_MAX_W, height: ROW_H - 8, fill: '#ede8e0', rx: 2 });
    svg.appendChild(bg);

    // bar
    const bar = svgEl('rect', { x: LABEL_W, y: y + 4, width: barW, height: ROW_H - 8, fill, rx: 2 });
    svg.appendChild(bar);

    // label
    const lbl = svgEl('text', {
      x: LABEL_W - 8,
      y: y + ROW_H / 2 + 1,
      'text-anchor': 'end',
      'dominant-baseline': 'middle',
      'font-family': 'Georgia, serif',
      'font-size': 13,
      fill: INK,
    });
    lbl.textContent = `Saint-${d.label}`;
    svg.appendChild(lbl);

    // value
    const val = svgEl('text', {
      x: LABEL_W + barW + 6,
      y: y + ROW_H / 2 + 1,
      'dominant-baseline': 'middle',
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': 12,
      fill: INK_MUTE,
    });
    val.textContent = d.value + (unitLabel ? ` ${unitLabel}` : '');
    svg.appendChild(val);
  });

  container.innerHTML = '';
  container.appendChild(svg);
}

// Length distribution chart — a simple histogram
export function drawLengthHist(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const relevant = data.filter(d => d.len >= 1 && d.len <= 25);
  const W     = container.clientWidth || 640;
  const H     = 140;
  const PAD_L = 32;
  const PAD_B = 28;
  const chartW = W - PAD_L - 8;
  const chartH = H - PAD_B - 8;
  const maxCount = Math.max(...relevant.map(d => d.count));
  const barW  = chartW / relevant.length;

  const svg = svgEl('svg', { width: '100%', viewBox: `0 0 ${W} ${H}`, style: 'display:block' });

  relevant.forEach((d, i) => {
    const bh   = (d.count / maxCount) * chartH;
    const x    = PAD_L + i * barW;
    const y    = 8 + chartH - bh;
    const fill = (d.len >= 5 && d.len <= 10) ? '#c8b89a' : '#ddd5c5';

    const bar = svgEl('rect', { x: x + 1, y, width: barW - 2, height: bh, fill, rx: 1 });
    svg.appendChild(bar);

    // x-axis label every 5
    if (d.len % 5 === 0 || d.len === 1) {
      const lbl = svgEl('text', {
        x: x + barW / 2,
        y: H - 6,
        'text-anchor': 'middle',
        'font-family': "'Helvetica Neue', sans-serif",
        'font-size': 10,
        fill: INK_MUTE,
      });
      lbl.textContent = d.len;
      svg.appendChild(lbl);
    }
  });

  // baseline
  const line = svgEl('line', { x1: PAD_L, y1: 8 + chartH, x2: W - 8, y2: 8 + chartH, stroke: MUTED, 'stroke-width': 1 });
  svg.appendChild(line);

  container.innerHTML = '';
  container.appendChild(svg);
}

// Most-repeated names — plain table rows filled via JS
export function fillRepeatTable(selector, data) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;
  tbody.innerHTML = data.slice(0, 12).map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${d.name}</td>
      <td>${d.count} communes</td>
    </tr>`
  ).join('');
}

// Short-names table
export function fillShortTable(selector, data) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;
  tbody.innerHTML = data.map(d =>
    `<tr>
      <td class="place">${d.name}</td>
      <td>${d.len} letter${d.len > 1 ? 's' : ''}</td>
      <td>Dept ${d.dept}</td>
      <td>${(d.pop || 0).toLocaleString('fr-FR')} pop.</td>
    </tr>`
  ).join('');
}
