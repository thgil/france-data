/* charts.js — commune-names story */

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#e0d8cc';
const ACCENT = '#b32020';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function makeSVG(container, w, h) {
  const svg = svgEl('svg', {
    viewBox: `0 0 ${w} ${h}`,
    width: '100%',
    style: 'display:block;max-width:100%;',
    'aria-hidden': 'true',
  });
  container.appendChild(svg);
  return svg;
}

/* ── Length histogram ───────────────────────────────────────────────── */
export function drawLengthHistogram(selector, lenDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Bin: 1–29 individual, 30+ collapsed
  const bins = [];
  for (let i = 1; i <= 29; i++) {
    bins.push({ label: String(i), count: lenDist[String(i)] || 0 });
  }
  const over30 = Object.entries(lenDist)
    .filter(([k]) => parseInt(k) >= 30)
    .reduce((s, [, v]) => s + v, 0);
  bins.push({ label: '30+', count: over30 });

  const W = 720, H = 200;
  const marginL = 44, marginR = 12, marginT = 16, marginB = 36;
  const chartW = W - marginL - marginR;
  const chartH = H - marginT - marginB;

  const maxVal = Math.max(...bins.map(b => b.count));
  const barW   = Math.floor(chartW / bins.length);
  const gap    = 1;

  const svg = makeSVG(container, W, H);

  // Y axis label
  const yLabel = svgEl('text', {
    x: 8, y: marginT + chartH / 2,
    'font-family': 'Helvetica Neue, sans-serif',
    'font-size': 10,
    fill: MUTE,
    'text-anchor': 'middle',
    transform: `rotate(-90, 8, ${marginT + chartH / 2})`,
  });
  yLabel.textContent = 'communes';
  svg.appendChild(yLabel);

  // Bars
  bins.forEach((bin, i) => {
    const barH = Math.round((bin.count / maxVal) * chartH);
    const x = marginL + i * barW + gap;
    const y = marginT + chartH - barH;
    const fill = bin.label === '30+' ? '#b0a090' : (i >= 6 && i <= 8 ? ACCENT : '#c0b090');

    const rect = svgEl('rect', {
      x, y,
      width: barW - gap * 2,
      height: barH,
      fill,
    });
    svg.appendChild(rect);

    // X label every 5 chars (or 30+)
    if (i % 5 === 0 || bin.label === '30+') {
      const lbl = svgEl('text', {
        x: x + (barW - gap * 2) / 2,
        y: marginT + chartH + 14,
        'font-family': 'Helvetica Neue, sans-serif',
        'font-size': 10,
        fill: MUTE,
        'text-anchor': 'middle',
      });
      lbl.textContent = bin.label;
      svg.appendChild(lbl);
    }
  });

  // Baseline
  const baseline = svgEl('line', {
    x1: marginL, y1: marginT + chartH,
    x2: W - marginR, y2: marginT + chartH,
    stroke: INK, 'stroke-width': 1,
  });
  svg.appendChild(baseline);

  // Peak annotation
  const peakI = bins.findIndex(b => b.count === maxVal);
  const px = marginL + peakI * barW + barW / 2;
  const py = marginT + chartH - Math.round((maxVal / maxVal) * chartH) - 6;
  const ann = svgEl('text', {
    x: px, y: py,
    'font-family': 'Helvetica Neue, sans-serif',
    'font-size': 10,
    fill: INK,
    'text-anchor': 'middle',
  });
  ann.textContent = `peak: ${bins[peakI].label} chars (${maxVal.toLocaleString('fr-FR')})`;
  svg.appendChild(ann);

  // X axis title
  const xTitle = svgEl('text', {
    x: marginL + chartW / 2, y: H - 2,
    'font-family': 'Helvetica Neue, sans-serif',
    'font-size': 10,
    fill: MUTE,
    'text-anchor': 'middle',
  });
  xTitle.textContent = 'name length (characters)';
  svg.appendChild(xTitle);
}

/* ── Horizontal bar: top duplicate names ───────────────────────────── */
export function drawTopNames(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = 680, rowH = 32, marginL = 200, marginR = 60;
  const H = topNames.length * rowH + 24;
  const chartW = W - marginL - marginR;
  const maxVal = topNames[0].count;

  const svg = makeSVG(container, W, H);

  topNames.forEach((item, i) => {
    const y = i * rowH + 16;
    const barW = Math.round((item.count / maxVal) * chartW);

    // Name label
    const lbl = svgEl('text', {
      x: marginL - 8, y: y + rowH / 2 + 4,
      'font-family': 'Georgia, serif',
      'font-size': 13,
      fill: INK,
      'text-anchor': 'end',
    });
    lbl.textContent = item.name;
    svg.appendChild(lbl);

    // Bar
    const rect = svgEl('rect', {
      x: marginL, y: y + 4,
      width: barW,
      height: rowH - 10,
      fill: i === 0 ? ACCENT : '#c0b090',
    });
    svg.appendChild(rect);

    // Count
    const cnt = svgEl('text', {
      x: marginL + barW + 6, y: y + rowH / 2 + 4,
      'font-family': 'Helvetica Neue, sans-serif',
      'font-size': 12,
      fill: MUTE,
    });
    cnt.textContent = `×${item.count}`;
    svg.appendChild(cnt);

    // Separator
    if (i < topNames.length - 1) {
      const rule = svgEl('line', {
        x1: 0, y1: y + rowH,
        x2: W, y2: y + rowH,
        stroke: RULE, 'stroke-width': 0.5,
      });
      svg.appendChild(rule);
    }
  });
}

/* ── Prefix breakdown donut-style horizontal stacked bar ────────────── */
export function drawPrefixBreakdown(selector, prefixes, total) {
  const container = document.querySelector(selector);
  if (!container) return;

  const order = [
    { key: 'Saint-',  label: 'Saint-',  color: '#b32020' },
    { key: 'Sainte-', label: 'Sainte-', color: '#c84040' },
    { key: 'Le ',     label: 'Le / La / Les', color: '#8a6a30' },
    { key: 'La ',     label: null, color: '#8a6a30' },
    { key: 'Les ',    label: null, color: '#8a6a30' },
    { key: "L'",      label: null, color: '#8a6a30' },
    { key: 'other',   label: 'Other', color: '#d0c8b8' },
  ];

  // Merge Le/La/Les/L' into one visual segment
  const segments = [
    { label: 'Saint-',       count: prefixes['Saint-'],  color: '#b32020' },
    { label: 'Sainte-',      count: prefixes['Sainte-'], color: '#c84040' },
    { label: "Le/La/Les/L'", count: (prefixes['Le '] || 0) + (prefixes['La '] || 0) + (prefixes['Les '] || 0) + (prefixes["L'"] || 0), color: '#9a8050' },
    { label: 'Other',        count: prefixes['other'],   color: '#d0c8b8' },
  ];

  const W = 680, H = 120;
  const barTop = 24, barH = 32, marginL = 0, marginR = 0;
  const chartW = W - marginL - marginR;

  const svg = makeSVG(container, W, H);

  let x = marginL;
  segments.forEach(seg => {
    const sw = Math.round((seg.count / total) * chartW);
    if (sw < 1) return;

    const rect = svgEl('rect', {
      x, y: barTop,
      width: sw, height: barH,
      fill: seg.color,
    });
    svg.appendChild(rect);

    const pct = (seg.count / total * 100).toFixed(1);

    // Label inside bar if wide enough
    if (sw > 50) {
      const tx = svgEl('text', {
        x: x + sw / 2,
        y: barTop + barH / 2 + 1,
        'font-family': 'Helvetica Neue, sans-serif',
        'font-size': sw > 80 ? 11 : 10,
        fill: seg.color === '#d0c8b8' ? INK : PAPER,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
      });
      tx.textContent = sw > 80 ? `${seg.label} ${pct}%` : `${pct}%`;
      svg.appendChild(tx);
    }

    // Legend below
    const legY = barTop + barH + 18;
    const dot = svgEl('rect', { x: x + 2, y: legY - 8, width: 8, height: 8, fill: seg.color });
    svg.appendChild(dot);
    const legTx = svgEl('text', {
      x: x + 14, y: legY,
      'font-family': 'Helvetica Neue, sans-serif',
      'font-size': 10,
      fill: MUTE,
    });
    legTx.textContent = `${seg.label}: ${seg.count.toLocaleString('fr-FR')} (${pct}%)`;
    svg.appendChild(legTx);

    x += sw;
  });
}
