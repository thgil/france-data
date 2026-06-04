// charts.js — commune-name-game story

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#e0d8cc';
const RED   = '#b32020';
const SOFT  = '#c8b49a';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(el, content) {
  el.textContent = content;
  return el;
}

// ── Name-length histogram ─────────────────────────────────────────────────────
export function drawLengthChart(containerId, lengthDist) {
  const container = document.querySelector(containerId);
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 220;
  const ML = 36, MR = 16, MT = 12, MB = 36;
  const plotW = W - ML - MR;
  const plotH = H - MT - MB;

  // filter to lengths with data
  const data = lengthDist.filter(d => d.count > 0);
  const maxLen = Math.max(...data.map(d => d.len));
  const maxCount = Math.max(...data.map(d => d.count));

  const xScale = (len) => (len - 1) / (maxLen - 1) * plotW;
  const yScale = (count) => plotH - (count / maxCount) * plotH;
  const barW = Math.max(2, plotW / maxLen - 1);

  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
  svg.style.display = 'block';
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";
  svg.style.overflow = 'visible';

  const g = svgEl('g', { transform: `translate(${ML},${MT})` });
  svg.appendChild(g);

  // Y-axis gridlines
  for (const frac of [0.25, 0.5, 0.75, 1.0]) {
    const y = plotH - frac * plotH;
    const rule = svgEl('line', { x1: 0, y1: y, x2: plotW, y2: y, stroke: RULE, 'stroke-width': 1 });
    g.appendChild(rule);
    const label = svgEl('text', { x: -4, y: y + 4, 'text-anchor': 'end', fill: MUTE, 'font-size': 10 });
    label.textContent = Math.round(frac * maxCount).toLocaleString('fr-FR');
    g.appendChild(label);
  }

  // Baseline
  g.appendChild(svgEl('line', { x1: 0, y1: plotH, x2: plotW, y2: plotH, stroke: INK, 'stroke-width': 1 }));

  // Bars
  for (const d of data) {
    const x = xScale(d.len);
    const y = yScale(d.count);
    const bar = svgEl('rect', {
      x: x - barW / 2, y, width: barW, height: plotH - y,
      fill: d.len === 1 ? RED : SOFT,
    });
    g.appendChild(bar);
  }

  // X-axis ticks at 1, 5, 10, 15, 20, 25, 30, 35, 40, 45
  for (const len of [1, 5, 10, 15, 20, 25, 30, 35, 40, 45]) {
    const x = xScale(len);
    g.appendChild(svgEl('line', { x1: x, y1: plotH, x2: x, y2: plotH + 4, stroke: INK, 'stroke-width': 1 }));
    const label = svgEl('text', { x, y: plotH + 15, 'text-anchor': 'middle', fill: MUTE, 'font-size': 10 });
    label.textContent = len;
    g.appendChild(label);
  }

  // X-axis label
  const xlabel = svgEl('text', {
    x: plotW / 2, y: plotH + 30,
    'text-anchor': 'middle', fill: MUTE, 'font-size': 10, 'font-style': 'italic',
  });
  xlabel.textContent = 'Characters in commune name';
  g.appendChild(xlabel);

  // Callout: Y at len=1
  const yBar = data.find(d => d.len === 1);
  if (yBar) {
    const x = xScale(1);
    const y = yScale(yBar.count);
    const callout = svgEl('text', {
      x: x + 8, y: y - 4, fill: RED, 'font-size': 10, 'font-weight': 600,
    });
    callout.textContent = '"Y"';
    g.appendChild(callout);
  }

  container.innerHTML = '';
  container.appendChild(svg);
}

// ── Top word tokens — horizontal bar chart ───────────────────────────────────
export function drawWordChart(containerId, topTokens) {
  const container = document.querySelector(containerId);
  if (!container) return;

  const ROWS = Math.min(topTokens.length, 16);
  const rowH = 22;
  const labelW = 100;
  const W = container.clientWidth || 580;
  const barMaxW = W - labelW - 56;
  const H = ROWS * rowH + 16;

  const maxCount = topTokens[0].count;

  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
  svg.style.display = 'block';
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";

  for (let i = 0; i < ROWS; i++) {
    const tok = topTokens[i];
    const y = i * rowH + 4;
    const barW = (tok.count / maxCount) * barMaxW;

    // Label
    const label = svgEl('text', {
      x: labelW - 6, y: y + 13,
      'text-anchor': 'end', fill: INK, 'font-size': 12,
      'font-style': (tok.word === 'saint' || tok.word === 'sainte') ? 'italic' : 'normal',
    });
    label.textContent = tok.word;
    svg.appendChild(label);

    // Bar
    const bar = svgEl('rect', {
      x: labelW, y: y + 2, width: barW, height: rowH - 8,
      fill: (tok.word === 'saint' || tok.word === 'sainte') ? RED : SOFT,
    });
    svg.appendChild(bar);

    // Count label
    const countLbl = svgEl('text', {
      x: labelW + barW + 5, y: y + 13,
      fill: MUTE, 'font-size': 10,
    });
    countLbl.textContent = tok.count.toLocaleString('fr-FR');
    svg.appendChild(countLbl);
  }

  container.innerHTML = '';
  container.appendChild(svg);
}
