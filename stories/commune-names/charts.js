// stories/commune-names/charts.js
// Two SVG charts: name-length histogram and top-repeated-names bars.
// Exports: drawLengthChart(selector, stats), drawTopNamesChart(selector, stats)

const PAPER  = '#faf7f2';
const INK    = '#1a1a1a';
const MUTE   = '#888';
const ACCENT = '#b32020';
const BAR_C  = '#c67c00';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ── Name-length histogram ────────────────────────────────────────────────────
export function drawLengthChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const dist = stats.lengthDist;
  const maxLen = Math.max(...dist.map(d => d.len));
  const maxCount = Math.max(...dist.map(d => d.count));

  const W = 680, H = 200;
  const padL = 48, padR = 16, padT = 16, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:680px;display:block;overflow:visible',
    role: 'img',
    'aria-label': 'Distribution of commune name lengths'
  });

  // bars
  const binW = innerW / (maxLen + 1);
  for (const d of dist) {
    const barH = (d.count / maxCount) * innerH;
    const x = padL + d.len * binW;
    const y = padT + innerH - barH;
    const isShort = d.len <= 4;
    const rect = svgEl('rect', {
      x: x + 1,
      y,
      width: Math.max(binW - 2, 1),
      height: barH,
      fill: isShort ? ACCENT : BAR_C,
      opacity: isShort ? '1' : '0.7',
    });
    const title = svgEl('title');
    title.textContent = `${d.len} chars: ${d.count.toLocaleString('fr-FR')} communes`;
    rect.appendChild(title);
    svg.appendChild(rect);
  }

  // x-axis labels — every 5 chars
  for (let i = 0; i <= maxLen; i += 5) {
    const x = padL + i * binW + binW / 2;
    const t = svgEl('text', {
      x,
      y: padT + innerH + 18,
      'text-anchor': 'middle',
      'font-size': '11',
      'font-family': 'Helvetica Neue, sans-serif',
      fill: MUTE,
    });
    t.textContent = i;
    svg.appendChild(t);
  }

  // x-axis label
  const xLabel = svgEl('text', {
    x: padL + innerW / 2,
    y: H - 2,
    'text-anchor': 'middle',
    'font-size': '11',
    'font-family': 'Helvetica Neue, sans-serif',
    fill: MUTE,
  });
  xLabel.textContent = 'characters in name';
  svg.appendChild(xLabel);

  // y-axis tick at max
  const yTopLabel = svgEl('text', {
    x: padL - 4,
    y: padT + 4,
    'text-anchor': 'end',
    'font-size': '11',
    'font-family': 'Helvetica Neue, sans-serif',
    fill: MUTE,
  });
  yTopLabel.textContent = maxCount.toLocaleString('fr-FR');
  svg.appendChild(yTopLabel);

  // baseline
  const line = svgEl('line', {
    x1: padL, y1: padT + innerH,
    x2: padL + innerW, y2: padT + innerH,
    stroke: INK, 'stroke-width': '1',
  });
  svg.appendChild(line);

  // annotation: "Y" marker
  const yComm = dist.find(d => d.len === 1);
  if (yComm) {
    const x = padL + 1 * binW + binW / 2;
    const y = padT + innerH - (yComm.count / maxCount) * innerH;
    const annLine = svgEl('line', {
      x1: x, y1: y - 2,
      x2: x, y2: y - 20,
      stroke: ACCENT, 'stroke-width': '1', 'stroke-dasharray': '2,2',
    });
    svg.appendChild(annLine);
    const ann = svgEl('text', {
      x: x + 4,
      y: y - 22,
      'font-size': '11',
      'font-family': 'Helvetica Neue, sans-serif',
      fill: ACCENT,
      'font-weight': '600',
    });
    ann.textContent = '"Y"';
    svg.appendChild(ann);
  }

  container.appendChild(svg);
}

// ── Top repeated names bar chart ─────────────────────────────────────────────
export function drawTopNamesChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const top = stats.topNames.slice(0, 15);
  const maxCount = top[0].count;

  const W = 680, rowH = 28, padL = 200, padR = 60, padT = 8, padB = 8;
  const H = padT + top.length * rowH + padB;
  const innerW = W - padL - padR;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:680px;display:block;',
    role: 'img',
    'aria-label': 'Most common commune names in France'
  });

  for (const [i, d] of top.entries()) {
    const y = padT + i * rowH;
    const barW = (d.count / maxCount) * innerW;

    // Name label
    const nameT = svgEl('text', {
      x: padL - 8,
      y: y + rowH / 2 + 4,
      'text-anchor': 'end',
      'font-size': '13',
      'font-family': 'Georgia, serif',
      fill: INK,
    });
    nameT.textContent = d.name;
    svg.appendChild(nameT);

    // Bar
    const rect = svgEl('rect', {
      x: padL,
      y: y + 4,
      width: barW,
      height: rowH - 8,
      fill: BAR_C,
      opacity: '0.8',
    });
    svg.appendChild(rect);

    // Count label
    const countT = svgEl('text', {
      x: padL + barW + 6,
      y: y + rowH / 2 + 4,
      'font-size': '12',
      'font-family': 'Helvetica Neue, sans-serif',
      fill: MUTE,
    });
    countT.textContent = `×${d.count}`;
    svg.appendChild(countT);

    // Row separator
    if (i < top.length - 1) {
      const sep = svgEl('line', {
        x1: padL, y1: y + rowH,
        x2: padL + innerW, y2: y + rowH,
        stroke: '#e0d8cc', 'stroke-width': '1',
      });
      svg.appendChild(sep);
    }
  }

  container.appendChild(svg);
}
