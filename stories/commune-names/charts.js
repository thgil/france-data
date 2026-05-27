/**
 * commune-names/charts.js
 * Name-length histogram rendered as a plain SVG (no external charting lib).
 */

export function drawLengthChart(container, lengthDist) {
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;
  if (!el) return;

  // Collapse the long tail: bucket 30+ into "30+"
  const CUTOFF = 30;
  const buckets = [];
  let overflow = 0;
  for (const d of lengthDist) {
    if (d.len < CUTOFF) {
      buckets.push({ label: String(d.len), count: d.count });
    } else {
      overflow += d.count;
    }
  }
  buckets.push({ label: '30+', count: overflow });

  const maxCount = Math.max(...buckets.map(b => b.count));

  // Dimensions
  const margin = { top: 20, right: 16, bottom: 36, left: 48 };
  const width  = Math.min(760, el.clientWidth || 760);
  const height = 240;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const barW = innerW / buckets.length;

  // Build SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('style', 'display:block;overflow:visible');

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  // Y-axis gridlines + labels
  const yTicks = [0, 1000, 2000, 3000, 4000];
  for (const tick of yTicks) {
    const y = innerH - (tick / maxCount) * innerH;

    // Gridline
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 0); line.setAttribute('x2', innerW);
    line.setAttribute('y1', y); line.setAttribute('y2', y);
    line.setAttribute('stroke', tick === 0 ? '#1a1a1a' : '#e0d8cc');
    line.setAttribute('stroke-width', tick === 0 ? '1' : '1');
    g.appendChild(line);

    // Label
    if (tick > 0) {
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', -6);
      txt.setAttribute('y', y + 4);
      txt.setAttribute('text-anchor', 'end');
      txt.setAttribute('font-size', '11');
      txt.setAttribute('fill', '#888');
      txt.setAttribute('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif');
      txt.textContent = tick.toLocaleString('fr-FR');
      g.appendChild(txt);
    }
  }

  // Bars
  buckets.forEach((b, i) => {
    const barH = (b.count / maxCount) * innerH;
    const x = i * barW;
    const y = innerH - barH;

    // Colour: highlight the extremes and the mode
    const isMode  = b.label === '7' || b.label === '8'; // mode is 7–8 chars
    const isShort = parseInt(b.label) <= 3;
    const isLong  = b.label === '30+';
    let fill = '#c8bba0';
    if (isMode)  fill = '#8b4513';
    if (isShort) fill = '#b32020';
    if (isLong)  fill = '#555';

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x + 1);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW - 2);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', fill);
    rect.setAttribute('rx', '1');

    // Tooltip via title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${b.label} chars: ${b.count.toLocaleString('fr-FR')} communes`;
    rect.appendChild(title);
    g.appendChild(rect);
  });

  // X-axis labels — every 5th bucket to avoid crowding
  buckets.forEach((b, i) => {
    if (i % 5 !== 0 && b.label !== '30+') return;
    const x = i * barW + barW / 2;
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', x);
    txt.setAttribute('y', innerH + 18);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '11');
    txt.setAttribute('fill', '#666');
    txt.setAttribute('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif');
    txt.textContent = b.label;
    g.appendChild(txt);
  });

  // X-axis label
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', innerW / 2);
  xLabel.setAttribute('y', innerH + 34);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-size', '11');
  xLabel.setAttribute('fill', '#888');
  xLabel.setAttribute('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif');
  xLabel.textContent = 'Name length (characters)';
  g.appendChild(xLabel);

  // Y-axis label
  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('transform', `translate(-38, ${innerH / 2}) rotate(-90)`);
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('font-size', '11');
  yLabel.setAttribute('fill', '#888');
  yLabel.setAttribute('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif');
  yLabel.textContent = 'Communes';
  g.appendChild(yLabel);

  el.innerHTML = '';
  el.appendChild(svg);
}
