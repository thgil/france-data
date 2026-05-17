/**
 * Charts for the commune-names story.
 * No external dependencies — pure SVG rendered into container elements.
 */

const ACCENT = '#b32020';
const INK_MUTE = '#888';
const INK_SOFT = '#3a3a3a';
const PAPER = '#faf7f2';
const RULE = '#e0d8cc';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function makeSVG(w, h) {
  return svgEl('svg', {
    viewBox: `0 0 ${w} ${h}`,
    width: '100%',
    style: 'display:block;overflow:visible',
  });
}

/** Name-length histogram */
export function drawLengthHistogram(container, stats) {
  const dist = stats.lengthDistribution;
  const lengths = Object.keys(dist).map(Number).sort((a, b) => a - b);
  const counts = lengths.map(l => dist[String(l)] || 0);
  const maxCount = Math.max(...counts);

  const W = 680, H = 200;
  const padL = 44, padR = 12, padT = 16, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barW = Math.max(1, chartW / lengths.length - 1);

  const svg = makeSVG(W, H);

  // Y-axis gridlines
  for (const pct of [0.25, 0.5, 0.75, 1.0]) {
    const y = padT + chartH * (1 - pct);
    const line = svgEl('line', {
      x1: padL, x2: padL + chartW, y1: y, y2: y,
      stroke: RULE, 'stroke-width': 1,
    });
    svg.appendChild(line);
    const label = svgEl('text', {
      x: padL - 6, y: y + 4,
      'text-anchor': 'end',
      'font-size': 10, fill: INK_MUTE,
      'font-family': 'Helvetica Neue, sans-serif',
    });
    label.textContent = Math.round(maxCount * pct).toLocaleString('fr-FR');
    svg.appendChild(label);
  }

  // Bars
  lengths.forEach((len, i) => {
    const count = counts[i];
    const barH = (count / maxCount) * chartH;
    const x = padL + (i / lengths.length) * chartW;
    const y = padT + chartH - barH;

    const rect = svgEl('rect', {
      x: x, y: y, width: barW, height: barH,
      fill: ACCENT, opacity: 0.75,
    });
    svg.appendChild(rect);
  });

  // X-axis labels (every 5)
  lengths.forEach((len, i) => {
    if (len % 5 !== 0) return;
    const x = padL + (i / lengths.length) * chartW + barW / 2;
    const label = svgEl('text', {
      x: x, y: padT + chartH + 16,
      'text-anchor': 'middle',
      'font-size': 10, fill: INK_MUTE,
      'font-family': 'Helvetica Neue, sans-serif',
    });
    label.textContent = len;
    svg.appendChild(label);
  });

  // Axis line
  const axis = svgEl('line', {
    x1: padL, x2: padL + chartW,
    y1: padT + chartH, y2: padT + chartH,
    stroke: INK_SOFT, 'stroke-width': 1,
  });
  svg.appendChild(axis);

  // Y-axis label
  const yLabel = svgEl('text', {
    x: 10, y: padT + chartH / 2,
    'text-anchor': 'middle',
    transform: `rotate(-90, 10, ${padT + chartH / 2})`,
    'font-size': 10, fill: INK_MUTE,
    'font-family': 'Helvetica Neue, sans-serif',
  });
  yLabel.textContent = 'communes';
  svg.appendChild(yLabel);

  // X-axis label
  const xLabel = svgEl('text', {
    x: padL + chartW / 2, y: H - 2,
    'text-anchor': 'middle',
    'font-size': 10, fill: INK_MUTE,
    'font-family': 'Helvetica Neue, sans-serif',
  });
  xLabel.textContent = 'name length (characters)';
  svg.appendChild(xLabel);

  container.innerHTML = '';
  container.appendChild(svg);
}

/** Top commune names horizontal bar chart */
export function drawTopNames(container, stats) {
  const items = stats.topNames.slice(0, 15);
  const maxCount = items[0].count;

  const W = 680, ROW = 28, PAD_L = 210, PAD_R = 60, PAD_T = 8, PAD_B = 8;
  const H = PAD_T + items.length * ROW + PAD_B;
  const chartW = W - PAD_L - PAD_R;

  const svg = makeSVG(W, H);

  items.forEach((item, i) => {
    const y = PAD_T + i * ROW;
    const barW = (item.count / maxCount) * chartW;
    const cx = PAD_L + barW + 8;

    // Name label
    const nameEl = svgEl('text', {
      x: PAD_L - 8, y: y + ROW / 2 + 4,
      'text-anchor': 'end',
      'font-size': 13, fill: INK_SOFT,
      'font-family': 'Georgia, serif',
    });
    nameEl.textContent = item.name;
    svg.appendChild(nameEl);

    // Bar
    const rect = svgEl('rect', {
      x: PAD_L, y: y + 4, width: barW, height: ROW - 8,
      fill: ACCENT, opacity: i === 0 ? 0.9 : 0.55,
      rx: 2,
    });
    svg.appendChild(rect);

    // Count label
    const countEl = svgEl('text', {
      x: cx, y: y + ROW / 2 + 4,
      'font-size': 11, fill: INK_MUTE,
      'font-family': 'Helvetica Neue, sans-serif',
    });
    countEl.textContent = `×${item.count}`;
    svg.appendChild(countEl);
  });

  container.innerHTML = '';
  container.appendChild(svg);
}

/** Random commune display */
export function initRandomCommune(buttonEl, displayEl, communes) {
  function showRandom() {
    const c = communes[Math.floor(Math.random() * communes.length)];
    displayEl.innerHTML = `
      <span class="rc-name">${c.name}</span>
      <span class="rc-meta">Dept&nbsp;${c.dept} &middot; pop.&nbsp;${(c.pop || 0).toLocaleString('fr-FR')}</span>
    `;
  }
  buttonEl.addEventListener('click', showRandom);
  showRandom();
}
