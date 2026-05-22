// stories/baguette-capital/charts.js
// Two D3 charts: horizontal bar (top communes by per-capita)
//                scatter (log population vs per-capita).

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const DEPT_COLOR = {
  '75': '#8b4513',  // Paris – dark red
  '92': '#c67c00',  // Hauts-de-Seine – amber
  '93': '#d4903a',  // Seine-Saint-Denis – amber-light
  '94': '#b8860b',  // Val-de-Marne – dark gold
  '77': '#2d6a4f',  // Seine-et-Marne – forest green
  '78': '#40916c',  // Yvelines – mid green
  '91': '#52b788',  // Essonne – light green
  '95': '#74c69d',  // Val-d'Oise – pale green
};
const DEPT_LABEL = {
  '75': 'Paris (75)',
  '92': 'Hauts-de-Seine (92)', '93': 'Seine-Saint-Denis (93)', '94': 'Val-de-Marne (94)',
  '77': 'Seine-et-Marne (77)', '78': 'Yvelines (78)', '91': 'Essonne (91)', '95': "Val-d'Oise (95)",
};

// ── Tooltip helper ───────────────────────────────────────────────────────────
function makeTooltip() {
  return d3.select('body').append('div')
    .attr('class', 'chart-tooltip')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('display', 'none')
    .style('background', '#faf7f2')
    .style('border', '1px solid #b8b0a0')
    .style('border-radius', '3px')
    .style('padding', '8px 11px')
    .style('font-family', "'Helvetica Neue', Helvetica, sans-serif")
    .style('font-size', '12px')
    .style('line-height', '1.5')
    .style('color', '#1a1a1a')
    .style('max-width', '220px')
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.12)')
    .style('z-index', '9999');
}

function showTooltip(tip, html, event) {
  tip.html(html).style('display', 'block');
  const x = event.pageX + 14;
  const y = event.pageY - 28;
  const w = tip.node().offsetWidth;
  tip
    .style('left', (x + w > window.innerWidth ? x - w - 20 : x) + 'px')
    .style('top', y + 'px');
}

function hideTooltip(tip) {
  tip.style('display', 'none');
}

// ── Bar chart: top communes by per-capita ────────────────────────────────────
export function drawTopBar(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = stats.topMeaningful.slice(0, 25);

  const margin = { top: 8, right: 60, bottom: 36, left: 200 };
  const W = container.clientWidth || 660;
  const rowH = 24;
  const height = data.length * rowH + margin.top + margin.bottom;
  const innerW = W - margin.left - margin.right;
  const innerH = data.length * rowH;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${height}`)
    .attr('width', '100%')
    .style('overflow', 'visible');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const xMax = Math.ceil(data[0].per10k / 5) * 5;
  const x = d3.scaleLinear().domain([0, xMax]).range([0, innerW]);
  const y = d3.scaleBand().domain(data.map((_, i) => i)).range([0, innerH]).padding(0.18);

  // Grid lines
  g.append('g').attr('class', 'grid')
    .selectAll('line')
    .data(x.ticks(5))
    .join('line')
      .attr('x1', d => x(d)).attr('x2', d => x(d))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#e0d8cc').attr('stroke-dasharray', '3,3');

  // Bars
  const tip = makeTooltip();

  g.selectAll('.bar')
    .data(data)
    .join('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (_, i) => y(i))
      .attr('width', d => x(d.per10k))
      .attr('height', y.bandwidth())
      .attr('fill', d => DEPT_COLOR[d.dept] || '#888')
      .attr('rx', 2)
      .on('mouseover', (event, d) => {
        showTooltip(tip, `<strong style="font-family:Georgia,serif">${d.name}</strong><br>
          <span style="color:#666">${DEPT_LABEL[d.dept] || d.dept}</span><br>
          ${d.bakeries} baker${d.bakeries === 1 ? 'y' : 'ies'} · pop ${d.pop.toLocaleString('fr-FR')}<br>
          <strong>${d.per10k.toFixed(1)}</strong> per 10,000`, event);
      })
      .on('mousemove', (event, d) => showTooltip(tip,
        `<strong style="font-family:Georgia,serif">${d.name}</strong><br>
        <span style="color:#666">${DEPT_LABEL[d.dept] || d.dept}</span><br>
        ${d.bakeries} baker${d.bakeries === 1 ? 'y' : 'ies'} · pop ${d.pop.toLocaleString('fr-FR')}<br>
        <strong>${d.per10k.toFixed(1)}</strong> per 10,000`, event))
      .on('mouseout', () => hideTooltip(tip));

  // Value labels
  g.selectAll('.val-label')
    .data(data)
    .join('text')
      .attr('class', 'val-label')
      .attr('x', d => x(d.per10k) + 5)
      .attr('y', (_, i) => y(i) + y.bandwidth() / 2 + 4)
      .attr('font-family', "'Helvetica Neue', Helvetica, sans-serif")
      .attr('font-size', 11)
      .attr('fill', '#444')
      .text(d => d.per10k.toFixed(1));

  // Y axis labels
  g.selectAll('.y-label')
    .data(data)
    .join('text')
      .attr('class', 'y-label')
      .attr('x', -6)
      .attr('y', (_, i) => y(i) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('font-family', 'Georgia, serif')
      .attr('font-size', 12)
      .attr('fill', '#1a1a1a')
      .text(d => d.name);

  // X axis
  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(4))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('line').attr('stroke', '#ccc'))
    .call(ax => ax.selectAll('text')
      .attr('font-family', "'Helvetica Neue', Helvetica, sans-serif")
      .attr('font-size', 11)
      .attr('fill', '#666'));

  g.append('text')
    .attr('x', innerW / 2).attr('y', innerH + 32)
    .attr('text-anchor', 'middle')
    .attr('font-family', "'Helvetica Neue', Helvetica, sans-serif")
    .attr('font-size', 11).attr('fill', '#888')
    .text('Bakeries per 10,000 residents');
}

// ── Scatter: log(population) vs per-10k ─────────────────────────────────────
export function drawScatter(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const raw = stats.allCommunes;
  // Cap per10k at 45 to keep axis clean; flag outliers
  const data = raw.map(d => ({ ...d, per10kCapped: Math.min(d.per10k, 45) }));

  const margin = { top: 20, right: 24, bottom: 48, left: 52 };
  const W = container.clientWidth || 680;
  const H = Math.round(W * 0.56);
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', '100%')
    .style('overflow', 'visible');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLog().domain([200, 300000]).range([0, innerW]).clamp(true);
  const y = d3.scaleLinear().domain([0, 45]).range([innerH, 0]);

  // Grid
  [5, 10, 15, 20, 25, 30, 35, 40].forEach(v => {
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(v)).attr('y2', y(v))
      .attr('stroke', '#e0d8cc').attr('stroke-dasharray', '3,3');
  });
  [300, 1000, 3000, 10000, 30000, 100000, 300000].forEach(v => {
    g.append('line')
      .attr('x1', x(v)).attr('x2', x(v))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#e0d8cc').attr('stroke-dasharray', '3,3');
  });

  const tip = makeTooltip();

  // Dots
  g.selectAll('.dot')
    .data(data)
    .join('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(Math.max(d.pop, 200)))
      .attr('cy', d => y(d.per10kCapped))
      .attr('r', 4)
      .attr('fill', d => DEPT_COLOR[d.dept] || '#888')
      .attr('fill-opacity', 0.65)
      .attr('stroke', 'none')
      .on('mouseover', (event, d) => {
        d3.select(event.target).attr('r', 6).attr('fill-opacity', 1);
        showTooltip(tip, `<strong style="font-family:Georgia,serif">${d.name}</strong><br>
          <span style="color:#666">${DEPT_LABEL[d.dept] || d.dept}</span><br>
          ${d.bakeries} baker${d.bakeries === 1 ? 'y' : 'ies'} · pop ${d.pop.toLocaleString('fr-FR')}<br>
          <strong>${d.per10k.toFixed(1)}</strong> per 10,000${d.per10k > 45 ? ' (off-chart)' : ''}`, event);
      })
      .on('mousemove', (event, d) => showTooltip(tip,
        `<strong style="font-family:Georgia,serif">${d.name}</strong><br>
        <span style="color:#666">${DEPT_LABEL[d.dept] || d.dept}</span><br>
        ${d.bakeries} baker${d.bakeries === 1 ? 'y' : 'ies'} · pop ${d.pop.toLocaleString('fr-FR')}<br>
        <strong>${d.per10k.toFixed(1)}</strong> per 10,000${d.per10k > 45 ? ' (off-chart)' : ''}`, event))
      .on('mouseout', (event) => {
        d3.select(event.target).attr('r', 4).attr('fill-opacity', 0.65);
        hideTooltip(tip);
      });

  // Axes
  const xAxis = d3.axisBottom(x)
    .tickValues([300, 1000, 3000, 10000, 30000, 100000])
    .tickFormat(d => d >= 1000 ? (d / 1000) + 'k' : d)
    .tickSize(4);

  g.append('g').attr('transform', `translate(0,${innerH})`)
    .call(xAxis)
    .call(ax => ax.select('.domain').attr('stroke', '#ccc'))
    .call(ax => ax.selectAll('line').attr('stroke', '#ccc'))
    .call(ax => ax.selectAll('text')
      .attr('font-family', "'Helvetica Neue', Helvetica, sans-serif")
      .attr('font-size', 11).attr('fill', '#666'));

  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickSize(4))
    .call(ax => ax.select('.domain').attr('stroke', '#ccc'))
    .call(ax => ax.selectAll('line').attr('stroke', '#ccc'))
    .call(ax => ax.selectAll('text')
      .attr('font-family', "'Helvetica Neue', Helvetica, sans-serif")
      .attr('font-size', 11).attr('fill', '#666'));

  // Axis labels
  g.append('text')
    .attr('x', innerW / 2).attr('y', innerH + 42)
    .attr('text-anchor', 'middle')
    .attr('font-family', "'Helvetica Neue', Helvetica, sans-serif")
    .attr('font-size', 11).attr('fill', '#888')
    .text('Commune population (log scale)');

  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerH / 2).attr('y', -40)
    .attr('text-anchor', 'middle')
    .attr('font-family', "'Helvetica Neue', Helvetica, sans-serif")
    .attr('font-size', 11).attr('fill', '#888')
    .text('Bakeries per 10,000 residents');

  // Legend
  const depts = ['75', '92', '93', '94', '77', '78', '91', '95'];
  const shortLabel = {
    '75': 'Paris', '92': 'Hauts-de-S.', '93': 'Seine-S.-D.', '94': 'Val-de-M.',
    '77': 'Seine-et-M.', '78': 'Yvelines', '91': 'Essonne', '95': "Val-d'Oise",
  };
  const leg = g.append('g').attr('transform', `translate(${innerW - 160}, 4)`);
  depts.forEach((dept, i) => {
    const row = leg.append('g').attr('transform', `translate(0, ${i * 15})`);
    row.append('circle').attr('r', 5).attr('cx', 5).attr('cy', 0)
      .attr('fill', DEPT_COLOR[dept]).attr('fill-opacity', 0.8);
    row.append('text').attr('x', 14).attr('y', 4)
      .attr('font-family', "'Helvetica Neue', Helvetica, sans-serif")
      .attr('font-size', 10).attr('fill', '#444')
      .text(shortLabel[dept]);
  });
}
