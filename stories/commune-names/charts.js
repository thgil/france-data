/* commune-names/charts.js — two static charts: length distribution + top duplicates */

const COLORS = {
  bar: '#b32020',
  barMuted: '#ddd0c8',
  text: '#1a1a1a',
  muted: '#888',
  rule: '#e0d8cc',
};

/* ── Shared SVG helpers ─────────────────────────────────────────────────── */

function makeSVG(w, h) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.overflow = 'visible';
  return svg;
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(x, y, str, attrs = {}) {
  const t = svgEl('text', { x, y, ...attrs });
  t.textContent = str;
  return t;
}

/* ── Chart A: name length distribution histogram ────────────────────────── */

export function drawLengthChart(selector, communes) {
  const container = document.querySelector(selector);
  if (!container) return;

  // bucket lengths 1–45
  const counts = new Array(46).fill(0);
  for (const c of communes) {
    const l = c.name.length;
    if (l < counts.length) counts[l]++;
  }

  const W = 700, H = 260;
  const padL = 44, padR = 16, padT = 16, padB = 56;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // x: lengths 1..45 (skip 0)
  const maxLen = 45;
  const barCount = maxLen; // bars for 1..45
  const barWidth = chartW / barCount;
  const maxCount = Math.max(...counts.slice(1));
  const yScale = v => chartH - (v / maxCount) * chartH;

  const svg = makeSVG(W, H);

  // y-axis gridlines at 0, 1000, 2000, 3000, 4000
  const yTicks = [0, 1000, 2000, 3000, 4000];
  for (const t of yTicks) {
    const y = padT + yScale(t);
    svg.appendChild(svgEl('line', {
      x1: padL, y1: y, x2: padL + chartW, y2: y,
      stroke: t === 0 ? '#ccc' : COLORS.rule,
      'stroke-width': t === 0 ? 1 : 0.5,
    }));
    svg.appendChild(svgText(padL - 6, y + 4, t === 0 ? '0' : `${t / 1000}k`, {
      'font-size': '10', 'text-anchor': 'end', fill: COLORS.muted,
      'font-family': 'Helvetica Neue, Arial, sans-serif',
    }));
  }

  // bars
  for (let len = 1; len <= maxLen; len++) {
    const x = padL + (len - 1) * barWidth;
    const barH = (counts[len] / maxCount) * chartH;
    const y = padT + chartH - barH;
    // highlight 7-8 char peak and extremes
    const highlight = len === 7 || len === 8;
    const extreme = len === 1 || len === 45;
    svg.appendChild(svgEl('rect', {
      x: x + 0.5, y, width: barWidth - 1, height: barH,
      fill: extreme ? '#b32020' : highlight ? '#c64040' : '#c8b8b0',
    }));
  }

  // x-axis labels: every 5 chars, plus 1 and 45
  for (const len of [1, 5, 10, 15, 20, 25, 30, 35, 40, 45]) {
    const x = padL + (len - 1) * barWidth + barWidth / 2;
    svg.appendChild(svgText(x, padT + chartH + 16, `${len}`, {
      'font-size': '10', 'text-anchor': 'middle', fill: COLORS.muted,
      'font-family': 'Helvetica Neue, Arial, sans-serif',
    }));
  }

  // x-axis label
  svg.appendChild(svgText(padL + chartW / 2, H - 4, 'name length (characters)', {
    'font-size': '11', 'text-anchor': 'middle', fill: COLORS.muted,
    'font-family': 'Helvetica Neue, Arial, sans-serif',
  }));

  // annotation: Y at 1 char
  const xY = padL + 0 * barWidth + barWidth / 2;
  const yY = padT + yScale(counts[1]) - 6;
  const ann1 = svgEl('g');
  ann1.appendChild(svgEl('line', {
    x1: xY, y1: yY, x2: xY, y2: yY - 18,
    stroke: '#b32020', 'stroke-width': 1,
  }));
  ann1.appendChild(svgText(xY, yY - 22, 'Y', {
    'font-size': '10', 'text-anchor': 'middle', fill: '#b32020',
    'font-family': 'Georgia, serif', 'font-style': 'italic',
  }));
  svg.appendChild(ann1);

  // annotation: 45 char longest
  const x45 = padL + 44 * barWidth + barWidth / 2;
  const y45 = padT + yScale(counts[45]) - 6;
  const ann45 = svgEl('g');
  ann45.appendChild(svgEl('line', {
    x1: x45, y1: y45, x2: x45, y2: y45 - 18,
    stroke: '#b32020', 'stroke-width': 1,
  }));
  ann45.appendChild(svgText(x45 - 4, y45 - 22, '45', {
    'font-size': '10', 'text-anchor': 'end', fill: '#b32020',
    'font-family': 'Helvetica Neue, Arial, sans-serif',
  }));
  svg.appendChild(ann45);

  container.appendChild(svg);
}

/* ── Chart B: top 20 most-duplicated names ──────────────────────────────── */

export function drawDuplicatesChart(selector, communes) {
  const container = document.querySelector(selector);
  if (!container) return;

  // count by name
  const counts = {};
  for (const c of communes) {
    counts[c.name] = (counts[c.name] || 0) + 1;
  }
  const top = Object.entries(counts)
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const ROW_H = 26;
  const W = 700;
  const padL = 176, padR = 48, padT = 8, padB = 16;
  const H = padT + top.length * ROW_H + padB;
  const chartW = W - padL - padR;
  const maxVal = top[0][1];

  const svg = makeSVG(W, H);

  for (const [i, [name, count]] of top.entries()) {
    const y = padT + i * ROW_H;
    const barW = (count / maxVal) * chartW;

    // label
    svg.appendChild(svgText(padL - 8, y + ROW_H / 2 + 4, name, {
      'font-size': '12', 'text-anchor': 'end', fill: COLORS.text,
      'font-family': 'Georgia, serif',
    }));

    // bar
    svg.appendChild(svgEl('rect', {
      x: padL, y: y + 4, width: barW, height: ROW_H - 8,
      fill: i === 0 ? COLORS.bar : COLORS.barMuted,
    }));

    // count label
    svg.appendChild(svgText(padL + barW + 5, y + ROW_H / 2 + 4, `×${count}`, {
      'font-size': '11', 'text-anchor': 'start', fill: COLORS.muted,
      'font-family': 'Helvetica Neue, Arial, sans-serif',
    }));
  }

  // baseline
  svg.appendChild(svgEl('line', {
    x1: padL, y1: padT, x2: padL, y2: H - padB,
    stroke: '#ccc', 'stroke-width': 1,
  }));

  container.appendChild(svg);
}
