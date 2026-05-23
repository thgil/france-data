/* charts.js — commune-names story */

export function drawLengthChart(containerId, lenDist) {
  const el = document.querySelector(containerId);
  if (!el) return;

  // Only show lengths 1–35 (beyond 35 is noise: 6 communes total)
  const data = lenDist.filter(d => d.len >= 1 && d.len <= 35);
  const maxCount = Math.max(...data.map(d => d.count));

  const W = el.clientWidth || 680;
  const H = 200;
  const marginL = 40;
  const marginR = 12;
  const marginT = 16;
  const marginB = 40;
  const chartW = W - marginL - marginR;
  const chartH = H - marginT - marginB;

  const barW = chartW / data.length;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.display = 'block';
  svg.style.maxWidth = '100%';
  svg.style.fontFamily = "'Helvetica Neue', sans-serif";

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${marginL},${marginT})`);
  svg.appendChild(g);

  // Y-axis label
  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('x', -chartH / 2);
  yLabel.setAttribute('y', -28);
  yLabel.setAttribute('transform', 'rotate(-90)');
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('font-size', '10');
  yLabel.setAttribute('fill', '#888');
  yLabel.setAttribute('letter-spacing', '0.8');
  yLabel.textContent = 'COMMUNES';
  g.appendChild(yLabel);

  // Y gridlines + ticks
  const yTicks = [0, 1000, 2000, 3000];
  yTicks.forEach(tick => {
    const y = chartH - (tick / maxCount) * chartH;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 0);
    line.setAttribute('x2', chartW);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', tick === 0 ? '#1a1a1a' : '#e0d8cc');
    line.setAttribute('stroke-width', tick === 0 ? '1' : '0.5');
    g.appendChild(line);

    if (tick > 0) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', -6);
      label.setAttribute('y', y + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('font-size', '10');
      label.setAttribute('fill', '#888');
      label.textContent = tick.toLocaleString('en');
      g.appendChild(label);
    }
  });

  // Bars
  data.forEach((d, i) => {
    const barH = (d.count / maxCount) * chartH;
    const x = i * barW;
    const y = chartH - barH;

    const highlight = d.len === 1 || d.len === 2;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x + 1);
    rect.setAttribute('y', y);
    rect.setAttribute('width', Math.max(barW - 2, 1));
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', highlight ? '#b32020' : '#c67c00');
    rect.setAttribute('opacity', highlight ? '1' : '0.75');
    g.appendChild(rect);
  });

  // X-axis: show every 5 chars
  data.forEach((d, i) => {
    if (d.len % 5 === 0) {
      const x = i * barW + barW / 2;
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', chartH + 18);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '11');
      label.setAttribute('fill', '#666');
      label.textContent = d.len;
      g.appendChild(label);
    }
    // mark 1 explicitly
    if (d.len === 1) {
      const x = i * barW + barW / 2;
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', chartH + 18);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '11');
      label.setAttribute('fill', '#b32020');
      label.textContent = '1';
      g.appendChild(label);
    }
  });

  // X-axis label
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', chartW / 2);
  xLabel.setAttribute('y', chartH + 36);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-size', '10');
  xLabel.setAttribute('fill', '#888');
  xLabel.setAttribute('letter-spacing', '0.8');
  xLabel.textContent = 'NAME LENGTH (CHARACTERS)';
  g.appendChild(xLabel);

  el.appendChild(svg);
}
