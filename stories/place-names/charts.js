// stories/place-names/charts.js
// Two horizontal bar charts: top commune names + top first-word prefixes.
// Exports: drawTopNamesChart(selector, data), drawPrefixChart(selector, data)

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const COLORS = {
  saint: '#8b2e2e',   // dark red for saint-prefixed names
  other: '#4a6fa5',   // muted blue for everything else
  prefix_saint: '#8b2e2e',
  prefix_other: '#4a6fa5',
};

function isSaintName(name) {
  return /^Saint/i.test(name);
}

function isSaintPrefix(prefix) {
  return prefix === 'saint' || prefix === 'sainte';
}

function buildChart(container, items, { labelKey, valueKey, colorFn, maxWidth = 680 }) {
  const margin = { top: 8, right: 60, bottom: 8, left: 180 };
  const barHeight = 22;
  const barGap = 4;
  const n = items.length;
  const totalHeight = n * (barHeight + barGap) + margin.top + margin.bottom;

  const svgWidth = Math.min(container.clientWidth || maxWidth, maxWidth);
  const innerW = svgWidth - margin.left - margin.right;
  const innerH = totalHeight - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', totalHeight)
    .attr('role', 'img');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xMax = d3.max(items, d => d[valueKey]);
  const x = d3.scaleLinear().domain([0, xMax]).range([0, innerW]);
  const y = d3.scaleBand()
    .domain(items.map(d => d[labelKey]))
    .range([0, innerH])
    .padding(barGap / (barHeight + barGap));

  // Bars
  g.selectAll('rect.bar')
    .data(items)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', d => y(d[labelKey]))
    .attr('width', d => x(d[valueKey]))
    .attr('height', y.bandwidth())
    .attr('fill', d => colorFn(d))
    .attr('rx', 2);

  // Value labels
  g.selectAll('text.val')
    .data(items)
    .join('text')
    .attr('class', 'val')
    .attr('x', d => x(d[valueKey]) + 6)
    .attr('y', d => y(d[labelKey]) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('font-family', 'var(--sans, Helvetica Neue, sans-serif)')
    .attr('font-size', 11)
    .attr('fill', '#444')
    .text(d => d[valueKey]);

  // Name labels
  g.selectAll('text.label')
    .data(items)
    .join('text')
    .attr('class', 'label')
    .attr('x', -8)
    .attr('y', d => y(d[labelKey]) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('font-family', 'Georgia, serif')
    .attr('font-size', 12)
    .attr('fill', d => colorFn(d))
    .text(d => d[labelKey]);
}

export function drawTopNamesChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;
  const items = data.top_names.slice(0, 15);
  buildChart(container, items, {
    labelKey: 'name',
    valueKey: 'count',
    colorFn: d => isSaintName(d.name) ? COLORS.saint : COLORS.other,
  });
}

export function drawPrefixChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;
  const items = data.top_prefixes.slice(0, 12).map(d => ({
    ...d,
    label: d.prefix.charAt(0).toUpperCase() + d.prefix.slice(1),
  }));
  buildChart(container, items, {
    labelKey: 'label',
    valueKey: 'count',
    colorFn: d => isSaintPrefix(d.prefix) ? COLORS.prefix_saint : COLORS.prefix_other,
  });
}
