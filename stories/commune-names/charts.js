// charts.js — commune-names story

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const ACCENT = '#b32020';
const BAR_COLOR = '#8b2020';
const BAR_LIGHT = '#c0a080';

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

export function drawTopNamesChart(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = topNames.slice(0, 15);
  const maxCount = items[0].count;

  const W = Math.min(container.offsetWidth || 640, 680);
  const ROW_H = 28;
  const LABEL_W = 190;
  const BAR_MAX = W - LABEL_W - 60;
  const H = items.length * ROW_H + 24;

  const svg = svgEl('svg', {
    width: W, height: H,
    viewBox: `0 0 ${W} ${H}`,
    style: 'overflow: visible; display: block;'
  });

  items.forEach((d, i) => {
    const y = i * ROW_H + ROW_H * 0.5;
    const barW = Math.max(2, (d.count / maxCount) * BAR_MAX);

    // label
    const label = svgEl('text', {
      x: LABEL_W - 8,
      y: y + 5,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': '13',
      fill: INK
    });
    label.textContent = d.name;
    svg.appendChild(label);

    // bar
    const rect = svgEl('rect', {
      x: LABEL_W,
      y: y - 9,
      width: barW,
      height: 18,
      fill: i === 0 ? BAR_COLOR : BAR_LIGHT,
      rx: 2
    });
    svg.appendChild(rect);

    // count
    const countLabel = svgEl('text', {
      x: LABEL_W + barW + 6,
      y: y + 5,
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '12',
      fill: MUTE
    });
    countLabel.textContent = `×${d.count}`;
    svg.appendChild(countLabel);
  });

  container.appendChild(svg);
}

export function drawSaintsChart(selector, topSaints) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = topSaints.slice(0, 10);
  const maxCount = items[0].count;

  const W = Math.min(container.offsetWidth || 640, 680);
  const ROW_H = 30;
  const LABEL_W = 120;
  const BAR_MAX = W - LABEL_W - 70;
  const H = items.length * ROW_H + 24;

  const svg = svgEl('svg', {
    width: W, height: H,
    viewBox: `0 0 ${W} ${H}`,
    style: 'overflow: visible; display: block;'
  });

  items.forEach((d, i) => {
    const y = i * ROW_H + ROW_H * 0.5;
    const barW = Math.max(2, (d.count / maxCount) * BAR_MAX);
    const saintLabel = d.saint.startsWith('Sainte-') ? d.saint : `Saint-${d.saint}`;

    const label = svgEl('text', {
      x: LABEL_W - 8,
      y: y + 5,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': '13',
      fill: INK
    });
    label.textContent = saintLabel;
    svg.appendChild(label);

    const rect = svgEl('rect', {
      x: LABEL_W,
      y: y - 10,
      width: barW,
      height: 20,
      fill: i === 0 ? BAR_COLOR : BAR_LIGHT,
      rx: 2
    });
    svg.appendChild(rect);

    const countLabel = svgEl('text', {
      x: LABEL_W + barW + 6,
      y: y + 5,
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '12',
      fill: MUTE
    });
    countLabel.textContent = `${d.count} communes`;
    svg.appendChild(countLabel);
  });

  container.appendChild(svg);
}

export function drawLengthBar(selector, name) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = Math.min(container.offsetWidth || 640, 680);
  const CHAR_W = Math.min(14, Math.floor((W - 40) / Math.max(name.length, 10)));
  const H = 48;

  const svg = svgEl('svg', {
    width: W, height: H,
    viewBox: `0 0 ${W} ${H}`,
    style: 'display: block; overflow: visible;'
  });

  name.split('').forEach((ch, i) => {
    const x = 20 + i * CHAR_W;
    const isHyphen = ch === '-';

    const rect = svgEl('rect', {
      x: x,
      y: 6,
      width: CHAR_W - 1,
      height: 22,
      fill: isHyphen ? '#d0c4b0' : BAR_COLOR,
      rx: 1
    });
    svg.appendChild(rect);

    const t = svgEl('text', {
      x: x + (CHAR_W - 1) / 2,
      y: 22,
      'text-anchor': 'middle',
      'font-family': 'Georgia, serif',
      'font-size': Math.max(8, CHAR_W - 3),
      fill: isHyphen ? INK : PAPER
    });
    t.textContent = ch;
    svg.appendChild(t);
  });

  const lenLabel = svgEl('text', {
    x: 20 + name.length * CHAR_W + 8,
    y: 22,
    'font-family': "'Helvetica Neue', sans-serif",
    'font-size': '11',
    fill: MUTE
  });
  lenLabel.textContent = `${name.length} chars`;
  svg.appendChild(lenLabel);

  container.appendChild(svg);
}

export function drawShortList(selector, shortCommunes) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = shortCommunes.filter(c => c.name.length <= 2).sort((a, b) => a.name.localeCompare(b.name));

  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin:16px 0;';

  items.forEach(c => {
    const chip = document.createElement('span');
    chip.style.cssText = `
      display:inline-flex;flex-direction:column;align-items:center;
      background:#f0ece4;border:1px solid #d8d0c0;border-radius:4px;
      padding:8px 12px;font-family:Georgia,serif;cursor:default;
    `;
    chip.title = `Dept ${c.dept} — ${c.pop.toLocaleString('fr-FR')} residents`;
    chip.innerHTML = `
      <span style="font-size:18px;font-weight:700;letter-spacing:2px">${c.name}</span>
      <span style="font-size:10px;color:#888;margin-top:2px;font-family:Helvetica Neue,sans-serif;letter-spacing:0.5px">dept ${c.dept}</span>
    `;
    grid.appendChild(chip);
  });

  container.appendChild(grid);
}
