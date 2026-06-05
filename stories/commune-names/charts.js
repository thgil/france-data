// commune-names/charts.js — pure SVG charts, no external libraries

const ACCENT = '#b32020';
const MUTED  = '#888';
const RULE   = '#e0d8cc';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// Horizontal bar chart — top commune names by frequency
export function renderNameFreqChart(mountId, topNames) {
  const container = document.getElementById(mountId);
  if (!container) return;

  const data  = topNames.slice(0, 15);
  const W     = container.clientWidth || 640;
  const rowH  = 28;
  const labelW = Math.min(220, W * 0.35);
  const barAreaW = W - labelW - 60;
  const H     = rowH * data.length + 32;
  const maxVal = data[0].count;

  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
  container.appendChild(svg);

  data.forEach((d, i) => {
    const y   = i * rowH + 4;
    const barW = Math.round((d.count / maxVal) * barAreaW);

    // Label
    const label = svgEl('text', {
      x: labelW - 6,
      y: y + rowH / 2 + 5,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': 13,
      fill: '#1a1a1a',
    });
    label.textContent = d.name;
    svg.appendChild(label);

    // Bar
    const rect = svgEl('rect', {
      x: labelW,
      y: y + 4,
      width: barW,
      height: rowH - 10,
      fill: ACCENT,
      opacity: i === 0 ? 1 : 0.55 + (1 - i / data.length) * 0.3,
      rx: 2,
    });
    svg.appendChild(rect);

    // Count label
    const countLabel = svgEl('text', {
      x: labelW + barW + 6,
      y: y + rowH / 2 + 5,
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': 11,
      fill: MUTED,
    });
    countLabel.textContent = `×${d.count}`;
    svg.appendChild(countLabel);
  });
}

// Histogram of name lengths
export function renderLengthChart(mountId, lengthDist, meanLength, medianLength) {
  const container = document.getElementById(mountId);
  if (!container) return;

  // Trim to ≤30 and lump rest into "30+"
  const trimmed = [];
  let overflow = 0;
  for (const [len, count] of lengthDist) {
    if (len <= 30) trimmed.push([len, count]);
    else overflow += count;
  }
  if (overflow > 0) {
    const last = trimmed[trimmed.length - 1];
    if (last && last[0] === 30) last[1] += overflow;
    else trimmed.push([30, overflow]);
  }

  const W       = container.clientWidth || 640;
  const padL    = 48;
  const padR    = 24;
  const padT    = 16;
  const padB    = 36;
  const H       = 200;
  const plotW   = W - padL - padR;
  const plotH   = H - padT - padB;

  const maxLen  = trimmed[trimmed.length - 1][0];
  const minLen  = trimmed[0][0];
  const barCount = maxLen - minLen + 1;
  const maxCount = Math.max(...trimmed.map(([,c]) => c));

  const xScale  = (len) => padL + ((len - minLen) / (maxLen - minLen + 1)) * plotW;
  const yScale  = (count) => padT + plotH - (count / maxCount) * plotH;
  const barW    = plotW / barCount - 1;

  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
  container.appendChild(svg);

  // Grid lines
  [0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = padT + plotH - frac * plotH;
    const line = svgEl('line', { x1: padL, y1: y, x2: W - padR, y2: y, stroke: RULE, 'stroke-width': 1 });
    svg.appendChild(line);
    const lbl = svgEl('text', {
      x: padL - 4, y: y + 4,
      'text-anchor': 'end', 'font-size': 10, 'font-family': "'Helvetica Neue', sans-serif",
      fill: MUTED,
    });
    lbl.textContent = Math.round(frac * maxCount).toLocaleString('fr-FR');
    svg.appendChild(lbl);
  });

  // Bars
  for (const [len, count] of trimmed) {
    const x = xScale(len);
    const y = yScale(count);
    const h = padT + plotH - y;
    const isHigh = len >= 30;
    const rect = svgEl('rect', {
      x: x, y, width: barW, height: h,
      fill: isHigh ? '#c67c00' : ACCENT,
      opacity: 0.75, rx: 1,
    });
    svg.appendChild(rect);
  }

  // Mean line
  const meanX = padL + ((meanLength - minLen) / (maxLen - minLen + 1)) * plotW;
  const meanLine = svgEl('line', {
    x1: meanX, y1: padT, x2: meanX, y2: padT + plotH,
    stroke: '#1a1a1a', 'stroke-width': 1.5, 'stroke-dasharray': '4 3',
  });
  svg.appendChild(meanLine);
  const meanLbl = svgEl('text', {
    x: meanX + 4, y: padT + 12,
    'font-size': 10, 'font-family': "'Helvetica Neue', sans-serif", fill: '#1a1a1a',
  });
  meanLbl.textContent = `mean ${meanLength}`;
  svg.appendChild(meanLbl);

  // X axis labels (every 5)
  for (let len = minLen; len <= maxLen; len += 5) {
    const x = xScale(len) + barW / 2;
    const lbl = svgEl('text', {
      x, y: padT + plotH + 18,
      'text-anchor': 'middle', 'font-size': 10,
      'font-family': "'Helvetica Neue', sans-serif", fill: MUTED,
    });
    lbl.textContent = len === 30 ? '30+' : String(len);
    svg.appendChild(lbl);
  }

  // Axis label
  const axisLbl = svgEl('text', {
    x: padL + plotW / 2, y: H - 2,
    'text-anchor': 'middle', 'font-size': 10,
    'font-family': "'Helvetica Neue', sans-serif", fill: MUTED,
  });
  axisLbl.textContent = 'characters in commune name';
  svg.appendChild(axisLbl);
}
