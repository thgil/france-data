// stories/commune-names/charts.js
// SVG charts for the commune-names story.
// Exports: drawLengthChart, drawSaintsChart

const PAPER = '#faf7f2';
const INK = '#1a1a1a';
const INK_MUTE = '#888';
const ACCENT = '#b32020';
const BAR_COLOR = '#6b8fba';
const BAR_HIGHLIGHT = '#b32020';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(el, text, attrs = {}) {
  const t = svgEl('text', attrs);
  t.textContent = text;
  el.appendChild(t);
  return t;
}

// ── Length distribution histogram ─────────────────────────────────────────
export function drawLengthChart(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 220;
  const marginL = 40, marginR = 16, marginT = 12, marginB = 40;
  const chartW = W - marginL - marginR;
  const chartH = H - marginT - marginB;

  const maxCount = Math.max(...lengthDist.map(d => d.count));
  const barCount = lengthDist.length;
  const barW = (chartW / barCount) * 0.8;
  const gap = (chartW / barCount) * 0.2;

  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";
  svg.style.overflow = 'visible';

  // Background
  const bg = svgEl('rect', { x: 0, y: 0, width: W, height: H, fill: PAPER });
  svg.appendChild(bg);

  // Y-axis gridlines
  for (const frac of [0.25, 0.5, 0.75, 1.0]) {
    const y = marginT + chartH - chartH * frac;
    const line = svgEl('line', {
      x1: marginL, y1: y, x2: marginL + chartW, y2: y,
      stroke: '#e0d8cc', 'stroke-width': 1
    });
    svg.appendChild(line);
    const label = String(Math.round(maxCount * frac / 100) * 100);
    svgText(svg, label.replace(/\B(?=(\d{3})+(?!\d))/g, ','), {
      x: marginL - 6, y: y + 4,
      'text-anchor': 'end', 'font-size': 10, fill: INK_MUTE
    });
  }

  // Bars
  lengthDist.forEach((d, i) => {
    const barH = (d.count / maxCount) * chartH;
    const x = marginL + i * (chartW / barCount) + gap / 2;
    const y = marginT + chartH - barH;

    // Highlight bars for length 1 and "26+"
    const isSpecial = d.length === 1 || d.length === '26+';
    const fill = isSpecial ? BAR_HIGHLIGHT : BAR_COLOR;

    const rect = svgEl('rect', {
      x, y, width: barW, height: barH,
      fill, opacity: 0.85
    });
    svg.appendChild(rect);
  });

  // X-axis labels — show every 5th and the extremes
  lengthDist.forEach((d, i) => {
    const showLabel = d.length === 1 || d.length === 5 || d.length === 10 ||
      d.length === 15 || d.length === 20 || d.length === 25 || d.length === '26+';
    if (!showLabel) return;
    const x = marginL + i * (chartW / barCount) + gap / 2 + barW / 2;
    svgText(svg, String(d.length), {
      x, y: marginT + chartH + 16,
      'text-anchor': 'middle', 'font-size': 10, fill: INK_MUTE
    });
  });

  // Axis line
  const axis = svgEl('line', {
    x1: marginL, y1: marginT + chartH,
    x2: marginL + chartW, y2: marginT + chartH,
    stroke: '#ccc', 'stroke-width': 1
  });
  svg.appendChild(axis);

  // Axis label
  svgText(svg, 'name length (characters)', {
    x: marginL + chartW / 2,
    y: H - 2,
    'text-anchor': 'middle', 'font-size': 10, fill: INK_MUTE
  });

  // Annotation for "Y" bar
  const yBar = lengthDist.findIndex(d => d.length === 1);
  if (yBar >= 0) {
    const x = marginL + yBar * (chartW / barCount) + gap / 2 + barW / 2;
    const yPos = marginT + chartH - (lengthDist[0].count / maxCount) * chartH - 8;
    svgText(svg, '"Y"', {
      x: x + 12, y: yPos - 2,
      'text-anchor': 'start', 'font-size': 10, fill: ACCENT, 'font-style': 'italic'
    });
    const dot = svgEl('circle', { cx: x, cy: yPos + 4, r: 2, fill: ACCENT });
    svg.appendChild(dot);
  }

  container.appendChild(svg);
}

// ── Saints horizontal bar chart ───────────────────────────────────────────
export function drawSaintsChart(selector, topSaints) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const rowH = 28;
  const marginL = 110, marginR = 60, marginT = 8, marginB = 16;
  const H = marginT + topSaints.length * rowH + marginB;
  const chartW = W - marginL - marginR;
  const maxCount = topSaints[0].count;

  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";

  const bg = svgEl('rect', { x: 0, y: 0, width: W, height: H, fill: PAPER });
  svg.appendChild(bg);

  topSaints.forEach((d, i) => {
    const y = marginT + i * rowH;
    const barW = (d.count / maxCount) * chartW;

    // Row background (alternating)
    if (i % 2 === 0) {
      const rowBg = svgEl('rect', { x: 0, y, width: W, height: rowH, fill: '#f4f0e8' });
      svg.appendChild(rowBg);
    }

    // Bar
    const bar = svgEl('rect', {
      x: marginL, y: y + 6, width: barW, height: rowH - 12,
      fill: i === 0 ? ACCENT : BAR_COLOR, opacity: 0.85
    });
    svg.appendChild(bar);

    // Saint name label
    svgText(svg, `Saint-${d.saint}`, {
      x: marginL - 8, y: y + rowH / 2 + 4,
      'text-anchor': 'end', 'font-size': 12, fill: INK
    });

    // Count label
    svgText(svg, String(d.count), {
      x: marginL + barW + 6, y: y + rowH / 2 + 4,
      'text-anchor': 'start', 'font-size': 11, fill: INK_MUTE
    });
  });

  container.appendChild(svg);
}
