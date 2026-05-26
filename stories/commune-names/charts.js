// stories/commune-names/charts.js
// D3 horizontal bar charts for commune name analysis.
// Exports: drawSaintChart(selector, data), drawDuplicatesChart(selector, data),
//          drawLengthHistogram(selector, data)

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const ACCENT = '#b32020';
const INK    = '#1a1a1a';
const MUTED  = '#888';
const BAR_FILL  = '#b32020';
const BAR_LIGHT = '#e8b8b8';

function hbar(selector, items, { valueKey = 'count', labelKey = 'name', title = '' } = {}) {
  const container = document.querySelector(selector);
  if (!container) return;

  const margin = { top: 8, right: 60, bottom: 24, left: 180 };
  const totalW = container.clientWidth || 560;
  const width  = totalW - margin.left - margin.right;
  const barH   = 24;
  const gap    = 6;
  const height = items.length * (barH + gap);

  const svg = d3.select(container).append('svg')
    .attr('width',  totalW)
    .attr('height', height + margin.top + margin.bottom)
    .style('display', 'block');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const maxVal = d3.max(items, d => d[valueKey]);
  const x = d3.scaleLinear().domain([0, maxVal]).range([0, width]);
  const y = d3.scaleBand()
    .domain(items.map(d => d[labelKey]))
    .range([0, height])
    .paddingInner(gap / (barH + gap));

  // Bars
  g.selectAll('rect.bar')
    .data(items)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', d => y(d[labelKey]))
    .attr('width', d => x(d[valueKey]))
    .attr('height', y.bandwidth())
    .attr('fill', (d, i) => i === 0 ? ACCENT : BAR_LIGHT);

  // Labels (left axis)
  g.selectAll('text.label')
    .data(items)
    .join('text')
    .attr('class', 'label')
    .attr('x', -8)
    .attr('y', d => y(d[labelKey]) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('fill', INK)
    .style('font-family', SERIF)
    .style('font-size', '13px')
    .text(d => d[labelKey]);

  // Values (right of bar)
  g.selectAll('text.value')
    .data(items)
    .join('text')
    .attr('class', 'value')
    .attr('x', d => x(d[valueKey]) + 6)
    .attr('y', d => y(d[labelKey]) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('fill', MUTED)
    .style('font-family', SANS)
    .style('font-size', '12px')
    .style('font-variant-numeric', 'tabular-nums')
    .text(d => d[valueKey].toLocaleString('fr-FR'));
}

export function drawSaintChart(selector, saintVariants) {
  hbar(selector, saintVariants.slice(0, 12), {
    valueKey: 'count',
    labelKey: 'name',
  });
}

export function drawDuplicatesChart(selector, duplicateNames) {
  hbar(selector, duplicateNames.slice(0, 10), {
    valueKey: 'count',
    labelKey: 'name',
  });
}

export function drawLengthHistogram(selector, lenDistribution) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Bin by ranges of 5 for readability
  const binSize = 5;
  const bins = {};
  for (const { len, count } of lenDistribution) {
    const binStart = Math.floor((len - 1) / binSize) * binSize + 1;
    const label = `${binStart}–${binStart + binSize - 1}`;
    bins[label] = (bins[label] || 0) + count;
  }
  const items = Object.entries(bins).map(([label, count]) => ({ label, count }));

  const margin = { top: 8, right: 40, bottom: 36, left: 48 };
  const totalW = container.clientWidth || 560;
  const width  = totalW - margin.left - margin.right;
  const height = 160;

  const svg = d3.select(container).append('svg')
    .attr('width', totalW)
    .attr('height', height + margin.top + margin.bottom)
    .style('display', 'block');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const maxVal = d3.max(items, d => d.count);
  const x = d3.scaleBand().domain(items.map(d => d.label)).range([0, width]).padding(0.15);
  const y = d3.scaleLinear().domain([0, maxVal]).range([height, 0]).nice();

  g.selectAll('rect')
    .data(items)
    .join('rect')
    .attr('x', d => x(d.label))
    .attr('y', d => y(d.count))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.count))
    .attr('fill', (d, i) => {
      // Highlight the "most common" bin
      return d.label === '6–10' || d.label === '11–15' ? ACCENT : BAR_LIGHT;
    });

  // X axis
  const xAxis = g.append('g').attr('transform', `translate(0,${height})`);
  xAxis.call(d3.axisBottom(x).tickSizeOuter(0));
  xAxis.selectAll('text')
    .style('font-family', SANS)
    .style('font-size', '11px')
    .attr('fill', MUTED);
  xAxis.select('.domain').attr('stroke', '#ccc');

  // Y axis (minimal)
  const yAxis = g.append('g');
  yAxis.call(d3.axisLeft(y).ticks(4).tickSizeOuter(0));
  yAxis.selectAll('text')
    .style('font-family', SANS)
    .style('font-size', '11px')
    .attr('fill', MUTED);
  yAxis.select('.domain').remove();
  yAxis.selectAll('.tick line').attr('stroke', '#e8e0d0');

  // X axis label
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height + 32)
    .attr('text-anchor', 'middle')
    .style('font-family', SANS)
    .style('font-size', '11px')
    .attr('fill', MUTED)
    .text('Name length (characters)');
}
