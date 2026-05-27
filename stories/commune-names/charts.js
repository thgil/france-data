// stories/commune-names/charts.js
// Three charts for the commune-names story:
//   drawLetterChart(selector, stats)   — bar chart: communes by first letter
//   drawSaintChart(selector, stats)    — horizontal bar: top saint names
//   drawLengthChart(selector, stats)   — histogram: name length distribution

// ── Tiny utility ──────────────────────────────────────────────────────────────

function qs(sel) { return document.querySelector(sel); }

// Colour palette
const RUST   = '#b32020';
const GOLD   = '#c67c00';
const SLATE  = '#4a5568';
const MUTED  = '#9a9a9a';
const PAPER  = '#faf7f2';
const BORDER = '#d8d0c0';

// ── Responsive SVG helper ─────────────────────────────────────────────────────
function makeSVG(container, { width, height, margin }) {
  const el = typeof container === 'string' ? qs(container) : container;
  el.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  el.appendChild(svg);

  // Inner group translated by margin
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  return {
    svg,
    g,
    iw: width  - margin.left - margin.right,
    ih: height - margin.top  - margin.bottom,
  };
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(text, attrs = {}) {
  const el = svgEl('text', attrs);
  el.textContent = text;
  return el;
}

// ── Chart 1: First-letter distribution ───────────────────────────────────────
export function drawLetterChart(selector, stats) {
  const data = stats.letterDist; // [{letter, count}, …]
  const W = 700, H = 280;
  const M = { top: 20, right: 16, bottom: 40, left: 48 };
  const { g, iw, ih } = makeSVG(selector, { width: W, height: H, margin: M });

  const maxCount = Math.max(...data.map(d => d.count));
  const barW     = iw / data.length;
  const yScale   = v => ih - (v / maxCount) * ih;

  // Grid lines
  const gridVals = [1000, 2000, 3000, 4000, 5000];
  for (const v of gridVals) {
    if (v > maxCount) break;
    const y = yScale(v);
    g.appendChild(svgEl('line', {
      x1: 0, y1: y, x2: iw, y2: y,
      stroke: BORDER, 'stroke-width': 1, 'stroke-dasharray': '3,3',
    }));
    g.appendChild(svgText(v.toLocaleString('fr-FR'), {
      x: -6, y: y + 4,
      'text-anchor': 'end',
      'font-size': '10',
      fill: MUTED,
      'font-family': 'Helvetica Neue, sans-serif',
    }));
  }

  // Bars
  data.forEach((d, i) => {
    const x = i * barW + 1;
    const barH = (d.count / maxCount) * ih;
    const y = ih - barH;

    // Highlight S
    const fill = d.letter === 'S' ? RUST
               : (d.letter === 'L' || d.letter === 'B' || d.letter === 'C' || d.letter === 'M') ? GOLD
               : SLATE + '99';

    g.appendChild(svgEl('rect', {
      x, y,
      width: Math.max(barW - 2, 1),
      height: barH,
      fill,
    }));

    // Letter label
    g.appendChild(svgText(d.letter, {
      x: i * barW + barW / 2,
      y: ih + 14,
      'text-anchor': 'middle',
      'font-size': '10',
      fill: d.letter === 'S' ? RUST : d.count === 0 ? '#ccc' : MUTED,
      'font-family': 'Helvetica Neue, sans-serif',
      'font-weight': d.letter === 'S' ? '700' : '400',
    }));
  });

  // Axis line
  g.appendChild(svgEl('line', {
    x1: 0, y1: ih, x2: iw, y2: ih,
    stroke: '#ccc', 'stroke-width': 1,
  }));

  // Annotation for S
  const sIdx  = data.findIndex(d => d.letter === 'S');
  const sData = data[sIdx];
  const sX    = sIdx * barW + barW / 2;
  const sY    = yScale(sData.count) - 6;
  g.appendChild(svgText('S = 5,598', {
    x: sX,
    y: sY,
    'text-anchor': 'middle',
    'font-size': '10',
    'font-weight': '700',
    fill: RUST,
    'font-family': 'Helvetica Neue, sans-serif',
  }));
  g.appendChild(svgText('(mostly Saints)', {
    x: sX,
    y: sY - 12,
    'text-anchor': 'middle',
    'font-size': '9',
    fill: RUST,
    'font-family': 'Helvetica Neue, sans-serif',
  }));
}

// ── Chart 2: Top saint names ──────────────────────────────────────────────────
export function drawSaintChart(selector, stats) {
  const data = stats.topSaints.slice(0, 10); // [{saint, count}, …]
  const W = 600, H = 300;
  const M = { top: 12, right: 80, bottom: 12, left: 120 };
  const { g, iw, ih } = makeSVG(selector, { width: W, height: H, margin: M });

  const rowH   = ih / data.length;
  const maxVal = data[0].count;

  data.forEach((d, i) => {
    const y     = i * rowH;
    const barW  = (d.count / maxVal) * iw;
    const isTop = i === 0;

    // Bar
    g.appendChild(svgEl('rect', {
      x: 0, y: y + 3,
      width: barW,
      height: rowH - 6,
      fill: isTop ? RUST : GOLD + 'cc',
      rx: 2,
    }));

    // Label left (saint name)
    g.appendChild(svgText(`Saint(e)-${d.saint}`, {
      x: -8, y: y + rowH / 2 + 4,
      'text-anchor': 'end',
      'font-size': '12',
      fill: '#1a1a1a',
      'font-family': 'Georgia, serif',
    }));

    // Count right
    g.appendChild(svgText(d.count, {
      x: barW + 6,
      y: y + rowH / 2 + 4,
      'text-anchor': 'start',
      'font-size': '11',
      fill: '#666',
      'font-family': 'Helvetica Neue, sans-serif',
    }));
  });
}

// ── Chart 3: Name length histogram ───────────────────────────────────────────
export function drawLengthChart(selector, stats) {
  // Bin into groups: 1-3, 4-6, 7-9, …  up to 30+
  const raw = stats.lengthDist; // [{len, count}, …]

  // Build bins of width 3
  const bins = [];
  for (let start = 1; start <= 43; start += 3) {
    const end = start + 2;
    const count = raw
      .filter(d => d.len >= start && d.len <= end)
      .reduce((s, d) => s + d.count, 0);
    if (count > 0 || start <= 40) {
      bins.push({ label: start === end ? `${start}` : `${start}–${end}`, start, count });
    }
  }

  const W = 700, H = 240;
  const M = { top: 20, right: 16, bottom: 36, left: 52 };
  const { g, iw, ih } = makeSVG(selector, { width: W, height: H, margin: M });

  const maxCount = Math.max(...bins.map(d => d.count));
  const barW     = iw / bins.length;

  // Y gridlines
  for (const v of [2000, 4000, 6000, 8000, 10000]) {
    if (v > maxCount) break;
    const y = ih - (v / maxCount) * ih;
    g.appendChild(svgEl('line', {
      x1: 0, y1: y, x2: iw, y2: y,
      stroke: BORDER, 'stroke-width': 1, 'stroke-dasharray': '3,3',
    }));
    g.appendChild(svgText(v >= 1000 ? (v / 1000) + 'k' : v, {
      x: -6, y: y + 4,
      'text-anchor': 'end',
      'font-size': '10',
      fill: MUTED,
      'font-family': 'Helvetica Neue, sans-serif',
    }));
  }

  bins.forEach((d, i) => {
    const x    = i * barW + 1;
    const barH = (d.count / maxCount) * ih;
    const y    = ih - barH;

    // Highlight the "7-9" peak bin
    const isPeak = d.start === 7;
    g.appendChild(svgEl('rect', {
      x, y,
      width: Math.max(barW - 2, 2),
      height: barH,
      fill: isPeak ? GOLD : SLATE + 'aa',
    }));

    // X labels (every 2nd bin to avoid crowding)
    if (i % 2 === 0) {
      g.appendChild(svgText(d.label, {
        x: i * barW + barW / 2,
        y: ih + 16,
        'text-anchor': 'middle',
        'font-size': '9',
        fill: MUTED,
        'font-family': 'Helvetica Neue, sans-serif',
      }));
    }
  });

  // Axis
  g.appendChild(svgEl('line', {
    x1: 0, y1: ih, x2: iw, y2: ih,
    stroke: '#ccc', 'stroke-width': 1,
  }));

  // Axis label
  g.appendChild(svgText('characters', {
    x: iw / 2, y: ih + 30,
    'text-anchor': 'middle',
    'font-size': '10',
    fill: MUTED,
    'font-family': 'Helvetica Neue, sans-serif',
  }));
}
