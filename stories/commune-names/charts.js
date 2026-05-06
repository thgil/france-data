// stories/commune-names/charts.js
// SVG bar charts and histogram for the commune-names story.

const ACCENT = '#b32020';
const ACCENT_LIGHT = '#d44040';
const PAPER = '#faf7f2';
const INK = '#1a1a1a';
const INK_MUTE = '#888';
const RULE = '#d8d0c0';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function text(content, attrs = {}) {
  const el = svgEl('text', attrs);
  el.textContent = content;
  return el;
}

// ── Horizontal bar chart ─────────────────────────────────────────────────────

export function drawHBarChart(mountId, items, { title = '', valueLabel = 'count', maxItems = 15 } = {}) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const data = items.slice(0, maxItems);
  const maxVal = Math.max(...data.map(d => d.count));

  const marginLeft = 220;
  const marginRight = 60;
  const marginTop = title ? 48 : 16;
  const marginBottom = 32;
  const barH = 26;
  const gap = 6;
  const rowH = barH + gap;
  const chartW = Math.min(mount.clientWidth || 640, 700);
  const chartH = marginTop + data.length * rowH + marginBottom;
  const barMaxW = chartW - marginLeft - marginRight;

  const svg = svgEl('svg', {
    width: chartW,
    height: chartH,
    viewBox: `0 0 ${chartW} ${chartH}`,
    style: 'display:block; overflow:visible; font-family: Helvetica Neue, sans-serif;'
  });

  if (title) {
    svg.appendChild(text(title, {
      x: marginLeft, y: 28,
      'font-size': '13', 'font-weight': '700',
      fill: INK, 'text-anchor': 'start',
      'letter-spacing': '0.5'
    }));
  }

  data.forEach((d, i) => {
    const y = marginTop + i * rowH;
    const barW = Math.max(2, (d.count / maxVal) * barMaxW);

    // Label
    svg.appendChild(text(d.name, {
      x: marginLeft - 10, y: y + barH / 2 + 4,
      'font-size': '13', fill: INK,
      'text-anchor': 'end'
    }));

    // Bar background
    svg.appendChild(svgEl('rect', {
      x: marginLeft, y,
      width: barMaxW, height: barH,
      fill: '#ede8df', rx: 2
    }));

    // Bar fill
    const fillColor = i === 0 ? ACCENT : (i < 3 ? ACCENT_LIGHT : '#c8a0a0');
    svg.appendChild(svgEl('rect', {
      x: marginLeft, y,
      width: barW, height: barH,
      fill: fillColor, rx: 2
    }));

    // Value label
    svg.appendChild(text(d.count, {
      x: marginLeft + barW + 6, y: y + barH / 2 + 4,
      'font-size': '12', fill: INK_MUTE,
      'text-anchor': 'start'
    }));
  });

  mount.appendChild(svg);
}

// ── Name length histogram ────────────────────────────────────────────────────

export function drawLengthHistogram(mountId, lengthHist) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  // Convert to sorted array, filter to 1–35 for readability
  const entries = Object.entries(lengthHist)
    .map(([k, v]) => ({ len: parseInt(k), count: v }))
    .filter(d => d.len >= 1 && d.len <= 35)
    .sort((a, b) => a.len - b.len);

  const maxCount = Math.max(...entries.map(d => d.count));

  const marginLeft = 40;
  const marginRight = 20;
  const marginTop = 16;
  const marginBottom = 36;
  const chartW = Math.min(mount.clientWidth || 660, 700);
  const chartH = 260;
  const plotW = chartW - marginLeft - marginRight;
  const plotH = chartH - marginTop - marginBottom;

  const barW = Math.floor(plotW / entries.length) - 1;
  const barGap = Math.floor(plotW / entries.length);

  const svg = svgEl('svg', {
    width: chartW,
    height: chartH,
    viewBox: `0 0 ${chartW} ${chartH}`,
    style: 'display:block; overflow:visible; font-family: Helvetica Neue, sans-serif;'
  });

  // Y-axis gridlines (4 lines)
  for (let i = 1; i <= 4; i++) {
    const y = marginTop + plotH - (i / 4) * plotH;
    svg.appendChild(svgEl('line', {
      x1: marginLeft, y1: y,
      x2: marginLeft + plotW, y2: y,
      stroke: RULE, 'stroke-width': 1
    }));
    svg.appendChild(text(Math.round((i / 4) * maxCount).toLocaleString(), {
      x: marginLeft - 6, y: y + 4,
      'font-size': '10', fill: INK_MUTE, 'text-anchor': 'end'
    }));
  }

  // Bars
  entries.forEach((d, i) => {
    const x = marginLeft + i * barGap;
    const barH = (d.count / maxCount) * plotH;
    const y = marginTop + plotH - barH;

    const isMode = d.count === maxCount;
    svg.appendChild(svgEl('rect', {
      x, y,
      width: Math.max(1, barW), height: barH,
      fill: isMode ? ACCENT : '#c8a0a0',
      rx: 1
    }));

    // X-axis label every 5
    if (d.len % 5 === 0 || d.len === 1) {
      svg.appendChild(text(d.len, {
        x: x + barW / 2, y: marginTop + plotH + 16,
        'font-size': '11', fill: INK_MUTE, 'text-anchor': 'middle'
      }));
    }
  });

  // Baseline
  svg.appendChild(svgEl('line', {
    x1: marginLeft, y1: marginTop + plotH,
    x2: marginLeft + plotW, y2: marginTop + plotH,
    stroke: INK, 'stroke-width': 1
  }));

  // X-axis title
  svg.appendChild(text('name length (characters)', {
    x: marginLeft + plotW / 2, y: chartH - 2,
    'font-size': '11', fill: INK_MUTE, 'text-anchor': 'middle'
  }));

  // Annotation for mode
  const modeEntry = entries.find(d => d.count === maxCount);
  if (modeEntry) {
    const xi = entries.indexOf(modeEntry);
    const x = marginLeft + xi * barGap + barW / 2;
    const y = marginTop + plotH - (modeEntry.count / maxCount) * plotH - 8;
    svg.appendChild(text(`peak: ${modeEntry.len} chars`, {
      x, y,
      'font-size': '10', fill: ACCENT, 'text-anchor': 'middle',
      'font-weight': '600'
    }));
  }

  mount.appendChild(svg);
}
