// stories/commune-atlas/charts.js
// SVG charts for the commune names story — no external deps.

const PAPER   = '#faf7f2';
const INK     = '#1a1a1a';
const MUTE    = '#888';
const ACCENT  = '#b32020';
const RULE    = '#d8d0c0';
const BAR_FG  = '#5c7a5c';   // muted green for name-frequency bars
const BAR_SAINT = '#b32020'; // red for saint bars
const HIST_FG = '#3b5e8c';   // blue for histogram

// ── Utility ─────────────────────────────────────────────────────────────────

function svg(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(el, x, y, content, extra = {}) {
  const t = svg('text', { x, y, ...extra });
  t.textContent = content;
  el.appendChild(t);
  return t;
}

function mount(selector, svgEl) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!container) return;
  container.innerHTML = '';
  container.appendChild(svgEl);
}

// ── Chart 1: Top commune names (horizontal bar) ──────────────────────────────

export function drawFrequencyChart(selector, topNames) {
  const W = 680, PAD_LEFT = 210, PAD_RIGHT = 80, PAD_TOP = 28, ROW = 30;
  const items = topNames.slice(0, 15);
  const H = PAD_TOP + items.length * ROW + 20;
  const maxCount = items[0].count;
  const barW = W - PAD_LEFT - PAD_RIGHT;

  const root = svg('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'font-family: Helvetica Neue, sans-serif; display:block',
  });

  // axis line
  root.appendChild(svg('line', {
    x1: PAD_LEFT, y1: PAD_TOP - 8,
    x2: PAD_LEFT, y2: H - 10,
    stroke: RULE, 'stroke-width': 1,
  }));

  items.forEach((d, i) => {
    const y = PAD_TOP + i * ROW;
    const bw = (d.count / maxCount) * barW;
    const isSaint = d.name.startsWith('Saint') || d.name.startsWith('Sainte');
    const fill = isSaint ? BAR_SAINT : BAR_FG;

    // bar
    root.appendChild(svg('rect', {
      x: PAD_LEFT, y: y + 4,
      width: Math.max(bw, 2), height: ROW - 8,
      fill, opacity: isSaint ? 0.85 : 0.75,
    }));

    // name label
    const nameEl = svgText(root, PAD_LEFT - 8, y + ROW / 2 + 5, d.name, {
      'text-anchor': 'end',
      'font-size': '13px',
      fill: INK,
      'font-family': 'Georgia, serif',
    });

    // count label
    svgText(root, PAD_LEFT + bw + 6, y + ROW / 2 + 5, `×${d.count}`, {
      'font-size': '12px',
      fill: MUTE,
    });
  });

  // title
  svgText(root, PAD_LEFT, 16, 'Top 15 most-repeated commune names', {
    'font-size': '11px',
    'font-weight': '600',
    fill: MUTE,
    'letter-spacing': '0.8px',
    'text-transform': 'uppercase',
  });

  // legend
  root.appendChild(svg('rect', { x: PAD_LEFT, y: H - 8, width: 10, height: 10, fill: BAR_SAINT, opacity: 0.85 }));
  svgText(root, PAD_LEFT + 14, H - 0, 'Saint / Sainte', { 'font-size': '11px', fill: MUTE });
  root.appendChild(svg('rect', { x: PAD_LEFT + 110, y: H - 8, width: 10, height: 10, fill: BAR_FG, opacity: 0.75 }));
  svgText(root, PAD_LEFT + 124, H - 0, 'Other', { 'font-size': '11px', fill: MUTE });

  mount(selector, root);
}

// ── Chart 2: Name length histogram ───────────────────────────────────────────

export function drawLengthChart(selector, lengthDist) {
  const W = 680, PAD_L = 36, PAD_R = 16, PAD_TOP = 36, PAD_BOT = 40;
  const H = 220;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_TOP - PAD_BOT;

  // Only keep lengths 1–32 (tail gets sparse)
  const items = lengthDist.filter(d => d.len <= 32);
  const maxCount = Math.max(...items.map(d => d.count));
  const barW = innerW / items.length;

  const root = svg('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'font-family: Helvetica Neue, sans-serif; display:block',
  });

  // title
  svgText(root, PAD_L, 20, 'Commune name length — number of communes per character count', {
    'font-size': '11px',
    'font-weight': '600',
    fill: MUTE,
    'letter-spacing': '0.8px',
  });

  // baseline
  root.appendChild(svg('line', {
    x1: PAD_L, y1: PAD_TOP + innerH,
    x2: PAD_L + innerW, y2: PAD_TOP + innerH,
    stroke: RULE, 'stroke-width': 1,
  }));

  items.forEach((d, i) => {
    const x = PAD_L + i * barW;
    const bh = (d.count / maxCount) * innerH;
    const y = PAD_TOP + innerH - bh;

    root.appendChild(svg('rect', {
      x: x + 1, y,
      width: Math.max(barW - 2, 1), height: bh,
      fill: HIST_FG, opacity: 0.7,
    }));

    // x-axis tick every 5 chars
    if (d.len % 5 === 0 || d.len === 1) {
      root.appendChild(svg('line', {
        x1: x + barW / 2, y1: PAD_TOP + innerH,
        x2: x + barW / 2, y2: PAD_TOP + innerH + 4,
        stroke: MUTE, 'stroke-width': 1,
      }));
      svgText(root, x + barW / 2, PAD_TOP + innerH + 16, String(d.len), {
        'text-anchor': 'middle',
        'font-size': '11px',
        fill: MUTE,
      });
    }

    // annotate peak
    if (d.len === 7 || d.len === 8) {
      svgText(root, x + barW / 2, y - 5, d.count.toLocaleString('fr-FR'), {
        'text-anchor': 'middle',
        'font-size': '10px',
        fill: HIST_FG,
        'font-weight': '600',
      });
    }
  });

  // x-axis label
  svgText(root, PAD_L + innerW / 2, H - 2, 'characters in name', {
    'text-anchor': 'middle',
    'font-size': '11px',
    fill: MUTE,
  });

  mount(selector, root);
}

// ── Chart 3: Prefix ranking (horizontal bar) ─────────────────────────────────

export function drawPrefixChart(selector, prefixes) {
  const W = 680, PAD_LEFT = 155, PAD_RIGHT = 80, PAD_TOP = 28, ROW = 28;
  const items = prefixes.slice(0, 10);
  const H = PAD_TOP + items.length * ROW + 20;
  const maxCount = items[0].count;
  const barW = W - PAD_LEFT - PAD_RIGHT;

  const root = svg('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'font-family: Helvetica Neue, sans-serif; display:block',
  });

  // axis line
  root.appendChild(svg('line', {
    x1: PAD_LEFT, y1: PAD_TOP - 8,
    x2: PAD_LEFT, y2: H - 10,
    stroke: RULE, 'stroke-width': 1,
  }));

  items.forEach((d, i) => {
    const y = PAD_TOP + i * ROW;
    const bw = (d.count / maxCount) * barW;
    const isSaint = d.prefix.startsWith('Saint');
    const fill = isSaint ? BAR_SAINT : BAR_FG;

    root.appendChild(svg('rect', {
      x: PAD_LEFT, y: y + 4,
      width: Math.max(bw, 2), height: ROW - 8,
      fill, opacity: isSaint ? 0.85 : 0.72,
    }));

    svgText(root, PAD_LEFT - 8, y + ROW / 2 + 5, d.prefix, {
      'text-anchor': 'end',
      'font-size': '13px',
      fill: INK,
      'font-family': 'Georgia, serif',
    });

    svgText(root, PAD_LEFT + bw + 6, y + ROW / 2 + 5, d.count.toLocaleString('fr-FR'), {
      'font-size': '12px',
      fill: MUTE,
    });
  });

  svgText(root, PAD_LEFT, 16, 'Most common opening word in commune name', {
    'font-size': '11px',
    'font-weight': '600',
    fill: MUTE,
    'letter-spacing': '0.8px',
  });

  mount(selector, root);
}
