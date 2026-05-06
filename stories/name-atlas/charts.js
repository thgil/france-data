import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTED = '#888';
const ACCENT = '#8b4513';   // warm brown for name bars
const HIST   = '#6b7fa8';   // slate blue for length histogram

/* ── Horizontal bar chart: top 20 most common names ─────────────── */
export function drawTopNames(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = stats.topNames.slice(0, 20);
  const maxCount = data[0].count;

  const marginLeft  = 220;
  const marginRight = 60;
  const marginTop   = 20;
  const barHeight   = 26;
  const barGap      = 4;
  const totalH      = marginTop + data.length * (barHeight + barGap) + 20;
  const svgW        = Math.min(container.clientWidth || 680, 720);

  const x = d3.scaleLinear()
    .domain([0, maxCount + 1])
    .range([0, svgW - marginLeft - marginRight]);

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${svgW} ${totalH}`)
    .attr('width', svgW)
    .attr('height', totalH);

  const g = svg.append('g').attr('transform', `translate(${marginLeft},${marginTop})`);

  // Grid lines
  const ticks = d3.range(1, maxCount + 1);
  g.selectAll('.grid-line')
    .data(ticks)
    .join('line')
    .attr('class', 'grid-line')
    .attr('x1', d => x(d))
    .attr('x2', d => x(d))
    .attr('y1', 0)
    .attr('y2', totalH - marginTop - 20)
    .attr('stroke', '#e0d8cc')
    .attr('stroke-width', 1);

  // Bars
  const row = g.selectAll('.name-row')
    .data(data)
    .join('g')
    .attr('class', 'name-row')
    .attr('transform', (d, i) => `translate(0,${i * (barHeight + barGap)})`);

  row.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', d => Math.max(1, x(d.count)))
    .attr('height', barHeight)
    .attr('fill', ACCENT)
    .attr('opacity', (d, i) => 1 - i * 0.028);

  // Count label inside/outside bar
  row.append('text')
    .attr('x', d => x(d.count) + 6)
    .attr('y', barHeight / 2)
    .attr('dy', '0.35em')
    .attr('font-family', 'var(--sans,"Helvetica Neue",sans-serif)')
    .attr('font-size', 11)
    .attr('fill', MUTED)
    .text(d => `×${d.count}`);

  // Name label (left)
  row.append('text')
    .attr('x', -8)
    .attr('y', barHeight / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('font-family', 'Georgia, serif')
    .attr('font-size', 13)
    .attr('fill', INK)
    .text(d => d.name);

  // Axis count labels at top
  g.selectAll('.x-tick')
    .data(ticks)
    .join('text')
    .attr('class', 'x-tick')
    .attr('x', d => x(d))
    .attr('y', -6)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'var(--sans,"Helvetica Neue",sans-serif)')
    .attr('font-size', 10)
    .attr('fill', MUTED)
    .text(d => d);
}

/* ── Histogram: name length distribution ─────────────────────────── */
export function drawLengthHist(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Group into bins of 2 chars for readability
  const binSize = 2;
  const binMap = {};
  stats.lengthDist.forEach(({ len, count }) => {
    const bin = Math.floor(len / binSize) * binSize;
    binMap[bin] = (binMap[bin] || 0) + count;
  });
  const data = Object.entries(binMap)
    .map(([bin, count]) => ({ bin: +bin, count }))
    .sort((a, b) => a.bin - b.bin);

  const marginLeft  = 48;
  const marginRight = 20;
  const marginTop   = 20;
  const marginBottom= 36;
  const svgW        = Math.min(container.clientWidth || 680, 720);
  const svgH        = 220;
  const innerW      = svgW - marginLeft - marginRight;
  const innerH      = svgH - marginTop - marginBottom;

  const x = d3.scaleBand()
    .domain(data.map(d => d.bin))
    .range([0, innerW])
    .padding(0.12);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([innerH, 0]);

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${svgW} ${svgH}`)
    .attr('width', svgW)
    .attr('height', svgH);

  const g = svg.append('g').attr('transform', `translate(${marginLeft},${marginTop})`);

  // Y gridlines
  g.selectAll('.y-grid')
    .data(y.ticks(5))
    .join('line')
    .attr('class', 'y-grid')
    .attr('x1', 0).attr('x2', innerW)
    .attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', '#e0d8cc')
    .attr('stroke-width', 1);

  // Bars
  g.selectAll('.hist-bar')
    .data(data)
    .join('rect')
    .attr('class', 'hist-bar')
    .attr('x', d => x(d.bin))
    .attr('y', d => y(d.count))
    .attr('width', x.bandwidth())
    .attr('height', d => innerH - y(d.count))
    .attr('fill', HIST)
    .attr('opacity', 0.82);

  // X axis labels — show every bin label
  g.selectAll('.x-label')
    .data(data)
    .join('text')
    .attr('class', 'x-label')
    .attr('x', d => x(d.bin) + x.bandwidth() / 2)
    .attr('y', innerH + 18)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'var(--sans,"Helvetica Neue",sans-serif)')
    .attr('font-size', 10)
    .attr('fill', MUTED)
    .text(d => d.bin);

  // X axis title
  g.append('text')
    .attr('x', innerW / 2)
    .attr('y', innerH + 34)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'var(--sans,"Helvetica Neue",sans-serif)')
    .attr('font-size', 11)
    .attr('fill', MUTED)
    .text('name length (characters)');

  // Y axis labels
  g.selectAll('.y-label')
    .data(y.ticks(5))
    .join('text')
    .attr('class', 'y-label')
    .attr('x', -8)
    .attr('y', d => y(d))
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('font-family', 'var(--sans,"Helvetica Neue",sans-serif)')
    .attr('font-size', 10)
    .attr('fill', MUTED)
    .text(d => d >= 1000 ? `${d/1000}k` : d);

  // Average line
  const avgLen = stats.avgNameLength;
  const avgBin = Math.floor(avgLen / binSize) * binSize;
  if (x(avgBin) !== undefined) {
    const avgX = x(avgBin) + x.bandwidth() / 2;
    g.append('line')
      .attr('x1', avgX).attr('x2', avgX)
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', ACCENT)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,3');
    g.append('text')
      .attr('x', avgX + 5)
      .attr('y', 12)
      .attr('font-family', 'var(--sans,"Helvetica Neue",sans-serif)')
      .attr('font-size', 10)
      .attr('fill', ACCENT)
      .text(`avg ${avgLen}`);
  }
}
