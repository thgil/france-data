// charts.js — commune-names story
// Two SVG charts: name-length histogram and top-duplicated-names bar chart.

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTED = '#888';
const ACCENT = '#b32020';
const BAR_COLOR = '#8b5e3c';
const BAR_HOVER = '#6b3e1c';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(el, txt, attrs = {}) {
  const t = svgEl('text', attrs);
  t.textContent = txt;
  el.appendChild(t);
  return t;
}

// ── Chart 1: Length histogram ────────────────────────────────────────────────

export function drawLengthHistogram(selector, histData) {
  const svg = document.querySelector(selector);
  if (!svg) return;

  // Filter to lengths that matter (1–35, everything ≥36 grouped)
  const MAX_SHOWN = 35;
  const grouped = [];
  let overflow = 0;
  for (const { length, count } of histData) {
    if (length <= MAX_SHOWN) grouped.push({ length, count });
    else overflow += count;
  }
  if (overflow > 0) grouped.push({ length: MAX_SHOWN + 1, count: overflow, label: '36+' });

  const W = 760, H = 240;
  const marginLeft = 44, marginRight = 16, marginTop = 20, marginBottom = 44;
  const chartW = W - marginLeft - marginRight;
  const chartH = H - marginTop - marginBottom;

  const maxCount = Math.max(...grouped.map(d => d.count));
  const barCount = grouped.length;
  const barGap = 1;
  const barW = (chartW - barGap * (barCount - 1)) / barCount;

  // Y scale
  const yScale = count => chartH - (count / maxCount) * chartH;

  // Gridlines at 0, 1000, 2000, 3000
  const gridValues = [1000, 2000, 3000];

  for (const v of gridValues) {
    const y = marginTop + yScale(v);
    const line = svgEl('line', {
      x1: marginLeft, y1: y,
      x2: marginLeft + chartW, y2: y,
      stroke: '#ddd', 'stroke-width': 1
    });
    svg.appendChild(line);
    svgText(svg, v.toLocaleString('fr-FR'), {
      x: marginLeft - 6, y: y + 4,
      'text-anchor': 'end',
      'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
      'font-size': '10',
      fill: MUTED
    });
  }

  // Bars
  grouped.forEach((d, i) => {
    const x = marginLeft + i * (barW + barGap);
    const barH = (d.count / maxCount) * chartH;
    const y = marginTop + chartH - barH;

    const bar = svgEl('rect', {
      x, y, width: barW, height: barH,
      fill: d.length <= 10 ? BAR_COLOR : (d.length >= 20 ? '#c67c00' : '#a8855c')
    });
    svg.appendChild(bar);
  });

  // X axis labels: every 5 chars
  grouped.forEach((d, i) => {
    if (d.length % 5 === 0 || d.label) {
      const x = marginLeft + i * (barW + barGap) + barW / 2;
      svgText(svg, d.label || d.length, {
        x, y: marginTop + chartH + 16,
        'text-anchor': 'middle',
        'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
        'font-size': '10',
        fill: MUTED
      });
    }
  });

  // Axis label
  svgText(svg, 'Name length (characters)', {
    x: marginLeft + chartW / 2,
    y: H - 2,
    'text-anchor': 'middle',
    'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
    'font-size': '11',
    fill: MUTED
  });

  // Y axis label
  const yLabel = svgEl('text', {
    x: 10, y: marginTop + chartH / 2,
    'text-anchor': 'middle',
    'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
    'font-size': '10',
    fill: MUTED,
    transform: `rotate(-90, 10, ${marginTop + chartH / 2})`
  });
  yLabel.textContent = 'Communes';
  svg.appendChild(yLabel);

  // Annotation: peak
  const peakBin = grouped.reduce((a, b) => (a.count > b.count ? a : b));
  const peakIdx = grouped.indexOf(peakBin);
  const peakX = marginLeft + peakIdx * (barW + barGap) + barW / 2;
  const peakY = marginTop + chartH - (peakBin.count / maxCount) * chartH - 8;
  svgText(svg, `peak: ${peakBin.count.toLocaleString('fr-FR')} at ${peakBin.length} chars`, {
    x: peakX + 6, y: peakY,
    'text-anchor': 'start',
    'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
    'font-size': '10',
    fill: ACCENT
  });
  svg.appendChild(svgEl('line', {
    x1: peakX, y1: peakY + 4,
    x2: peakX, y2: peakY + 14,
    stroke: ACCENT, 'stroke-width': 1
  }));
}

// ── Chart 2: Top duplicated names ────────────────────────────────────────────

export function drawDupesChart(selector, topDupes) {
  const svg = document.querySelector(selector);
  if (!svg) return;

  const data = topDupes.slice(0, 12);
  const W = 760, H = 300;
  const marginLeft = 200, marginRight = 60, marginTop = 16, marginBottom = 24;
  const chartW = W - marginLeft - marginRight;
  const chartH = H - marginTop - marginBottom;

  const rowH = chartH / data.length;
  const barH = Math.min(rowH * 0.6, 24);
  const maxCount = Math.max(...data.map(d => d.count));

  // Gridlines
  for (let v = 0; v <= maxCount; v++) {
    if (v === 0 || v % 3 === 0) {
      const x = marginLeft + (v / maxCount) * chartW;
      svg.appendChild(svgEl('line', {
        x1: x, y1: marginTop,
        x2: x, y2: marginTop + chartH,
        stroke: '#ddd', 'stroke-width': 1
      }));
      if (v > 0) {
        svgText(svg, v, {
          x, y: marginTop + chartH + 14,
          'text-anchor': 'middle',
          'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
          'font-size': '10',
          fill: MUTED
        });
      }
    }
  }

  data.forEach((d, i) => {
    const y = marginTop + i * rowH + (rowH - barH) / 2;
    const barWidth = (d.count / maxCount) * chartW;

    // Bar
    svg.appendChild(svgEl('rect', {
      x: marginLeft, y, width: barWidth, height: barH,
      fill: i === 0 ? ACCENT : BAR_COLOR
    }));

    // Count label
    svgText(svg, d.count, {
      x: marginLeft + barWidth + 6, y: y + barH / 2 + 4,
      'text-anchor': 'start',
      'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
      'font-size': '12',
      'font-weight': i === 0 ? '600' : '400',
      fill: INK
    });

    // Name label
    svgText(svg, d.name, {
      x: marginLeft - 10, y: y + barH / 2 + 4,
      'text-anchor': 'end',
      'font-family': 'Georgia, Times New Roman, serif',
      'font-size': '13',
      fill: INK
    });
  });

  svgText(svg, 'Number of communes sharing this name', {
    x: marginLeft + chartW / 2,
    y: H - 2,
    'text-anchor': 'middle',
    'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
    'font-size': '11',
    fill: MUTED
  });
}
