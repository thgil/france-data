/* charts.js — commune-names story */

export function drawLengthChart(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 200;
  const margin = { top: 10, right: 20, bottom: 36, left: 36 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  // Filter to sensible range 1–35 chars (tail is noise)
  const filtered = lengthDist.filter(d => d.len >= 1 && d.len <= 35);
  const maxCount = Math.max(...filtered.map(d => d.count));
  const maxLen = 35;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.overflow = 'visible';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  // Bars
  const barW = iW / maxLen - 1;
  filtered.forEach(d => {
    const x = ((d.len - 1) / maxLen) * iW;
    const barH = (d.count / maxCount) * iH;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', iH - barH);
    rect.setAttribute('width', Math.max(barW, 1));
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', '#3a6a3a');
    rect.setAttribute('opacity', '0.75');

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${d.len} chars: ${d.count.toLocaleString('fr-FR')} communes`;
    rect.appendChild(title);
    g.appendChild(rect);
  });

  // X axis
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', 0); xAxis.setAttribute('y1', iH);
  xAxis.setAttribute('x2', iW); xAxis.setAttribute('y2', iH);
  xAxis.setAttribute('stroke', '#ccc'); xAxis.setAttribute('stroke-width', '1');
  g.appendChild(xAxis);

  // X tick labels every 5
  [1, 5, 10, 15, 20, 25, 30, 35].forEach(tick => {
    const x = ((tick - 1) / maxLen) * iW;
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', iH + 16);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-family', 'Helvetica Neue, sans-serif');
    t.setAttribute('font-size', '10');
    t.setAttribute('fill', '#888');
    t.textContent = tick;
    g.appendChild(t);
  });

  // X axis label
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', iW / 2);
  xLabel.setAttribute('y', iH + 32);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-family', 'Helvetica Neue, sans-serif');
  xLabel.setAttribute('font-size', '10');
  xLabel.setAttribute('fill', '#aaa');
  xLabel.textContent = 'Characters in commune name';
  g.appendChild(xLabel);

  // Y tick labels (0, peak)
  [0, maxCount].forEach((val, i) => {
    const y = i === 0 ? iH : 0;
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', -6);
    t.setAttribute('y', y + 3);
    t.setAttribute('text-anchor', 'end');
    t.setAttribute('font-family', 'Helvetica Neue, sans-serif');
    t.setAttribute('font-size', '10');
    t.setAttribute('fill', '#888');
    t.textContent = i === 0 ? '0' : val.toLocaleString('fr-FR');
    g.appendChild(t);
  });

  container.appendChild(svg);
}

export function drawFreqChart(selector, top20) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const rowH = 26;
  const labelW = 200;
  const margin = { top: 8, right: 48, bottom: 8, left: 0 };
  const barAreaW = W - labelW - margin.right - margin.left;
  const H = top20.length * rowH + margin.top + margin.bottom;
  const maxCount = top20[0].count;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');

  top20.forEach((d, i) => {
    const y = margin.top + i * rowH;
    const barW = (d.count / maxCount) * barAreaW;
    const x0 = labelW;

    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelW - 8);
    label.setAttribute('y', y + rowH / 2 + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-family', 'Georgia, serif');
    label.setAttribute('font-size', '13');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = d.name;
    svg.appendChild(label);

    // Bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x0);
    rect.setAttribute('y', y + 4);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', rowH - 8);
    rect.setAttribute('fill', '#3a6a3a');
    rect.setAttribute('opacity', '0.7');
    svg.appendChild(rect);

    // Count
    const countLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    countLabel.setAttribute('x', x0 + barW + 6);
    countLabel.setAttribute('y', y + rowH / 2 + 4);
    countLabel.setAttribute('font-family', 'Helvetica Neue, sans-serif');
    countLabel.setAttribute('font-size', '12');
    countLabel.setAttribute('fill', '#555');
    countLabel.textContent = d.count;
    svg.appendChild(countLabel);

    // Row separator
    if (i < top20.length - 1) {
      const sep = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      sep.setAttribute('x1', 0); sep.setAttribute('y1', y + rowH);
      sep.setAttribute('x2', W); sep.setAttribute('y2', y + rowH);
      sep.setAttribute('stroke', '#ede8e0'); sep.setAttribute('stroke-width', '1');
      svg.appendChild(sep);
    }
  });

  container.appendChild(svg);
}
