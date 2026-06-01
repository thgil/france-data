/* commune-names/charts.js — SVG bar charts and histogram */

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK   = '#1a1a1a';
const MUTE  = '#888';
const BAR   = '#b32020';
const BAR2  = '#d88080';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

/* ── Top-names horizontal bar chart ─────────────────────────────── */
export function drawTopNamesChart(containerId, stats) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const data  = stats.top_names.slice(0, 20);
  const maxVal = data[0].count;

  const W = Math.min(container.clientWidth || 600, 640);
  const rowH = 28;
  const labelW = 210;
  const barAreaW = W - labelW - 60;
  const H = data.length * rowH + 32;

  const svg = svgEl('svg', { width: W, height: H, role: 'img',
    'aria-label': 'Top 20 most common commune names in France' });

  data.forEach((d, i) => {
    const y = i * rowH + 16;
    const barW = Math.round((d.count / maxVal) * barAreaW);

    // Label
    const text = svgEl('text', {
      x: labelW - 8,
      y: y + rowH * 0.65,
      'text-anchor': 'end',
      'font-family': SERIF,
      'font-size': '13',
      fill: INK,
    });
    text.textContent = d.name;
    svg.appendChild(text);

    // Bar
    const rect = svgEl('rect', {
      x: labelW,
      y: y + 4,
      width: barW,
      height: rowH - 10,
      fill: i === 0 ? BAR : BAR2,
      rx: 2,
    });
    svg.appendChild(rect);

    // Count label
    const countText = svgEl('text', {
      x: labelW + barW + 6,
      y: y + rowH * 0.65,
      'font-family': SANS,
      'font-size': '12',
      fill: MUTE,
    });
    countText.textContent = `${d.count}×`;
    svg.appendChild(countText);
  });

  container.appendChild(svg);
}

/* ── Name length histogram ───────────────────────────────────────── */
export function drawLengthHistogram(containerId, stats) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Group into buckets 1-5, 6-10, 11-15, 16-20, 21-25, 26+
  const raw = stats.length_distribution;
  const buckets = [
    { label: '1–5',  min: 1,  max: 5  },
    { label: '6–10', min: 6,  max: 10 },
    { label: '11–15',min: 11, max: 15 },
    { label: '16–20',min: 16, max: 20 },
    { label: '21–25',min: 21, max: 25 },
    { label: '26+',  min: 26, max: 99 },
  ];
  const data = buckets.map(b => ({
    label: b.label,
    count: raw.filter(r => r.length >= b.min && r.length <= b.max)
              .reduce((s, r) => s + r.count, 0),
  }));

  const W = Math.min(container.clientWidth || 600, 480);
  const H = 200;
  const padL = 48, padR = 16, padT = 16, padB = 32;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxVal = Math.max(...data.map(d => d.count));
  const bw = Math.floor(plotW / data.length) - 4;

  const svg = svgEl('svg', { width: W, height: H, role: 'img',
    'aria-label': 'Distribution of commune name lengths' });

  // Y-axis label
  const yLabel = svgEl('text', {
    x: 10, y: padT + plotH / 2,
    'text-anchor': 'middle',
    'font-family': SANS,
    'font-size': '10',
    fill: MUTE,
    transform: `rotate(-90, 10, ${padT + plotH / 2})`,
  });
  yLabel.textContent = 'communes';
  svg.appendChild(yLabel);

  // Horizontal gridlines (4)
  [0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = padT + plotH - Math.round(frac * plotH);
    const line = svgEl('line', {
      x1: padL, x2: W - padR, y1: y, y2: y,
      stroke: '#e0d8cc', 'stroke-width': 1,
    });
    svg.appendChild(line);
    const tick = svgEl('text', {
      x: padL - 4, y: y + 4,
      'text-anchor': 'end',
      'font-family': SANS,
      'font-size': '10',
      fill: MUTE,
    });
    tick.textContent = Math.round(frac * maxVal).toLocaleString('fr-FR');
    svg.appendChild(tick);
  });

  data.forEach((d, i) => {
    const x = padL + i * (plotW / data.length) + 2;
    const barH = Math.round((d.count / maxVal) * plotH);
    const y = padT + plotH - barH;

    const rect = svgEl('rect', {
      x, y, width: bw, height: barH,
      fill: BAR2, rx: 2,
    });
    svg.appendChild(rect);

    const xlabel = svgEl('text', {
      x: x + bw / 2,
      y: H - padB + 14,
      'text-anchor': 'middle',
      'font-family': SANS,
      'font-size': '11',
      fill: INK,
    });
    xlabel.textContent = d.label;
    svg.appendChild(xlabel);
  });

  container.appendChild(svg);
}
