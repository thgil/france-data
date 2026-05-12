/* Scatter plot: bars per 1,000 residents vs population-weighted APL, by département */

export async function drawScatter(containerId) {
  const resp = await fetch('./dept-data.json');
  const { depts, medianBarsPer1000, medianApl } = await resp.json();

  const DESERT_THRESHOLD = 2.5;

  // Labels to show (dept code → label text)
  const LABEL_DEPTS = {
    '75': 'Paris',
    '05': 'Hautes-Alpes',
    '91': 'Essonne',
    '78': 'Yvelines',
    '77': 'Seine-et-Marne',
    '95': "Val-d'Oise",
    '2B': 'Haute-Corse',
    '48': 'Lozère',
    '67': 'Bas-Rhin',
    '18': 'Cher',
    '33': 'Gironde',
  };

  // IDF "double desert" departments
  const IDF_DESERT = new Set(['77', '78', '91', '95']);
  const IDF_OK     = new Set(['92', '93', '94']);
  const PARIS      = new Set(['75']);
  const MOUNTAIN   = new Set(['05', '73', '2B', '48', '15', '2A']);

  const container = document.getElementById(containerId);
  if (!container) return;

  /* ── Dimensions ─────────────────────────────────────────────────── */
  const margin = { top: 24, right: 28, bottom: 56, left: 56 };
  const totalW = Math.min(container.clientWidth || 700, 760);
  const totalH = Math.round(totalW * 0.65);
  const W = totalW - margin.left - margin.right;
  const H = totalH - margin.top - margin.bottom;

  /* ── SVG ────────────────────────────────────────────────────────── */
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', totalW);
  svg.setAttribute('height', totalH);
  svg.style.overflow = 'visible';
  svg.style.display = 'block';
  svg.style.maxWidth = '100%';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  /* ── Scales ─────────────────────────────────────────────────────── */
  const xMin = 0.25, xMax = 2.25;
  const yMin = 1.9, yMax = 5.3;

  const scaleX = v => ((v - xMin) / (xMax - xMin)) * W;
  const scaleY = v => H - ((v - yMin) / (yMax - yMin)) * H;

  const maxPop = Math.max(...depts.map(d => d.pop));
  const rScale = v => 3 + 7 * Math.sqrt(v / maxPop) * 3;

  /* ── Helpers ────────────────────────────────────────────────────── */
  function el(tag, attrs = {}, text) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text != null) e.textContent = text;
    return e;
  }

  /* ── Grid lines ─────────────────────────────────────────────────── */
  const gridG = el('g');
  g.appendChild(gridG);

  for (let x = 0.5; x <= 2.0; x += 0.5) {
    gridG.appendChild(el('line', {
      x1: scaleX(x), y1: 0, x2: scaleX(x), y2: H,
      stroke: '#e8e2d8', 'stroke-width': '1'
    }));
  }
  for (let y = 2.0; y <= 5.0; y += 0.5) {
    gridG.appendChild(el('line', {
      x1: 0, y1: scaleY(y), x2: W, y2: scaleY(y),
      stroke: '#e8e2d8', 'stroke-width': '1'
    }));
  }

  /* ── Desert threshold line ──────────────────────────────────────── */
  const desertY = scaleY(DESERT_THRESHOLD);
  g.appendChild(el('line', {
    x1: 0, y1: desertY, x2: W, y2: desertY,
    stroke: '#c0392b', 'stroke-width': '1', 'stroke-dasharray': '4 4', opacity: '0.6'
  }));
  g.appendChild(el('text', {
    x: W + 4, y: desertY + 4,
    'font-family': 'var(--sans,"Helvetica Neue",sans-serif)',
    'font-size': '10',
    fill: '#c0392b',
    opacity: '0.9'
  }, 'desert'));

  /* ── Median reference lines ─────────────────────────────────────── */
  const medX = scaleX(medianBarsPer1000);
  const medY = scaleY(medianApl);

  g.appendChild(el('line', {
    x1: medX, y1: 0, x2: medX, y2: H,
    stroke: '#b8b0a0', 'stroke-width': '1', 'stroke-dasharray': '3 3'
  }));
  g.appendChild(el('line', {
    x1: 0, y1: medY, x2: W, y2: medY,
    stroke: '#b8b0a0', 'stroke-width': '1', 'stroke-dasharray': '3 3'
  }));

  /* ── Quadrant labels ────────────────────────────────────────────── */
  const qlStyle = { 'font-family': 'var(--sans,"Helvetica Neue",sans-serif)', 'font-size': '9', 'font-weight': '600', 'letter-spacing': '1', 'text-transform': 'uppercase', 'fill': '#c0b8a8', opacity: '0.8' };
  g.appendChild(Object.assign(el('text', { x: medX + 5, y: 12, ...qlStyle }), { textContent: 'Bars + Doctors' }));
  g.appendChild(Object.assign(el('text', { x: 4, y: 12, ...qlStyle }), { textContent: 'Doctors, few bars' }));
  g.appendChild(Object.assign(el('text', { x: 4, y: H - 4, ...qlStyle }), { textContent: 'Few of both' }));
  g.appendChild(Object.assign(el('text', { x: medX + 5, y: H - 4, ...qlStyle }), { textContent: 'Bars, few doctors' }));

  /* ── Axes ───────────────────────────────────────────────────────── */
  g.appendChild(el('line', { x1: 0, y1: H, x2: W, y2: H, stroke: '#888', 'stroke-width': '1' }));
  g.appendChild(el('line', { x1: 0, y1: 0, x2: 0, y2: H, stroke: '#888', 'stroke-width': '1' }));

  // X ticks
  const xTickStyle = { 'font-family': 'var(--sans,"Helvetica Neue",sans-serif)', 'font-size': '11', fill: '#666', 'text-anchor': 'middle' };
  for (let x = 0.5; x <= 2.0; x += 0.5) {
    g.appendChild(el('line', { x1: scaleX(x), y1: H, x2: scaleX(x), y2: H + 4, stroke: '#888', 'stroke-width': '1' }));
    g.appendChild(el('text', { x: scaleX(x), y: H + 15, ...xTickStyle }, x.toFixed(1)));
  }

  // Y ticks
  const yTickStyle = { 'font-family': 'var(--sans,"Helvetica Neue",sans-serif)', 'font-size': '11', fill: '#666', 'text-anchor': 'end' };
  for (let y = 2.0; y <= 5.0; y += 0.5) {
    g.appendChild(el('line', { x1: 0, y1: scaleY(y), x2: -4, y2: scaleY(y), stroke: '#888', 'stroke-width': '1' }));
    g.appendChild(el('text', { x: -7, y: scaleY(y) + 4, ...yTickStyle }, y.toFixed(1)));
  }

  // Axis labels
  g.appendChild(Object.assign(el('text', {
    x: W / 2, y: H + 44,
    'font-family': 'var(--sans,"Helvetica Neue",sans-serif)', 'font-size': '12', fill: '#444', 'text-anchor': 'middle'
  }), { textContent: 'Bars per 1,000 residents' }));

  const yLabel = el('text', {
    'font-family': 'var(--sans,"Helvetica Neue",sans-serif)', 'font-size': '12', fill: '#444', 'text-anchor': 'middle',
    transform: `translate(-42,${H / 2}) rotate(-90)`
  });
  yLabel.textContent = 'APL healthcare score';
  g.appendChild(yLabel);

  /* ── Dots ───────────────────────────────────────────────────────── */
  const dotsG = el('g');
  g.appendChild(dotsG);

  function dotColor(d) {
    if (IDF_DESERT.has(d.dept)) return '#a63228';
    if (PARIS.has(d.dept)) return '#c67c00';
    if (MOUNTAIN.has(d.dept)) return '#2e6d4e';
    return '#8a9eb5';
  }

  for (const d of depts) {
    const cx = scaleX(d.barsPer1000);
    const cy = scaleY(d.apl);
    const r = rScale(d.pop);
    const fill = dotColor(d);

    const circle = el('circle', { cx, cy, r, fill, opacity: '0.82', stroke: '#fff', 'stroke-width': '0.8' });
    circle._data = d;
    dotsG.appendChild(circle);
  }

  /* ── Labels ─────────────────────────────────────────────────────── */
  const labelsG = el('g');
  g.appendChild(labelsG);

  const labelOffsets = {
    '75': [6, -5],   // Paris: right and up
    '05': [6, -5],   // Hautes-Alpes: right and up
    '91': [0, -8],   // Essonne: above
    '78': [-6, -8],  // Yvelines: upper-left
    '77': [6, 4],    // Seine-et-Marne: lower-right
    '95': [6, 4],    // Val-d'Oise: lower-right
    '2B': [6, -4],   // Haute-Corse: right
    '48': [0, -8],   // Lozère: above
    '67': [-6, -6],  // Bas-Rhin: upper-left
    '18': [0, 10],   // Cher: below
    '33': [6, 4],    // Gironde: lower-right
  };

  for (const d of depts) {
    if (!LABEL_DEPTS[d.dept]) continue;
    const cx = scaleX(d.barsPer1000);
    const cy = scaleY(d.apl);
    const [dx, dy] = labelOffsets[d.dept] || [6, -4];
    const anchor = dx < 0 ? 'end' : 'start';
    const fill = IDF_DESERT.has(d.dept) ? '#a63228' : PARIS.has(d.dept) ? '#c67c00' : MOUNTAIN.has(d.dept) ? '#2e6d4e' : '#444';

    labelsG.appendChild(el('text', {
      x: cx + dx, y: cy + dy,
      'font-family': 'var(--sans,"Helvetica Neue",sans-serif)', 'font-size': '10',
      fill, 'text-anchor': anchor, 'font-weight': (IDF_DESERT.has(d.dept) || PARIS.has(d.dept)) ? '600' : '400'
    }, LABEL_DEPTS[d.dept]));
  }

  /* ── Tooltip ────────────────────────────────────────────────────── */
  let tooltip = null;

  function ensureTooltip() {
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'scatter-tooltip';
      container.style.position = 'relative';
      container.appendChild(tooltip);
    }
    return tooltip;
  }

  svg.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - margin.left;
    const mouseY = e.clientY - rect.top - margin.top;

    let best = null, bestDist = Infinity;
    for (const d of depts) {
      const cx = scaleX(d.barsPer1000);
      const cy = scaleY(d.apl);
      const dist = Math.hypot(mouseX - cx, mouseY - cy);
      if (dist < bestDist) { bestDist = dist; best = d; }
    }

    if (best && bestDist < 22) {
      const tt = ensureTooltip();
      tt.style.display = 'block';
      const containerRect = container.getBoundingClientRect();
      tt.style.left = (e.clientX - containerRect.left + 12) + 'px';
      tt.style.top = (e.clientY - containerRect.top - 10) + 'px';
      tt.innerHTML = `
        <span class="tt-name">${best.dept} — ${best.name}</span>
        <span class="tt-row"><span class="tt-label">Bars/1,000:</span> ${best.barsPer1000.toFixed(2)}</span>
        <span class="tt-row"><span class="tt-label">APL score:</span> ${best.apl.toFixed(2)}</span>
        <span class="tt-row"><span class="tt-label">Desert communes:</span> ${best.desertPct}%</span>
        <span class="tt-row"><span class="tt-label">Total bars:</span> ${best.bars.toLocaleString('en')}</span>
        <span class="tt-row"><span class="tt-label">Population:</span> ${(best.pop / 1e6).toFixed(2)}M</span>
      `;
    } else if (tooltip) {
      tooltip.style.display = 'none';
    }
  });

  svg.addEventListener('mouseleave', () => {
    if (tooltip) tooltip.style.display = 'none';
  });

  container.appendChild(svg);
}

/* ── Ranking tables ─────────────────────────────────────────────────── */
export async function drawRankingTables() {
  const resp = await fetch('./dept-data.json');
  const { depts } = await resp.json();

  function fillTable(tableId, rows) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    tbody.innerHTML = '';
    rows.forEach((d, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="rank">${i + 1}</td>
        <td class="place">${d.name}</td>
        <td>${d.value}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const byBars = [...depts].sort((a, b) => b.barsPer1000 - a.barsPer1000).slice(0, 10).map(d => ({
    name: `${d.dept} – ${d.name}`, value: `${d.barsPer1000.toFixed(2)}/1,000`
  }));
  fillTable('table-top-bars', byBars);

  const byApl = [...depts].sort((a, b) => a.apl - b.apl).slice(0, 10).map(d => ({
    name: `${d.dept} – ${d.name}`, value: `APL ${d.apl.toFixed(2)}`
  }));
  fillTable('table-worst-apl', byApl);
}
