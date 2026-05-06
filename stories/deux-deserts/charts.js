/* deux-deserts — scatter + bar charts via D3 v7 */
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const COLORS = {
  paris: '#b32020',
  idf:   '#d97706',
  other: '#94a3b8',
};

const LABEL_DEPTS = new Set([
  '75', '77', '78', '91', '95', '48', '2B', '29', '15', '23', '67',
]);

export function drawScatter(selector, stats) {
  const depts = stats.departments;
  const container = document.querySelector(selector);
  const W = Math.min(container.clientWidth || 680, 740);
  const H = Math.round(W * 0.62);
  const M = { top: 20, right: 20, bottom: 52, left: 52 };
  const iW = W - M.left - M.right;
  const iH = H - M.top - M.bottom;

  const svg = d3.select(selector)
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', '100%')
    .style('font-family', 'var(--sans, Helvetica Neue, sans-serif)');

  const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(depts, d => d.barsPer10k) * 1.08])
    .range([0, iW]);

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([iH, 0]);

  // Grid lines
  g.append('g')
    .attr('stroke', '#e5e0d8')
    .attr('stroke-width', 0.5)
    .selectAll('line')
    .data(y.ticks(5))
    .join('line')
    .attr('x1', 0).attr('x2', iW)
    .attr('y1', d => y(d)).attr('y2', d => y(d));

  // APL 2.5 threshold — horizontal reference at 50% (rough national median)
  // Instead, draw a subtle reference at nationalDesertPct
  g.append('line')
    .attr('x1', 0).attr('x2', iW)
    .attr('y1', y(stats.nationalDesertPct))
    .attr('y2', y(stats.nationalDesertPct))
    .attr('stroke', '#b32020')
    .attr('stroke-width', 0.8)
    .attr('stroke-dasharray', '4,3')
    .attr('opacity', 0.5);

  g.append('text')
    .attr('x', iW - 4)
    .attr('y', y(stats.nationalDesertPct) - 5)
    .attr('text-anchor', 'end')
    .attr('font-size', 10)
    .attr('fill', '#b32020')
    .attr('opacity', 0.8)
    .text(`national avg ${stats.nationalDesertPct}%`);

  // Axes
  g.append('g')
    .attr('transform', `translate(0,${iH})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d => d.toFixed(0)))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('text').attr('font-size', 11).attr('fill', '#555'));

  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('text').attr('font-size', 11).attr('fill', '#555'));

  // Axis labels
  g.append('text')
    .attr('x', iW / 2).attr('y', iH + 42)
    .attr('text-anchor', 'middle')
    .attr('font-size', 12).attr('fill', '#555')
    .text('Bars per 10,000 residents');

  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -iH / 2).attr('y', -40)
    .attr('text-anchor', 'middle')
    .attr('font-size', 12).attr('fill', '#555')
    .text('Communes below APL 2.5 threshold (%)');

  // IDF annotation box (background)
  const idfDepts = depts.filter(d => d.group === 'idf' && d.dept !== '75');
  if (idfDepts.length) {
    const pad = 14;
    const x0 = d3.min(idfDepts, d => x(d.barsPer10k)) - pad;
    const x1 = d3.max(idfDepts, d => x(d.barsPer10k)) + pad;
    const y0 = d3.min(idfDepts, d => y(d.desertPct)) - pad;
    const y1 = d3.max(idfDepts, d => y(d.desertPct)) + pad;
    g.append('rect')
      .attr('x', x0).attr('y', y0)
      .attr('width', x1 - x0).attr('height', y1 - y0)
      .attr('rx', 4)
      .attr('fill', 'none')
      .attr('stroke', '#d97706')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,3')
      .attr('opacity', 0.7);
    g.append('text')
      .attr('x', (x0 + x1) / 2).attr('y', y0 - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10).attr('fill', '#d97706')
      .text('IDF suburbs');
  }

  // Dots
  const dot = g.selectAll('circle')
    .data(depts)
    .join('circle')
    .attr('cx', d => x(d.barsPer10k))
    .attr('cy', d => y(d.desertPct))
    .attr('r', d => d.group === 'paris' ? 7 : 5)
    .attr('fill', d => COLORS[d.group])
    .attr('opacity', d => d.group === 'other' ? 0.55 : 0.85)
    .attr('stroke', d => d.group === 'other' ? 'none' : '#fff')
    .attr('stroke-width', 1.5);

  // Tooltip
  const tip = d3.select('body').append('div')
    .style('position', 'fixed')
    .style('pointer-events', 'none')
    .style('background', '#1a1a1a')
    .style('color', '#faf7f2')
    .style('font-family', 'var(--sans, Helvetica Neue, sans-serif)')
    .style('font-size', '13px')
    .style('line-height', '1.5')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('opacity', 0)
    .style('z-index', 1000)
    .style('white-space', 'nowrap');

  dot
    .on('mouseenter', (e, d) => {
      tip
        .style('opacity', 1)
        .html(
          `<strong>${d.name}</strong> (${d.dept})<br>` +
          `${d.barsPer10k.toFixed(1)} bars / 10k residents<br>` +
          `${d.desertPct.toFixed(1)}% communes below APL 2.5`
        );
    })
    .on('mousemove', e => {
      tip
        .style('left', `${e.clientX + 14}px`)
        .style('top', `${e.clientY - 10}px`);
    })
    .on('mouseleave', () => tip.style('opacity', 0));

  // Labels for key departments
  const labelData = depts.filter(d => LABEL_DEPTS.has(d.dept));
  const labelOffset = {
    '75': [8, -8],   '77': [8, 4],   '78': [8, -6],
    '91': [-6, 10],  '95': [8, 4],   '48': [6, -8],
    '2B': [6, -8],   '29': [6, 8],   '15': [6, -8],
    '23': [6, 8],    '67': [8, 4],
  };
  g.selectAll('.dept-label')
    .data(labelData)
    .join('text')
    .attr('class', 'dept-label')
    .attr('x', d => x(d.barsPer10k) + (labelOffset[d.dept]?.[0] ?? 8))
    .attr('y', d => y(d.desertPct) + (labelOffset[d.dept]?.[1] ?? 4))
    .attr('font-size', 10)
    .attr('fill', d => COLORS[d.group])
    .attr('font-weight', d => d.group !== 'other' ? '600' : '400')
    .text(d => d.name);

  // Legend
  const legendData = [
    { label: 'Paris', color: COLORS.paris },
    { label: 'IDF suburbs', color: COLORS.idf },
    { label: 'Other départements', color: COLORS.other },
  ];
  const leg = g.append('g').attr('transform', `translate(${iW - 160}, 4)`);
  legendData.forEach((item, i) => {
    leg.append('circle')
      .attr('cx', 0).attr('cy', i * 18)
      .attr('r', 5)
      .attr('fill', item.color)
      .attr('opacity', item.label === 'Other départements' ? 0.6 : 0.9);
    leg.append('text')
      .attr('x', 10).attr('y', i * 18 + 4)
      .attr('font-size', 11).attr('fill', '#444')
      .text(item.label);
  });
}

export function drawBarChart(selector, stats) {
  const depts = [...stats.departments].sort((a, b) => a.barsPer10k - b.barsPer10k).slice(0, 12);
  const container = document.querySelector(selector);
  const W = Math.min(container.clientWidth || 680, 720);
  const H = Math.round(depts.length * 36 + 48);
  const M = { top: 12, right: 120, bottom: 32, left: 148 };
  const iW = W - M.left - M.right;
  const iH = H - M.top - M.bottom;

  const svg = d3.select(selector)
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', '100%')
    .style('font-family', 'var(--sans, Helvetica Neue, sans-serif)');

  const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(depts, d => d.barsPer10k) * 1.15])
    .range([0, iW]);

  const y = d3.scaleBand()
    .domain(depts.map(d => d.dept))
    .range([0, iH])
    .padding(0.25);

  // Bars
  g.selectAll('rect')
    .data(depts)
    .join('rect')
    .attr('x', 0)
    .attr('y', d => y(d.dept))
    .attr('width', d => x(d.barsPer10k))
    .attr('height', y.bandwidth())
    .attr('fill', d => COLORS[d.group])
    .attr('opacity', 0.85);

  // Dept name labels
  g.selectAll('.name')
    .data(depts)
    .join('text')
    .attr('class', 'name')
    .attr('x', -8)
    .attr('y', d => y(d.dept) + y.bandwidth() / 2 + 4)
    .attr('text-anchor', 'end')
    .attr('font-size', 12)
    .attr('fill', '#333')
    .text(d => d.name);

  // Value labels
  g.selectAll('.val')
    .data(depts)
    .join('text')
    .attr('class', 'val')
    .attr('x', d => x(d.barsPer10k) + 6)
    .attr('y', d => y(d.dept) + y.bandwidth() / 2 + 4)
    .attr('font-size', 11)
    .attr('fill', '#555')
    .text(d => d.barsPer10k.toFixed(1));

  // Desert % annotation on right
  g.selectAll('.desert-ann')
    .data(depts)
    .join('text')
    .attr('class', 'desert-ann')
    .attr('x', iW + 8)
    .attr('y', d => y(d.dept) + y.bandwidth() / 2 + 4)
    .attr('font-size', 11)
    .attr('fill', d => d.desertPct > 50 ? '#b32020' : '#888')
    .text(d => `${d.desertPct.toFixed(0)}% desert`);

  // X axis
  g.append('g')
    .attr('transform', `translate(0,${iH})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d => d.toFixed(0)))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('text').attr('font-size', 10).attr('fill', '#666'));

  g.append('text')
    .attr('x', iW / 2).attr('y', iH + 28)
    .attr('text-anchor', 'middle')
    .attr('font-size', 11).attr('fill', '#666')
    .text('Bars per 10,000 residents');

  // Column header for desert %
  g.append('text')
    .attr('x', iW + 8).attr('y', -6)
    .attr('font-size', 10).attr('fill', '#888')
    .text('Medical');
  g.append('text')
    .attr('x', iW + 8).attr('y', 6)
    .attr('font-size', 10).attr('fill', '#888')
    .text('desert');
}
