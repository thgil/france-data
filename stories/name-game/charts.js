import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export function drawTopNamesChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const top = data.topNames.slice(0, 15);
  const maxCount = top[0].count;

  const margin = { top: 12, right: 48, bottom: 12, left: 168 };
  const rowH = 28;
  const height = top.length * rowH + margin.top + margin.bottom;

  const width = Math.min(container.clientWidth || 640, 680);
  const innerW = width - margin.left - margin.right;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, maxCount + 1]).range([0, innerW]);
  const y = d3.scaleBand().domain(top.map(d => d.name)).range([0, top.length * rowH]).padding(0.25);

  // Bars
  g.selectAll('rect')
    .data(top)
    .join('rect')
    .attr('x', 0)
    .attr('y', d => y(d.name))
    .attr('width', d => x(d.count))
    .attr('height', y.bandwidth())
    .attr('fill', '#b32020')
    .attr('opacity', 0.85);

  // Labels (left)
  g.selectAll('.label-name')
    .data(top)
    .join('text')
    .attr('class', 'label-name')
    .attr('x', -8)
    .attr('y', d => y(d.name) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('font-family', 'Georgia, serif')
    .attr('font-size', 13)
    .attr('fill', '#1a1a1a')
    .text(d => d.name);

  // Count labels (right of bar)
  g.selectAll('.label-count')
    .data(top)
    .join('text')
    .attr('class', 'label-count')
    .attr('x', d => x(d.count) + 5)
    .attr('y', d => y(d.name) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('font-family', "'Helvetica Neue', sans-serif")
    .attr('font-size', 11)
    .attr('fill', '#666')
    .text(d => `${d.count}×`);
}

export function drawLengthChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Trim trailing zeros — stop at last non-zero length
  const dist = data.lengthDistribution.filter(d => d.length <= 40 && d.count > 0);
  const maxCount = d3.max(dist, d => d.count);

  const margin = { top: 16, right: 24, bottom: 40, left: 48 };
  const width = Math.min(container.clientWidth || 640, 680);
  const height = 220;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([1, 40]).range([0, innerW]);
  const y = d3.scaleLinear().domain([0, maxCount]).range([innerH, 0]);

  const area = d3.area()
    .x(d => x(d.length))
    .y0(innerH)
    .y1(d => y(d.count))
    .curve(d3.curveBasis);

  const line = d3.line()
    .x(d => x(d.length))
    .y(d => y(d.count))
    .curve(d3.curveBasis);

  g.append('path')
    .datum(dist)
    .attr('d', area)
    .attr('fill', '#b32020')
    .attr('opacity', 0.15);

  g.append('path')
    .datum(dist)
    .attr('d', line)
    .attr('fill', 'none')
    .attr('stroke', '#b32020')
    .attr('stroke-width', 2);

  // X axis
  const xAxis = d3.axisBottom(x)
    .tickValues([1, 5, 10, 15, 20, 25, 30, 35, 40])
    .tickFormat(d => d === 1 ? '1 char' : `${d}`);

  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(xAxis)
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('line').attr('stroke', '#ddd'))
    .call(ax => ax.selectAll('text')
      .attr('font-family', "'Helvetica Neue', sans-serif")
      .attr('font-size', 11)
      .attr('fill', '#888'));

  // Y axis
  g.append('g')
    .call(d3.axisLeft(y).ticks(4).tickFormat(d => d >= 1000 ? `${d / 1000}k` : d))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('line').attr('stroke', '#eee').attr('x2', innerW))
    .call(ax => ax.selectAll('text')
      .attr('font-family', "'Helvetica Neue', sans-serif")
      .attr('font-size', 11)
      .attr('fill', '#888'));

  // Annotation: peak around 7-8 chars
  const peakEntry = dist.reduce((a, b) => a.count > b.count ? a : b);
  g.append('line')
    .attr('x1', x(peakEntry.length)).attr('x2', x(peakEntry.length))
    .attr('y1', y(peakEntry.count) - 4).attr('y2', innerH)
    .attr('stroke', '#b32020').attr('stroke-width', 1).attr('stroke-dasharray', '3,3');

  g.append('text')
    .attr('x', x(peakEntry.length))
    .attr('y', y(peakEntry.count) - 8)
    .attr('text-anchor', 'middle')
    .attr('font-family', "'Helvetica Neue', sans-serif")
    .attr('font-size', 10)
    .attr('fill', '#b32020')
    .text(`peak: ${peakEntry.length} chars (${peakEntry.count.toLocaleString('fr-FR')} communes)`);
}
