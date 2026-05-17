// stories/name-france/charts.js
// Pure-SVG charts drawn with D3: length histogram + saint bar chart.
// No map dependency — this is a text-and-charts story.

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// ── Shared ────────────────────────────────────────────────────────────────────
const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#e0d8cc';
const RED   = '#b32020';

function px(el) {
  return parseFloat(getComputedStyle(el).width) || 680;
}

// ── Length histogram ──────────────────────────────────────────────────────────
export function drawLengthChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = px(container);
  const H = 260;
  const m = { top: 12, right: 16, bottom: 36, left: 52 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;

  // Bucket lengths ≥ 30 into a "30+" bin for cleaner display
  const CUTOFF = 30;
  const bucketed = [];
  let overflow = 0;
  for (const d of data) {
    if (d.length < CUTOFF) {
      bucketed.push({ label: String(d.length), count: d.count, length: d.length });
    } else {
      overflow += d.count;
    }
  }
  bucketed.push({ label: '30+', count: overflow, length: CUTOFF });

  const x = d3.scaleBand()
    .domain(bucketed.map(d => d.label))
    .range([0, iw])
    .padding(0.08);

  const y = d3.scaleLinear()
    .domain([0, d3.max(bucketed, d => d.count)])
    .nice()
    .range([ih, 0]);

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', '100%')
    .style('display', 'block');

  const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

  // Gridlines
  g.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y).ticks(5).tickSize(-iw).tickFormat(''))
    .call(g => {
      g.select('.domain').remove();
      g.selectAll('line').attr('stroke', RULE).attr('stroke-dasharray', '3,3');
    });

  // Bars — highlight the bimodal peaks (lengths 7–8 and 17–18)
  g.selectAll('rect')
    .data(bucketed)
    .join('rect')
    .attr('x', d => x(d.label))
    .attr('y', d => y(d.count))
    .attr('width', x.bandwidth())
    .attr('height', d => ih - y(d.count))
    .attr('fill', d => (d.length === 7 || d.length === 8 || d.length === 17 || d.length === 18)
      ? RED : '#c8b89a');

  // X axis — show every other tick to avoid crowding
  g.append('g')
    .attr('transform', `translate(0,${ih})`)
    .call(
      d3.axisBottom(x)
        .tickValues(bucketed.filter((_, i) => i % 3 === 0).map(d => d.label))
    )
    .call(g => {
      g.select('.domain').attr('stroke', RULE);
      g.selectAll('text').attr('fill', MUTE).style('font-size', '11px');
      g.selectAll('line').attr('stroke', RULE);
    });

  // Y axis
  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? d3.format('.1s')(d) : d))
    .call(g => {
      g.select('.domain').remove();
      g.selectAll('text').attr('fill', MUTE).style('font-size', '11px');
      g.selectAll('line').attr('stroke', RULE);
    });

  // X label
  svg.append('text')
    .attr('x', m.left + iw / 2)
    .attr('y', H - 2)
    .attr('text-anchor', 'middle')
    .attr('fill', MUTE)
    .style('font-size', '11px')
    .text('Name length (characters)');

  // Peak annotations
  const peak1x = x('7');
  const peak2x = x('17');
  if (peak1x != null) {
    g.append('text')
      .attr('x', peak1x + x.bandwidth() / 2)
      .attr('y', y(bucketed.find(d => d.label === '7').count) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', RED)
      .style('font-size', '10px')
      .text('simple names');
  }
  if (peak2x != null) {
    g.append('text')
      .attr('x', peak2x + x.bandwidth() / 2 + 18)
      .attr('y', y(bucketed.find(d => d.label === '17').count) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', RED)
      .style('font-size', '10px')
      .text('compound names');
  }
}

// ── Saint bar chart ───────────────────────────────────────────────────────────
export function drawSaintChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = px(container);
  const barH = 22;
  const m = { top: 8, right: 60, bottom: 8, left: 120 };
  const H = data.length * (barH + 4) + m.top + m.bottom;
  const iw = W - m.left - m.right;

  const x = d3.scaleLinear()
    .domain([0, data[0].count])
    .range([0, iw]);

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', '100%')
    .style('display', 'block');

  const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

  const rows = g.selectAll('g.row')
    .data(data)
    .join('g')
    .attr('class', 'row')
    .attr('transform', (_, i) => `translate(0,${i * (barH + 4)})`);

  // Label
  rows.append('text')
    .attr('x', -6)
    .attr('y', barH / 2 + 1)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('fill', INK)
    .style('font-family', 'Georgia, serif')
    .style('font-size', '12px')
    .text(d => `Saint-${d.saint}`);

  // Bar
  rows.append('rect')
    .attr('y', 0)
    .attr('width', d => x(d.count))
    .attr('height', barH)
    .attr('fill', d => d.saint === 'Martin' ? RED : '#c8b89a')
    .attr('rx', 2);

  // Count
  rows.append('text')
    .attr('x', d => x(d.count) + 6)
    .attr('y', barH / 2 + 1)
    .attr('dominant-baseline', 'middle')
    .attr('fill', MUTE)
    .style('font-size', '11px')
    .style('font-variant-numeric', 'tabular-nums')
    .text(d => d.count);
}
