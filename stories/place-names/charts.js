// stories/place-names/charts.js
// Two static charts: top commune names + name length histogram.
// Export: drawCharts(data)

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const PAPER  = '#faf7f2';
const INK    = '#1a1a1a';
const ACCENT = '#b32020';
const MUTE   = '#888';
const RULE   = '#e0d8cc';

function svgBase(selector, { w, h, mt = 24, mr = 24, mb = 48, ml = 200 } = {}) {
  const el = d3.select(selector);
  el.selectAll('*').remove();
  const svg = el.append('svg')
    .attr('width', '100%')
    .attr('viewBox', `0 0 ${w} ${h}`)
    .attr('preserveAspectRatio', 'xMinYMid meet')
    .style('display', 'block')
    .style('overflow', 'visible');
  const g = svg.append('g').attr('transform', `translate(${ml},${mt})`);
  return { svg, g, innerW: w - ml - mr, innerH: h - mt - mb };
}

export function drawTopNames(selector, topNames) {
  const data = topNames.slice(0, 15);
  const maxVal = data[0].count;

  const w = 680, h = 380, mt = 8, mr = 60, mb = 32, ml = 190;
  const { g, innerW, innerH } = svgBase(selector, { w, h, mt, mr, mb, ml });

  const x = d3.scaleLinear().domain([0, maxVal + 1]).range([0, innerW]);
  const y = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, innerH])
    .padding(0.28);

  // Grid lines
  g.append('g')
    .attr('class', 'grid')
    .selectAll('line')
    .data(x.ticks(5))
    .join('line')
    .attr('x1', d => x(d))
    .attr('x2', d => x(d))
    .attr('y1', 0)
    .attr('y2', innerH)
    .attr('stroke', RULE)
    .attr('stroke-width', 1);

  // Bars
  g.selectAll('.bar')
    .data(data)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', d => y(d.name))
    .attr('width', d => x(d.count))
    .attr('height', y.bandwidth())
    .attr('fill', (d, i) => i === 0 ? ACCENT : INK)
    .attr('opacity', (d, i) => i === 0 ? 1 : 0.75);

  // Value labels
  g.selectAll('.val')
    .data(data)
    .join('text')
    .attr('class', 'val')
    .attr('x', d => x(d.count) + 6)
    .attr('y', d => y(d.name) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .attr('font-size', 11)
    .attr('fill', MUTE)
    .text(d => `×${d.count}`);

  // Y-axis labels (commune names)
  g.selectAll('.ylabel')
    .data(data)
    .join('text')
    .attr('class', 'ylabel')
    .attr('x', -8)
    .attr('y', d => y(d.name) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('font-family', 'Georgia, serif')
    .attr('font-size', 12)
    .attr('fill', INK)
    .text(d => d.name);

  // X-axis
  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(0).tickFormat(d => d === 0 ? '' : d))
    .call(ax => ax.select('.domain').attr('stroke', RULE))
    .call(ax => ax.selectAll('text')
      .attr('font-family', 'Helvetica Neue, sans-serif')
      .attr('font-size', 11)
      .attr('fill', MUTE)
      .attr('dy', '1.2em'));

  // X-axis label
  g.append('text')
    .attr('x', innerW / 2)
    .attr('y', innerH + 42)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .attr('font-size', 11)
    .attr('fill', MUTE)
    .text('Number of communes with this name');
}

export function drawLengthHistogram(selector, lengthDist) {
  // Bin to a reasonable range (1–45)
  const data = lengthDist.filter(d => d.length >= 1 && d.length <= 45);

  const w = 680, h = 280, mt = 8, mr = 24, mb = 40, ml = 48;
  const { g, innerW, innerH } = svgBase(selector, { w, h, mt, mr, mb, ml });

  const x = d3.scaleLinear()
    .domain([0, 46])
    .range([0, innerW]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([innerH, 0]);

  const barW = Math.max(1, innerW / 46 - 1);

  // Bars
  g.selectAll('.hbar')
    .data(data)
    .join('rect')
    .attr('class', 'hbar')
    .attr('x', d => x(d.length))
    .attr('y', d => y(d.count))
    .attr('width', barW)
    .attr('height', d => innerH - y(d.count))
    .attr('fill', INK)
    .attr('opacity', 0.75);

  // Highlight the outlier: length 1 (Y)
  const oneLetterBar = data.find(d => d.length === 1);
  if (oneLetterBar) {
    g.append('rect')
      .attr('x', x(1))
      .attr('y', y(oneLetterBar.count))
      .attr('width', barW)
      .attr('height', innerH - y(oneLetterBar.count))
      .attr('fill', ACCENT);
    g.append('text')
      .attr('x', x(1) + barW / 2)
      .attr('y', y(oneLetterBar.count) - 8)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Georgia, serif')
      .attr('font-size', 12)
      .attr('fill', ACCENT)
      .text('"Y"');
  }

  // Highlight longest: length 45
  const longestBar = data.find(d => d.length === 45);
  if (longestBar) {
    g.append('rect')
      .attr('x', x(45))
      .attr('y', y(longestBar.count))
      .attr('width', barW)
      .attr('height', innerH - y(longestBar.count))
      .attr('fill', ACCENT);
  }

  // X-axis (ticks at 5, 10, 15 … 45)
  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickValues([1, 5, 10, 15, 20, 25, 30, 35, 40, 45]).tickSize(4))
    .call(ax => ax.select('.domain').attr('stroke', RULE))
    .call(ax => ax.selectAll('text')
      .attr('font-family', 'Helvetica Neue, sans-serif')
      .attr('font-size', 11)
      .attr('fill', MUTE)
      .attr('dy', '1.2em'));

  g.append('text')
    .attr('x', innerW / 2)
    .attr('y', innerH + 36)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .attr('font-size', 11)
    .attr('fill', MUTE)
    .text('Name length (characters)');

  // Y-axis
  g.append('g')
    .call(d3.axisLeft(y).ticks(4).tickSize(0))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('text')
      .attr('font-family', 'Helvetica Neue, sans-serif')
      .attr('font-size', 11)
      .attr('fill', MUTE)
      .attr('x', -4));

  // Y grid
  g.selectAll('.ygrid')
    .data(y.ticks(4))
    .join('line')
    .attr('class', 'ygrid')
    .attr('x1', 0)
    .attr('x2', innerW)
    .attr('y1', d => y(d))
    .attr('y2', d => y(d))
    .attr('stroke', RULE)
    .attr('stroke-width', 1);

  // Y-axis label
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerH / 2)
    .attr('y', -38)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .attr('font-size', 11)
    .attr('fill', MUTE)
    .text('Communes');
}
