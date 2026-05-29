// stories/commune-names/charts.js
// Name-length histogram using D3 v7.
// Export: drawLengthHistogram(selector, stats)

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export function drawLengthHistogram(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const margin = { top: 16, right: 16, bottom: 40, left: 44 };
  const totalW = container.clientWidth || 680;
  const totalH = 220;
  const W = totalW - margin.left - margin.right;
  const H = totalH - margin.top - margin.bottom;

  // Only include lengths 1–35 (tail is very sparse past 35)
  const data = stats.lengthDist.filter(d => d.length <= 35 && d.count > 0);

  const x = d3.scaleBand()
    .domain(data.map(d => d.length))
    .range([0, W])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([H, 0]);

  const svg = d3.select(container)
    .append('svg')
    .attr('width', totalW)
    .attr('height', totalH)
    .attr('role', 'img')
    .attr('aria-label', 'Histogram of commune name lengths in France');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Bars
  const barColor = '#1a1a1a';
  const highlightColor = '#b32020';

  // Highlight the single-letter bar (length=1) and the peak
  const peakLength = data.reduce((a, b) => a.count > b.count ? a : b).length;

  g.selectAll('.bar')
    .data(data)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.length))
    .attr('y', d => y(d.count))
    .attr('width', x.bandwidth())
    .attr('height', d => H - y(d.count))
    .attr('fill', d => d.length === 1 ? highlightColor : barColor)
    .attr('opacity', d => d.length === 1 ? 1 : 0.75);

  // x-axis: show every 5th tick
  g.append('g')
    .attr('transform', `translate(0,${H})`)
    .call(
      d3.axisBottom(x)
        .tickValues(data.filter(d => d.length % 5 === 0).map(d => d.length))
        .tickSize(3)
    )
    .call(ax => {
      ax.select('.domain').attr('stroke', '#bbb');
      ax.selectAll('text')
        .style('font-family', 'var(--sans, sans-serif)')
        .style('font-size', '11px')
        .style('fill', '#555');
      ax.selectAll('line').attr('stroke', '#bbb');
    });

  // x-axis label
  g.append('text')
    .attr('x', W / 2)
    .attr('y', H + 34)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--sans, sans-serif)')
    .style('font-size', '11px')
    .style('fill', '#888')
    .text('Name length (characters)');

  // y-axis
  g.append('g')
    .call(
      d3.axisLeft(y)
        .ticks(4)
        .tickFormat(d => d >= 1000 ? (d / 1000).toFixed(0) + 'k' : d)
        .tickSize(3)
    )
    .call(ax => {
      ax.select('.domain').remove();
      ax.selectAll('text')
        .style('font-family', 'var(--sans, sans-serif)')
        .style('font-size', '11px')
        .style('fill', '#555');
      ax.selectAll('line').attr('stroke', '#ddd');
    });

  // Annotation: Y (length 1)
  const yBar = data.find(d => d.length === 1);
  if (yBar) {
    g.append('text')
      .attr('x', x(1) + x.bandwidth() / 2)
      .attr('y', y(yBar.count) - 8)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--sans, sans-serif)')
      .style('font-size', '10px')
      .style('fill', highlightColor)
      .style('font-weight', '600')
      .text('Y');
  }
}
