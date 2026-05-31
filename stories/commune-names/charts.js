// stories/commune-names/charts.js
// Charts for the commune-names story — no map, two horizontal bar charts.
// Exports: drawSaintChart(selector, data), drawNamesChart(selector, data),
//          drawLengthChart(selector, data)

// ── Shared helpers ────────────────────────────────────────────────────────

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function makeBarChart(container, items, { valueKey = 'count', labelKey = 'label', color = '#b44', maxItems = 12, title = '' } = {}) {
  const width  = container.clientWidth || 600;
  const barH   = 28;
  const gap    = 4;
  const labelW = 180;
  const countW = 44;
  const marginTop = 8;
  const maxVal = Math.max(...items.map(d => d[valueKey]));
  const barAreaW = width - labelW - countW - 16;

  const height = marginTop + items.length * (barH + gap);

  const svg = svgEl('svg', { width, height, viewBox: `0 0 ${width} ${height}` });
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  items.forEach((d, i) => {
    const y   = marginTop + i * (barH + gap);
    const val = d[valueKey];
    const barW = Math.max(2, Math.round((val / maxVal) * barAreaW));

    // Label
    const label = svgEl('text', {
      x: labelW - 8,
      y: y + barH / 2 + 5,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': '13',
      fill: '#1a1a1a',
    });
    label.textContent = d[labelKey];
    svg.appendChild(label);

    // Bar
    const rect = svgEl('rect', {
      x: labelW,
      y,
      width: barW,
      height: barH,
      fill: color,
      rx: 2,
    });
    svg.appendChild(rect);

    // Count label inside/outside bar
    const countLabel = svgEl('text', {
      x: labelW + barW + 6,
      y: y + barH / 2 + 5,
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '12',
      fill: '#555',
    });
    countLabel.textContent = val;
    svg.appendChild(countLabel);
  });

  container.appendChild(svg);
}

// ── Chart 1: Top saint parts ──────────────────────────────────────────────

export function drawSaintChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = data.topSaintParts.slice(0, 10).map(d => ({
    label: (d.saint.startsWith('Sainte-') ? d.saint : 'Saint-' + d.saint),
    count: d.count,
  }));

  makeBarChart(container, items, {
    valueKey: 'count',
    labelKey: 'label',
    color: '#8b3a3a',
    title: 'Most popular saint names',
  });
}

// ── Chart 2: Most common full names ──────────────────────────────────────

export function drawNamesChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = data.mostCommon.slice(0, 10).map(d => ({
    label: d.name,
    count: d.count,
  }));

  makeBarChart(container, items, {
    valueKey: 'count',
    labelKey: 'label',
    color: '#3a5a8b',
    title: 'Most duplicated commune names',
  });
}

// ── Chart 3: Name length histogram ───────────────────────────────────────

export function drawLengthChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const dist = data.lengthDistribution;
  const maxCount = Math.max(...dist.map(d => d.count));
  const maxLen   = Math.max(...dist.map(d => d.length));

  const width    = container.clientWidth || 600;
  const height   = 140;
  const padLeft  = 40;
  const padRight = 16;
  const padTop   = 8;
  const padBot   = 28;

  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBot;

  const barW  = Math.max(1, Math.floor(innerW / (maxLen + 1)) - 1);
  const xStep = innerW / (maxLen + 1);

  const svg = svgEl('svg', { width, height, viewBox: `0 0 ${width} ${height}` });
  svg.style.display = 'block';

  // Y-axis label
  const yLabel = svgEl('text', {
    x: 10,
    y: padTop + innerH / 2,
    'text-anchor': 'middle',
    transform: `rotate(-90, 10, ${padTop + innerH / 2})`,
    'font-family': "'Helvetica Neue', sans-serif",
    'font-size': '10',
    fill: '#888',
  });
  yLabel.textContent = 'unique names';
  svg.appendChild(yLabel);

  dist.forEach(d => {
    const barHeight = Math.max(1, Math.round((d.count / maxCount) * innerH));
    const x = padLeft + d.length * xStep;
    const y = padTop + innerH - barHeight;

    const rect = svgEl('rect', {
      x,
      y,
      width: barW,
      height: barHeight,
      fill: d.length <= 3 ? '#c0392b' : d.length >= 40 ? '#e67e22' : '#5a7fa8',
      rx: 1,
    });

    // Tooltip via title
    const titleEl = svgEl('title');
    titleEl.textContent = `${d.length} chars: ${d.count} unique name${d.count === 1 ? '' : 's'}`;
    rect.appendChild(titleEl);
    svg.appendChild(rect);
  });

  // X-axis ticks
  [1, 5, 10, 15, 20, 25, 30, 35, 40, 45].forEach(len => {
    if (len > maxLen) return;
    const x = padLeft + len * xStep + barW / 2;

    const tick = svgEl('line', {
      x1: x, y1: padTop + innerH + 2,
      x2: x, y2: padTop + innerH + 6,
      stroke: '#aaa', 'stroke-width': 1,
    });
    svg.appendChild(tick);

    const label = svgEl('text', {
      x,
      y: padTop + innerH + 18,
      'text-anchor': 'middle',
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '10',
      fill: '#888',
    });
    label.textContent = len;
    svg.appendChild(label);
  });

  // Annotation: Y
  const yLen = dist.find(d => d.length === 1);
  if (yLen) {
    const x = padLeft + 1 * xStep + barW / 2;
    const barH2 = Math.round((yLen.count / maxCount) * innerH);
    const annY = padTop + innerH - barH2 - 8;
    const ann = svgEl('text', {
      x: x + 12,
      y: annY,
      'font-family': 'Georgia, serif',
      'font-size': '11',
      fill: '#c0392b',
    });
    ann.textContent = '"Y"';
    svg.appendChild(ann);
  }

  container.appendChild(svg);
}
