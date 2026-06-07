/* charts.js — commune-names story */

const CDN = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js';

function loadD3() {
  return new Promise((resolve, reject) => {
    if (window.d3) { resolve(window.d3); return; }
    const s = document.createElement('script');
    s.src = CDN;
    s.onload = () => resolve(window.d3);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export async function drawLengthChart(selector, lengthDist) {
  const d3 = await loadD3();
  const el = document.querySelector(selector);
  if (!el) return;

  const data = Object.entries(lengthDist)
    .map(([k, v]) => ({ len: +k, count: v }))
    .sort((a, b) => a.len - b.len);

  const totalWidth = el.clientWidth || 820;
  const margin = { top: 20, right: 20, bottom: 48, left: 52 };
  const width = totalWidth - margin.left - margin.right;
  const height = 260 - margin.top - margin.bottom;

  const svg = d3.select(el)
    .append('svg')
    .attr('viewBox', `0 0 ${totalWidth} ${260}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.len))
    .range([0, width])
    .padding(0.05);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([height, 0]);

  // Axes
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3.axisBottom(x)
        .tickValues(data.map(d => d.len).filter((_, i) => i % 5 === 0 || d3.min(data, d => d.len) === data[i]?.len))
        .tickSize(4)
    )
    .call(ax => ax.select('.domain').attr('stroke', '#ccc'))
    .call(ax => ax.selectAll('line').attr('stroke', '#ccc'))
    .call(ax => ax.selectAll('text').attr('font-size', 11).attr('fill', '#666'));

  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(d => d >= 1000 ? `${d/1000}k` : d))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('line').attr('stroke', '#ece8e0'))
    .call(ax => ax.selectAll('text').attr('font-size', 11).attr('fill', '#666'));

  // Bars
  g.selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', d => x(d.len))
    .attr('y', d => y(d.count))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.count))
    .attr('fill', d => (d.len === 1 || d.len >= 40) ? '#b32020' : '#b8a88a');

  // Callout: Y (1 char)
  const yBar = data.find(d => d.len === 1);
  if (yBar) {
    const bx = x(1) + x.bandwidth() / 2;
    const by = y(yBar.count) - 6;
    g.append('text')
      .attr('x', bx).attr('y', by)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10).attr('fill', '#b32020')
      .text('Y');
  }

  // Callout: 45-char champion
  const champBar = data.find(d => d.len === 45);
  if (champBar) {
    const bx = x(45) + x.bandwidth() / 2;
    const by = y(champBar.count) - 6;
    g.append('text')
      .attr('x', bx).attr('y', by)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10).attr('fill', '#b32020')
      .text('45');
  }

  // X-axis label
  g.append('text')
    .attr('x', width / 2).attr('y', height + 42)
    .attr('text-anchor', 'middle')
    .attr('font-size', 11).attr('fill', '#888')
    .text('Name length (characters)');

  // Y-axis label
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2).attr('y', -42)
    .attr('text-anchor', 'middle')
    .attr('font-size', 11).attr('fill', '#888')
    .text('Number of communes');
}

export async function drawRepeatedChart(selector, topRepeated) {
  const d3 = await loadD3();
  const el = document.querySelector(selector);
  if (!el) return;

  const data = topRepeated.slice(0, 10);

  const totalWidth = el.clientWidth || 820;
  const margin = { top: 10, right: 60, bottom: 16, left: 220 };
  const barHeight = 28;
  const height = data.length * barHeight;
  const totalHeight = height + margin.top + margin.bottom;
  const width = totalWidth - margin.left - margin.right;

  const svg = d3.select(el)
    .append('svg')
    .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, height])
    .padding(0.25);

  // Bars
  g.selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', 0)
    .attr('y', d => y(d.name))
    .attr('width', d => x(d.count))
    .attr('height', y.bandwidth())
    .attr('fill', '#b8a88a');

  // Count labels
  g.selectAll('.count')
    .data(data)
    .join('text')
    .attr('class', 'count')
    .attr('x', d => x(d.count) + 6)
    .attr('y', d => y(d.name) + y.bandwidth() / 2 + 4)
    .attr('font-size', 12)
    .attr('fill', '#555')
    .text(d => `×${d.count}`);

  // Name labels
  g.selectAll('.name')
    .data(data)
    .join('text')
    .attr('class', 'name')
    .attr('x', -8)
    .attr('y', d => y(d.name) + y.bandwidth() / 2 + 4)
    .attr('text-anchor', 'end')
    .attr('font-size', 13)
    .attr('font-style', 'italic')
    .attr('fill', '#1a1a1a')
    .text(d => d.name);
}
