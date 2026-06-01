import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export function drawLengthHistogram(selector, lengthDist) {
  const el = document.querySelector(selector);
  if (!el) return;

  const margin = { top: 12, right: 16, bottom: 48, left: 52 };
  const totalW = el.clientWidth || 680;
  const totalH = 260;
  const w = totalW - margin.left - margin.right;
  const h = totalH - margin.top - margin.bottom;

  // Bin by 1-char increments up to 30, then ">30"
  const cutoff = 30;
  const binned = [];
  let rest = 0;
  for (const { length, count } of lengthDist) {
    if (length <= cutoff) {
      binned.push({ label: String(length), length, count });
    } else {
      rest += count;
    }
  }
  if (rest > 0) binned.push({ label: `>${cutoff}`, length: cutoff + 1, count: rest });

  const x = d3.scaleBand()
    .domain(binned.map(d => d.label))
    .range([0, w])
    .padding(0.15);

  const y = d3.scaleLinear()
    .domain([0, d3.max(binned, d => d.count) * 1.08])
    .range([h, 0]);

  const svg = d3.select(el).append('svg')
    .attr('width', totalW)
    .attr('height', totalH);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Bars
  g.selectAll('rect')
    .data(binned)
    .join('rect')
    .attr('x', d => x(d.label))
    .attr('y', d => y(d.count))
    .attr('width', x.bandwidth())
    .attr('height', d => h - y(d.count))
    .attr('fill', d => {
      if (d.length === 1) return '#c67c00';   // Y — highlight
      if (d.length === 2) return '#e09a20';   // 2-letter club
      return '#c8bfb0';
    });

  // Annotate the peak saint-compound bump (around 15-20)
  const saintPeak = binned.find(d => d.length === 17);
  if (saintPeak) {
    g.append('text')
      .attr('x', x('17') + x.bandwidth() / 2)
      .attr('y', y(saintPeak.count) - 22)
      .attr('text-anchor', 'middle')
      .attr('fill', '#888')
      .attr('font-size', '10px')
      .attr('font-family', 'Helvetica Neue, sans-serif')
      .text('saint compounds');
    g.append('line')
      .attr('x1', x('17') + x.bandwidth() / 2)
      .attr('y1', y(saintPeak.count) - 14)
      .attr('x2', x('17') + x.bandwidth() / 2)
      .attr('y2', y(saintPeak.count) - 4)
      .attr('stroke', '#aaa')
      .attr('stroke-width', 1);
  }

  // Y bar annotation
  const yBar = binned.find(d => d.length === 1);
  if (yBar) {
    g.append('text')
      .attr('x', x('1') + x.bandwidth() / 2)
      .attr('y', y(yBar.count) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#c67c00')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('font-family', 'Helvetica Neue, sans-serif')
      .text('Y');
  }

  // X axis — show every 5 ticks
  const xAxis = d3.axisBottom(x)
    .tickValues(binned.filter(d => d.length % 5 === 0 || d.length <= 3 || d.label.startsWith('>')).map(d => d.label));

  g.append('g')
    .attr('transform', `translate(0,${h})`)
    .call(xAxis)
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('line').attr('stroke', '#ddd'))
    .call(ax => ax.selectAll('text')
      .attr('fill', '#666')
      .attr('font-size', '11px')
      .attr('font-family', 'Helvetica Neue, sans-serif'));

  // Y axis
  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(',d')))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('line').attr('stroke', '#eee'))
    .call(ax => ax.selectAll('text')
      .attr('fill', '#888')
      .attr('font-size', '11px')
      .attr('font-family', 'Helvetica Neue, sans-serif'));

  // Grid
  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(''))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('line')
      .attr('stroke', '#eee')
      .attr('stroke-dasharray', '3,3'));

  // Axis labels
  g.append('text')
    .attr('x', w / 2)
    .attr('y', h + 40)
    .attr('text-anchor', 'middle')
    .attr('fill', '#888')
    .attr('font-size', '11px')
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .text('Name length (characters)');

  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -h / 2)
    .attr('y', -40)
    .attr('text-anchor', 'middle')
    .attr('fill', '#888')
    .attr('font-size', '11px')
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .text('Communes');
}

export function drawTopNamesChart(selector, topNames) {
  const el = document.querySelector(selector);
  if (!el) return;

  const data = topNames.slice(0, 12);
  const margin = { top: 8, right: 52, bottom: 8, left: 160 };
  const totalH = data.length * 32 + margin.top + margin.bottom;
  const totalW = el.clientWidth || 640;
  const w = totalW - margin.left - margin.right;
  const h = totalH - margin.top - margin.bottom;

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count) * 1.15])
    .range([0, w]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, h])
    .padding(0.3);

  const svg = d3.select(el).append('svg')
    .attr('width', totalW)
    .attr('height', totalH);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  g.selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', 0)
    .attr('y', d => y(d.name))
    .attr('width', d => x(d.count))
    .attr('height', y.bandwidth())
    .attr('fill', d => d.name === 'Sainte-Colombe' ? '#c67c00' : '#c8bfb0');

  g.selectAll('.count-label')
    .data(data)
    .join('text')
    .attr('class', 'count-label')
    .attr('x', d => x(d.count) + 5)
    .attr('y', d => y(d.name) + y.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('fill', '#555')
    .attr('font-size', '12px')
    .attr('font-variant-numeric', 'tabular-nums')
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .text(d => `×${d.count}`);

  g.selectAll('.name-label')
    .data(data)
    .join('text')
    .attr('class', 'name-label')
    .attr('x', -8)
    .attr('y', d => y(d.name) + y.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('text-anchor', 'end')
    .attr('fill', d => d.name === 'Sainte-Colombe' ? '#c67c00' : '#222')
    .attr('font-size', '13px')
    .attr('font-family', 'Georgia, serif')
    .text(d => d.name);
}
