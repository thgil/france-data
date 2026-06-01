/* charts.js — commune-names story */

export function drawLengthHistogram(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 200;
  const margin = { top: 16, right: 16, bottom: 36, left: 48 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;

  const maxLength = Math.max(...lengthDist.map(d => d.length));
  const maxCount  = Math.max(...lengthDist.map(d => d.count));

  const xScale = l => ((l - 1) / (maxLength - 1)) * innerW;
  const barW   = Math.max(1, innerW / (maxLength + 1));
  const yScale = c => innerH - (c / maxCount) * innerH;

  const ns = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';

  const g = document.createElementNS(ns, 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  // bars
  for (const d of lengthDist) {
    const x = xScale(d.length);
    const y = yScale(d.count);
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', x - barW / 2);
    rect.setAttribute('y', y);
    rect.setAttribute('width', Math.max(1, barW - 1));
    rect.setAttribute('height', innerH - y);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('opacity', '0.75');
    g.appendChild(rect);
  }

  // x-axis ticks
  const xTicks = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
  for (const t of xTicks) {
    const x = xScale(t);
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x); line.setAttribute('x2', x);
    line.setAttribute('y1', innerH); line.setAttribute('y2', innerH + 4);
    line.setAttribute('stroke', '#aaa'); line.setAttribute('stroke-width', '1');
    g.appendChild(line);

    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', innerH + 16);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '11');
    label.setAttribute('fill', '#666');
    label.setAttribute('font-family', 'Helvetica Neue, sans-serif');
    label.textContent = t;
    g.appendChild(label);
  }

  // x-axis label
  const xLabel = document.createElementNS(ns, 'text');
  xLabel.setAttribute('x', innerW / 2);
  xLabel.setAttribute('y', innerH + 32);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-size', '11');
  xLabel.setAttribute('fill', '#888');
  xLabel.setAttribute('font-family', 'Helvetica Neue, sans-serif');
  xLabel.textContent = 'Name length (characters)';
  g.appendChild(xLabel);

  // y-axis ticks
  const yTickVals = [0, 1000, 2000, 3000];
  for (const t of yTickVals) {
    const y = yScale(t);
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', -4); line.setAttribute('x2', innerW);
    line.setAttribute('y1', y); line.setAttribute('y2', y);
    line.setAttribute('stroke', t === 0 ? '#aaa' : '#e8e4dc');
    line.setAttribute('stroke-width', '1');
    g.appendChild(line);

    if (t > 0) {
      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', -8);
      label.setAttribute('y', y + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('font-size', '11');
      label.setAttribute('fill', '#888');
      label.setAttribute('font-family', 'Helvetica Neue, sans-serif');
      label.textContent = t.toLocaleString('fr-FR');
      g.appendChild(label);
    }
  }

  container.appendChild(svg);
}

export function drawCommonNamesChart(selector, mostCommon) {
  const container = document.querySelector(selector);
  if (!container) return;

  const top15 = mostCommon.slice(0, 15);
  const W = container.clientWidth || 680;
  const rowH = 28;
  const leftPad = 200;
  const rightPad = 64;
  const H = top15.length * rowH + 20;
  const barMaxW = W - leftPad - rightPad;
  const maxCount = top15[0].count;

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';

  for (let i = 0; i < top15.length; i++) {
    const d = top15[i];
    const y = i * rowH;
    const barW = (d.count / maxCount) * barMaxW;

    // Label
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', leftPad - 10);
    label.setAttribute('y', y + rowH / 2 + 5);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '13');
    label.setAttribute('fill', '#1a1a1a');
    label.setAttribute('font-family', 'Georgia, serif');
    label.textContent = d.name;
    svg.appendChild(label);

    // Bar
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', leftPad);
    rect.setAttribute('y', y + 6);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', rowH - 10);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('opacity', '0.75');
    svg.appendChild(rect);

    // Count label
    const count = document.createElementNS(ns, 'text');
    count.setAttribute('x', leftPad + barW + 6);
    count.setAttribute('y', y + rowH / 2 + 5);
    count.setAttribute('font-size', '12');
    count.setAttribute('fill', '#555');
    count.setAttribute('font-family', 'Helvetica Neue, sans-serif');
    count.textContent = `${d.count}×`;
    svg.appendChild(count);

    // Row separator
    if (i < top15.length - 1) {
      const sep = document.createElementNS(ns, 'line');
      sep.setAttribute('x1', 0); sep.setAttribute('x2', W);
      sep.setAttribute('y1', y + rowH); sep.setAttribute('y2', y + rowH);
      sep.setAttribute('stroke', '#ede8e0'); sep.setAttribute('stroke-width', '1');
      svg.appendChild(sep);
    }
  }

  container.appendChild(svg);
}
