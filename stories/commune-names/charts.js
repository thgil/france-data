// stories/commune-names/charts.js
// Pure-SVG charts for the commune-names story (no external deps).
// Exports: drawTopNamesChart, drawLengthHistogram

const PAPER  = '#faf7f2';
const INK    = '#1a1a1a';
const ACCENT = '#b32020';
const MUTE   = '#888';
const BAR_COLOR  = '#8c5a2a';
const HIST_COLOR = '#4a7a6e';

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

// ── Horizontal bar chart: top N commune names ──────────────────────────────
export function drawTopNamesChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = stats.topNames.slice(0, 15);
  const maxCount = data[0].count;

  const marginLeft  = 200;
  const marginRight = 60;
  const marginTop   = 24;
  const marginBottom = 16;
  const barHeight   = 28;
  const barGap      = 6;
  const chartW      = Math.min(container.clientWidth || 700, 700);
  const innerW      = chartW - marginLeft - marginRight;
  const chartH      = data.length * (barHeight + barGap) + marginTop + marginBottom;

  const svg = svgEl('svg', {
    width: chartW,
    height: chartH,
    viewBox: `0 0 ${chartW} ${chartH}`,
    style: 'display:block;max-width:100%;font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif',
  });

  const xScale = count => (count / maxCount) * innerW;

  data.forEach((d, i) => {
    const y = marginTop + i * (barHeight + barGap);
    const barW = xScale(d.count);

    // Bar
    svg.appendChild(svgEl('rect', {
      x: marginLeft,
      y,
      width: barW,
      height: barHeight,
      fill: i === 0 ? ACCENT : BAR_COLOR,
      opacity: 1 - i * 0.04,
    }));

    // Name label (left)
    const nameLabel = textEl('text', d.name, {
      x: marginLeft - 8,
      y: y + barHeight / 2 + 1,
      'text-anchor': 'end',
      'dominant-baseline': 'middle',
      'font-size': '13',
      'font-family': 'Georgia,serif',
      fill: i === 0 ? ACCENT : INK,
      'font-weight': i === 0 ? '700' : '400',
    });
    svg.appendChild(nameLabel);

    // Count label (right of bar)
    const countLabel = textEl('text', `${d.count}`, {
      x: marginLeft + barW + 6,
      y: y + barHeight / 2 + 1,
      'text-anchor': 'start',
      'dominant-baseline': 'middle',
      'font-size': '12',
      fill: MUTE,
    });
    svg.appendChild(countLabel);
  });

  container.appendChild(svg);
}

// ── Length histogram ───────────────────────────────────────────────────────
export function drawLengthHistogram(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Group into bins of 2 characters to reduce noise
  const raw = stats.lengthDistribution; // [{length, count}]
  const maxLen = raw[raw.length - 1].length;

  // Build bins: 1, 2-3, 4-5, 6-7, ... up to 45
  // Actually let's just use raw data but smooth/trim
  // Use individual lengths 1-25 and bucket 26+ together
  const buckets = [];
  const grouped = {};
  for (const d of raw) {
    const key = d.length <= 25 ? d.length : '26+';
    grouped[key] = (grouped[key] || 0) + d.count;
  }
  for (let l = 1; l <= 25; l++) {
    buckets.push({ label: String(l), count: grouped[l] || 0 });
  }
  buckets.push({ label: '26+', count: grouped['26+'] || 0 });

  const maxCount = Math.max(...buckets.map(b => b.count));

  const marginLeft   = 48;
  const marginRight  = 16;
  const marginTop    = 24;
  const marginBottom = 40;
  const chartW = Math.min(container.clientWidth || 700, 700);
  const innerW = chartW - marginLeft - marginRight;
  const chartH = 240;
  const innerH = chartH - marginTop - marginBottom;

  const bw = innerW / buckets.length;
  const yScale = count => (count / maxCount) * innerH;

  const svg = svgEl('svg', {
    width: chartW,
    height: chartH,
    viewBox: `0 0 ${chartW} ${chartH}`,
    style: 'display:block;max-width:100%;font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif',
  });

  // Baseline
  svg.appendChild(svgEl('line', {
    x1: marginLeft, y1: marginTop + innerH,
    x2: marginLeft + innerW, y2: marginTop + innerH,
    stroke: '#ccc', 'stroke-width': 1,
  }));

  // Mean marker
  const meanLen = stats.avgLength;
  const meanBucket = Math.min(meanLen - 1, 25); // 0-indexed bucket
  const meanX = marginLeft + (meanBucket + 0.5) * bw;
  svg.appendChild(svgEl('line', {
    x1: meanX, y1: marginTop,
    x2: meanX, y2: marginTop + innerH,
    stroke: ACCENT, 'stroke-width': 1.5, 'stroke-dasharray': '4 3',
  }));
  svg.appendChild(textEl('text', `mean ${meanLen}`, {
    x: meanX + 4,
    y: marginTop + 14,
    'font-size': '11',
    fill: ACCENT,
  }));

  // Bars
  buckets.forEach((b, i) => {
    const x = marginLeft + i * bw + 1;
    const h = yScale(b.count);
    const y = marginTop + innerH - h;

    svg.appendChild(svgEl('rect', {
      x,
      y,
      width: Math.max(bw - 2, 1),
      height: h,
      fill: HIST_COLOR,
      opacity: '0.85',
    }));

    // X-axis label (every 5)
    const lNum = parseInt(b.label);
    if (!isNaN(lNum) && (lNum === 1 || lNum % 5 === 0)) {
      svg.appendChild(textEl('text', b.label, {
        x: x + bw / 2,
        y: marginTop + innerH + 16,
        'text-anchor': 'middle',
        'font-size': '11',
        fill: MUTE,
      }));
    } else if (b.label === '26+') {
      svg.appendChild(textEl('text', '26+', {
        x: x + bw / 2,
        y: marginTop + innerH + 16,
        'text-anchor': 'middle',
        'font-size': '11',
        fill: MUTE,
      }));
    }
  });

  // Y-axis label
  svg.appendChild(textEl('text', 'communes', {
    x: marginLeft - 4,
    y: marginTop,
    'text-anchor': 'end',
    'font-size': '11',
    fill: MUTE,
    transform: `rotate(-90, ${marginLeft - 4}, ${marginTop})`,
  }));

  // X-axis title
  svg.appendChild(textEl('text', 'name length (characters)', {
    x: marginLeft + innerW / 2,
    y: chartH - 4,
    'text-anchor': 'middle',
    'font-size': '12',
    fill: MUTE,
  }));

  container.appendChild(svg);
}
