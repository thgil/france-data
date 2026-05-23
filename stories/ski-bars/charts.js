/**
 * ski-bars: bar charts for per-capita bar density story.
 * Pure SVG, no external dependencies.
 */

const ACCENT = '#b32020';
const SKI_COLOR = '#3a6fa8';
const OTHER_COLOR = '#c67c00';
const CORSICA_COLOR = '#7c5c2a';
const AVG_COLOR = '#999';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(el, text) {
  el.textContent = text;
  return el;
}

function barColor(d) {
  if (d.tag === 'ski') return SKI_COLOR;
  if (d.dept === '2B' || d.dept === '2A') return CORSICA_COLOR;
  return OTHER_COLOR;
}

/**
 * Horizontal bar chart for commune or dept rankings.
 * @param {string} selector  CSS selector for container element
 * @param {Array}  rows      [{name, value, label?, tag?, dept?}]
 * @param {object} opts      {avgLine?, avgLabel?, colorFn?, valueLabel?}
 */
export function drawHorizontalBar(selector, rows, opts = {}) {
  const container = document.querySelector(selector);
  if (!container) return;

  const totalW = Math.min(container.clientWidth || 680, 680);
  const labelW = Math.min(Math.floor(totalW * 0.38), 200);
  const numW = 52;
  const rankW = 24;
  const rowH = 30;
  const gap = 2;
  const barAreaW = totalW - labelW - numW - rankW - 8;
  const paddingTop = 8;
  const paddingBottom = opts.avgLine ? 28 : 8;
  const totalH = rows.length * (rowH + gap) + paddingTop + paddingBottom;

  const maxVal = Math.max(...rows.map(r => r.value));
  const scale = v => (v / maxVal) * barAreaW;

  const svg = svgEl('svg', {
    width: totalW,
    height: totalH,
    viewBox: `0 0 ${totalW} ${totalH}`,
    role: 'img',
    'aria-label': opts.ariaLabel || 'Bar chart'
  });
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  const colorFn = opts.colorFn || (() => ACCENT);

  rows.forEach((d, i) => {
    const y = paddingTop + i * (rowH + gap);
    const bw = scale(d.value);
    const barX = rankW + labelW + 4;

    // Row background (hover hint)
    const bg = svgEl('rect', { x: 0, y, width: totalW, height: rowH, fill: 'transparent' });
    svg.appendChild(bg);

    // Rank
    const rankEl = svgEl('text', {
      x: rankW - 4,
      y: y + rowH / 2 + 1,
      'text-anchor': 'end',
      'dominant-baseline': 'middle',
      'font-family': 'var(--sans, Helvetica Neue, sans-serif)',
      'font-size': '11',
      fill: '#aaa'
    });
    svgText(rankEl, i + 1);
    svg.appendChild(rankEl);

    // Label
    const labelEl = svgEl('text', {
      x: rankW + 2,
      y: y + rowH / 2 + 1,
      'dominant-baseline': 'middle',
      'font-family': 'Georgia, serif',
      'font-size': '13',
      fill: '#1a1a1a'
    });
    // Truncate if needed
    const labelStr = d.sublabel ? d.name : d.name;
    svgText(labelEl, labelStr);
    svg.appendChild(labelEl);

    // Sublabel (e.g. dept name)
    if (d.sublabel) {
      const subEl = svgEl('text', {
        x: rankW + 2,
        y: y + rowH / 2 + 13,
        'dominant-baseline': 'middle',
        'font-family': 'var(--sans, Helvetica Neue, sans-serif)',
        'font-size': '10',
        fill: '#888'
      });
      svgText(subEl, d.sublabel);
      svg.appendChild(subEl);
    }

    // Bar
    const barEl = svgEl('rect', {
      x: barX,
      y: y + 7,
      width: Math.max(bw, 1),
      height: rowH - 14,
      fill: colorFn(d),
      rx: 2
    });
    svg.appendChild(barEl);

    // Value label
    const valEl = svgEl('text', {
      x: barX + bw + 5,
      y: y + rowH / 2 + 1,
      'dominant-baseline': 'middle',
      'font-family': 'var(--sans, Helvetica Neue, sans-serif)',
      'font-size': '12',
      fill: '#333',
      'font-variant-numeric': 'tabular-nums'
    });
    svgText(valEl, d.value.toFixed(1));
    svg.appendChild(valEl);
  });

  // Average reference line
  if (opts.avgLine != null) {
    const avgX = rankW + labelW + 4 + scale(opts.avgLine);
    const lineEl = svgEl('line', {
      x1: avgX, y1: paddingTop,
      x2: avgX, y2: totalH - paddingBottom,
      stroke: AVG_COLOR,
      'stroke-width': '1',
      'stroke-dasharray': '3,3'
    });
    svg.appendChild(lineEl);

    const avgLabelEl = svgEl('text', {
      x: avgX + 3,
      y: totalH - paddingBottom + 16,
      'font-family': 'var(--sans, Helvetica Neue, sans-serif)',
      'font-size': '10',
      fill: '#888'
    });
    svgText(avgLabelEl, opts.avgLabel || `avg ${opts.avgLine}`);
    svg.appendChild(avgLabelEl);
  }

  container.innerHTML = '';
  container.appendChild(svg);
}

export function drawCommuneChart(selector, data) {
  const rows = data.topCommunes.map(d => ({
    name: d.name,
    sublabel: d.deptName,
    value: d.per10k,
    tag: d.tag,
    dept: d.dept
  }));

  drawHorizontalBar(selector, rows, {
    avgLine: data.nationalPer10k,
    avgLabel: `national avg ${data.nationalPer10k}`,
    colorFn: barColor,
    ariaLabel: 'Top communes by bars per 10,000 residents'
  });
}

export function drawDeptChart(selector, rows, avgLine, avgLabel) {
  drawHorizontalBar(selector, rows.map(d => ({
    name: d.name,
    value: d.per10k,
    dept: d.dept
  })), {
    avgLine,
    avgLabel,
    colorFn: d => {
      if (d.dept === '2B' || d.dept === '2A') return CORSICA_COLOR;
      if (['91', '78', '92', '95', '77', '94', '93'].includes(d.dept)) return ACCENT;
      return OTHER_COLOR;
    },
    ariaLabel: 'Départements by bars per 10,000 residents'
  });
}
