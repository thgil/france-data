export function drawTopNamesChart(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const maxCount = topNames[0].count;
  const W = container.clientWidth || 600;
  const labelW = 160;
  const barMaxW = W - labelW - 60;
  const rowH = 32;
  const H = topNames.length * rowH + 20;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  topNames.forEach((d, i) => {
    const y = i * rowH + rowH / 2;
    const barW = Math.round((d.count / maxCount) * barMaxW);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelW - 8);
    label.setAttribute('y', y + 5);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-family', 'Georgia, serif');
    label.setAttribute('font-size', '13');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = d.name;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', labelW);
    rect.setAttribute('y', y - 9);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', 18);
    rect.setAttribute('fill', '#2d5a1b');
    rect.setAttribute('rx', 2);
    rect.setAttribute('opacity', 0.75 + 0.25 * (1 - i / topNames.length));

    const countLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    countLabel.setAttribute('x', labelW + barW + 6);
    countLabel.setAttribute('y', y + 5);
    countLabel.setAttribute('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");
    countLabel.setAttribute('font-size', '12');
    countLabel.setAttribute('fill', '#555');
    countLabel.textContent = `×${d.count}`;

    g.appendChild(label);
    g.appendChild(rect);
    g.appendChild(countLabel);
    svg.appendChild(g);
  });

  container.appendChild(svg);
}

export function drawLenHistogram(selector, lenDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = lenDist.filter(d => d.len <= 30);
  const maxCount = Math.max(...data.map(d => d.count));
  const W = container.clientWidth || 600;
  const padL = 44, padR = 16, padT = 16, padB = 36;
  const innerW = W - padL - padR;
  const innerH = 160;
  const H = innerH + padT + padB;
  const barW = Math.floor(innerW / data.length) - 1;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';

  const yScale = v => innerH - Math.round((v / maxCount) * innerH);

  data.forEach((d, i) => {
    const x = padL + i * (barW + 1);
    const barH = Math.round((d.count / maxCount) * innerH);
    const y = padT + yScale(d.count);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', '#2d5a1b');
    rect.setAttribute('opacity', '0.7');
    svg.appendChild(rect);

    if (d.len % 5 === 0 || d.len === 1) {
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tick.setAttribute('x', x + barW / 2);
      tick.setAttribute('y', padT + innerH + 18);
      tick.setAttribute('text-anchor', 'middle');
      tick.setAttribute('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");
      tick.setAttribute('font-size', '11');
      tick.setAttribute('fill', '#888');
      tick.textContent = d.len;
      svg.appendChild(tick);
    }
  });

  const axisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  axisLine.setAttribute('x1', padL); axisLine.setAttribute('x2', padL);
  axisLine.setAttribute('y1', padT); axisLine.setAttribute('y2', padT + innerH);
  axisLine.setAttribute('stroke', '#ccc'); axisLine.setAttribute('stroke-width', '1');
  svg.appendChild(axisLine);

  const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxisLine.setAttribute('x1', padL); xAxisLine.setAttribute('x2', padL + innerW);
  xAxisLine.setAttribute('y1', padT + innerH); xAxisLine.setAttribute('y2', padT + innerH);
  xAxisLine.setAttribute('stroke', '#ccc'); xAxisLine.setAttribute('stroke-width', '1');
  svg.appendChild(xAxisLine);

  [0, Math.round(maxCount / 2), maxCount].forEach(v => {
    const yPos = padT + yScale(v);
    const ytick = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ytick.setAttribute('x', padL - 6);
    ytick.setAttribute('y', yPos + 4);
    ytick.setAttribute('text-anchor', 'end');
    ytick.setAttribute('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");
    ytick.setAttribute('font-size', '10');
    ytick.setAttribute('fill', '#aaa');
    ytick.textContent = v >= 1000 ? `${(v/1000).toFixed(1)}k` : v;
    svg.appendChild(ytick);
  });

  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', padL + innerW / 2);
  xLabel.setAttribute('y', H - 2);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");
  xLabel.setAttribute('font-size', '11');
  xLabel.setAttribute('fill', '#aaa');
  xLabel.textContent = 'Name length (characters)';
  svg.appendChild(xLabel);

  container.appendChild(svg);
}

export function drawRiversChart(selector, topRivers) {
  const container = document.querySelector(selector);
  if (!container) return;

  const maxCount = topRivers[0].count;
  const W = container.clientWidth || 600;
  const labelW = 80;
  const barMaxW = W - labelW - 60;
  const rowH = 28;
  const H = topRivers.length * rowH + 16;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  topRivers.forEach((d, i) => {
    const y = i * rowH + rowH / 2;
    const barW = Math.round((d.count / maxCount) * barMaxW);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelW - 8);
    label.setAttribute('y', y + 5);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-family', 'Georgia, serif');
    label.setAttribute('font-size', '13');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = `-sur-${d.river}`;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', labelW);
    rect.setAttribute('y', y - 8);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', 16);
    rect.setAttribute('fill', '#1a5276');
    rect.setAttribute('rx', 2);
    rect.setAttribute('opacity', 0.65 + 0.35 * (1 - i / topRivers.length));

    const countLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    countLabel.setAttribute('x', labelW + barW + 6);
    countLabel.setAttribute('y', y + 5);
    countLabel.setAttribute('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");
    countLabel.setAttribute('font-size', '12');
    countLabel.setAttribute('fill', '#555');
    countLabel.textContent = d.count;

    g.appendChild(label);
    g.appendChild(rect);
    g.appendChild(countLabel);
    svg.appendChild(g);
  });

  container.appendChild(svg);
}
