// charts.js — all-the-saints story
// Renders SVG charts for commune name analysis.

const ACCENT  = '#b32020';
const MUTED   = '#888';
const RULE    = '#e0d8cc';
const BG      = '#faf7f2';
const INK     = '#1a1a1a';
const SERIF   = "Georgia, 'Times New Roman', serif";
const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ── Horizontal bar chart: top saints ─────────────────────────────────
export function drawSaintsChart(containerId, topSaints) {
  const container = document.querySelector(containerId);
  if (!container) return;

  const items = topSaints.slice(0, 10);
  const maxCount = items[0].count;

  const ROW_H   = 32;
  const LABEL_W = 110;
  const VALUE_W = 38;
  const BAR_AREA = 280;
  const PAD_T   = 16;
  const PAD_B   = 20;
  const W       = LABEL_W + BAR_AREA + VALUE_W + 16;
  const H       = PAD_T + items.length * ROW_H + PAD_B;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'display:block;max-width:520px;',
    'aria-label': 'Top 10 saints in French commune names',
  });

  items.forEach((item, i) => {
    const y = PAD_T + i * ROW_H;
    const barW = (item.count / maxCount) * BAR_AREA;

    // Row background on alternating rows
    if (i % 2 === 0) {
      const bg = svgEl('rect', {
        x: 0, y: y - 4,
        width: W, height: ROW_H,
        fill: '#f5f2ec',
      });
      svg.appendChild(bg);
    }

    // Bar
    const bar = svgEl('rect', {
      x: LABEL_W,
      y: y + 4,
      width: Math.max(barW, 2),
      height: ROW_H - 14,
      fill: i === 0 ? ACCENT : '#c8a090',
      rx: 2,
    });
    svg.appendChild(bar);

    // Label: Saint(e)-...
    const label = svgEl('text', {
      x: LABEL_W - 8,
      y: y + ROW_H / 2 + 1,
      'text-anchor': 'end',
      'dominant-baseline': 'middle',
      'font-family': SERIF,
      'font-size': 13,
      fill: INK,
    });
    label.textContent = `Saint(e)-${item.saint}`;
    svg.appendChild(label);

    // Count
    const val = svgEl('text', {
      x: LABEL_W + BAR_AREA + 8,
      y: y + ROW_H / 2 + 1,
      'dominant-baseline': 'middle',
      'font-family': SANS,
      'font-size': 12,
      fill: MUTED,
    });
    val.textContent = item.count;
    svg.appendChild(val);
  });

  // Axis line
  const axis = svgEl('line', {
    x1: LABEL_W, y1: PAD_T - 6,
    x2: LABEL_W, y2: H - PAD_B + 4,
    stroke: RULE, 'stroke-width': 1,
  });
  svg.appendChild(axis);

  container.appendChild(svg);
}

// ── Length histogram ──────────────────────────────────────────────────
export function drawLengthHistogram(containerId, lengthDist) {
  const container = document.querySelector(containerId);
  if (!container) return;

  // Show lengths 1–35; bucket 36+ together
  const buckets = [];
  let overflow = 0;
  for (const { len, count } of lengthDist) {
    if (len <= 35) buckets.push({ len, count });
    else overflow += count;
  }
  if (overflow > 0) buckets.push({ len: 36, count: overflow, label: '36+' });

  const maxCount = Math.max(...buckets.map(b => b.count));
  const PAD_L  = 52;
  const PAD_R  = 16;
  const PAD_T  = 16;
  const PAD_B  = 32;
  const BAR_W  = 11;
  const GAP    = 1;
  const CHART_H = 160;
  const W = PAD_L + buckets.length * (BAR_W + GAP) + PAD_R;
  const H = PAD_T + CHART_H + PAD_B;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'display:block;',
    'aria-label': 'Distribution of commune name lengths',
  });

  // Y-axis gridlines
  const yTicks = [0, 1000, 2000, 3000];
  for (const tick of yTicks) {
    const yPos = PAD_T + CHART_H - (tick / maxCount) * CHART_H;
    const line = svgEl('line', {
      x1: PAD_L, y1: yPos,
      x2: W - PAD_R, y2: yPos,
      stroke: tick === 0 ? '#ccc' : RULE,
      'stroke-width': 1,
      'stroke-dasharray': tick > 0 ? '3,3' : 'none',
    });
    svg.appendChild(line);

    const tickLabel = svgEl('text', {
      x: PAD_L - 5,
      y: yPos + 1,
      'text-anchor': 'end',
      'dominant-baseline': 'middle',
      'font-family': SANS,
      'font-size': 9,
      fill: MUTED,
    });
    tickLabel.textContent = tick >= 1000 ? `${tick / 1000}k` : tick;
    svg.appendChild(tickLabel);
  }

  buckets.forEach((b, i) => {
    const x = PAD_L + i * (BAR_W + GAP);
    const barH = (b.count / maxCount) * CHART_H;
    const y = PAD_T + CHART_H - barH;

    const isPeak = b.count === maxCount;
    const isSaintBump = b.len >= 14 && b.len <= 22;

    const bar = svgEl('rect', {
      x, y,
      width: BAR_W,
      height: barH,
      fill: isPeak ? ACCENT : (isSaintBump ? '#c8a090' : '#c8a090'),
      opacity: isPeak ? 1 : (isSaintBump ? 0.75 : 0.55),
    });
    svg.appendChild(bar);

    // X-axis labels: show multiples of 5 (or single digit)
    if (b.len === 1 || b.len % 5 === 0) {
      const xl = svgEl('text', {
        x: x + BAR_W / 2,
        y: PAD_T + CHART_H + 10,
        'text-anchor': 'middle',
        'font-family': SANS,
        'font-size': 9,
        fill: MUTED,
      });
      xl.textContent = b.label || b.len;
      svg.appendChild(xl);
    }
  });

  // X-axis label
  const xLabel = svgEl('text', {
    x: PAD_L + (buckets.length * (BAR_W + GAP)) / 2,
    y: H - 2,
    'text-anchor': 'middle',
    'font-family': SANS,
    'font-size': 10,
    fill: MUTED,
  });
  xLabel.textContent = 'characters in name';
  svg.appendChild(xLabel);

  // Y-axis label
  const yLabel = svgEl('text', {
    x: 10,
    y: PAD_T + CHART_H / 2,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    transform: `rotate(-90, 10, ${PAD_T + CHART_H / 2})`,
    'font-family': SANS,
    'font-size': 10,
    fill: MUTED,
  });
  yLabel.textContent = 'communes';
  svg.appendChild(yLabel);

  container.appendChild(svg);
}
