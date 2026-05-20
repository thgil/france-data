// stories/baguette-capital/charts.js
// Pure-JS SVG bar charts for the baguette capital story.
// Exports: drawParisChart(selector, parisRanking)
//          drawDesertChart(selector, deptBreakdown)

const BREAD = '#8B6314';
const BREAD_LIGHT = '#c49a38';
const DESERT = '#c05a20';
const DESERT_LIGHT = '#e8b090';
const TEXT = '#1a1a1a';
const MUTE = '#888';
const RULE = '#e0d8cc';

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

// Horizontal bar chart — one row per item.
// items: [{ label, value, sub }]  value is the bar width driver
function drawHBar(selector, items, { maxValue, barColor, unit = '', title = '' } = {}) {
  const container = document.querySelector(selector);
  if (!container) return;

  const ROW_H = 28;
  const LABEL_W = 130;
  const BAR_AREA = 320;
  const VALUE_W = 64;
  const PAD_TOP = title ? 32 : 8;
  const PAD_BOT = 8;
  const W = LABEL_W + BAR_AREA + VALUE_W + 16;
  const H = PAD_TOP + items.length * ROW_H + PAD_BOT;
  const max = maxValue || Math.max(...items.map(d => d.value));

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'display:block;font-family:Helvetica Neue,Helvetica,Arial,sans-serif',
  });

  if (title) {
    svg.appendChild(svgText(title, {
      x: 0, y: 18,
      'font-size': 10, 'font-weight': 600,
      'letter-spacing': 1.5, 'text-transform': 'uppercase',
      fill: MUTE, 'font-family': 'inherit',
    }));
  }

  items.forEach((item, i) => {
    const y = PAD_TOP + i * ROW_H;
    const barW = Math.max(2, (item.value / max) * BAR_AREA);
    const isFirst = i === 0;

    // Row background on hover — use a rect + JS
    const rowBg = svgEl('rect', {
      x: 0, y: y + 2, width: W, height: ROW_H - 2,
      fill: 'transparent', rx: 2,
      'data-idx': i,
    });
    rowBg.style.cursor = 'default';
    rowBg.addEventListener('mouseenter', () => { rowBg.setAttribute('fill', '#f3ede4'); });
    rowBg.addEventListener('mouseleave', () => { rowBg.setAttribute('fill', 'transparent'); });
    svg.appendChild(rowBg);

    // Label
    svg.appendChild(svgText(item.label, {
      x: LABEL_W - 8, y: y + ROW_H / 2 + 4,
      'font-size': isFirst ? 13 : 12,
      'font-weight': isFirst ? 600 : 400,
      'font-family': isFirst ? 'Georgia,serif' : 'inherit',
      fill: isFirst ? TEXT : '#444',
      'text-anchor': 'end',
    }));

    // Bar
    svg.appendChild(svgEl('rect', {
      x: LABEL_W, y: y + 6,
      width: barW, height: ROW_H - 12,
      fill: isFirst ? barColor : (item.value >= max * 0.65 ? barColor : BREAD_LIGHT),
      rx: 2,
      opacity: isFirst ? 1 : 0.85,
    }));

    // Value label
    svg.appendChild(svgText(`${item.value}${unit}`, {
      x: LABEL_W + barW + 6, y: y + ROW_H / 2 + 4,
      'font-size': isFirst ? 13 : 12,
      'font-weight': isFirst ? 600 : 400,
      fill: isFirst ? TEXT : '#555',
      'font-family': 'inherit',
    }));

    // Sub-label (bakery count, pop)
    if (item.sub) {
      svg.appendChild(svgText(item.sub, {
        x: LABEL_W + BAR_AREA + VALUE_W, y: y + ROW_H / 2 + 4,
        'font-size': 10, fill: MUTE, 'text-anchor': 'end',
        'font-family': 'inherit',
      }));
    }

    // Separator
    if (i < items.length - 1) {
      svg.appendChild(svgEl('line', {
        x1: 0, x2: W,
        y1: y + ROW_H, y2: y + ROW_H,
        stroke: RULE, 'stroke-width': 0.5,
      }));
    }
  });

  container.appendChild(svg);
}

export function drawParisChart(selector, parisRanking) {
  const items = parisRanking.map(d => ({
    label: d.name.replace('Paris ', '').replace(' Arrondissement', ''),
    value: d.per10k,
    sub: `${d.bakeries} boulanges · ${(d.population / 1000).toFixed(0)}k pop`,
  }));

  drawHBar(selector, items, {
    barColor: BREAD,
    unit: '/10k',
    title: 'Bakeries per 10,000 residents — Paris arrondissements',
  });
}

export function drawDesertChart(selector, deptBreakdown) {
  // Sort: most deserts first
  const sorted = [...deptBreakdown].sort((a, b) => b.pctDesert - a.pctDesert);
  const items = sorted.map(d => ({
    label: d.name,
    value: d.pctDesert,
    sub: `${d.zeroBakeries}/${d.communes} communes`,
  }));

  // Use a desert-themed color for this chart
  const container = document.querySelector(selector);
  if (!container) return;

  const ROW_H = 30;
  const LABEL_W = 140;
  const BAR_AREA = 280;
  const VALUE_W = 56;
  const PAD_TOP = 32;
  const PAD_BOT = 8;
  const W = LABEL_W + BAR_AREA + VALUE_W + 16;
  const H = PAD_TOP + items.length * ROW_H + PAD_BOT;
  const max = 100;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: 'display:block;font-family:Helvetica Neue,Helvetica,Arial,sans-serif',
  });

  svg.appendChild(svgText('% of communes with zero bakeries — by département', {
    x: 0, y: 18,
    'font-size': 10, 'font-weight': 600,
    'letter-spacing': 1.5,
    fill: MUTE, 'font-family': 'inherit',
  }));

  items.forEach((item, i) => {
    const y = PAD_TOP + i * ROW_H;
    const barW = Math.max(2, (item.value / max) * BAR_AREA);
    const isParis = item.label === 'Paris';

    const rowBg = svgEl('rect', {
      x: 0, y: y + 2, width: W, height: ROW_H - 2,
      fill: 'transparent', rx: 2,
    });
    rowBg.addEventListener('mouseenter', () => { rowBg.setAttribute('fill', '#f3ede4'); });
    rowBg.addEventListener('mouseleave', () => { rowBg.setAttribute('fill', 'transparent'); });
    svg.appendChild(rowBg);

    svg.appendChild(svgText(item.label, {
      x: LABEL_W - 8, y: y + ROW_H / 2 + 4,
      'font-size': 12,
      'font-weight': isParis ? 600 : 400,
      'font-family': 'inherit',
      fill: '#444',
      'text-anchor': 'end',
    }));

    const fillColor = isParis ? '#aaaaaa' : (item.value >= 50 ? DESERT : DESERT_LIGHT);
    svg.appendChild(svgEl('rect', {
      x: LABEL_W, y: y + 7,
      width: barW, height: ROW_H - 14,
      fill: fillColor, rx: 2,
    }));

    svg.appendChild(svgText(isParis ? '0%' : `${item.value}%`, {
      x: LABEL_W + barW + 6, y: y + ROW_H / 2 + 4,
      'font-size': 12,
      'font-weight': isParis ? 600 : 400,
      fill: isParis ? '#777' : TEXT,
      'font-family': 'inherit',
    }));

    if (item.sub) {
      svg.appendChild(svgText(item.sub, {
        x: LABEL_W + BAR_AREA + VALUE_W, y: y + ROW_H / 2 + 4,
        'font-size': 10, fill: MUTE, 'text-anchor': 'end',
        'font-family': 'inherit',
      }));
    }

    if (i < items.length - 1) {
      svg.appendChild(svgEl('line', {
        x1: 0, x2: W,
        y1: y + ROW_H, y2: y + ROW_H,
        stroke: RULE, 'stroke-width': 0.5,
      }));
    }
  });

  container.appendChild(svg);
}
