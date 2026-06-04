/* charts.js — commune-names story */

const ACCENT = '#b32020';
const INK    = '#1a1a1a';
const MUTE   = '#888';
const RULE   = '#d8d0c0';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function textEl(tag, content, attrs = {}) {
  const el = document.createElement(tag);
  el.textContent = content;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

export function drawTopNamesChart(container, stats) {
  const items = stats.topNames.slice(0, 20);
  const maxCount = items[0].count;

  const BAR_H   = 22;
  const GAP     = 4;
  const LABEL_W = 168;
  const BAR_MAX = 220;
  const COUNT_W = 28;
  const PAD_TOP = 8;
  const PAD_BOT = 8;
  const W       = LABEL_W + 8 + BAR_MAX + COUNT_W + 4;
  const H       = PAD_TOP + items.length * (BAR_H + GAP) + PAD_BOT;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'max-width:520px;display:block;overflow:visible',
  });

  items.forEach((item, i) => {
    const y    = PAD_TOP + i * (BAR_H + GAP);
    const barW = Math.round((item.count / maxCount) * BAR_MAX);
    const x0   = LABEL_W + 8;

    // label
    const lbl = svgEl('text', {
      x: LABEL_W,
      y: y + BAR_H / 2 + 5,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': '12',
      fill: INK,
    });
    lbl.textContent = item.name;
    svg.appendChild(lbl);

    // bar
    svg.appendChild(svgEl('rect', {
      x: x0, y,
      width: barW, height: BAR_H,
      fill: i === 0 ? ACCENT : '#c8b89a',
      rx: 2,
    }));

    // count
    const cnt = svgEl('text', {
      x: x0 + barW + 6,
      y: y + BAR_H / 2 + 5,
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '11',
      'font-variant-numeric': 'tabular-nums',
      fill: MUTE,
    });
    cnt.textContent = `×${item.count}`;
    svg.appendChild(cnt);
  });

  container.appendChild(svg);
}

export function drawLengthChart(container, stats) {
  const dist = stats.lengthDist;
  const buckets = [];
  for (let len = 1; len < dist.length; len++) {
    if (dist[len] > 0) buckets.push({ len, count: dist[len] });
  }

  const maxCount = Math.max(...buckets.map(b => b.count));
  const BAR_W   = 14;
  const GAP     = 2;
  const CHART_H = 120;
  const PAD_L   = 8;
  const PAD_R   = 16;
  const PAD_T   = 8;
  const AXIS_H  = 20;
  const W       = PAD_L + buckets.length * (BAR_W + GAP) + PAD_R;
  const H       = PAD_T + CHART_H + AXIS_H;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: `max-width:${W * 1.2}px;display:block;overflow:visible`,
  });

  // mean line
  const meanLen = stats.meanLength;
  const meanIdx = buckets.findIndex(b => b.len === Math.round(meanLen));
  if (meanIdx >= 0) {
    const mx = PAD_L + meanIdx * (BAR_W + GAP) + BAR_W / 2;
    svg.appendChild(svgEl('line', {
      x1: mx, y1: PAD_T, x2: mx, y2: PAD_T + CHART_H,
      stroke: ACCENT, 'stroke-width': '1.5', 'stroke-dasharray': '4 3',
    }));
    const ml = svgEl('text', {
      x: mx + 4,
      y: PAD_T + 12,
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '10',
      fill: ACCENT,
    });
    ml.textContent = `avg ${meanLen}`;
    svg.appendChild(ml);
  }

  buckets.forEach((b, i) => {
    const barH = Math.round((b.count / maxCount) * CHART_H);
    const x    = PAD_L + i * (BAR_W + GAP);
    const y    = PAD_T + CHART_H - barH;

    svg.appendChild(svgEl('rect', {
      x, y,
      width: BAR_W, height: barH,
      fill: '#c8b89a',
      rx: 1,
    }));

    // axis label every 5 chars
    if (b.len % 5 === 0) {
      const lbl = svgEl('text', {
        x: x + BAR_W / 2,
        y: PAD_T + CHART_H + 14,
        'text-anchor': 'middle',
        'font-family': "'Helvetica Neue', sans-serif",
        'font-size': '10',
        fill: MUTE,
      });
      lbl.textContent = b.len;
      svg.appendChild(lbl);
    }
  });

  // Y-axis label
  const ylbl = svgEl('text', {
    x: 0,
    y: PAD_T + 8,
    'font-family': "'Helvetica Neue', sans-serif",
    'font-size': '9',
    fill: MUTE,
  });
  ylbl.textContent = 'communes';
  svg.appendChild(ylbl);

  container.appendChild(svg);
}
