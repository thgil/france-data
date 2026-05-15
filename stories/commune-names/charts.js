// Horizontal bar chart drawn on a <canvas> element.
// Exported functions are called from index.html.

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#d8d0c0';
const RED   = '#b32020';
const AMBER = '#c67c00';

function dpr() { return window.devicePixelRatio || 1; }

function setupCanvas(el, w, h) {
  const r = dpr();
  el.width  = w * r;
  el.height = h * r;
  el.style.width  = w + 'px';
  el.style.height = h + 'px';
  const ctx = el.getContext('2d');
  ctx.scale(r, r);
  return ctx;
}

// Draw horizontal bar chart for saint names or duplicates
export function drawBarChart(selector, data, opts = {}) {
  const el = document.querySelector(selector);
  if (!el) return;

  const {
    color    = RED,
    maxBars  = 15,
    labelKey = 'name',
    valueKey = 'count',
    unit     = '',
  } = opts;

  const items = data.slice(0, maxBars);
  const maxVal = items[0][valueKey];

  const ROW_H  = 28;
  const LABEL_W = 160;
  const BAR_AREA = 260;
  const VAL_W   = 48;
  const PAD_T   = 8;
  const PAD_B   = 8;
  const W = LABEL_W + BAR_AREA + VAL_W + 24;
  const H = PAD_T + items.length * ROW_H + PAD_B;

  const ctx = setupCanvas(el, W, H);

  items.forEach((item, i) => {
    const y = PAD_T + i * ROW_H;
    const cy = y + ROW_H / 2;

    // Row separator
    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.strokeStyle = RULE;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = INK;
    ctx.font = `14px ${SERIF}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    // Clip long labels
    const label = item[labelKey];
    ctx.fillText(label, LABEL_W - 8, cy);

    // Bar
    const barW = Math.max(2, (item[valueKey] / maxVal) * BAR_AREA);
    ctx.fillStyle = color;
    ctx.fillRect(LABEL_W, cy - 6, barW, 12);

    // Value
    ctx.fillStyle = MUTE;
    ctx.font = `12px ${SANS}`;
    ctx.textAlign = 'left';
    ctx.fillText(item[valueKey].toLocaleString('fr-FR') + unit, LABEL_W + BAR_AREA + 8, cy);
  });
}

// Draw the shortest-names bubble display (a simple grid of name "chips")
export function drawShortNames(selector, shortest) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Group by length
  const byLen = {};
  for (const c of shortest) {
    if (!byLen[c.len]) byLen[c.len] = [];
    byLen[c.len].push(c);
  }

  container.innerHTML = '';
  for (const len of Object.keys(byLen).sort((a, b) => +a - +b)) {
    const group = document.createElement('div');
    group.className = 'short-group';

    const heading = document.createElement('div');
    heading.className = 'short-heading';
    heading.textContent = len === '1'
      ? '1 letter'
      : `${len} letters`;
    group.appendChild(heading);

    const chips = document.createElement('div');
    chips.className = 'chips';
    for (const c of byLen[len]) {
      const chip = document.createElement('div');
      chip.className = 'name-chip';
      chip.innerHTML = `<span class="chip-name">${c.name}</span>` +
        `<span class="chip-sub">dept ${c.dept} · pop ${c.pop ? c.pop.toLocaleString('fr-FR') : '?'}</span>`;
      chips.appendChild(chip);
    }
    group.appendChild(chips);
    container.appendChild(group);
  }
}
