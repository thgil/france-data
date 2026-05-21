// stories/commune-names/charts.js
// Two static SVG charts: top commune names bar chart, name-length histogram.
// Exports: drawTopNames(selector), drawLengthHistogram(selector)

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const PAPER  = '#faf7f2';
const INK    = '#1a1a1a';
const MUTE   = '#888';
const ACCENT = '#b32020';
const RULE   = '#d8d0c0';

const TOP_NAMES = [
  ['Sainte-Colombe',  12],
  ['Saint-Sauveur',   11],
  ['Saint-Aubin',     10],
  ['Beaulieu',        10],
  ['Saint-Marcel',     9],
  ['Saint-Michel',     9],
  ['Le Pin',           9],
  ['Saint-Pierre',     9],
  ['Sainte-Marie',     9],
  ['Saint-Rémy',       8],
  ['Saint-Clément',    8],
  ['Saint-Hilaire',    8],
  ['Saint-Loup',       8],
  ['Beaumont',         8],
  ['Verrières',        8],
  ['Saint-Hippolyte',  8],
  ['Saint-Georges',    8],
  ['Saint-Médard',     8],
  ['Saint-Paul',       8],
  ['Brion',            7],
];

const LENGTH_DIST = [
  [1,1],[2,13],[3,154],[4,720],[5,1969],[6,3223],
  [7,3695],[8,3695],[9,3000],[10,2522],[11,1884],[12,1435],
  [13,1167],[14,1018],[15,1095],[16,1177],[17,1186],[18,1202],
  [19,1117],[20,1028],[21,923],[22,819],[23,649],[24,501],
  [25,329],[26,200],[27,105],[28,55],[29,53],[30,29],
  [31,12],[32,8],[33,2],[34,6],[35,7],[36,2],[37,3],
  [38,3],[39,1],[40,3],[41,1],[43,1],[45,1],
];

// ── Top commune names ─────────────────────────────────────────────────────────

export function drawTopNames(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const isMobile = window.innerWidth < 600;
  const marginLeft = isMobile ? 120 : 160;
  const margin = { top: 16, right: 40, bottom: 24, left: marginLeft };
  const totalW = container.clientWidth || 680;
  const height = TOP_NAMES.length * 28 + margin.top + margin.bottom;
  const width  = Math.min(totalW, 720) - margin.left - margin.right;

  const svg = d3.select(container).append('svg')
    .attr('width',  width  + margin.left + margin.right)
    .attr('height', height + margin.top  + margin.bottom)
    .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
    .style('background', PAPER);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, 13])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(TOP_NAMES.map(d => d[0]))
    .range([0, height - margin.top - margin.bottom])
    .padding(0.25);

  // Grid lines
  g.append('g')
    .selectAll('line')
    .data([2, 4, 6, 8, 10, 12])
    .join('line')
      .attr('x1', d => x(d))
      .attr('x2', d => x(d))
      .attr('y1', 0)
      .attr('y2', height - margin.top - margin.bottom)
      .attr('stroke', RULE)
      .attr('stroke-width', 1);

  // Bars
  g.selectAll('rect')
    .data(TOP_NAMES)
    .join('rect')
      .attr('x', 0)
      .attr('y', d => y(d[0]))
      .attr('width', d => x(d[1]))
      .attr('height', y.bandwidth())
      .attr('fill', (d, i) => i === 0 ? ACCENT : '#c8bfaf');

  // Count labels
  g.selectAll('.count-label')
    .data(TOP_NAMES)
    .join('text')
      .attr('class', 'count-label')
      .attr('x', d => x(d[1]) + 5)
      .attr('y', d => y(d[0]) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', MUTE)
      .attr('font-size', 11)
      .text(d => d[1]);

  // Y axis labels
  g.selectAll('.y-label')
    .data(TOP_NAMES)
    .join('text')
      .attr('class', 'y-label')
      .attr('x', -8)
      .attr('y', d => y(d[0]) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', (d, i) => i === 0 ? INK : '#444')
      .attr('font-size', isMobile ? 11 : 12)
      .attr('font-family', 'Georgia, serif')
      .text(d => d[0]);

  // X axis
  g.append('g')
    .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
    .call(
      d3.axisBottom(x)
        .tickValues([0, 2, 4, 6, 8, 10, 12])
        .tickSize(4)
        .tickFormat(d => d === 0 ? '' : d)
    )
    .call(ax => {
      ax.select('.domain').attr('stroke', RULE);
      ax.selectAll('.tick line').attr('stroke', RULE);
      ax.selectAll('.tick text').attr('fill', MUTE).attr('font-size', 11);
    });

  // X axis label
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height - margin.top - margin.bottom + 20)
    .attr('text-anchor', 'middle')
    .attr('fill', MUTE)
    .attr('font-size', 10)
    .attr('letter-spacing', 1)
    .text('NUMBER OF COMMUNES WITH THIS NAME');
}

// ── Name length histogram ────────────────────────────────────────────────────

export function drawLengthHistogram(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const margin = { top: 16, right: 24, bottom: 48, left: 56 };
  const totalW = container.clientWidth || 680;
  const width  = Math.min(totalW, 720) - margin.left - margin.right;
  const height = 220;

  const svg = d3.select(container).append('svg')
    .attr('width',  width  + margin.left + margin.right)
    .attr('height', height + margin.top  + margin.bottom)
    .style('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif")
    .style('background', PAPER);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const maxLen = 45;
  const allLengths = [];
  for (let l = 1; l <= maxLen; l++) {
    const found = LENGTH_DIST.find(d => d[0] === l);
    allLengths.push([l, found ? found[1] : 0]);
  }

  const x = d3.scaleBand()
    .domain(allLengths.map(d => d[0]))
    .range([0, width])
    .padding(0.05);

  const y = d3.scaleLinear()
    .domain([0, d3.max(allLengths, d => d[1])])
    .nice()
    .range([height, 0]);

  // Horizontal grid
  g.append('g')
    .selectAll('line')
    .data(y.ticks(5))
    .join('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', RULE)
      .attr('stroke-width', 1);

  // Bars — colour the peak (7–8 chars)
  g.selectAll('rect')
    .data(allLengths)
    .join('rect')
      .attr('x', d => x(d[0]))
      .attr('y', d => y(d[1]))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d[1]))
      .attr('fill', d => (d[0] === 7 || d[0] === 8) ? ACCENT : '#c8bfaf');

  // Annotation: "Y — 1 letter"
  const yBar = allLengths.find(d => d[0] === 1);
  if (yBar) {
    const bx = x(1) + x.bandwidth() / 2;
    const by = y(yBar[1]) - 6;
    g.append('line')
      .attr('x1', bx).attr('x2', bx)
      .attr('y1', by).attr('y2', by - 18)
      .attr('stroke', INK).attr('stroke-width', 1);
    g.append('text')
      .attr('x', bx + 4).attr('y', by - 20)
      .attr('fill', INK).attr('font-size', 10)
      .text('"Y"');
  }

  // Annotation: longest = 45
  const longBar = allLengths.find(d => d[0] === 45);
  if (longBar) {
    const bx = x(45) + x.bandwidth() / 2;
    const by = height - 2;
    g.append('line')
      .attr('x1', bx).attr('x2', bx)
      .attr('y1', y(longBar[1]) - 6).attr('y2', y(longBar[1]) - 28)
      .attr('stroke', INK).attr('stroke-width', 1);
    g.append('text')
      .attr('x', bx - 2).attr('y', y(longBar[1]) - 31)
      .attr('fill', INK).attr('font-size', 9)
      .attr('text-anchor', 'middle')
      .text('45 chars');
  }

  // X axis — tick every 5
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3.axisBottom(x)
        .tickValues(allLengths.filter(d => d[0] % 5 === 0).map(d => d[0]))
        .tickSize(4)
    )
    .call(ax => {
      ax.select('.domain').attr('stroke', RULE);
      ax.selectAll('.tick line').attr('stroke', RULE);
      ax.selectAll('.tick text').attr('fill', MUTE).attr('font-size', 11);
    });

  // Y axis
  g.append('g')
    .call(
      d3.axisLeft(y)
        .ticks(5)
        .tickSize(4)
        .tickFormat(d => d >= 1000 ? `${d/1000}k` : d)
    )
    .call(ax => {
      ax.select('.domain').attr('stroke', RULE);
      ax.selectAll('.tick line').attr('stroke', RULE);
      ax.selectAll('.tick text').attr('fill', MUTE).attr('font-size', 11);
    });

  // X label
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height + 38)
    .attr('text-anchor', 'middle')
    .attr('fill', MUTE)
    .attr('font-size', 10)
    .attr('letter-spacing', 1)
    .text('NAME LENGTH (CHARACTERS)');

  // Y label
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -44)
    .attr('text-anchor', 'middle')
    .attr('fill', MUTE)
    .attr('font-size', 10)
    .attr('letter-spacing', 1)
    .text('COMMUNES');
}
