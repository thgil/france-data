// charts.js — saints-republic story

export function drawTopNamesChart(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const barH = 28;
  const marginLeft = 196;
  const marginRight = 48;
  const marginTop = 8;
  const marginBottom = 8;
  const innerW = W - marginLeft - marginRight;
  const H = topNames.length * barH + marginTop + marginBottom;

  const maxCount = Math.max(...topNames.map(d => d.count));

  const scale = v => (v / maxCount) * innerW;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Most common French commune names');

  topNames.forEach((d, i) => {
    const y = marginTop + i * barH;
    const bw = Math.max(scale(d.count), 2);

    // Row highlight (subtle)
    if (i % 2 === 0) {
      const bg = document.createElementNS(svgNS, 'rect');
      bg.setAttribute('x', 0);
      bg.setAttribute('y', y);
      bg.setAttribute('width', W);
      bg.setAttribute('height', barH);
      bg.setAttribute('fill', '#f5f1eb');
      svg.appendChild(bg);
    }

    // Bar
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', marginLeft);
    rect.setAttribute('y', y + 5);
    rect.setAttribute('width', bw);
    rect.setAttribute('height', barH - 10);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('opacity', 0.85);
    svg.appendChild(rect);

    // Name label
    const nameText = document.createElementNS(svgNS, 'text');
    nameText.setAttribute('x', marginLeft - 8);
    nameText.setAttribute('y', y + barH / 2 + 1);
    nameText.setAttribute('text-anchor', 'end');
    nameText.setAttribute('dominant-baseline', 'middle');
    nameText.setAttribute('font-family', 'Georgia, serif');
    nameText.setAttribute('font-size', '13');
    nameText.setAttribute('fill', '#1a1a1a');
    nameText.textContent = d.name;
    svg.appendChild(nameText);

    // Rank
    const rankText = document.createElementNS(svgNS, 'text');
    rankText.setAttribute('x', 24);
    rankText.setAttribute('y', y + barH / 2 + 1);
    rankText.setAttribute('text-anchor', 'middle');
    rankText.setAttribute('dominant-baseline', 'middle');
    rankText.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    rankText.setAttribute('font-size', '10');
    rankText.setAttribute('fill', '#aaa');
    rankText.textContent = String(i + 1);
    svg.appendChild(rankText);

    // Count label
    const countText = document.createElementNS(svgNS, 'text');
    countText.setAttribute('x', marginLeft + bw + 6);
    countText.setAttribute('y', y + barH / 2 + 1);
    countText.setAttribute('dominant-baseline', 'middle');
    countText.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    countText.setAttribute('font-size', '12');
    countText.setAttribute('fill', '#555');
    countText.textContent = `${d.count}×`;
    svg.appendChild(countText);
  });

  container.appendChild(svg);
}

export function drawLengthHistogram(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 200;
  const marginLeft = 36;
  const marginRight = 16;
  const marginTop = 16;
  const marginBottom = 32;
  const innerW = W - marginLeft - marginRight;
  const innerH = H - marginTop - marginBottom;

  // Only show lengths 1–35 (cut outliers for readability)
  const data = lengthDist.filter(d => d.length <= 35);
  const maxLen = Math.max(...data.map(d => d.length));
  const minLen = Math.min(...data.map(d => d.length));
  const maxCount = Math.max(...data.map(d => d.count));
  const barCount = maxLen - minLen + 1;
  const barW = innerW / barCount;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Distribution of commune name lengths');

  // Gridlines
  [0.25, 0.5, 0.75, 1.0].forEach(frac => {
    const y = marginTop + innerH - frac * innerH;
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', marginLeft);
    line.setAttribute('x2', marginLeft + innerW);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', '#e0d8cc');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  });

  // Bars
  data.forEach(d => {
    const bh = (d.count / maxCount) * innerH;
    const x = marginLeft + (d.length - minLen) * barW;
    const y = marginTop + innerH - bh;

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', x + 1);
    rect.setAttribute('y', y);
    rect.setAttribute('width', Math.max(barW - 2, 1));
    rect.setAttribute('height', bh);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('opacity', '0.75');
    svg.appendChild(rect);
  });

  // X axis labels (every 5 chars)
  for (let l = 5; l <= 35; l += 5) {
    const x = marginLeft + (l - minLen) * barW + barW / 2;
    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', H - 8);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    label.setAttribute('font-size', '10');
    label.setAttribute('fill', '#888');
    label.textContent = `${l}`;
    svg.appendChild(label);
  }

  // X axis label
  const xAxisLabel = document.createElementNS(svgNS, 'text');
  xAxisLabel.setAttribute('x', marginLeft + innerW / 2);
  xAxisLabel.setAttribute('y', H - 2);
  xAxisLabel.setAttribute('text-anchor', 'middle');
  xAxisLabel.setAttribute('font-family', "'Helvetica Neue', sans-serif");
  xAxisLabel.setAttribute('font-size', '9');
  xAxisLabel.setAttribute('fill', '#aaa');
  xAxisLabel.setAttribute('letter-spacing', '0.5');
  xAxisLabel.textContent = 'characters in commune name';
  svg.appendChild(xAxisLabel);

  // Annotation: modal peak at ~7-8 chars
  const peakLen = data.reduce((best, d) => d.count > best.count ? d : best, data[0]);
  const peakX = marginLeft + (peakLen.length - minLen) * barW + barW / 2;
  const peakY = marginTop + innerH - (peakLen.count / maxCount) * innerH - 6;
  const ann = document.createElementNS(svgNS, 'text');
  ann.setAttribute('x', peakX + 8);
  ann.setAttribute('y', peakY);
  ann.setAttribute('font-family', "'Helvetica Neue', sans-serif");
  ann.setAttribute('font-size', '10');
  ann.setAttribute('fill', '#b32020');
  ann.textContent = `peak: ${peakLen.length} chars`;
  svg.appendChild(ann);

  container.appendChild(svg);
}
