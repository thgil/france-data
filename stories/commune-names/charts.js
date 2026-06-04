/* commune-names/charts.js — D3 v7 charts for the commune names story */

const MARGIN = { top: 8, right: 40, bottom: 8, left: 148 };
const BAR_H  = 22;
const GAP    = 4;

function hbarChart(selector, items, valueKey, labelKey, color) {
  const el = document.querySelector(selector);
  if (!el) return;

  const n      = items.length;
  const height = n * (BAR_H + GAP) - GAP + MARGIN.top + MARGIN.bottom;
  const width  = el.clientWidth || 600;
  const inner  = width - MARGIN.left - MARGIN.right;

  const max = d3.max(items, d => d[valueKey]);

  const x = d3.scaleLinear().domain([0, max]).range([0, inner]);
  const y = d3.scaleBand()
    .domain(items.map(d => d[labelKey]))
    .range([0, n * (BAR_H + GAP)])
    .paddingInner(GAP / (BAR_H + GAP));

  const svg = d3.select(el)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('aria-hidden', 'true');

  const g = svg.append('g')
    .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  // Bars
  g.selectAll('rect')
    .data(items)
    .join('rect')
    .attr('y', d => y(d[labelKey]))
    .attr('height', y.bandwidth())
    .attr('width', d => x(d[valueKey]))
    .attr('fill', color);

  // Value labels
  g.selectAll('.val')
    .data(items)
    .join('text')
    .attr('class', 'val')
    .attr('x', d => x(d[valueKey]) + 5)
    .attr('y', d => y(d[labelKey]) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('font-family', 'var(--sans, Helvetica Neue, sans-serif)')
    .attr('font-size', 11)
    .attr('fill', '#555')
    .text(d => d[valueKey].toLocaleString('fr-FR'));

  // Item labels (left side)
  g.selectAll('.lbl')
    .data(items)
    .join('text')
    .attr('class', 'lbl')
    .attr('x', -6)
    .attr('y', d => y(d[labelKey]) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('font-family', 'Georgia, serif')
    .attr('font-size', 12)
    .attr('fill', '#1a1a1a')
    .text(d => d[labelKey]);
}

function lengthHistogram(selector, items) {
  const el = document.querySelector(selector);
  if (!el) return;

  // Group lengths into buckets of 2 up to 30+
  const buckets = [];
  for (let lo = 1; lo <= 29; lo += 2) {
    const hi = lo + 1;
    const count = items
      .filter(d => d.length >= lo && d.length <= hi)
      .reduce((s, d) => s + d.count, 0);
    buckets.push({ label: lo === 29 ? '29–45' : `${lo}–${hi}`, lo, count });
  }
  // 30+
  const overCount = items.filter(d => d.length >= 30).reduce((s, d) => s + d.count, 0);
  buckets[buckets.length - 1].count += overCount;
  buckets[buckets.length - 1].label = '29+';

  const marginH = { top: 12, right: 20, bottom: 36, left: 52 };
  const width  = el.clientWidth || 600;
  const height = 180;
  const innerW = width - marginH.left - marginH.right;
  const innerH = height - marginH.top - marginH.bottom;

  const x = d3.scaleBand()
    .domain(buckets.map(d => d.label))
    .range([0, innerW])
    .padding(0.08);

  const yH = d3.scaleLinear()
    .domain([0, d3.max(buckets, d => d.count)])
    .range([innerH, 0])
    .nice();

  const svg = d3.select(el)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('aria-hidden', 'true');

  const g = svg.append('g')
    .attr('transform', `translate(${marginH.left},${marginH.top})`);

  // Gridlines
  g.selectAll('.grid')
    .data(yH.ticks(4))
    .join('line')
    .attr('class', 'grid')
    .attr('x1', 0).attr('x2', innerW)
    .attr('y1', d => yH(d)).attr('y2', d => yH(d))
    .attr('stroke', '#e0d8cc')
    .attr('stroke-width', 1);

  // Bars
  g.selectAll('rect')
    .data(buckets)
    .join('rect')
    .attr('x', d => x(d.label))
    .attr('y', d => yH(d.count))
    .attr('width', x.bandwidth())
    .attr('height', d => innerH - yH(d.count))
    .attr('fill', '#8b6914');

  // X axis labels
  g.selectAll('.xl')
    .data(buckets)
    .join('text')
    .attr('class', 'xl')
    .attr('x', d => x(d.label) + x.bandwidth() / 2)
    .attr('y', innerH + 14)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'var(--sans, Helvetica Neue, sans-serif)')
    .attr('font-size', 9)
    .attr('fill', '#666')
    .text(d => d.label);

  // Y axis labels
  g.selectAll('.yl')
    .data(yH.ticks(4))
    .join('text')
    .attr('class', 'yl')
    .attr('x', -5)
    .attr('y', d => yH(d))
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('font-family', 'var(--sans, Helvetica Neue, sans-serif)')
    .attr('font-size', 9)
    .attr('fill', '#888')
    .text(d => d >= 1000 ? `${d / 1000}k` : d);

  // Axis label
  g.append('text')
    .attr('x', innerW / 2)
    .attr('y', innerH + 30)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'var(--sans, Helvetica Neue, sans-serif)')
    .attr('font-size', 10)
    .attr('fill', '#888')
    .text('name length (characters)');
}

export function drawCharts(stats) {
  hbarChart('#chart-top-names', stats.topNames, 'count', 'name', '#8b6914');
  hbarChart('#chart-top-words', stats.topWords, 'count', 'word', '#2a6496');
  lengthHistogram('#chart-length', stats.lengthDist);
}
