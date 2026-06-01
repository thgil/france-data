// charts.js — commune-names story

function makeSVG(w, h) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  return svg;
}

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

export function drawLengthHistogram(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const hist = stats.lengthHistogram;
  const maxLen = 38;
  const buckets = [];
  for (let l = 1; l <= maxLen; l++) {
    buckets.push({ len: l, count: hist[String(l)] || 0 });
  }
  buckets.push({
    len: 99,
    label: '39+',
    count: Object.entries(hist)
      .filter(([k]) => parseInt(k) > maxLen)
      .reduce((s, [, v]) => s + v, 0),
  });

  const W = 680, H = 220;
  const marginL = 42, marginR = 16, marginT = 16, marginB = 44;
  const plotW = W - marginL - marginR;
  const plotH = H - marginT - marginB;

  const maxCount = Math.max(...buckets.map((b) => b.count));
  const barW = (plotW / buckets.length) - 1;

  const svg = makeSVG(W, H);
  svg.style.maxWidth = '680px';

  const g = svgEl('g', { transform: `translate(${marginL},${marginT})` });
  svg.appendChild(g);

  const ACCENT = '#b32020';
  const MUTE = '#d8d0c0';
  const INK = '#1a1a1a';
  const MUTEDINK = '#888';
  const FONTMONO = `font-family: 'Courier New', monospace; font-size: 10px; fill: ${MUTEDINK}`;

  // Y-axis gridlines at 0, 5k, 10k, 15k
  const yTicks = [0, 5000, 10000, 15000];
  for (const v of yTicks) {
    const y = plotH - (v / maxCount) * plotH;
    g.appendChild(svgEl('line', {
      x1: 0, y1: y, x2: plotW, y2: y,
      stroke: MUTE, 'stroke-width': 0.5,
    }));
    const label = v === 0 ? '0' : `${v / 1000}k`;
    const t = svgText(label, {
      x: -6, y: y + 4,
      'text-anchor': 'end',
      'font-family': 'Helvetica Neue, Arial, sans-serif',
      'font-size': '10',
      fill: MUTEDINK,
    });
    g.appendChild(t);
  }

  // Bars
  buckets.forEach((b, i) => {
    const x = i * (barW + 1);
    const barH = (b.count / maxCount) * plotH;
    const y = plotH - barH;
    const isMedian = b.len === stats.medianLength;
    const isShortest = b.len === 1;
    const isLongest = b.len === 99;
    const fill = isShortest || isLongest ? ACCENT : isMedian ? '#7a1818' : '#c8a87a';

    g.appendChild(svgEl('rect', {
      x, y, width: barW, height: barH,
      fill,
    }));

    if (b.len <= 38 && b.len % 5 === 0) {
      g.appendChild(svgText(String(b.len), {
        x: x + barW / 2, y: plotH + 14,
        'text-anchor': 'middle',
        'font-family': 'Helvetica Neue, Arial, sans-serif',
        'font-size': '10',
        fill: MUTEDINK,
      }));
    }
    if (b.label) {
      g.appendChild(svgText(b.label, {
        x: x + barW / 2, y: plotH + 14,
        'text-anchor': 'middle',
        'font-family': 'Helvetica Neue, Arial, sans-serif',
        'font-size': '10',
        fill: MUTEDINK,
      }));
    }
  });

  // Axis line
  g.appendChild(svgEl('line', {
    x1: 0, y1: plotH, x2: plotW, y2: plotH,
    stroke: INK, 'stroke-width': 1,
  }));

  // Median annotation
  const medianIdx = buckets.findIndex((b) => b.len === stats.medianLength);
  if (medianIdx >= 0) {
    const mx = medianIdx * (barW + 1) + barW / 2;
    const my = plotH - (buckets[medianIdx].count / maxCount) * plotH - 6;
    g.appendChild(svgEl('line', {
      x1: mx, y1: my, x2: mx, y2: my - 20,
      stroke: '#7a1818', 'stroke-width': 1, 'stroke-dasharray': '3,2',
    }));
    g.appendChild(svgText(`median: ${stats.medianLength}`, {
      x: mx + 4, y: my - 22,
      'font-family': 'Helvetica Neue, Arial, sans-serif',
      'font-size': '10',
      fill: '#7a1818',
    }));
  }

  // X-axis label
  g.appendChild(svgText('characters', {
    x: plotW / 2, y: plotH + 38,
    'text-anchor': 'middle',
    'font-family': 'Helvetica Neue, Arial, sans-serif',
    'font-size': '11',
    fill: MUTEDINK,
  }));

  container.appendChild(svg);
}

export function drawDuplicatesChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const dupes = stats.topDuplicates.slice(0, 15);
  const maxCount = dupes[0].count;

  const W = 680, ROW = 28, marginL = 180, marginR = 56, marginT = 8, marginB = 8;
  const H = marginT + dupes.length * ROW + marginB;
  const plotW = W - marginL - marginR;

  const svg = makeSVG(W, H);
  svg.style.maxWidth = '680px';

  const ACCENT = '#b32020';
  const LIGHT = '#e8dece';
  const INK = '#1a1a1a';
  const MUTED = '#888';

  const g = svgEl('g', { transform: `translate(${marginL},${marginT})` });
  svg.appendChild(g);

  dupes.forEach((d, i) => {
    const y = i * ROW;
    const barW = (d.count / maxCount) * plotW;

    g.appendChild(svgEl('rect', {
      x: 0, y: y + 4, width: plotW, height: ROW - 8,
      fill: LIGHT, rx: 2,
    }));
    g.appendChild(svgEl('rect', {
      x: 0, y: y + 4, width: barW, height: ROW - 8,
      fill: i < 3 ? ACCENT : '#c8a87a', rx: 2,
    }));

    g.appendChild(svgText(d.name, {
      x: -8, y: y + ROW / 2 + 4,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': '13',
      fill: INK,
    }));

    const countLabel = `${d.count}×`;
    g.appendChild(svgText(countLabel, {
      x: barW + 6, y: y + ROW / 2 + 4,
      'font-family': 'Helvetica Neue, Arial, sans-serif',
      'font-size': '11',
      'font-weight': '600',
      fill: i < 3 ? ACCENT : '#666',
    }));
  });

  container.appendChild(svg);
}
