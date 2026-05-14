// stories/commune-names/charts.js
// Static SVG charts: name-length histogram, top repeated names bar chart,
// shortest / longest tables, saint ranking table.

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

// ── SVG helpers ──────────────────────────────────────────────────────────────

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(content, attrs = {}) {
  const el = svgEl('text', attrs);
  el.textContent = content;
  return el;
}

// ── Length histogram ─────────────────────────────────────────────────────────

function drawLengthHistogram(svgEl_, hist) {
  const W = 680, H = 240;
  const margin = { top: 16, right: 24, bottom: 36, left: 52 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const maxCount = Math.max(...hist.map(d => d.count));
  const maxLen   = Math.max(...hist.map(d => d.len));
  const minLen   = Math.min(...hist.map(d => d.len));
  const binCount = maxLen - minLen + 1;

  const xScale = (len) => ((len - minLen) / (maxLen - minLen)) * iW;
  const yScale = (c)   => iH - (c / maxCount) * iH;
  const binW   = iW / binCount;

  const g = svgEl('g', { transform: `translate(${margin.left},${margin.top})` });

  // Bars
  for (const d of hist) {
    if (d.count === 0) continue;
    const x  = xScale(d.len);
    const y  = yScale(d.count);
    const bh = iH - y;
    const rect = svgEl('rect', {
      x: x + 0.5, y, width: Math.max(1, binW - 1), height: bh,
      fill: '#2b4a8a', opacity: '0.85',
    });
    g.appendChild(rect);
  }

  // X axis
  const xAxis = svgEl('line', { x1: 0, y1: iH, x2: iW, y2: iH, stroke: '#bbb', 'stroke-width': 1 });
  g.appendChild(xAxis);

  // X axis ticks every 5 characters
  for (let len = 5; len <= maxLen; len += 5) {
    const x = xScale(len);
    g.appendChild(svgEl('line', { x1: x, y1: iH, x2: x, y2: iH + 4, stroke: '#999', 'stroke-width': 1 }));
    g.appendChild(svgText(len, {
      x, y: iH + 16, 'text-anchor': 'middle',
      'font-family': 'Helvetica Neue, sans-serif', 'font-size': 11, fill: '#666',
    }));
  }

  // X axis label
  g.appendChild(svgText('Name length (characters)', {
    x: iW / 2, y: iH + 32, 'text-anchor': 'middle',
    'font-family': 'Helvetica Neue, sans-serif', 'font-size': 11, fill: '#888',
  }));

  // Y axis ticks
  const yTicks = [0, 1000, 2000, 3000, 4000];
  for (const t of yTicks) {
    const y = yScale(t);
    g.appendChild(svgEl('line', { x1: -4, y1: y, x2: iW, y2: y, stroke: t === 0 ? '#bbb' : '#eee', 'stroke-width': 1 }));
    g.appendChild(svgText(t === 0 ? '0' : `${t/1000}k`, {
      x: -8, y: y + 4, 'text-anchor': 'end',
      'font-family': 'Helvetica Neue, sans-serif', 'font-size': 11, fill: '#666',
    }));
  }

  // Annotation: peak ~7-8 chars
  const peak = hist.reduce((a, b) => b.count > a.count ? b : a);
  const px = xScale(peak.len) + binW / 2;
  const py = yScale(peak.count) - 8;
  g.appendChild(svgText(`peak: ${peak.count.toLocaleString('fr-FR')} communes at ${peak.len} chars`, {
    x: px, y: py, 'text-anchor': 'middle',
    'font-family': 'Helvetica Neue, sans-serif', 'font-size': 10, fill: '#555',
  }));

  svgEl_.appendChild(g);
}

// ── Top repeated names bar chart ─────────────────────────────────────────────

function drawRepeatedChart(svgEl_, topRepeated) {
  const W = 680, H = 300;
  const margin = { top: 8, right: 60, bottom: 24, left: 180 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const items = topRepeated.slice(0, 12);
  const maxCount = Math.max(...items.map(d => d.count));
  const rowH = iH / items.length;

  const g = svgEl('g', { transform: `translate(${margin.left},${margin.top})` });

  items.forEach((d, i) => {
    const y = i * rowH;
    const barW = (d.count / maxCount) * iW;
    const barH = Math.max(1, rowH - 6);

    // Bar
    g.appendChild(svgEl('rect', {
      x: 0, y: y + 3, width: barW, height: barH,
      fill: '#2b4a8a', opacity: '0.8',
    }));

    // Name label
    const nameLabel = svgEl('text', {
      x: -8, y: y + rowH / 2 + 4, 'text-anchor': 'end',
      'font-family': 'Georgia, serif', 'font-size': 12, fill: '#1a1a1a',
    });
    nameLabel.textContent = d.name;
    g.appendChild(nameLabel);

    // Count label
    const countLabel = svgEl('text', {
      x: barW + 6, y: y + rowH / 2 + 4, 'text-anchor': 'start',
      'font-family': 'Helvetica Neue, sans-serif', 'font-size': 11, fill: '#555',
    });
    countLabel.textContent = d.count;
    g.appendChild(countLabel);
  });

  // X axis baseline
  g.appendChild(svgEl('line', {
    x1: 0, y1: 0, x2: 0, y2: iH, stroke: '#bbb', 'stroke-width': 1,
  }));

  svgEl_.appendChild(g);
}

// ── Populate tables ──────────────────────────────────────────────────────────

function populateSaintsTable(stats) {
  const saints = [
    { name: 'Saint-Martin', count: 202 },
    { name: 'Saint-Jean', count: 155 },
    { name: 'Saint-Pierre', count: 144 },
    { name: 'Saint-Germain', count: 108 },
    { name: 'Saint-Julien', count: 78 },
    { name: 'Saint-Laurent', count: 77 },
    { name: 'Saint-Hilaire', count: 68 },
    { name: 'Saint-Georges', count: 67 },
  ];
  const tbody = document.querySelector('#table-saints tbody');
  if (!tbody) return;
  tbody.innerHTML = saints.map(s =>
    `<tr>
      <td class="commune-name">${s.name}<span style="font-size:11px;color:#aaa">…</span></td>
      <td>${s.count.toLocaleString('fr-FR')}</td>
    </tr>`
  ).join('');
}

function populateDupesTable(stats) {
  const tbody = document.querySelector('#table-dupes tbody');
  if (!tbody) return;
  tbody.innerHTML = stats.top_repeated.slice(0, 8).map(d =>
    `<tr>
      <td class="commune-name">${d.name}</td>
      <td>${d.count}</td>
    </tr>`
  ).join('');
}

function populateShortestTable(stats) {
  const tbody = document.querySelector('#table-shortest tbody');
  if (!tbody) return;

  const short = [
    { name: 'Y',  dept: '80', pop: 89,   note: '(Somme)' },
    { name: 'By', dept: '25', pop: 86,   note: '' },
    { name: 'Bû', dept: '28', pop: 2022, note: '' },
    { name: 'Eu', dept: '76', pop: 6591, note: '' },
    { name: 'Gy', dept: '70', pop: 1001, note: '' },
    { name: 'Oz', dept: '38', pop: 213,  note: '' },
    { name: 'Oô', dept: '31', pop: 103,  note: '' },
    { name: 'Py', dept: '66', pop: 79,   note: '' },
  ];

  tbody.innerHTML = short.map(d =>
    `<tr>
      <td class="commune-name">${d.name}</td>
      <td><span class="dept-chip">${d.dept}</span></td>
      <td>${d.pop.toLocaleString('fr-FR')}</td>
    </tr>`
  ).join('');
}

function populateLongestTable(stats) {
  const tbody = document.querySelector('#table-longest tbody');
  if (!tbody) return;
  tbody.innerHTML = stats.longest.map(d =>
    `<tr>
      <td class="commune-name" style="font-size:11px;word-break:break-word;">${d.name}</td>
      <td>${d.len}</td>
      <td>${d.pop.toLocaleString('fr-FR')}</td>
    </tr>`
  ).join('');
}

function populateStatBlocks(stats) {
  const uEl = document.getElementById('stat-unique');
  const dEl = document.getElementById('stat-dupes');
  if (uEl) uEl.textContent = stats.unique.toLocaleString('fr-FR');
  if (dEl) dEl.textContent = stats.duplicated_names.toLocaleString('fr-FR');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    const stats = await loadJSON('./stats.json');

    populateStatBlocks(stats);
    populateSaintsTable(stats);
    populateDupesTable(stats);
    populateShortestTable(stats);
    populateLongestTable(stats);

    const histSvg = document.getElementById('chart-lengths');
    if (histSvg) drawLengthHistogram(histSvg, stats.length_hist);

    const repSvg = document.getElementById('chart-repeated');
    if (repSvg) drawRepeatedChart(repSvg, stats.top_repeated);

  } catch (err) {
    console.error('Failed to load commune-names story data:', err);
  }
}

main();
