/* commune-names/charts.js — SVG bar charts for commune name statistics */

const CHART_BG   = '#faf7f2';
const CHART_INK  = '#1a1a1a';
const CHART_MUTE = '#888';
const ACCENT     = '#b32020';
const BAR_COLOR  = '#1a1a1a';
const BAR_LIGHT  = '#d0c8b8';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(el, x, y, text, attrs = {}) {
  const t = svgEl('text', { x, y, ...attrs });
  t.textContent = text;
  el.appendChild(t);
  return t;
}

/* ── Horizontal bar chart ──────────────────────────────────────────────────── */
export function drawHorizontalBars(containerId, rows, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const {
    labelKey = 'label',
    valueKey = 'count',
    accentRow = null,   // index or label to highlight in accent color
    maxLabel  = 220,
    barHeight = 18,
    barGap    = 8,
    marginTop = 8,
    fontSize  = 12,
    formatVal = v => v.toLocaleString('fr-FR'),
  } = opts;

  const maxVal = Math.max(...rows.map(r => r[valueKey]));
  const BAR_AREA = 260;
  const VALUE_W  = 40;
  const W = maxLabel + BAR_AREA + VALUE_W + 8;
  const H = marginTop + rows.length * (barHeight + barGap) + 4;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    'aria-hidden': 'true',
    style: `display:block;overflow:visible;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;`,
  });

  rows.forEach((row, i) => {
    const y = marginTop + i * (barHeight + barGap);
    const barW = (row[valueKey] / maxVal) * BAR_AREA;
    const isAccent = (accentRow === i) || (accentRow === row[labelKey]);
    const color = isAccent ? ACCENT : BAR_COLOR;

    // Bar
    const rect = svgEl('rect', {
      x: maxLabel,
      y: y + 1,
      width: Math.max(barW, 2),
      height: barHeight - 2,
      fill: color,
      opacity: isAccent ? 1 : 0.82,
    });
    svg.appendChild(rect);

    // Label
    const label = svgEl('text', {
      x: maxLabel - 6,
      y: y + barHeight / 2 + fontSize * 0.36,
      'text-anchor': 'end',
      'font-size': fontSize,
      fill: CHART_INK,
    });
    label.textContent = row[labelKey];
    svg.appendChild(label);

    // Value
    const val = svgEl('text', {
      x: maxLabel + barW + 6,
      y: y + barHeight / 2 + fontSize * 0.36,
      'font-size': fontSize - 1,
      fill: CHART_MUTE,
    });
    val.textContent = formatVal(row[valueKey]);
    svg.appendChild(val);
  });

  container.innerHTML = '';
  container.appendChild(svg);
}

/* ── Name length histogram ─────────────────────────────────────────────────── */
export function drawLengthHistogram(containerId, lengthBins) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Build ordered bins
  const bins = [];
  for (let l = 1; l <= 20; l++) {
    bins.push({ label: String(l), count: lengthBins[String(l)] || 0 });
  }
  bins.push({ label: '21–30', count: lengthBins['21-30'] || 0 });
  bins.push({ label: '31+',   count: lengthBins['31+']   || 0 });

  const maxVal  = Math.max(...bins.map(b => b.count));
  const MARGIN  = { top: 20, right: 20, bottom: 36, left: 50 };
  const barW    = 18;
  const gap     = 4;
  const CHART_W = bins.length * (barW + gap) - gap;
  const CHART_H = 120;
  const W = MARGIN.left + CHART_W + MARGIN.right;
  const H = MARGIN.top  + CHART_H + MARGIN.bottom;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    'aria-hidden': 'true',
    style: `display:block;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;`,
  });

  // Y-axis label
  const yLabel = svgEl('text', {
    x: 0,
    y: MARGIN.top + CHART_H / 2,
    'text-anchor': 'middle',
    'font-size': 10,
    fill: CHART_MUTE,
    transform: `rotate(-90, 8, ${MARGIN.top + CHART_H / 2})`,
  });
  yLabel.textContent = 'communes';
  svg.appendChild(yLabel);

  bins.forEach((bin, i) => {
    const x = MARGIN.left + i * (barW + gap);
    const barH = (bin.count / maxVal) * CHART_H;
    const y = MARGIN.top + CHART_H - barH;

    // Highlight common length range (8–12) in slightly darker tone
    const inPeak = bin.label >= '8' && bin.label <= '12';
    const color = inPeak ? '#3a3a3a' : BAR_LIGHT;

    const rect = svgEl('rect', { x, y, width: barW, height: barH, fill: color });
    svg.appendChild(rect);

    // X label — every 3rd, plus last two
    if (i % 3 === 0 || i >= bins.length - 2) {
      const xLabel = svgEl('text', {
        x: x + barW / 2,
        y: H - MARGIN.bottom + 12,
        'text-anchor': 'middle',
        'font-size': 10,
        fill: CHART_MUTE,
      });
      xLabel.textContent = bin.label;
      svg.appendChild(xLabel);
    }
  });

  // X axis line
  const axisLine = svgEl('line', {
    x1: MARGIN.left,
    y1: MARGIN.top + CHART_H,
    x2: MARGIN.left + CHART_W,
    y2: MARGIN.top + CHART_H,
    stroke: '#ccc',
    'stroke-width': 1,
  });
  svg.appendChild(axisLine);

  // X-axis title
  const xTitle = svgEl('text', {
    x: MARGIN.left + CHART_W / 2,
    y: H - 2,
    'text-anchor': 'middle',
    'font-size': 10,
    fill: CHART_MUTE,
  });
  xTitle.textContent = 'name length (characters)';
  svg.appendChild(xTitle);

  container.innerHTML = '';
  container.appendChild(svg);
}
