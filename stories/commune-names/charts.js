// commune-names/charts.js
// Renders three SVG charts: length distribution, top names, top first words.

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#d8d0c0';
const ACCENT = '#b32020';
const BAR_COLOR = '#4a7fa8';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(el, text, attrs = {}) {
  const t = svgEl('text', attrs);
  t.textContent = text;
  el.appendChild(t);
  return t;
}

export function drawLengthChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = Math.min(container.clientWidth || 720, 720);
  const H = 260;
  const ml = 46, mr = 20, mt = 20, mb = 40;
  const cw = W - ml - mr;
  const ch = H - mt - mb;

  const svg = svgEl('svg', { width: W, height: H, role: 'img' });
  container.appendChild(svg);

  const g = svgEl('g', { transform: `translate(${ml},${mt})` });
  svg.appendChild(g);

  const maxCount = Math.max(...data.map(d => d.count));
  const barW = cw / data.length;

  // Y gridlines
  const ticks = [0, Math.round(maxCount * 0.25), Math.round(maxCount * 0.5), Math.round(maxCount * 0.75), maxCount];
  for (const t of ticks) {
    const y = ch - (t / maxCount) * ch;
    const line = svgEl('line', { x1: 0, x2: cw, y1: y, y2: y, stroke: RULE, 'stroke-width': 1 });
    g.appendChild(line);
    const label = svgText(g, t >= 1000 ? `${(t/1000).toFixed(1)}k` : t, {
      x: -6, y: y + 4,
      'text-anchor': 'end',
      'font-family': 'Helvetica Neue, sans-serif',
      'font-size': 10,
      fill: MUTE,
    });
  }

  // Bars
  data.forEach((d, i) => {
    const bh = (d.count / maxCount) * ch;
    const x = i * barW;
    const y = ch - bh;
    const isOne = d.len === 1;

    const rect = svgEl('rect', {
      x: x + 1, y: y,
      width: Math.max(barW - 2, 1), height: bh,
      fill: isOne ? ACCENT : BAR_COLOR,
      opacity: isOne ? 1 : 0.72,
    });
    g.appendChild(rect);

    // X axis label: every 4th + label for 1
    if (i % 4 === 0 || d.len === 1 || d.len === '21+') {
      const label = svgText(g, String(d.len), {
        x: x + barW / 2, y: ch + 14,
        'text-anchor': 'middle',
        'font-family': 'Helvetica Neue, sans-serif',
        'font-size': 10,
        fill: isOne ? ACCENT : MUTE,
        'font-weight': isOne ? 700 : 400,
      });
    }
  });

  // Axis line
  const axisLine = svgEl('line', { x1: 0, x2: cw, y1: ch, y2: ch, stroke: INK, 'stroke-width': 1 });
  g.appendChild(axisLine);

  // Annotation for "Y"
  const yBar = data[0]; // len=1
  const annotX = 0 * barW + barW / 2;
  const annotY = ch - (yBar.count / maxCount) * ch - 8;
  const ann = svgText(g, 'Y — the only 1-letter commune', {
    x: annotX + 4, y: annotY,
    'font-family': 'Georgia, serif',
    'font-size': 11,
    fill: ACCENT,
    'font-style': 'italic',
  });
  g.appendChild(ann);
}

export function drawTopNamesChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = Math.min(container.clientWidth || 720, 720);
  const rowH = 28;
  const H = data.length * rowH + 40;
  const ml = 170, mr = 60, mt = 10, mb = 20;
  const cw = W - ml - mr;

  const svg = svgEl('svg', { width: W, height: H });
  container.appendChild(svg);

  const g = svgEl('g', { transform: `translate(${ml},${mt})` });
  svg.appendChild(g);

  const maxCount = data[0].count;

  data.forEach((d, i) => {
    const y = i * rowH;
    const bw = (d.count / maxCount) * cw;

    const rect = svgEl('rect', {
      x: 0, y: y + 4,
      width: Math.max(bw, 2), height: rowH - 8,
      fill: BAR_COLOR,
      opacity: 0.75,
    });
    g.appendChild(rect);

    // Name label (left)
    const nameLabel = svgEl('text', {
      x: -8, y: y + rowH / 2 + 4,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': 13,
      fill: INK,
    });
    nameLabel.textContent = d.name;
    g.appendChild(nameLabel);

    // Count label (right of bar)
    const countLabel = svgEl('text', {
      x: Math.max(bw, 2) + 6, y: y + rowH / 2 + 4,
      'font-family': 'Helvetica Neue, sans-serif',
      'font-size': 11,
      fill: MUTE,
    });
    countLabel.textContent = `×${d.count}`;
    g.appendChild(countLabel);
  });
}

export function drawFirstWordsChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = Math.min(container.clientWidth || 720, 720);
  const rowH = 28;
  const H = data.length * rowH + 40;
  const ml = 90, mr = 80, mt = 10, mb = 20;
  const cw = W - ml - mr;

  const svg = svgEl('svg', { width: W, height: H });
  container.appendChild(svg);

  const g = svgEl('g', { transform: `translate(${ml},${mt})` });
  svg.appendChild(g);

  const maxCount = data[0].count;

  data.forEach((d, i) => {
    const y = i * rowH;
    const bw = (d.count / maxCount) * cw;
    const isSaint = d.word === 'Saint' || d.word === 'Sainte';

    const rect = svgEl('rect', {
      x: 0, y: y + 4,
      width: Math.max(bw, 2), height: rowH - 8,
      fill: isSaint ? ACCENT : BAR_COLOR,
      opacity: isSaint ? 0.85 : 0.72,
    });
    g.appendChild(rect);

    const nameLabel = svgEl('text', {
      x: -8, y: y + rowH / 2 + 4,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': 13,
      fill: isSaint ? ACCENT : INK,
      'font-weight': isSaint ? 700 : 400,
    });
    nameLabel.textContent = d.word;
    g.appendChild(nameLabel);

    const countLabel = svgEl('text', {
      x: Math.max(bw, 2) + 6, y: y + rowH / 2 + 4,
      'font-family': 'Helvetica Neue, sans-serif',
      'font-size': 11,
      fill: MUTE,
    });
    countLabel.textContent = d.count.toLocaleString('fr-FR');
    g.appendChild(countLabel);
  });
}
