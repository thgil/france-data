// stories/commune-names/charts.js
// Two charts: top-names horizontal bar + name-length histogram.

const PAPER   = '#faf7f2';
const INK     = '#1a1a1a';
const INK_MUTE= '#888';
const ACCENT  = '#b32020';
const RULE    = '#d8d0c0';
const BAR_FILL= '#b32020';
const BAR_ALT = '#c8a0a0';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(parent, x, y, text, style = {}) {
  const el = svgEl('text', { x, y, ...style });
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

// ── Horizontal bar chart: top commune names ──────────────────────────────────
export function drawNamesChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = stats.mostCommon.slice(0, 15);
  const maxCount = data[0].count;

  const margin = { top: 12, right: 60, bottom: 20, left: 160 };
  const rowH = 28;
  const height = data.length * rowH + margin.top + margin.bottom;
  const width = Math.min(container.clientWidth || 640, 680);
  const innerW = width - margin.left - margin.right;
  const innerH = data.length * rowH;

  const svg = svgEl('svg', {
    width, height,
    viewBox: `0 0 ${width} ${height}`,
    style: 'display:block;width:100%;font-family:Helvetica Neue,Helvetica,Arial,sans-serif',
  });

  const g = svgEl('g', { transform: `translate(${margin.left},${margin.top})` });
  svg.appendChild(g);

  // Gridlines
  const ticks = [0, 3, 6, 9, 12];
  for (const t of ticks) {
    const x = (t / maxCount) * innerW;
    const line = svgEl('line', {
      x1: x, y1: 0, x2: x, y2: innerH,
      stroke: RULE, 'stroke-width': '1',
    });
    g.appendChild(line);
    if (t > 0) {
      svgText(g, x, innerH + 14, t, {
        'text-anchor': 'middle', 'font-size': '11', fill: INK_MUTE,
      });
    }
  }

  // Bars and labels
  data.forEach((d, i) => {
    const y = i * rowH;
    const barW = (d.count / maxCount) * innerW;

    const rect = svgEl('rect', {
      x: 0, y: y + 5,
      width: Math.max(barW, 2), height: rowH - 8,
      fill: i < 3 ? BAR_FILL : BAR_ALT,
      rx: 2,
    });
    g.appendChild(rect);

    // Name label (left)
    svgText(svg, margin.left - 8, margin.top + y + rowH / 2 + 4, d.name, {
      'text-anchor': 'end', 'font-size': '13', fill: INK,
      'font-family': 'Georgia,Times New Roman,serif',
    });

    // Count label (right of bar)
    svgText(g, barW + 6, y + rowH / 2 + 4, `×${d.count}`, {
      'text-anchor': 'start', 'font-size': '11', fill: INK_MUTE,
    });
  });

  // Axis label
  svgText(g, innerW / 2, innerH + 30, 'communes sharing this name', {
    'text-anchor': 'middle', 'font-size': '11', fill: INK_MUTE,
    'font-style': 'italic',
  });

  container.appendChild(svg);
}

// ── Histogram: name-length distribution ─────────────────────────────────────
export function drawLengthChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Bucket 30+ into one bar
  const raw = stats.lengthDist;
  const bucketed = [];
  for (const d of raw) {
    if (d.len <= 30) {
      bucketed.push({ len: d.len, count: d.count });
    } else {
      const last = bucketed[bucketed.length - 1];
      if (last && last.len === 30) last.count += d.count;
      else bucketed.push({ len: 30, count: d.count, label: '30+' });
    }
  }

  const margin = { top: 12, right: 20, bottom: 48, left: 50 };
  const width  = Math.min(container.clientWidth || 680, 680);
  const height = 220;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const maxCount = Math.max(...bucketed.map(d => d.count));

  const barW = innerW / bucketed.length;

  const svg = svgEl('svg', {
    width, height,
    viewBox: `0 0 ${width} ${height}`,
    style: 'display:block;width:100%;font-family:Helvetica Neue,Helvetica,Arial,sans-serif',
  });

  const g = svgEl('g', { transform: `translate(${margin.left},${margin.top})` });
  svg.appendChild(g);

  // Y gridlines
  const yTicks = [1000, 2000, 3000];
  for (const t of yTicks) {
    const y = innerH - (t / maxCount) * innerH;
    const line = svgEl('line', {
      x1: 0, y1: y, x2: innerW, y2: y,
      stroke: RULE, 'stroke-width': '1',
    });
    g.appendChild(line);
    svgText(g, -6, y + 4, t.toLocaleString('fr-FR'), {
      'text-anchor': 'end', 'font-size': '10', fill: INK_MUTE,
    });
  }

  // Bars
  bucketed.forEach((d, i) => {
    const bh = (d.count / maxCount) * innerH;
    const x  = i * barW;
    const y  = innerH - bh;
    const rect = svgEl('rect', {
      x: x + 1, y,
      width: Math.max(barW - 2, 1), height: bh,
      fill: d.len >= 8 && d.len <= 9 ? ACCENT : BAR_ALT,
      rx: 1,
    });
    g.appendChild(rect);
  });

  // X-axis ticks (every 5 chars)
  for (const d of bucketed) {
    if (d.len % 5 === 0) {
      const x = (d.len - 1) * barW + barW / 2;
      svgText(g, x, innerH + 14, d.label || d.len, {
        'text-anchor': 'middle', 'font-size': '11', fill: INK_MUTE,
      });
    }
  }

  // Annotation for peak
  const peakIdx = bucketed.findIndex(d => d.len === 7) ;
  if (peakIdx >= 0) {
    const px = peakIdx * barW + barW / 2;
    const py = innerH - (bucketed[peakIdx].count / maxCount) * innerH - 6;
    svgText(g, px, py, 'peak: 7 chars', {
      'text-anchor': 'middle', 'font-size': '10', fill: ACCENT,
      'font-style': 'italic',
    });
  }

  // Axis labels
  svgText(g, innerW / 2, innerH + 36, 'name length (characters)', {
    'text-anchor': 'middle', 'font-size': '11', fill: INK_MUTE,
    'font-style': 'italic',
  });
  svgText(svg, 14, height / 2, 'communes', {
    'text-anchor': 'middle', 'font-size': '11', fill: INK_MUTE,
    'font-style': 'italic',
    transform: `rotate(-90, 14, ${height / 2})`,
  });

  container.appendChild(svg);
}
