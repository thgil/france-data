// stories/commune-names/charts.js
// SVG histogram of commune name lengths.
// Export: drawLengthHistogram(selector, stats)

const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function txt(content, attrs = {}) {
  const e = el('text', attrs);
  e.textContent = content;
  return e;
}

export function drawLengthHistogram(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const dist = stats.lengthDist;

  // Buckets: lengths 1–29 individual, then 30+ grouped
  const SPLIT = 30;
  const buckets = [];
  let longTail = 0;

  for (const d of dist) {
    if (d.length < SPLIT) {
      buckets.push({ label: String(d.length), length: d.length, count: d.count });
    } else {
      longTail += d.count;
    }
  }
  buckets.push({ label: '30+', length: 30, count: longTail });

  const maxCount = Math.max(...buckets.map(b => b.count));

  // Layout
  const W = 720, H = 300;
  const mL = 52, mR = 16, mT = 20, mB = 44;
  const plotW = W - mL - mR;
  const plotH = H - mT - mB;
  const barW = plotW / buckets.length;

  const scaleY = (v) => mT + plotH - (v / maxCount) * plotH;

  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;height:auto;display:block;',
    'aria-label': 'Histogram of French commune name lengths',
    role: 'img',
  });

  // Gridlines + y-axis labels
  const yTicks = [500, 1000, 1500, 2000, 2500, 3000, 3500];
  for (const tick of yTicks) {
    const y = scaleY(tick);
    svg.appendChild(el('line', { x1: mL, x2: mL + plotW, y1: y, y2: y, stroke: '#e0d8cc', 'stroke-width': 1 }));
    svg.appendChild(txt(tick >= 1000 ? (tick / 1000) + 'k' : String(tick), {
      x: mL - 6, y: y + 4,
      'text-anchor': 'end',
      'font-size': 10,
      'font-family': 'Helvetica Neue, sans-serif',
      fill: '#888',
    }));
  }

  // Baseline
  svg.appendChild(el('line', { x1: mL, x2: mL + plotW, y1: mT + plotH, y2: mT + plotH, stroke: '#1a1a1a', 'stroke-width': 1 }));

  // Bars
  for (let i = 0; i < buckets.length; i++) {
    const b = buckets[i];
    const x = mL + i * barW;
    const bH = (b.count / maxCount) * plotH;
    const y = scaleY(b.count);

    // Highlight peak (7–8) in accent, long-tail in muted gray, others in ink
    let fill;
    if (b.length === 7 || b.length === 8) fill = '#b32020';
    else if (b.label === '30+') fill = '#aaa';
    else if (b.length === 1) fill = '#444';
    else fill = '#1a1a1a';

    svg.appendChild(el('rect', {
      x: x + 1,
      y,
      width: barW - 2,
      height: bH,
      fill,
    }));

    // X axis labels: 1, every 5, and 30+
    const n = parseInt(b.label);
    if (b.label === '1' || b.label === '30+' || (n > 0 && n % 5 === 0)) {
      svg.appendChild(txt(b.label, {
        x: x + barW / 2,
        y: mT + plotH + 16,
        'text-anchor': 'middle',
        'font-size': 10,
        'font-family': 'Helvetica Neue, sans-serif',
        fill: '#666',
      }));
    }
  }

  // Peak annotation
  const peakX = mL + 6 * barW + barW / 2; // length=7
  svg.appendChild(txt('Peak: 7–8 chars', {
    x: peakX + barW * 2.2,
    y: scaleY(maxCount) - 6,
    'font-size': 10,
    'font-family': 'Helvetica Neue, sans-serif',
    fill: '#b32020',
  }));

  // Axis label
  svg.appendChild(txt('Name length (characters)', {
    x: mL + plotW / 2,
    y: H - 4,
    'text-anchor': 'middle',
    'font-size': 10,
    'font-family': 'Helvetica Neue, sans-serif',
    fill: '#888',
  }));

  // Y axis label
  const yLbl = txt('Communes', {
    x: 0,
    y: 0,
    'text-anchor': 'middle',
    'font-size': 10,
    'font-family': 'Helvetica Neue, sans-serif',
    fill: '#888',
    transform: `translate(12, ${mT + plotH / 2}) rotate(-90)`,
  });
  svg.appendChild(yLbl);

  container.appendChild(svg);
}
