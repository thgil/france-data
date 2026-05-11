// stories/commune-names/charts.js
// SVG charts for commune name analysis.
// Exports: drawNameFreqChart, drawLengthHistogram

const ACCENT = '#b32020';
const BAR_BG = '#e8e0d4';
const BAR_FG = '#b32020';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function textEl(tag, content, attrs = {}) {
  const el = svgEl(tag, attrs);
  el.textContent = content;
  return el;
}

// Horizontal bar chart — top N commune names by frequency
export function drawNameFreqChart(selector, top20) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const BAR_HEIGHT = 26;
  const GAP = 4;
  const LEFT_MARGIN = 168;
  const RIGHT_MARGIN = 50;
  const TOP = 8;
  const n = top20.length;
  const H = TOP + n * (BAR_HEIGHT + GAP) + 8;

  const maxCount = top20[0].count;
  const barW = W - LEFT_MARGIN - RIGHT_MARGIN;

  const svg = svgEl('svg', { width: W, height: H, role: 'img', 'aria-label': 'Most common commune names in France' });

  top20.forEach((d, i) => {
    const y = TOP + i * (BAR_HEIGHT + GAP);
    const filled = Math.round((d.count / maxCount) * barW);

    // background bar
    svg.appendChild(svgEl('rect', {
      x: LEFT_MARGIN, y, width: barW, height: BAR_HEIGHT,
      fill: BAR_BG, rx: 2
    }));

    // filled bar
    svg.appendChild(svgEl('rect', {
      x: LEFT_MARGIN, y, width: filled, height: BAR_HEIGHT,
      fill: BAR_FG, rx: 2
    }));

    // name label
    const nameEl = textEl('text', d.name, {
      x: LEFT_MARGIN - 8, y: y + BAR_HEIGHT / 2 + 1,
      'text-anchor': 'end', 'dominant-baseline': 'middle',
      'font-family': 'Georgia, serif', 'font-size': '13',
      fill: '#1a1a1a'
    });
    svg.appendChild(nameEl);

    // count label inside/outside bar
    const countEl = textEl('text', `×${d.count}`, {
      x: LEFT_MARGIN + filled + 6,
      y: y + BAR_HEIGHT / 2 + 1,
      'dominant-baseline': 'middle',
      'font-family': "'Helvetica Neue', sans-serif", 'font-size': '12',
      fill: '#555', 'font-variant-numeric': 'tabular-nums'
    });
    svg.appendChild(countEl);
  });

  container.appendChild(svg);
}

// Histogram — commune name lengths
export function drawLengthHistogram(selector, lenDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 200;
  const LEFT = 32;
  const RIGHT = 16;
  const TOP = 12;
  const BOTTOM = 36;
  const plotW = W - LEFT - RIGHT;
  const plotH = H - TOP - BOTTOM;

  // Only show lengths 1-35 (the tail beyond 35 is tiny)
  const MAX_LEN = 35;
  const filtered = lenDist.filter(d => d.len <= MAX_LEN);
  const minLen = 1;
  const maxLen = MAX_LEN;
  const buckets = maxLen - minLen + 1;
  const barW = Math.max(1, Math.floor(plotW / buckets) - 1);
  const maxCount = Math.max(...filtered.map(d => d.count));

  const svg = svgEl('svg', { width: W, height: H, role: 'img', 'aria-label': 'Distribution of commune name lengths' });

  // Y-axis baseline
  svg.appendChild(svgEl('line', {
    x1: LEFT, y1: TOP + plotH, x2: LEFT + plotW, y2: TOP + plotH,
    stroke: '#ccc', 'stroke-width': 1
  }));

  // Bars
  for (let len = minLen; len <= maxLen; len++) {
    const d = filtered.find(x => x.len === len);
    const count = d ? d.count : 0;
    const barH = count > 0 ? Math.max(1, Math.round((count / maxCount) * plotH)) : 0;
    const x = LEFT + (len - minLen) * (barW + 1);
    const y = TOP + plotH - barH;

    if (barH > 0) {
      svg.appendChild(svgEl('rect', {
        x, y, width: barW, height: barH,
        fill: len <= 2 ? '#c67c00' : (len >= 30 ? '#666' : BAR_FG),
        rx: 1
      }));
    }
  }

  // X-axis tick labels — only selected values
  [1, 5, 10, 15, 20, 25, 30, 35].forEach(len => {
    const x = LEFT + (len - minLen) * (barW + 1) + barW / 2;
    svg.appendChild(textEl('text', len === 1 ? '1' : len, {
      x, y: TOP + plotH + 16,
      'text-anchor': 'middle', 'font-size': '11',
      'font-family': "'Helvetica Neue', sans-serif", fill: '#666'
    }));
    svg.appendChild(svgEl('line', {
      x1: x, y1: TOP + plotH, x2: x, y2: TOP + plotH + 4,
      stroke: '#aaa', 'stroke-width': 1
    }));
  });

  // X axis label
  svg.appendChild(textEl('text', 'characters in name', {
    x: LEFT + plotW / 2, y: H - 2,
    'text-anchor': 'middle', 'font-size': '11',
    'font-family': "'Helvetica Neue', sans-serif", fill: '#888'
  }));

  // Annotation: peak around 7-8
  const peakLen = filtered.reduce((best, d) => d.count > best.count ? d : best, { count: 0 });
  const peakX = LEFT + (peakLen.len - minLen) * (barW + 1) + barW / 2;
  const peakY = TOP + plotH - Math.round((peakLen.count / maxCount) * plotH) - 6;
  svg.appendChild(textEl('text', `peak: ${peakLen.len} chars`, {
    x: peakX, y: Math.max(peakY, TOP + 10),
    'text-anchor': 'middle', 'font-size': '10',
    'font-family': "'Helvetica Neue', sans-serif", fill: '#888'
  }));

  container.appendChild(svg);
}
