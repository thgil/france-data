/* commune-names/charts.js — SVG charts for the commune names story */

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#d8d0c0';
const BAR   = '#b32020';
const BAR2  = '#c8a080';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(content, attrs = {}) {
  const el = svgEl('text', attrs);
  el.textContent = content;
  return el;
}

/* ── Horizontal bar chart: top N commune names ─────────────────────── */
export function drawTopNames(selector, data, { limit = 20 } = {}) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = data.top_names.slice(0, limit);
  const maxCount = items[0].count;

  const rowH   = 28;
  const labelW = 220;
  const barMaxW = 360;
  const padL   = 16;
  const padR   = 16;
  const padT   = 24;
  const padB   = 16;
  const W      = padL + labelW + barMaxW + padR;
  const H      = padT + items.length * rowH + padB;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'display:block;font-family:var(--sans,"Helvetica Neue",sans-serif)',
  });

  // X-axis grid lines
  for (let v = 0; v <= maxCount; v += 2) {
    const x = padL + labelW + (v / maxCount) * barMaxW;
    const line = svgEl('line', {
      x1: x, y1: padT, x2: x, y2: H - padB,
      stroke: RULE, 'stroke-width': 1,
    });
    svg.appendChild(line);

    if (v > 0) {
      svg.appendChild(svgText(String(v), {
        x, y: padT - 6,
        'text-anchor': 'middle',
        'font-size': 10,
        fill: MUTE,
      }));
    }
  }

  items.forEach((item, i) => {
    const y = padT + i * rowH;
    const barW = (item.count / maxCount) * barMaxW;

    // Alternate row background
    if (i % 2 === 0) {
      svg.appendChild(svgEl('rect', {
        x: 0, y, width: W, height: rowH,
        fill: '#f4f0e8',
      }));
    }

    // Bar
    svg.appendChild(svgEl('rect', {
      x: padL + labelW,
      y: y + 5,
      width: Math.max(barW, 1),
      height: rowH - 10,
      fill: i === 0 ? BAR : '#c8604a',
      rx: 2,
    }));

    // Label (commune name)
    svg.appendChild(svgText(item.name, {
      x: padL + labelW - 8,
      y: y + rowH / 2 + 4,
      'text-anchor': 'end',
      'font-size': 12,
      fill: INK,
      'font-family': 'Georgia,serif',
    }));

    // Count
    svg.appendChild(svgText(`×${item.count}`, {
      x: padL + labelW + barW + 6,
      y: y + rowH / 2 + 4,
      'font-size': 11,
      fill: MUTE,
    }));
  });

  container.appendChild(svg);
}

/* ── Histogram: name length distribution ───────────────────────────── */
export function drawLengthHist(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Trim to sensible range (1–35 chars, grouping longer into 35+)
  const raw = {};
  for (const { length, count } of data.length_hist) {
    const key = Math.min(length, 35);
    raw[key] = (raw[key] || 0) + count;
  }

  const labels = [];
  const counts = [];
  for (let l = 1; l <= 35; l++) {
    labels.push(l === 35 ? '35+' : String(l));
    counts.push(raw[l] || 0);
  }

  const maxCount = Math.max(...counts);
  const barW = 18;
  const gap  = 2;
  const padL = 52;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const chartH = 180;
  const W = padL + labels.length * (barW + gap) + padR;
  const H = padT + chartH + padB;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'display:block;font-family:var(--sans,"Helvetica Neue",sans-serif)',
  });

  // Y-axis grid
  const yTicks = [0, 1000, 2000, 3000, 4000];
  for (const v of yTicks) {
    if (v > maxCount) continue;
    const y = padT + chartH - (v / maxCount) * chartH;
    svg.appendChild(svgEl('line', {
      x1: padL, y1: y, x2: W - padR, y2: y,
      stroke: RULE, 'stroke-width': 1,
    }));
    svg.appendChild(svgText(v === 0 ? '0' : `${v/1000}k`, {
      x: padL - 6, y: y + 4,
      'text-anchor': 'end', 'font-size': 10, fill: MUTE,
    }));
  }

  counts.forEach((c, i) => {
    const barH = (c / maxCount) * chartH;
    const x = padL + i * (barW + gap);
    const y = padT + chartH - barH;

    // Highlight mode (7-8 chars)
    const highlight = (i + 1) === 7 || (i + 1) === 8;

    svg.appendChild(svgEl('rect', {
      x, y, width: barW, height: barH,
      fill: highlight ? BAR : '#c8604a',
      rx: 2,
    }));

    // X label every 5
    if ((i + 1) % 5 === 0 || i === 0) {
      svg.appendChild(svgText(labels[i], {
        x: x + barW / 2,
        y: padT + chartH + 14,
        'text-anchor': 'middle', 'font-size': 10, fill: MUTE,
      }));
    }
  });

  // Axis label
  svg.appendChild(svgText('Characters in commune name', {
    x: padL + (labels.length * (barW + gap)) / 2,
    y: H - 4,
    'text-anchor': 'middle', 'font-size': 11, fill: MUTE,
  }));

  container.appendChild(svg);
}
