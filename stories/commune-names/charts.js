// charts.js — commune-names story charts

const PAPER = '#faf7f2';
const INK = '#1a1a1a';
const INK_MUTE = '#888';
const RULE = '#e0d8cc';
const BAR_FILL = '#b32020';
const BAR_FILL_LIGHT = '#d96060';
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(text, attrs = {}) {
  const el = svgEl('text', attrs);
  el.textContent = text;
  return el;
}

/**
 * Horizontal bar chart.
 * @param {string} selector
 * @param {{ label: string, value: number, note?: string }[]} rows
 * @param {{ maxValue?: number, unit?: string, highlight?: number }} opts
 */
export function drawHBar(selector, rows, opts = {}) {
  const container = document.querySelector(selector);
  if (!container) return;

  const ROW_H = 28;
  const LABEL_W = 220;
  const VALUE_W = 50;
  const BAR_AREA = 320;
  const MARGIN = { top: 8, right: VALUE_W + 8, bottom: 4, left: LABEL_W };
  const W = LABEL_W + BAR_AREA + VALUE_W + 16;
  const H = rows.length * ROW_H + MARGIN.top + MARGIN.bottom;

  const maxV = opts.maxValue || Math.max(...rows.map(r => r.value));

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: `max-width:${W}px; display:block; overflow:visible;`,
  });

  rows.forEach((row, i) => {
    const y = MARGIN.top + i * ROW_H;
    const barW = (row.value / maxV) * BAR_AREA;
    const isHighlight = opts.highlight === i;

    // Row background on hover (done via CSS class)
    const g = svgEl('g', { class: 'chart-row' });

    // Label
    const labelEl = svgEl('text', {
      x: LABEL_W - 8,
      y: y + ROW_H * 0.62,
      'text-anchor': 'end',
      'font-family': SERIF,
      'font-size': '13',
      fill: isHighlight ? INK : '#333',
      'font-weight': isHighlight ? '700' : '400',
    });
    labelEl.textContent = row.label;
    g.appendChild(labelEl);

    // Rule
    const rule = svgEl('line', {
      x1: LABEL_W, y1: y + ROW_H - 1,
      x2: W - VALUE_W, y2: y + ROW_H - 1,
      stroke: RULE, 'stroke-width': '1',
    });
    g.appendChild(rule);

    // Bar
    const rect = svgEl('rect', {
      x: LABEL_W,
      y: y + 4,
      width: Math.max(barW, 2),
      height: ROW_H - 10,
      fill: isHighlight ? BAR_FILL : BAR_FILL_LIGHT,
      rx: '2',
    });
    g.appendChild(rect);

    // Value
    const valEl = svgEl('text', {
      x: LABEL_W + BAR_AREA + 8,
      y: y + ROW_H * 0.62,
      'text-anchor': 'start',
      'font-family': SANS,
      'font-size': '12',
      fill: INK_MUTE,
      'font-weight': '600',
    });
    valEl.textContent = row.value.toLocaleString('fr-FR') + (opts.unit ? ' ' + opts.unit : '');
    g.appendChild(valEl);

    svg.appendChild(g);
  });

  container.innerHTML = '';
  container.appendChild(svg);
}

/**
 * Length histogram: one bar per character-length bucket.
 * @param {string} selector
 * @param {Object} lengthDist — keys are string numbers, value counts
 */
export function drawLengthHistogram(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Build buckets 1–30, then "31+"
  const buckets = [];
  for (let i = 1; i <= 30; i++) {
    buckets.push({ label: String(i), value: lengthDist[String(i)] || 0 });
  }
  const over30 = Object.entries(lengthDist)
    .filter(([k]) => parseInt(k) > 30 || k === '41+')
    .reduce((s, [, v]) => s + v, 0);
  buckets.push({ label: '31+', value: over30 });

  const MARGIN = { top: 24, right: 16, bottom: 36, left: 44 };
  const BAR_W = 18;
  const GAP = 2;
  const CHART_W = buckets.length * (BAR_W + GAP);
  const CHART_H = 140;
  const W = MARGIN.left + CHART_W + MARGIN.right;
  const H = MARGIN.top + CHART_H + MARGIN.bottom;

  const maxV = Math.max(...buckets.map(b => b.value));

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    style: `max-width:${W}px; display:block; overflow:visible;`,
  });

  // Y-axis label
  const yLabelEl = svgEl('text', {
    x: 10,
    y: MARGIN.top + CHART_H / 2,
    'text-anchor': 'middle',
    'font-family': SANS,
    'font-size': '10',
    fill: INK_MUTE,
    transform: `rotate(-90, 10, ${MARGIN.top + CHART_H / 2})`,
  });
  yLabelEl.textContent = 'communes';
  svg.appendChild(yLabelEl);

  buckets.forEach((b, i) => {
    const x = MARGIN.left + i * (BAR_W + GAP);
    const barH = (b.value / maxV) * CHART_H;
    const y = MARGIN.top + CHART_H - barH;

    // Highlight the median area (around 7–12 chars) subtly
    const isMedianZone = i >= 6 && i <= 11;

    const rect = svgEl('rect', {
      x, y,
      width: BAR_W,
      height: barH,
      fill: isMedianZone ? BAR_FILL : BAR_FILL_LIGHT,
      rx: '1',
    });
    svg.appendChild(rect);

    // X-axis labels — every 5th bucket + last
    if (i === 0 || (i + 1) % 5 === 0 || i === buckets.length - 1) {
      const labelEl = svgEl('text', {
        x: x + BAR_W / 2,
        y: MARGIN.top + CHART_H + 16,
        'text-anchor': 'middle',
        'font-family': SANS,
        'font-size': '10',
        fill: INK_MUTE,
      });
      labelEl.textContent = b.label;
      svg.appendChild(labelEl);
    }
  });

  // Baseline
  const baseline = svgEl('line', {
    x1: MARGIN.left, y1: MARGIN.top + CHART_H,
    x2: MARGIN.left + CHART_W, y2: MARGIN.top + CHART_H,
    stroke: INK, 'stroke-width': '1',
  });
  svg.appendChild(baseline);

  // Peak annotation
  const peakI = buckets.indexOf(buckets.reduce((a, b) => a.value > b.value ? a : b));
  const peakX = MARGIN.left + peakI * (BAR_W + GAP) + BAR_W / 2;
  const peakBarH = (buckets[peakI].value / maxV) * CHART_H;
  const annEl = svgEl('text', {
    x: peakX,
    y: MARGIN.top + CHART_H - peakBarH - 6,
    'text-anchor': 'middle',
    'font-family': SANS,
    'font-size': '10',
    fill: INK,
    'font-weight': '600',
  });
  annEl.textContent = `${buckets[peakI].value.toLocaleString('fr-FR')}`;
  svg.appendChild(annEl);

  // X-axis title
  const xTitleEl = svgEl('text', {
    x: MARGIN.left + CHART_W / 2,
    y: H - 4,
    'text-anchor': 'middle',
    'font-family': SANS,
    'font-size': '10',
    fill: INK_MUTE,
  });
  xTitleEl.textContent = 'name length (characters)';
  svg.appendChild(xTitleEl);

  container.innerHTML = '';
  container.appendChild(svg);
}

/**
 * Render the short-commune table.
 * @param {string} selector
 * @param {Array} shortCommunes
 */
export function renderShortTable(selector, shortCommunes) {
  const container = document.querySelector(selector);
  if (!container) return;

  const rows = shortCommunes.map(c => {
    const isY = c.name === 'Y';
    return `<tr class="${isY ? 'row-highlight' : ''}">
      <td class="name-cell${isY ? ' name-y' : ''}">${c.name}</td>
      <td class="len-cell">${c.name.length}</td>
      <td class="dept-cell">Dept. ${c.dept}</td>
      <td class="pop-cell">${c.pop.toLocaleString('fr-FR')} pop.</td>
    </tr>`;
  }).join('');

  container.innerHTML = `<table class="short-table"><tbody>${rows}</tbody></table>`;
}
