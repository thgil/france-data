export function drawDuplicatesChart(selector, topDuplicatedNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = topDuplicatedNames.slice(0, 15);
  const maxCount = data[0].count;

  const BAR_H = 28;
  const GAP = 4;
  const LABEL_W = 180;
  const BAR_AREA = 220;
  const COUNT_W = 36;
  const PAD_V = 8;
  const totalH = data.length * (BAR_H + GAP) - GAP + PAD_V * 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${LABEL_W + BAR_AREA + COUNT_W} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = 'Georgia, serif';
  svg.style.fontSize = '13px';
  svg.style.overflow = 'visible';

  data.forEach((d, i) => {
    const y = PAD_V + i * (BAR_H + GAP);
    const barW = (d.count / maxCount) * BAR_AREA;

    // Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', LABEL_W - 10);
    text.setAttribute('y', y + BAR_H / 2 + 4);
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('fill', '#1a1a1a');
    text.textContent = d.name;
    svg.appendChild(text);

    // Bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', LABEL_W);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', BAR_H);
    rect.setAttribute('fill', i === 0 ? '#8b5c2a' : '#c67c00');
    rect.setAttribute('rx', 2);
    svg.appendChild(rect);

    // Count
    const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    count.setAttribute('x', LABEL_W + barW + 6);
    count.setAttribute('y', y + BAR_H / 2 + 4);
    count.setAttribute('fill', '#555');
    count.style.fontFamily = "'Helvetica Neue', sans-serif";
    count.style.fontSize = '12px';
    count.textContent = `${d.count}×`;
    svg.appendChild(count);
  });

  container.appendChild(svg);
}

export function drawLengthHistogram(selector, lengthDistribution) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Build sorted array of [length, count] pairs, trimming outlier tails
  const entries = Object.entries(lengthDistribution)
    .map(([k, v]) => [parseInt(k), v])
    .filter(([k]) => k <= 40)
    .sort((a, b) => a[0] - b[0]);

  const maxCount = Math.max(...entries.map(e => e[1]));
  const BAR_W = 14;
  const GAP = 2;
  const CHART_H = 140;
  const PAD_L = 32;
  const PAD_B = 24;
  const PAD_T = 8;
  const PAD_R = 8;
  const totalW = PAD_L + entries.length * (BAR_W + GAP) + PAD_R;
  const totalH = PAD_T + CHART_H + PAD_B;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = "'Helvetica Neue', sans-serif";
  svg.style.fontSize = '10px';
  svg.style.overflow = 'visible';

  // Y-axis ticks
  [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = PAD_T + CHART_H - frac * CHART_H;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', PAD_L - 4);
    line.setAttribute('x2', PAD_L + entries.length * (BAR_W + GAP));
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', frac === 0 ? '#888' : '#e8e0d4');
    line.setAttribute('stroke-width', frac === 0 ? 1 : 0.5);
    svg.appendChild(line);

    if (frac > 0) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', PAD_L - 6);
      label.setAttribute('y', y + 3);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('fill', '#aaa');
      label.textContent = Math.round(frac * maxCount).toLocaleString('fr-FR');
      svg.appendChild(label);
    }
  });

  entries.forEach(([len, count], i) => {
    const x = PAD_L + i * (BAR_W + GAP);
    const barH = (count / maxCount) * CHART_H;
    const y = PAD_T + CHART_H - barH;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', BAR_W);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', '#c67c00');
    rect.setAttribute('rx', 1);
    svg.appendChild(rect);

    // X-axis labels every 5
    if (len % 5 === 0) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x + BAR_W / 2);
      label.setAttribute('y', PAD_T + CHART_H + 14);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', '#888');
      label.textContent = len;
      svg.appendChild(label);
    }
  });

  // X-axis label
  const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xAxisLabel.setAttribute('x', PAD_L + entries.length * (BAR_W + GAP) / 2);
  xAxisLabel.setAttribute('y', PAD_T + CHART_H + 24);
  xAxisLabel.setAttribute('text-anchor', 'middle');
  xAxisLabel.setAttribute('fill', '#999');
  xAxisLabel.style.fontSize = '9px';
  xAxisLabel.textContent = 'characters';
  svg.appendChild(xAxisLabel);

  container.appendChild(svg);
}
