// charts.js — commune-names story
// Draws SVG charts using vanilla JS. No external dependencies.

export function drawTopNamesChart(containerId, data) {
  const el = document.querySelector(containerId);
  if (!el) return;

  const names = data.mostCommonNames.slice(0, 20);
  const maxCount = names[0].count;

  const rowH = 26;
  const labelW = 230;
  const barMaxW = 260;
  const margin = { top: 8, right: 48, bottom: 8, left: labelW };
  const totalH = names.length * rowH + margin.top + margin.bottom;
  const totalW = labelW + barMaxW + margin.right;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";
  svg.style.overflow = 'visible';

  names.forEach((d, i) => {
    const y = margin.top + i * rowH;
    const barW = (d.count / maxCount) * barMaxW;
    const cx = labelW;
    const cy = y + rowH * 0.5;

    // Row background
    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('x', '0');
    bg.setAttribute('y', String(y + 1));
    bg.setAttribute('width', String(totalW - margin.right));
    bg.setAttribute('height', String(rowH - 2));
    bg.setAttribute('fill', i % 2 === 0 ? '#faf7f2' : '#f3efe8');
    bg.setAttribute('rx', '2');
    svg.appendChild(bg);

    // Bar
    const bar = document.createElementNS(svgNS, 'rect');
    bar.setAttribute('x', String(cx));
    bar.setAttribute('y', String(cy - 7));
    bar.setAttribute('width', String(barW));
    bar.setAttribute('height', '14');
    bar.setAttribute('fill', i === 0 ? '#b32020' : '#c8a87a');
    bar.setAttribute('rx', '2');
    svg.appendChild(bar);

    // Name label
    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', String(cx - 8));
    label.setAttribute('y', String(cy + 4));
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '12');
    label.setAttribute('fill', '#1a1a1a');
    label.setAttribute('font-family', "Georgia, serif");
    label.textContent = d.name;
    svg.appendChild(label);

    // Count label
    const count = document.createElementNS(svgNS, 'text');
    count.setAttribute('x', String(cx + barW + 6));
    count.setAttribute('y', String(cy + 4));
    count.setAttribute('font-size', '11');
    count.setAttribute('fill', '#666');
    count.textContent = `×${d.count}`;
    svg.appendChild(count);
  });

  el.appendChild(svg);
}

export function drawLengthHistogram(containerId, data) {
  const el = document.querySelector(containerId);
  if (!el) return;

  // Focus on length 1–30 (covers 99.9% of communes)
  const dist = data.lengthDistribution.filter(d => d.length <= 35);
  const maxCount = Math.max(...dist.map(d => d.count));

  const barW = 18;
  const gap = 2;
  const chartH = 120;
  const margin = { top: 16, right: 16, bottom: 28, left: 44 };
  const totalW = dist.length * (barW + gap) + margin.left + margin.right;
  const totalH = chartH + margin.top + margin.bottom;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";

  // Y axis label
  const yLabel = document.createElementNS(svgNS, 'text');
  yLabel.setAttribute('x', '8');
  yLabel.setAttribute('y', String(margin.top + chartH / 2));
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('font-size', '10');
  yLabel.setAttribute('fill', '#888');
  yLabel.setAttribute('transform', `rotate(-90, 8, ${margin.top + chartH / 2})`);
  yLabel.textContent = 'communes';
  svg.appendChild(yLabel);

  dist.forEach((d, i) => {
    const bh = (d.count / maxCount) * chartH;
    const x = margin.left + i * (barW + gap);
    const y = margin.top + chartH - bh;

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', String(barW));
    rect.setAttribute('height', String(bh));
    rect.setAttribute('fill', '#c8a87a');
    rect.setAttribute('rx', '1');
    svg.appendChild(rect);

    // X axis label (every 5 chars)
    if (d.length % 5 === 0) {
      const tick = document.createElementNS(svgNS, 'text');
      tick.setAttribute('x', String(x + barW / 2));
      tick.setAttribute('y', String(margin.top + chartH + 14));
      tick.setAttribute('text-anchor', 'middle');
      tick.setAttribute('font-size', '10');
      tick.setAttribute('fill', '#888');
      tick.textContent = String(d.length);
      svg.appendChild(tick);
    }
  });

  // Baseline
  const base = document.createElementNS(svgNS, 'line');
  base.setAttribute('x1', String(margin.left - 4));
  base.setAttribute('y1', String(margin.top + chartH));
  base.setAttribute('x2', String(margin.left + dist.length * (barW + gap)));
  base.setAttribute('y2', String(margin.top + chartH));
  base.setAttribute('stroke', '#ccc');
  base.setAttribute('stroke-width', '1');
  svg.appendChild(base);

  // X axis label
  const xLabel = document.createElementNS(svgNS, 'text');
  xLabel.setAttribute('x', String(margin.left + dist.length * (barW + gap) / 2));
  xLabel.setAttribute('y', String(totalH - 2));
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-size', '10');
  xLabel.setAttribute('fill', '#888');
  xLabel.textContent = 'name length (characters)';
  svg.appendChild(xLabel);

  el.appendChild(svg);
}
