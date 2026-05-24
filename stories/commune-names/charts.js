/* commune-names/charts.js — bar charts for the name analysis story */

export function drawTopNamesChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const topN = data.topNames.slice(0, 20);
  const maxCount = topN[0].count;

  const BAR_HEIGHT = 28;
  const LABEL_W = 220;
  const VALUE_W = 32;
  const BAR_MAX_W = 280;
  const GAP = 4;
  const HEIGHT = topN.length * (BAR_HEIGHT + GAP);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', `0 0 ${LABEL_W + BAR_MAX_W + VALUE_W + 16} ${HEIGHT}`);
  svg.style.fontFamily = "Georgia, 'Times New Roman', serif";
  svg.style.overflow = 'visible';

  topN.forEach((d, i) => {
    const y = i * (BAR_HEIGHT + GAP);
    const barW = Math.round((d.count / maxCount) * BAR_MAX_W);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(0,${y})`);

    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', LABEL_W - 8);
    label.setAttribute('y', BAR_HEIGHT / 2 + 1);
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '13');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = d.name;

    // Bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', LABEL_W);
    rect.setAttribute('y', 4);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', BAR_HEIGHT - 8);
    rect.setAttribute('fill', i === 0 ? '#b32020' : '#c8b89a');
    rect.setAttribute('rx', '2');

    // Count
    const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    count.setAttribute('x', LABEL_W + barW + 6);
    count.setAttribute('y', BAR_HEIGHT / 2 + 1);
    count.setAttribute('dominant-baseline', 'middle');
    count.setAttribute('font-size', '12');
    count.setAttribute('fill', '#666');
    count.textContent = `×${d.count}`;

    g.appendChild(label);
    g.appendChild(rect);
    g.appendChild(count);
    svg.appendChild(g);
  });

  container.appendChild(svg);
}

export function drawLengthHistogram(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Only show lengths 1–30
  const bins = data.lengthDist.filter(d => d.length <= 30);
  const maxCount = Math.max(...bins.map(d => d.count));

  const CHART_W = 580;
  const CHART_H = 160;
  const MARGIN = { top: 8, right: 8, bottom: 32, left: 40 };
  const plotW = CHART_W - MARGIN.left - MARGIN.right;
  const plotH = CHART_H - MARGIN.top - MARGIN.bottom;
  const barW = Math.floor(plotW / bins.length) - 1;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', `0 0 ${CHART_W} ${CHART_H}`);
  svg.style.fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  svg.style.overflow = 'visible';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  bins.forEach((d, i) => {
    const x = Math.round(i * (plotW / bins.length));
    const barH = Math.round((d.count / maxCount) * plotH);
    const y = plotH - barH;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', d.length <= 2 ? '#b32020' : d.length >= 30 ? '#6b8a6b' : '#c8b89a');
    rect.setAttribute('rx', '1');
    g.appendChild(rect);

    // X-axis labels (every 5)
    if (d.length % 5 === 0 || d.length === 1) {
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tick.setAttribute('x', x + barW / 2);
      tick.setAttribute('y', plotH + 16);
      tick.setAttribute('text-anchor', 'middle');
      tick.setAttribute('font-size', '11');
      tick.setAttribute('fill', '#888');
      tick.textContent = d.length;
      g.appendChild(tick);
    }
  });

  // Y-axis label
  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('transform', `translate(-32,${plotH / 2}) rotate(-90)`);
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('font-size', '10');
  yLabel.setAttribute('fill', '#888');
  yLabel.textContent = 'communes';
  g.appendChild(yLabel);

  // Axis line
  const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  axis.setAttribute('x1', 0);
  axis.setAttribute('y1', plotH);
  axis.setAttribute('x2', plotW);
  axis.setAttribute('y2', plotH);
  axis.setAttribute('stroke', '#ddd');
  axis.setAttribute('stroke-width', '1');
  g.appendChild(axis);

  // X-axis label
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', plotW / 2);
  xLabel.setAttribute('y', plotH + 28);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-size', '11');
  xLabel.setAttribute('fill', '#888');
  xLabel.textContent = 'characters in commune name';
  g.appendChild(xLabel);

  svg.appendChild(g);
  container.appendChild(svg);
}
