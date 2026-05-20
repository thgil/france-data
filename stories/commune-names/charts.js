/* commune-names/charts.js — name-length histogram + saint-names bar */

export function drawLengthHistogram(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 220;
  const marginLeft = 36;
  const marginRight = 12;
  const marginTop = 16;
  const marginBottom = 40;
  const innerW = W - marginLeft - marginRight;
  const innerH = H - marginTop - marginBottom;

  // Filter to lengths 1–30, bucket rest
  const buckets = lengthDist.filter(d => typeof d.len === 'number' && d.len <= 30);
  const over30 = lengthDist.filter(d => d.len === '41+' || (typeof d.len === 'number' && d.len > 30))
    .reduce((s, d) => s + d.count, 0);

  // Add any lengths 31-40 that weren't caught
  const extra = lengthDist.filter(d => typeof d.len === 'number' && d.len > 30 && d.len <= 40)
    .reduce((s, d) => s + d.count, 0);
  const totalOver30 = over30 + extra;

  const maxCount = Math.max(...buckets.map(d => d.count));
  const xScale = i => marginLeft + (i / buckets.length) * innerW;
  const barW = Math.max(1, innerW / buckets.length - 1);
  const yScale = v => marginTop + innerH - (v / maxCount) * innerH;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  // Y-axis gridlines
  [0, 1000, 2000, 3000].forEach(v => {
    if (v > maxCount) return;
    const y = yScale(v);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', marginLeft);
    line.setAttribute('x2', marginLeft + innerW);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', '#e0d8cc');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', marginLeft - 4);
    label.setAttribute('y', y + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '10');
    label.setAttribute('fill', '#999');
    label.setAttribute('font-family', 'var(--sans, sans-serif)');
    label.textContent = v === 0 ? '0' : (v / 1000).toFixed(0) + 'k';
    svg.appendChild(label);
  });

  // Bars
  buckets.forEach((d, i) => {
    const x = xScale(i);
    const y = yScale(d.count);
    const h = marginTop + innerH - y;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', Math.max(1, h));
    rect.setAttribute('fill', d.len === 7 || d.len === 8 ? '#b32020' : '#c8b99a');
    rect.setAttribute('rx', '1');
    svg.appendChild(rect);
  });

  // X axis labels (every 5)
  buckets.forEach((d, i) => {
    if (d.len % 5 !== 0) return;
    const x = xScale(i) + barW / 2;
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', marginTop + innerH + 16);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '11');
    label.setAttribute('fill', '#888');
    label.setAttribute('font-family', 'var(--sans, sans-serif)');
    label.textContent = d.len;
    svg.appendChild(label);
  });

  // X axis label
  const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xAxisLabel.setAttribute('x', marginLeft + innerW / 2);
  xAxisLabel.setAttribute('y', marginTop + innerH + 36);
  xAxisLabel.setAttribute('text-anchor', 'middle');
  xAxisLabel.setAttribute('font-size', '11');
  xAxisLabel.setAttribute('fill', '#888');
  xAxisLabel.setAttribute('font-family', 'var(--sans, sans-serif)');
  xAxisLabel.textContent = 'Characters in commune name';
  svg.appendChild(xAxisLabel);

  // Legend annotation for peak
  const peakX = xScale(6) + barW / 2;
  const peakY = yScale(3695) - 8;
  const ann = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  ann.setAttribute('x', peakX + 18);
  ann.setAttribute('y', peakY - 2);
  ann.setAttribute('font-size', '10');
  ann.setAttribute('fill', '#b32020');
  ann.setAttribute('font-family', 'var(--sans, sans-serif)');
  ann.textContent = '7–8 chars: most common';
  svg.appendChild(ann);

  container.appendChild(svg);
}

export function drawSaintChart(selector, topSaints) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const barH = 22;
  const gap = 4;
  const marginLeft = 100;
  const marginRight = 60;
  const marginTop = 8;
  const n = Math.min(10, topSaints.length);
  const H = marginTop + n * (barH + gap);

  const maxVal = topSaints[0].count;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';

  topSaints.slice(0, n).forEach((d, i) => {
    const y = marginTop + i * (barH + gap);
    const barWidth = ((d.count / maxVal) * (W - marginLeft - marginRight));

    // Bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', marginLeft);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barWidth);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', i === 0 ? '#b32020' : '#c8b99a');
    rect.setAttribute('rx', '2');
    svg.appendChild(rect);

    // Name label
    const nameLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameLabel.setAttribute('x', marginLeft - 6);
    nameLabel.setAttribute('y', y + barH / 2 + 4);
    nameLabel.setAttribute('text-anchor', 'end');
    nameLabel.setAttribute('font-size', '12');
    nameLabel.setAttribute('fill', '#1a1a1a');
    nameLabel.setAttribute('font-family', 'Georgia, serif');
    nameLabel.textContent = 'Saint-' + d.name;
    svg.appendChild(nameLabel);

    // Count label
    const countLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    countLabel.setAttribute('x', marginLeft + barWidth + 6);
    countLabel.setAttribute('y', y + barH / 2 + 4);
    countLabel.setAttribute('font-size', '11');
    countLabel.setAttribute('fill', '#888');
    countLabel.setAttribute('font-family', 'var(--sans, sans-serif)');
    countLabel.textContent = d.count;
    svg.appendChild(countLabel);
  });

  container.appendChild(svg);
}
