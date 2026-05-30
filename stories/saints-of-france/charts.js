// stories/saints-of-france/charts.js
// Charts for the Saints of France story.
// Exports: drawSaintsChart(selector, stats)

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export function drawSaintsChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const saints = stats.topSaints; // [{name, count}, ...]
  const maxCount = saints[0].count;

  const isMobile = window.innerWidth < 600;
  const margin = { top: 12, right: 60, bottom: 16, left: isMobile ? 90 : 110 };
  const width = container.clientWidth || 660;
  const barHeight = 28;
  const height = saints.length * barHeight + margin.top + margin.bottom;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");

  const x = d3.scaleLinear()
    .domain([0, maxCount * 1.08])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleBand()
    .domain(saints.map(d => d.name))
    .range([margin.top, height - margin.bottom])
    .padding(0.22);

  // Bars
  svg.selectAll('rect.bar')
    .data(saints)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', x(0))
    .attr('y', d => y(d.name))
    .attr('width', d => x(d.count) - x(0))
    .attr('height', y.bandwidth())
    .attr('fill', (d, i) => i === 0 ? '#b32020' : '#c8bfb0');

  // Value labels
  svg.selectAll('text.val')
    .data(saints)
    .join('text')
    .attr('class', 'val')
    .attr('x', d => x(d.count) + 6)
    .attr('y', d => y(d.name) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('fill', '#444')
    .attr('font-size', 12)
    .text(d => d.count);

  // Y-axis labels
  svg.selectAll('text.label')
    .data(saints)
    .join('text')
    .attr('class', 'label')
    .attr('x', margin.left - 8)
    .attr('y', d => y(d.name) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('fill', (d, i) => i === 0 ? '#b32020' : '#1a1a1a')
    .attr('font-size', isMobile ? 11 : 13)
    .attr('font-family', 'Georgia, serif')
    .text(d => `Saint(e)-${d.name}`);
}

export function drawPrefixChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const total = stats.totalCommunes;
  const data = [
    { label: 'Saint- / Sainte-', count: stats.saintCommunes, color: '#b32020' },
    { label: 'Le / La / Les',    count: stats.leLaLesCommunes, color: '#6b8eae' },
    { label: 'Other',            count: total - stats.saintCommunes - stats.leLaLesCommunes, color: '#c8bfb0' },
  ];

  const isMobile = window.innerWidth < 600;
  const margin = { top: 12, right: 80, bottom: 16, left: isMobile ? 100 : 130 };
  const width = container.clientWidth || 480;
  const barHeight = 32;
  const height = data.length * barHeight + margin.top + margin.bottom;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");

  const x = d3.scaleLinear()
    .domain([0, total])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([margin.top, height - margin.bottom])
    .padding(0.25);

  svg.selectAll('rect.bg')
    .data(data)
    .join('rect')
    .attr('class', 'bg')
    .attr('x', x(0))
    .attr('y', d => y(d.label))
    .attr('width', x(total) - x(0))
    .attr('height', y.bandwidth())
    .attr('fill', '#ede8e0');

  svg.selectAll('rect.bar')
    .data(data)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', x(0))
    .attr('y', d => y(d.label))
    .attr('width', d => x(d.count) - x(0))
    .attr('height', y.bandwidth())
    .attr('fill', d => d.color);

  svg.selectAll('text.val')
    .data(data)
    .join('text')
    .attr('class', 'val')
    .attr('x', d => x(d.count) + 6)
    .attr('y', d => y(d.label) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('fill', '#444')
    .attr('font-size', 12)
    .text(d => `${d.count.toLocaleString('fr-FR')} (${(d.count / total * 100).toFixed(1)}%)`);

  svg.selectAll('text.label')
    .data(data)
    .join('text')
    .attr('class', 'label')
    .attr('x', margin.left - 8)
    .attr('y', d => y(d.label) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('fill', '#1a1a1a')
    .attr('font-size', isMobile ? 11 : 13)
    .text(d => d.label);
}
