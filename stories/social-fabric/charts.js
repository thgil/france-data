// Scatter plot: bars/10k (x) vs APL (y) for each metropolitan département

const BAR_THRESHOLD = 8;  // bars/10k cutoff for "high"
const APL_THRESHOLD = 2.5; // official medical desert threshold

// Colour by quadrant
function dotColor(d) {
  const highBars = d.bars_per_10k >= BAR_THRESHOLD;
  const highAPL  = d.apl >= APL_THRESHOLD;
  if (highBars && highAPL)  return '#4a7c59';  // green  — lucky
  if (highBars && !highAPL) return '#b8860b';  // amber  — drinks but no doctor
  if (!highBars && highAPL) return '#5b7fa6';  // blue   — healthy but dry
  return '#999';                                // grey   — doubly unlucky
}

// Departments to label on the chart
const LABEL_DEPTS = new Set(['05','75','18','77','95','2B','2A','48','29','22','67','59']);

export function drawScatter(containerSelector, depts) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const metro = depts.filter(d => !['971','972','973','974','976'].includes(d.dept));

  // Layout constants — these define the SVG coordinate space.
  // Width is treated as 800 units; height scales with aspect ratio.
  const W = 800;
  const H = 520;
  const PAD = { top: 24, right: 32, bottom: 56, left: 56 };

  // Data extents — fixed to nice round numbers for clarity
  const X_MIN = 0, X_MAX = 23;
  const Y_MIN = 1.5, Y_MAX = 5.5;

  function scaleX(v) {
    return PAD.left + (v - X_MIN) / (X_MAX - X_MIN) * (W - PAD.left - PAD.right);
  }
  function scaleY(v) {
    return H - PAD.bottom - (v - Y_MIN) / (Y_MAX - Y_MIN) * (H - PAD.top - PAD.bottom);
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('aria-label', 'Scatter plot: bars per 10,000 vs APL score by département');

  // ── Background ───────────────────────────────────────────────────────
  const bg = el('rect', { x: 0, y: 0, width: W, height: H, fill: '#faf7f2' });
  svg.appendChild(bg);

  // ── Quadrant shading ─────────────────────────────────────────────────
  const xMid = scaleX(BAR_THRESHOLD);
  const yMid = scaleY(APL_THRESHOLD);
  const plotL = PAD.left, plotR = W - PAD.right;
  const plotT = PAD.top, plotB = H - PAD.bottom;

  const quads = [
    { x: plotL, y: plotT,  w: xMid - plotL, h: yMid - plotT,  fill: 'rgba(91,127,166,0.07)' },   // low bars, high APL
    { x: xMid,  y: plotT,  w: plotR - xMid, h: yMid - plotT,  fill: 'rgba(74,124,89,0.07)' },    // high bars, high APL
    { x: plotL, y: yMid,   w: xMid - plotL, h: plotB - yMid,  fill: 'rgba(153,153,153,0.06)' },  // low bars, low APL
    { x: xMid,  y: yMid,   w: plotR - xMid, h: plotB - yMid,  fill: 'rgba(184,134,11,0.07)' },   // high bars, low APL
  ];
  quads.forEach(q => svg.appendChild(el('rect', { x: q.x, y: q.y, width: q.w, height: q.h, fill: q.fill })));

  // ── Grid lines ───────────────────────────────────────────────────────
  const gridGroup = el('g', { stroke: '#e0d8cc', 'stroke-width': '0.5' });

  // X grid: every 2 bars
  for (let v = 2; v <= X_MAX; v += 2) {
    const x = scaleX(v);
    gridGroup.appendChild(el('line', { x1: x, y1: plotT, x2: x, y2: plotB }));
  }
  // Y grid: every 0.5 APL
  for (let v = 1.5; v <= Y_MAX; v += 0.5) {
    const y = scaleY(v);
    gridGroup.appendChild(el('line', { x1: plotL, y1: y, x2: plotR, y2: y }));
  }
  svg.appendChild(gridGroup);

  // ── APL 2.5 threshold line ───────────────────────────────────────────
  const threshY = scaleY(APL_THRESHOLD);
  const threshLine = el('line', {
    x1: plotL, y1: threshY, x2: plotR, y2: threshY,
    stroke: '#c67c00', 'stroke-width': '1.2',
    'stroke-dasharray': '5,4',
  });
  svg.appendChild(threshLine);
  const threshLabel = el('text', {
    x: plotR - 2, y: threshY - 5,
    'text-anchor': 'end',
    fill: '#c67c00',
    'font-size': '10',
    'font-family': 'Helvetica Neue, sans-serif',
  });
  threshLabel.textContent = 'APL 2.5 — desert threshold';
  svg.appendChild(threshLabel);

  // ── Bars threshold line ──────────────────────────────────────────────
  const threshX = scaleX(BAR_THRESHOLD);
  const vLine = el('line', {
    x1: threshX, y1: plotT, x2: threshX, y2: plotB,
    stroke: '#bbb', 'stroke-width': '0.8',
    'stroke-dasharray': '4,4',
  });
  svg.appendChild(vLine);

  // ── Dots ─────────────────────────────────────────────────────────────
  const dotsGroup = el('g');
  const tooltip = document.getElementById('scatter-tooltip');

  metro.forEach(d => {
    const cx = scaleX(d.bars_per_10k);
    const cy = scaleY(d.apl);
    const color = dotColor(d);

    const circle = el('circle', {
      cx, cy, r: 5.5,
      fill: color,
      opacity: '0.82',
      stroke: '#faf7f2',
      'stroke-width': '1',
      style: 'cursor:pointer',
    });

    circle.addEventListener('mousemove', (e) => showTooltip(e, d));
    circle.addEventListener('mouseleave', () => { if (tooltip) tooltip.style.display = 'none'; });
    circle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      showTooltip(e.touches[0], d);
    }, { passive: false });

    dotsGroup.appendChild(circle);
  });
  svg.appendChild(dotsGroup);

  // ── Labels for key depts ─────────────────────────────────────────────
  metro.forEach(d => {
    if (!LABEL_DEPTS.has(d.dept)) return;
    const cx = scaleX(d.bars_per_10k);
    const cy = scaleY(d.apl);

    // Nudge labels to avoid overlap
    const nudge = getLabelNudge(d.dept);

    const label = el('text', {
      x: cx + nudge.dx,
      y: cy + nudge.dy,
      'text-anchor': nudge.anchor || 'middle',
      fill: '#333',
      'font-size': '9.5',
      'font-family': 'Helvetica Neue, sans-serif',
      'font-weight': '600',
      style: 'pointer-events:none',
    });
    label.textContent = d.dept;
    svg.appendChild(label);
  });

  // ── Axes ─────────────────────────────────────────────────────────────
  // X axis line
  svg.appendChild(el('line', { x1: plotL, y1: plotB, x2: plotR, y2: plotB, stroke: '#999', 'stroke-width': '1' }));
  // Y axis line
  svg.appendChild(el('line', { x1: plotL, y1: plotT, x2: plotL, y2: plotB, stroke: '#999', 'stroke-width': '1' }));

  // X tick labels
  for (let v = 0; v <= X_MAX; v += 4) {
    const x = scaleX(v);
    const t = el('text', {
      x, y: plotB + 16,
      'text-anchor': 'middle',
      fill: '#666',
      'font-size': '10',
      'font-family': 'Helvetica Neue, sans-serif',
    });
    t.textContent = v;
    svg.appendChild(t);
  }

  // Y tick labels
  for (let v = 2; v <= 5; v++) {
    const y = scaleY(v);
    const t = el('text', {
      x: plotL - 7, y: y + 3.5,
      'text-anchor': 'end',
      fill: '#666',
      'font-size': '10',
      'font-family': 'Helvetica Neue, sans-serif',
    });
    t.textContent = v.toFixed(1);
    svg.appendChild(t);
  }

  // X axis title
  const xTitle = el('text', {
    x: (plotL + plotR) / 2, y: H - 6,
    'text-anchor': 'middle',
    fill: '#555',
    'font-size': '11',
    'font-family': 'Helvetica Neue, sans-serif',
  });
  xTitle.textContent = 'Bars per 10,000 residents';
  svg.appendChild(xTitle);

  // Y axis title (rotated)
  const yTitle = el('text', {
    x: 13, y: (plotT + plotB) / 2,
    'text-anchor': 'middle',
    fill: '#555',
    'font-size': '11',
    'font-family': 'Helvetica Neue, sans-serif',
    transform: `rotate(-90, 13, ${(plotT + plotB) / 2})`,
  });
  yTitle.textContent = 'APL score (GP access)';
  svg.appendChild(yTitle);

  // ── Insert SVG ───────────────────────────────────────────────────────
  const loadingDiv = container.querySelector('#scatter-loading');
  if (loadingDiv) loadingDiv.remove();
  container.appendChild(svg);

  // ── Tooltip helper ───────────────────────────────────────────────────
  function showTooltip(e, d) {
    if (!tooltip) return;
    const quadrant = getQuadrantLabel(d);
    tooltip.innerHTML = `
      <span class="tt-name">${d.name}</span>
      <span class="tt-row"><span class="tt-label">Dept</span> ${d.dept}</span>
      <span class="tt-row"><span class="tt-label">Bars/10k</span> ${d.bars_per_10k.toFixed(1)}</span>
      <span class="tt-row"><span class="tt-label">APL</span> ${d.apl.toFixed(2)}</span>
      <span class="tt-row"><span class="tt-label">Desert pop.</span> ${d.desert_pct.toFixed(0)}%</span>
      <span class="tt-row" style="color:#888;margin-top:3px">${quadrant}</span>
    `;
    tooltip.style.display = 'block';
    const margin = 14;
    let left = e.clientX + margin;
    let top  = e.clientY - 20;
    if (left + 230 > window.innerWidth) left = e.clientX - 230 - margin;
    if (top + 140 > window.innerHeight) top = e.clientY - 140;
    tooltip.style.left = left + 'px';
    tooltip.style.top  = top + 'px';
  }
}

function getQuadrantLabel(d) {
  const highBars = d.bars_per_10k >= BAR_THRESHOLD;
  const highAPL  = d.apl >= APL_THRESHOLD;
  if (highBars && highAPL)  return 'High bars + good healthcare';
  if (highBars && !highAPL) return 'High bars + medical desert';
  if (!highBars && highAPL) return 'Few bars + good healthcare';
  return 'Few bars + medical desert';
}

function getLabelNudge(dept) {
  const nudges = {
    '05': { dx: 0,   dy: -9,  anchor: 'middle' },
    '75': { dx: 8,   dy: 4,   anchor: 'start'  },
    '18': { dx: 8,   dy: 4,   anchor: 'start'  },
    '77': { dx: -7,  dy: 4,   anchor: 'end'    },
    '95': { dx: 0,   dy: -9,  anchor: 'middle' },
    '2B': { dx: 0,   dy: -9,  anchor: 'middle' },
    '2A': { dx: 8,   dy: 4,   anchor: 'start'  },
    '48': { dx: 0,   dy: -9,  anchor: 'middle' },
    '29': { dx: -7,  dy: 4,   anchor: 'end'    },
    '22': { dx: 8,   dy: 4,   anchor: 'start'  },
    '67': { dx: 8,   dy: 4,   anchor: 'start'  },
    '59': { dx: 0,   dy: -9,  anchor: 'middle' },
  };
  return nudges[dept] || { dx: 0, dy: -9, anchor: 'middle' };
}

function el(tag, attrs) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    e.setAttribute(k, v);
  }
  return e;
}
