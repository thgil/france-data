export function drawLengthChart(mountId, lengthDist) {
  const container = document.querySelector(mountId);
  if (!container) return;

  const margin = { top: 12, right: 16, bottom: 40, left: 52 };
  const W = container.clientWidth || 680;
  const H = 220;
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.style.display = 'block';
  svg.style.maxWidth = '100%';
  container.appendChild(svg);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  const maxLen = Math.max(...lengthDist.map(d => d.length));
  const minLen = Math.min(...lengthDist.map(d => d.length));
  const maxCount = Math.max(...lengthDist.map(d => d.count));

  const xScale = val => ((val - minLen) / (maxLen - minLen)) * w;
  const barW = Math.max(1, (w / (maxLen - minLen + 1)) - 1);
  const yScale = val => h - (val / maxCount) * h;

  // Bars
  for (const d of lengthDist) {
    const x = xScale(d.length);
    const y = yScale(d.count);
    const bh = h - y;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', bh);
    rect.setAttribute('fill', d.length <= 3 ? '#b32020' : '#c8bfa8');
    g.appendChild(rect);
  }

  // X axis ticks: every 5 characters
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxis.setAttribute('transform', `translate(0,${h})`);
  g.appendChild(xAxis);

  for (let l = minLen; l <= maxLen; l += 5) {
    const x = xScale(l) + barW / 2;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x); line.setAttribute('y1', 0);
    line.setAttribute('x2', x); line.setAttribute('y2', 5);
    line.setAttribute('stroke', '#999');
    xAxis.appendChild(line);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', 18);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif');
    text.setAttribute('font-size', '11');
    text.setAttribute('fill', '#666');
    text.textContent = l;
    xAxis.appendChild(text);
  }

  // X axis label
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', w / 2);
  xLabel.setAttribute('y', h + 38);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif');
  xLabel.setAttribute('font-size', '11');
  xLabel.setAttribute('fill', '#888');
  xLabel.textContent = 'Name length (characters)';
  g.appendChild(xLabel);

  // Y axis ticks
  const yTicks = [0, 1000, 2000, 3000, 4000];
  for (const t of yTicks) {
    if (t > maxCount) continue;
    const y = yScale(t);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', -4); line.setAttribute('y1', y);
    line.setAttribute('x2', w); line.setAttribute('y2', y);
    line.setAttribute('stroke', t === 0 ? '#999' : '#e8e0d4');
    line.setAttribute('stroke-width', t === 0 ? '1' : '1');
    g.appendChild(line);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', -8);
    text.setAttribute('y', y + 4);
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif');
    text.setAttribute('font-size', '11');
    text.setAttribute('fill', '#666');
    text.textContent = t.toLocaleString('fr-FR');
    g.appendChild(text);
  }

  // Legend
  const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  legend.setAttribute('transform', `translate(${w - 160}, 4)`);
  g.appendChild(legend);

  const lr1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  lr1.setAttribute('width', 10); lr1.setAttribute('height', 10);
  lr1.setAttribute('fill', '#b32020');
  legend.appendChild(lr1);
  const lt1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  lt1.setAttribute('x', 14); lt1.setAttribute('y', 9);
  lt1.setAttribute('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif');
  lt1.setAttribute('font-size', '11');
  lt1.setAttribute('fill', '#444');
  lt1.textContent = '≤ 3 characters';
  legend.appendChild(lt1);
}
