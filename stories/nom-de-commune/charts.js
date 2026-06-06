// Charts for the nom-de-commune story.
// All charts are plain SVG/DOM — no external chart library needed.

export function drawLengthChart(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Only show lengths 1–32 (>32 is rare merged-commune names)
  const data = lengthDist.filter(d => d.length <= 32);
  const maxCount = Math.max(...data.map(d => d.count));

  const W = container.clientWidth || 680;
  const H = 180;
  const marginL = 40;
  const marginB = 28;
  const marginT = 8;
  const marginR = 8;
  const innerW = W - marginL - marginR;
  const innerH = H - marginT - marginB;
  const barW = innerW / data.length;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${marginL},${marginT})`);

  // Bars
  data.forEach((d, i) => {
    const barH = (d.count / maxCount) * innerH;
    const x = i * barW;
    const y = innerH - barH;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x + barW * 0.1);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW * 0.8);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('opacity', '0.75');

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${d.length} letters: ${d.count.toLocaleString('fr-FR')} communes`;
    rect.appendChild(title);
    g.appendChild(rect);
  });

  // X axis labels (every 5)
  data.forEach((d, i) => {
    if (d.length === 1 || d.length % 5 === 0) {
      const x = i * barW + barW / 2;
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', innerH + 18);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-family', 'Helvetica Neue, sans-serif');
      label.setAttribute('font-size', '10');
      label.setAttribute('fill', '#666');
      label.textContent = d.length;
      g.appendChild(label);
    }
  });

  // Y axis label
  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('x', -innerH / 2);
  yLabel.setAttribute('y', -28);
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('font-family', 'Helvetica Neue, sans-serif');
  yLabel.setAttribute('font-size', '9');
  yLabel.setAttribute('fill', '#999');
  yLabel.setAttribute('transform', 'rotate(-90)');
  yLabel.textContent = 'communes';
  g.appendChild(yLabel);

  // Peak annotation
  const peakIdx = data.findIndex(d => d.count === maxCount);
  if (peakIdx >= 0) {
    const px = peakIdx * barW + barW / 2;
    const ann = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ann.setAttribute('x', px);
    ann.setAttribute('y', innerH - (innerH + 4));
    ann.setAttribute('text-anchor', 'middle');
    ann.setAttribute('font-family', 'Helvetica Neue, sans-serif');
    ann.setAttribute('font-size', '10');
    ann.setAttribute('fill', '#333');
    ann.textContent = `peak: ${data[peakIdx].count.toLocaleString('fr-FR')}`;
    g.appendChild(ann);
  }

  svg.appendChild(g);
  container.appendChild(svg);
}

export function drawNamesChart(selector, top20) {
  const container = document.querySelector(selector);
  if (!container) return;

  const maxCount = top20[0].count;
  const rowH = 22;
  const barMaxW = 300;
  const labelW = 220;
  const countW = 48;
  const W = labelW + barMaxW + countW + 16;
  const H = top20.length * rowH + 8;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  top20.forEach((d, i) => {
    const y = i * rowH + rowH / 2;
    const barW = (d.count / maxCount) * barMaxW;

    // background stripe
    if (i % 2 === 0) {
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', 0);
      bg.setAttribute('y', i * rowH);
      bg.setAttribute('width', W);
      bg.setAttribute('height', rowH);
      bg.setAttribute('fill', '#f5f1eb');
      svg.appendChild(bg);
    }

    // Name label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelW - 8);
    label.setAttribute('y', y + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-family', 'Georgia, serif');
    label.setAttribute('font-size', '12');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = d.name;
    svg.appendChild(label);

    // Bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', labelW);
    rect.setAttribute('y', i * rowH + 4);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', rowH - 8);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('opacity', '0.72');
    svg.appendChild(rect);

    // Count
    const cnt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    cnt.setAttribute('x', labelW + barW + 6);
    cnt.setAttribute('y', y + 4);
    cnt.setAttribute('font-family', 'Helvetica Neue, sans-serif');
    cnt.setAttribute('font-size', '11');
    cnt.setAttribute('fill', '#444');
    cnt.textContent = d.count;
    svg.appendChild(cnt);
  });

  container.appendChild(svg);
}
