import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const ACCENT = '#b32020';
const INK_MUTE = '#666';
const RULE = '#e0d8cc';

const lengthData = [
  { len: 1,  count: 1    },
  { len: 2,  count: 13   },
  { len: 3,  count: 154  },
  { len: 4,  count: 720  },
  { len: 5,  count: 1969 },
  { len: 6,  count: 3223 },
  { len: 7,  count: 3695 },
  { len: 8,  count: 3695 },
  { len: 9,  count: 3000 },
  { len: 10, count: 2522 },
  { len: 11, count: 1884 },
  { len: 12, count: 1435 },
  { len: 13, count: 1167 },
  { len: 14, count: 1018 },
  { len: 15, count: 1095 },
  { len: 16, count: 1177 },
  { len: 17, count: 1186 },
  { len: 18, count: 1202 },
  { len: 19, count: 1117 },
  { len: 20, count: 1028 },
  { len: 21, count: 923  },
  { len: 22, count: 819  },
  { len: 23, count: 649  },
  { len: 24, count: 501  },
  { len: 25, count: 329  },
  { len: 26, count: 200  },
  { len: 27, count: 105  },
  { len: 28, count: 55   },
  { len: 29, count: 53   },
  { len: 30, count: 29   },
  { len: 31, count: 50   },  // 31+ combined
];

const saintData = [
  { name: 'Saint-Martin',  count: 202 },
  { name: 'Saint-Jean',    count: 155 },
  { name: 'Saint-Pierre',  count: 144 },
  { name: 'Saint-Germain', count: 108 },
  { name: 'Saint-Julien',  count: 78  },
  { name: 'Saint-Laurent', count: 77  },
  { name: 'Saint-Hilaire', count: 68  },
  { name: 'Saint-Georges', count: 67  },
  { name: 'Saint-Étienne', count: 65  },
  { name: 'Saint-André',   count: 64  },
];

const duplicateData = [
  { name: 'Sainte-Colombe', count: 12 },
  { name: 'Saint-Sauveur',  count: 11 },
  { name: 'Saint-Aubin',    count: 10 },
  { name: 'Beaulieu',       count: 10 },
  { name: 'Saint-Marcel',   count: 9  },
  { name: 'Saint-Michel',   count: 9  },
  { name: 'Le Pin',         count: 9  },
  { name: 'Saint-Pierre',   count: 9  },
  { name: 'Sainte-Marie',   count: 9  },
  { name: 'Saint-Rémy',     count: 8  },
];

function drawLengthChart(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const totalW = container.clientWidth || 640;
  const margin = { top: 24, right: 24, bottom: 48, left: 52 };
  const width  = totalW - margin.left - margin.right;
  const height = 260;

  const svg = d3.select(selector)
    .attr('viewBox', `0 0 ${totalW} ${height + margin.top + margin.bottom}`)
    .attr('height', height + margin.top + margin.bottom);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(lengthData.map(d => d.len))
    .range([0, width])
    .padding(0.15);

  const y = d3.scaleLinear()
    .domain([0, d3.max(lengthData, d => d.count)])
    .nice()
    .range([height, 0]);

  // Gridlines
  g.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y).tickSize(-width).tickFormat('').ticks(5))
    .call(gr => gr.select('.domain').remove())
    .call(gr => gr.selectAll('line').attr('stroke', RULE).attr('stroke-dasharray', '2,3'));

  // Bars
  g.selectAll('rect')
    .data(lengthData)
    .join('rect')
      .attr('x', d => x(d.len))
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.count))
      .attr('fill', d => (d.len === 7 || d.len === 8) ? ACCENT : '#c8a87a')
      .attr('opacity', 0.85);

  // X axis — only show select labels
  const xLabels = [1, 5, 10, 15, 20, 25, 30, 31];
  const xAxis = d3.axisBottom(x)
    .tickValues(xLabels)
    .tickFormat(d => d === 31 ? '31+' : String(d));

  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
    .call(ax => ax.select('.domain').attr('stroke', '#ccc'))
    .call(ax => ax.selectAll('text')
      .attr('font-size', 11)
      .attr('fill', INK_MUTE))
    .call(ax => ax.selectAll('line').attr('stroke', '#ccc'));

  // Y axis
  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? (d/1000) + 'k' : d))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('text').attr('font-size', 11).attr('fill', INK_MUTE))
    .call(ax => ax.selectAll('line').remove());

  // X-axis label
  svg.append('text')
    .attr('x', margin.left + width / 2)
    .attr('y', height + margin.top + margin.bottom - 2)
    .attr('text-anchor', 'middle')
    .attr('font-size', 11)
    .attr('fill', INK_MUTE)
    .text('Characters in commune name');

  // Annotation: Y (len 1)
  const yBarX = x(1) + x.bandwidth() / 2 + margin.left;
  const yBarY = y(1) + margin.top;
  svg.append('line')
    .attr('x1', yBarX).attr('y1', yBarY - 4)
    .attr('x2', yBarX).attr('y2', yBarY - 22)
    .attr('stroke', '#888').attr('stroke-width', 1);
  svg.append('text')
    .attr('x', yBarX + 4).attr('y', yBarY - 24)
    .attr('font-size', 10).attr('fill', '#555')
    .text('Y (1 char, pop. 89)');

  // Annotation: peak
  const peakX = x(7) + x.bandwidth() / 2 + margin.left;
  const peakY = y(3695) + margin.top;
  svg.append('text')
    .attr('x', peakX).attr('y', peakY - 6)
    .attr('text-anchor', 'middle')
    .attr('font-size', 10).attr('fill', ACCENT)
    .text('peak: 7–8 chars');
}

function drawSaintsChart(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const totalW = container.clientWidth || 640;
  const margin = { top: 12, right: 48, bottom: 16, left: 116 };
  const rowH   = 28;
  const height = saintData.length * rowH;

  const svg = d3.select(selector)
    .attr('viewBox', `0 0 ${totalW} ${height + margin.top + margin.bottom}`)
    .attr('height', height + margin.top + margin.bottom);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const innerW = totalW - margin.left - margin.right;

  const x = d3.scaleLinear()
    .domain([0, d3.max(saintData, d => d.count)])
    .range([0, innerW]);

  const y = d3.scaleBand()
    .domain(saintData.map(d => d.name))
    .range([0, height])
    .padding(0.25);

  // Bars
  g.selectAll('rect')
    .data(saintData)
    .join('rect')
      .attr('y', d => y(d.name))
      .attr('height', y.bandwidth())
      .attr('width', d => x(d.count))
      .attr('fill', ACCENT)
      .attr('opacity', 0.8);

  // Count labels
  g.selectAll('.count-label')
    .data(saintData)
    .join('text')
      .attr('class', 'count-label')
      .attr('x', d => x(d.count) + 6)
      .attr('y', d => y(d.name) + y.bandwidth() / 2 + 4)
      .attr('font-size', 11)
      .attr('fill', INK_MUTE)
      .text(d => d.count);

  // Y axis (name labels)
  g.append('g')
    .call(d3.axisLeft(y).tickSize(0))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('text')
      .attr('font-size', 12)
      .attr('fill', '#1a1a1a')
      .attr('font-style', 'italic')
      .attr('dx', -6));
}

function populateDuplicatesTable() {
  const tbody = document.querySelector('#table-duplicates');
  if (!tbody) return;
  tbody.innerHTML = duplicateData.map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${d.name}</td>
      <td>${d.count} communes</td>
    </tr>`
  ).join('');
}

drawLengthChart('#chart-lengths');
drawSaintsChart('#chart-saints');
populateDuplicatesTable();
