/* village-names/charts.js — name length histogram + ranked tables */

export function drawLengthHistogram(selector, lengthData) {
  const container = document.querySelector(selector);
  if (!container) return;

  const margin = { top: 12, right: 24, bottom: 48, left: 56 };
  const totalW = container.clientWidth || 680;
  const W = totalW;
  const H = 240;
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;

  // Filter to a readable range (1–35 chars covers 99.9%)
  const filtered = lengthData.filter(d => d.length <= 35);
  const maxCount = Math.max(...filtered.map(d => d.count));
  const maxLen = Math.max(...filtered.map(d => d.length));

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  const xScale = v => ((v - 1) / (maxLen - 1)) * innerW;
  const barW = Math.max(2, (innerW / maxLen) - 1);
  const yScale = v => innerH - (v / maxCount) * innerH;

  // Bars
  for (const d of filtered) {
    const x = xScale(d.length) - barW / 2;
    const barH = (d.count / maxCount) * innerH;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', innerH - barH);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('opacity', '0.75');
    g.appendChild(rect);
  }

  // X axis
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', 0); xAxis.setAttribute('y1', innerH);
  xAxis.setAttribute('x2', innerW); xAxis.setAttribute('y2', innerH);
  xAxis.setAttribute('stroke', '#ccc'); xAxis.setAttribute('stroke-width', '1');
  g.appendChild(xAxis);

  // X ticks at 5, 10, 15, 20, 25, 30, 35
  for (const tick of [5, 10, 15, 20, 25, 30, 35]) {
    if (tick > maxLen) break;
    const tx = xScale(tick);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', tx); line.setAttribute('y1', innerH);
    line.setAttribute('x2', tx); line.setAttribute('y2', innerH + 5);
    line.setAttribute('stroke', '#888'); line.setAttribute('stroke-width', '1');
    g.appendChild(line);
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', tx); label.setAttribute('y', innerH + 18);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '11');
    label.setAttribute('fill', '#888');
    label.textContent = tick;
    g.appendChild(label);
  }

  // X axis label
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', innerW / 2);
  xLabel.setAttribute('y', innerH + 42);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-size', '11');
  xLabel.setAttribute('fill', '#666');
  xLabel.textContent = 'Name length (characters)';
  g.appendChild(xLabel);

  // Y ticks
  for (const tick of [1000, 2000, 3000]) {
    if (tick > maxCount) break;
    const ty = yScale(tick);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', -5); line.setAttribute('y1', ty);
    line.setAttribute('x2', innerW); line.setAttribute('y2', ty);
    line.setAttribute('stroke', '#eee'); line.setAttribute('stroke-width', '1');
    g.appendChild(line);
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', -8); label.setAttribute('y', ty + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '11');
    label.setAttribute('fill', '#888');
    label.textContent = (tick / 1000).toFixed(0) + 'k';
    g.appendChild(label);
  }

  container.appendChild(svg);
}

export function populateDuplicatesTable(selector, topDuplicates) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;
  tbody.innerHTML = topDuplicates.slice(0, 12).map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${d.name}</td>
      <td>${d.count}</td>
    </tr>`
  ).join('');
}

export function populateShortestTable(selector, shortest) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;
  tbody.innerHTML = shortest.slice(0, 14).map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${d.name}</td>
      <td class="muted">${d.length === 1 ? '1 letter' : d.length + ' letters'}</td>
      <td>${d.pop != null ? d.pop.toLocaleString('fr-FR') : '—'}</td>
    </tr>`
  ).join('');
}
