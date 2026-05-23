// stories/commune-names/charts.js
// SVG chart functions for the commune-names story.
// drawTopNamesChart(selector, topNames)  — horizontal bar chart, top 20 names
// drawLengthChart(selector, lengthDist)  — histogram of commune name lengths

const ACCENT = '#b32020';
const RULE   = '#e0d8cc';
const MUTE   = '#888';
const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF  = "Georgia, serif";

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function textEl(tag, text, attrs = {}) {
  const el = svgEl(tag, attrs);
  el.textContent = text;
  return el;
}

// ── Top Names horizontal bar chart ────────────────────────────────────────────

export function drawTopNamesChart(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = topNames.slice(0, 20);
  const maxCount = data[0].count;

  const W = 560;
  const ROW_H = 28;
  const LABEL_W = 220;
  const BAR_AREA = W - LABEL_W - 60;
  const H = data.length * ROW_H + 24;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'display:block;overflow:visible',
  });

  data.forEach((d, i) => {
    const y = i * ROW_H + ROW_H / 2;
    const barW = Math.round((d.count / maxCount) * BAR_AREA);

    // Row background (subtle alternating)
    if (i % 2 === 0) {
      const bg = svgEl('rect', {
        x: 0, y: i * ROW_H, width: W, height: ROW_H,
        fill: '#f5f2ed',
      });
      svg.appendChild(bg);
    }

    // Rank label
    svg.appendChild(textEl('text', String(i + 1), {
      x: 16, y: y + 5,
      'font-family': SANS, 'font-size': 10, fill: '#aaa',
      'text-anchor': 'end',
    }));

    // Name
    svg.appendChild(textEl('text', d.name, {
      x: 24, y: y + 5,
      'font-family': SERIF, 'font-size': 13, fill: '#1a1a1a',
    }));

    // Bar
    if (barW > 0) {
      svg.appendChild(svgEl('rect', {
        x: LABEL_W, y: y - 8, width: barW, height: 14,
        fill: ACCENT, opacity: 0.82,
      }));
    }

    // Count label
    svg.appendChild(textEl('text', String(d.count), {
      x: LABEL_W + barW + 6, y: y + 5,
      'font-family': SANS, 'font-size': 12, fill: '#444',
    }));
  });

  // X axis rule
  svg.appendChild(svgEl('line', {
    x1: LABEL_W, y1: H - 4, x2: LABEL_W + BAR_AREA, y2: H - 4,
    stroke: RULE, 'stroke-width': 1,
  }));

  container.innerHTML = '';
  container.appendChild(svg);
}

// ── Name Length histogram ─────────────────────────────────────────────────────

export function drawLengthChart(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Bin: individual bars for lengths 1-30, then bucket 31+ together
  const CUTOFF = 30;
  const individual = lengthDist.filter(d => d.length <= CUTOFF);
  const overflow = lengthDist.filter(d => d.length > CUTOFF).reduce((s, d) => s + d.count, 0);
  const bins = [...individual, { length: '31+', count: overflow }];

  const maxCount = Math.max(...bins.map(d => d.count));
  const W = 620;
  const CHART_H = 180;
  const BOTTOM = 40;
  const H = CHART_H + BOTTOM + 20;
  const barW = Math.floor((W - 40) / bins.length) - 1;
  const LEFT = 40;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'display:block;overflow:visible',
  });

  // Y gridlines
  for (const pct of [0.25, 0.5, 0.75, 1.0]) {
    const y = 20 + CHART_H * (1 - pct);
    svg.appendChild(svgEl('line', {
      x1: LEFT, y1: y, x2: W, y2: y,
      stroke: RULE, 'stroke-width': 1, 'stroke-dasharray': pct < 1 ? '3,3' : 'none',
    }));
    const label = Math.round(maxCount * pct).toLocaleString('fr-FR');
    svg.appendChild(textEl('text', label, {
      x: LEFT - 4, y: y + 4,
      'font-family': SANS, 'font-size': 10, fill: MUTE, 'text-anchor': 'end',
    }));
  }

  // Bars
  bins.forEach((d, i) => {
    const barH = Math.round((d.count / maxCount) * CHART_H);
    const x = LEFT + i * (barW + 1);
    const y = 20 + CHART_H - barH;

    svg.appendChild(svgEl('rect', {
      x, y, width: barW, height: barH,
      fill: ACCENT, opacity: d.length === '31+' ? 0.4 : 0.75,
    }));

    // X-axis label: show every 5, first, and last
    if (d.length === 1 || d.length === '31+' || (typeof d.length === 'number' && d.length % 5 === 0)) {
      svg.appendChild(textEl('text', String(d.length), {
        x: x + barW / 2, y: 20 + CHART_H + 14,
        'font-family': SANS, 'font-size': 10, fill: MUTE, 'text-anchor': 'middle',
      }));
    }
  });

  // X axis label
  svg.appendChild(textEl('text', 'Name length (characters)', {
    x: LEFT + (W - LEFT) / 2, y: H,
    'font-family': SANS, 'font-size': 11, fill: MUTE, 'text-anchor': 'middle',
  }));

  container.innerHTML = '';
  container.appendChild(svg);
}
