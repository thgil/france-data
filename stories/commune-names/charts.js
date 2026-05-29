// charts.js — commune-names story visualisations

export function drawDuplicatesChart(selector, topDuplicates) {
  const container = document.querySelector(selector);
  if (!container) return;

  const margin = { top: 8, right: 64, bottom: 8, left: 148 };
  const rowH = 26;
  const data = topDuplicates.slice(0, 15);
  const width = Math.min(container.clientWidth || 640, 680);
  const innerW = width - margin.left - margin.right;
  const height = data.length * rowH + margin.top + margin.bottom;

  const maxCount = data[0].count;
  const scaleX = v => (v / maxCount) * innerW;

  const accent = '#b32020';
  const bg = '#faf7f2';
  const ink = '#1a1a1a';
  const inkMute = '#888';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  data.forEach((d, i) => {
    const y = i * rowH;
    const barW = scaleX(d.count);

    // bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', y + 4);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', rowH - 8);
    rect.setAttribute('fill', i === 0 ? accent : '#d4a0a0');
    rect.setAttribute('rx', 2);
    g.appendChild(rect);

    // name label (left)
    const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameText.setAttribute('x', -8);
    nameText.setAttribute('y', y + rowH / 2 + 4);
    nameText.setAttribute('text-anchor', 'end');
    nameText.setAttribute('font-family', 'Georgia, serif');
    nameText.setAttribute('font-size', '13');
    nameText.setAttribute('fill', ink);
    nameText.textContent = d.name;
    g.appendChild(nameText);

    // count label (right of bar)
    const countText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    countText.setAttribute('x', barW + 6);
    countText.setAttribute('y', y + rowH / 2 + 4);
    countText.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    countText.setAttribute('font-size', '12');
    countText.setAttribute('fill', i === 0 ? accent : inkMute);
    countText.setAttribute('font-weight', i === 0 ? '600' : '400');
    countText.textContent = `${d.count}×`;
    g.appendChild(countText);
  });

  container.appendChild(svg);
}

export function drawLengthChart(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const margin = { top: 16, right: 16, bottom: 36, left: 44 };
  const width = Math.min(container.clientWidth || 640, 680);
  const height = 180;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // Only show lengths 1–30 (the long tail above 30 is tiny)
  const data = lengthDist.filter(d => d.len >= 1 && d.len <= 32);
  const maxCount = Math.max(...data.map(d => d.count));
  const maxLen = Math.max(...data.map(d => d.len));
  const minLen = Math.min(...data.map(d => d.len));

  const barCount = maxLen - minLen + 1;
  const barW = innerW / barCount;

  const scaleY = v => (v / maxCount) * innerH;
  const scaleX = len => (len - minLen) * barW;

  const accent = '#b32020';
  const inkMute = '#888';
  const ink = '#1a1a1a';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.style.display = 'block';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  // Baseline
  const baseline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  baseline.setAttribute('x1', 0);
  baseline.setAttribute('y1', innerH);
  baseline.setAttribute('x2', innerW);
  baseline.setAttribute('y2', innerH);
  baseline.setAttribute('stroke', '#d8d0c0');
  baseline.setAttribute('stroke-width', 1);
  g.appendChild(baseline);

  // Bars
  const dataMap = Object.fromEntries(data.map(d => [d.len, d.count]));
  for (let len = minLen; len <= maxLen; len++) {
    const count = dataMap[len] || 0;
    if (!count) continue;
    const bh = scaleY(count);
    const x = scaleX(len);
    const isExtreme = len === 1 || len >= 30;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x + 1);
    rect.setAttribute('y', innerH - bh);
    rect.setAttribute('width', Math.max(barW - 2, 1));
    rect.setAttribute('height', bh);
    rect.setAttribute('fill', isExtreme ? accent : '#c8a090');
    rect.setAttribute('rx', 1);
    g.appendChild(rect);
  }

  // X axis labels — every 5 chars
  for (let len = 5; len <= 30; len += 5) {
    const x = scaleX(len) + barW / 2;
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', innerH + 16);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    label.setAttribute('font-size', '11');
    label.setAttribute('fill', inkMute);
    label.textContent = len;
    g.appendChild(label);
  }

  // X axis label text
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', innerW / 2);
  xLabel.setAttribute('y', innerH + 32);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-family', "'Helvetica Neue', sans-serif");
  xLabel.setAttribute('font-size', '11');
  xLabel.setAttribute('fill', inkMute);
  xLabel.textContent = 'Name length (characters)';
  g.appendChild(xLabel);

  // Y axis label
  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('transform', `translate(-36, ${innerH / 2}) rotate(-90)`);
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('font-family', "'Helvetica Neue', sans-serif");
  yLabel.setAttribute('font-size', '11');
  yLabel.setAttribute('fill', inkMute);
  yLabel.textContent = 'Communes';
  g.appendChild(yLabel);

  // Annotations for extremes
  // "Y" at len=1
  const yAnnot = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yAnnot.setAttribute('x', scaleX(1) + barW / 2);
  yAnnot.setAttribute('y', innerH - scaleY(dataMap[1] || 1) - 6);
  yAnnot.setAttribute('text-anchor', 'middle');
  yAnnot.setAttribute('font-family', 'Georgia, serif');
  yAnnot.setAttribute('font-size', '11');
  yAnnot.setAttribute('fill', accent);
  yAnnot.textContent = '"Y"';
  g.appendChild(yAnnot);

  container.appendChild(svg);
}
