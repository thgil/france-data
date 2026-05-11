import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

function aplColor(apl) {
  if (apl >= 10) return '#1a6b3c';
  if (apl >= 5)  return '#2d9a5a';
  if (apl >= 2.5) return '#7bbf9a';
  return '#d4896e';
}

export function drawTopCommunesChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const communes = stats.top20communes.slice(0, 20);
  const margin = { top: 8, right: 80, bottom: 32, left: 180 };
  const width = Math.min(container.clientWidth || 680, 680) - margin.left - margin.right;
  const height = communes.length * 28;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('role', 'img')
    .attr('aria-label', 'Bar chart: top 20 communes by APL score');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xMax = communes[0].apl * 1.05;
  const x = d3.scaleLinear().domain([0, xMax]).range([0, width]);
  const y = d3.scaleBand()
    .domain(communes.map(d => d.name))
    .range([0, height])
    .padding(0.22);

  // National average line
  const natAvg = stats.national.popWeightedMeanApl;
  g.append('line')
    .attr('x1', x(natAvg)).attr('x2', x(natAvg))
    .attr('y1', -margin.top).attr('y2', height)
    .attr('stroke', '#aaa').attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,3');

  g.append('text')
    .attr('x', x(natAvg) + 3).attr('y', -2)
    .attr('font-size', 10).attr('fill', '#888')
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .text(`national avg ${natAvg}`);

  // Bars
  g.selectAll('.bar')
    .data(communes)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', d => y(d.name))
    .attr('width', d => x(d.apl))
    .attr('height', y.bandwidth())
    .attr('fill', d => aplColor(d.apl))
    .attr('rx', 2);

  // APL value label
  g.selectAll('.val-label')
    .data(communes)
    .join('text')
    .attr('class', 'val-label')
    .attr('x', d => x(d.apl) + 5)
    .attr('y', d => y(d.name) + y.bandwidth() / 2 + 4)
    .attr('font-size', 11)
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .attr('fill', '#444')
    .text(d => d.apl.toFixed(1));

  // Type badge
  g.selectAll('.type-label')
    .data(communes)
    .join('text')
    .attr('class', 'type-label')
    .attr('x', d => x(d.apl) + 40)
    .attr('y', d => y(d.name) + y.bandwidth() / 2 + 4)
    .attr('font-size', 10)
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .attr('fill', '#888')
    .text(d => d.type !== 'commune' ? d.type : '');

  // Y axis (commune names)
  const yAxis = g.append('g').call(d3.axisLeft(y).tickSize(0));
  yAxis.select('.domain').remove();
  yAxis.selectAll('text')
    .attr('font-size', 12)
    .attr('font-family', 'Georgia, serif')
    .attr('fill', '#1a1a1a')
    .attr('dx', -6);

  // X axis
  const xAxis = g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(6).tickSize(3));
  xAxis.select('.domain').attr('stroke', '#ccc');
  xAxis.selectAll('.tick line').attr('stroke', '#ddd');
  xAxis.selectAll('text')
    .attr('font-size', 10)
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .attr('fill', '#888');

  g.append('text')
    .attr('x', width / 2).attr('y', height + 28)
    .attr('text-anchor', 'middle')
    .attr('font-size', 10)
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .attr('fill', '#888')
    .attr('letter-spacing', '0.8px')
    .text('APL SCORE (GP consultations accessible per resident per year)');
}

export function drawDeptChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const topDepts = stats.topDepts.slice(0, 12);
  const bottomDepts = stats.bottomDepts
    .filter(d => /^\d/.test(d.dept))
    .slice(0, 10);

  const margin = { top: 8, right: 60, bottom: 32, left: 160 };
  const width = Math.min(container.clientWidth || 680, 680) - margin.left - margin.right;
  const totalRows = topDepts.length + 1 + bottomDepts.length;
  const rowH = 24;
  const height = totalRows * rowH;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom + 20);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const allDepts = [...topDepts, null, ...bottomDepts];
  const yVals = allDepts.map((d, i) => i);
  const x = d3.scaleLinear().domain([0, 6]).range([0, width]);

  // National average line
  const natAvg = stats.national.popWeightedMeanApl;
  g.append('line')
    .attr('x1', x(natAvg)).attr('x2', x(natAvg))
    .attr('y1', -4).attr('y2', height)
    .attr('stroke', '#bbb').attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,3');

  // Desert threshold line
  g.append('line')
    .attr('x1', x(2.5)).attr('x2', x(2.5))
    .attr('y1', -4).attr('y2', height)
    .attr('stroke', '#e08060').attr('stroke-width', 1)
    .attr('stroke-dasharray', '4,3');

  g.append('text')
    .attr('x', x(2.5) - 3).attr('y', -2)
    .attr('text-anchor', 'end')
    .attr('font-size', 9).attr('fill', '#c06040')
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .text('desert threshold 2.5');

  allDepts.forEach((d, i) => {
    if (!d) {
      // Divider
      g.append('line')
        .attr('x1', -margin.left).attr('x2', width)
        .attr('y1', i * rowH + rowH / 2).attr('y2', i * rowH + rowH / 2)
        .attr('stroke', '#e0d8cc').attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2');
      return;
    }

    const y0 = i * rowH;
    const isTop = i < topDepts.length;
    const barColor = isTop ? '#2d9a5a' : '#d4896e';

    g.append('rect')
      .attr('x', 0)
      .attr('y', y0 + 3)
      .attr('width', x(d.popWeightedApl))
      .attr('height', rowH - 8)
      .attr('fill', barColor)
      .attr('rx', 2)
      .attr('opacity', 0.85);

    g.append('text')
      .attr('x', -6)
      .attr('y', y0 + rowH / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('font-size', 11)
      .attr('font-family', 'Georgia, serif')
      .attr('fill', '#1a1a1a')
      .text(d.name);

    g.append('text')
      .attr('x', x(d.popWeightedApl) + 4)
      .attr('y', y0 + rowH / 2 + 4)
      .attr('font-size', 10)
      .attr('font-family', 'Helvetica Neue, sans-serif')
      .attr('fill', '#555')
      .text(d.popWeightedApl.toFixed(2));
  });

  // X axis
  const xAxis = g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(6).tickSize(3));
  xAxis.select('.domain').attr('stroke', '#ccc');
  xAxis.selectAll('.tick line').attr('stroke', '#ddd');
  xAxis.selectAll('text')
    .attr('font-size', 10)
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .attr('fill', '#888');

  g.append('text')
    .attr('x', width / 2).attr('y', height + 28)
    .attr('text-anchor', 'middle')
    .attr('font-size', 10)
    .attr('font-family', 'Helvetica Neue, sans-serif')
    .attr('fill', '#888')
    .attr('letter-spacing', '0.8px')
    .text('POPULATION-WEIGHTED MEAN APL');
}
