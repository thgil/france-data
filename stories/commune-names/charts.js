/* charts.js — commune-names story */

export function drawLengthChart(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 640;
  const H = 160;
  const marginL = 32, marginR = 12, marginT = 10, marginB = 32;
  const chartW = W - marginL - marginR;
  const chartH = H - marginT - marginB;

  const maxCount = Math.max(...lengthDist.map(d => d.count));
  const barCount = lengthDist.length;
  const barW = Math.max(1, chartW / barCount - 1);

  const scaleX = (i) => marginL + i * (chartW / barCount) + (chartW / barCount - barW) / 2;
  const scaleY = (v) => marginT + chartH - (v / maxCount) * chartH;

  // Axis tick labels
  const tickLabels = lengthDist.map((d, i) => {
    const lbl = typeof d.len === 'number' ? (d.len % 5 === 0 ? String(d.len) : '') : String(d.len);
    return `<text x="${scaleX(i) + barW / 2}" y="${H - marginB + 14}" text-anchor="middle" font-size="9" fill="#888">${lbl}</text>`;
  }).join('');

  // Bars — highlight len=1 in accent color
  const bars = lengthDist.map((d, i) => {
    const x = scaleX(i);
    const y = scaleY(d.count);
    const h = chartH - (y - marginT);
    const isOne = d.len === 1;
    const isShort = (typeof d.len === 'number' && d.len <= 2);
    const fill = isOne ? '#c0392b' : isShort ? '#e07b5a' : '#b5a080';
    return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="${fill}" rx="1"/>`;
  }).join('');

  // Median line at x=10
  const medIdx = lengthDist.findIndex(d => d.len === 10);
  const medX = medIdx >= 0 ? scaleX(medIdx) + barW / 2 : null;
  const medLine = medX ? `<line x1="${medX}" y1="${marginT}" x2="${medX}" y2="${marginT + chartH}" stroke="#1a1a1a" stroke-width="1" stroke-dasharray="3,3"/>
    <text x="${medX + 3}" y="${marginT + 10}" font-size="9" fill="#555">median (10)</text>` : '';

  container.innerHTML = `<svg width="100%" viewBox="0 0 ${W} ${H}" style="display:block;overflow:visible">
    <g>
      ${bars}
      ${medLine}
      ${tickLabels}
      <text x="${marginL - 4}" y="${marginT + chartH}" text-anchor="end" font-size="9" fill="#888">0</text>
      <text x="${marginL - 4}" y="${marginT + 4}" text-anchor="end" font-size="9" fill="#888">${maxCount.toLocaleString('fr-FR')}</text>
      <line x1="${marginL}" y1="${marginT}" x2="${marginL}" y2="${marginT + chartH}" stroke="#ccc" stroke-width="1"/>
      <line x1="${marginL}" y1="${marginT + chartH}" x2="${W - marginR}" y2="${marginT + chartH}" stroke="#ccc" stroke-width="1"/>
    </g>
  </svg>`;
}

export function drawDupesChart(selector, topDuplicates) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 640;
  const rowH = 22;
  const labelW = 200;
  const marginR = 50;
  const chartW = W - labelW - marginR;
  const H = topDuplicates.length * rowH + 4;
  const maxCount = Math.max(...topDuplicates.map(d => d.count));

  const rows = topDuplicates.map((d, i) => {
    const y = i * rowH;
    const barLen = (d.count / maxCount) * chartW;
    const isSaint = d.name.toLowerCase().startsWith('saint');
    const fill = isSaint ? '#8b6fa0' : '#b5a080';
    return `
      <text x="${labelW - 6}" y="${y + rowH / 2 + 4}" text-anchor="end" font-size="12" font-family="Georgia, serif" fill="#1a1a1a">${d.name}</text>
      <rect x="${labelW}" y="${y + 4}" width="${barLen}" height="${rowH - 8}" fill="${fill}" rx="2"/>
      <text x="${labelW + barLen + 4}" y="${y + rowH / 2 + 4}" font-size="11" fill="#555">${d.count}×</text>`;
  }).join('');

  container.innerHTML = `<svg width="100%" viewBox="0 0 ${W} ${H}" style="display:block">
    <g>${rows}</g>
  </svg>`;
}

export function drawWordsChart(selector, topWords) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 640;
  const rowH = 22;
  const labelW = 110;
  const marginR = 60;
  const chartW = W - labelW - marginR;
  const H = topWords.length * rowH + 4;
  const maxCount = Math.max(...topWords.map(d => d.count));

  // Color by category
  const saintWords = new Set(['saint', 'sainte']);
  const geoWords = new Set(['mer', 'bois', 'val', 'mont', 'château', 'forêt']);

  const rows = topWords.map((d, i) => {
    const y = i * rowH;
    const barLen = (d.count / maxCount) * chartW;
    const fill = saintWords.has(d.word) ? '#8b6fa0'
               : geoWords.has(d.word) ? '#5a8fa0'
               : '#b5a080';
    return `
      <text x="${labelW - 6}" y="${y + rowH / 2 + 4}" text-anchor="end" font-size="12" font-family="Georgia, serif" fill="#1a1a1a">${d.word}</text>
      <rect x="${labelW}" y="${y + 4}" width="${barLen}" height="${rowH - 8}" fill="${fill}" rx="2"/>
      <text x="${labelW + barLen + 4}" y="${y + rowH / 2 + 4}" font-size="11" fill="#555">${d.count.toLocaleString('fr-FR')}</text>`;
  }).join('');

  container.innerHTML = `<svg width="100%" viewBox="0 0 ${W} ${H}" style="display:block">
    <g>${rows}</g>
  </svg>`;
}

export function drawShortNamesMap(selector, shortNames) {
  if (typeof maplibregl === 'undefined') return;

  const map = new maplibregl.Map({
    container: selector.replace('#', ''),
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [2.5, 46.5],
    zoom: 5,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  map.on('load', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: shortNames.map(c => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: { name: c.n, dept: c.d, pop: c.p, len: c.n.length },
      })),
    };

    map.addSource('short-names', { type: 'geojson', data: geojson });

    map.addLayer({
      id: 'short-names-halo',
      type: 'circle',
      source: 'short-names',
      paint: {
        'circle-radius': 14,
        'circle-color': '#fff',
        'circle-opacity': 0.85,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': ['case', ['==', ['get', 'len'], 1], '#c0392b', '#888'],
      },
    });

    map.addLayer({
      id: 'short-names-label',
      type: 'symbol',
      source: 'short-names',
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Bold'],
        'text-size': ['case', ['==', ['get', 'len'], 1], 13, 10],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': ['case', ['==', ['get', 'len'], 1], '#c0392b', '#333'],
      },
    });

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    tooltip.style.display = 'none';
    map.getContainer().appendChild(tooltip);

    map.on('mousemove', 'short-names-halo', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const props = e.features[0].properties;
      const dept = props.dept;
      tooltip.innerHTML = `<span class="tt-name">${props.name}</span>
        <span class="tt-row"><span class="tt-label">Département</span> ${dept}</span>
        <span class="tt-row"><span class="tt-label">Population</span> ${props.pop.toLocaleString('fr-FR')}</span>
        <span class="tt-row"><span class="tt-label">Name length</span> ${props.len} letter${props.len > 1 ? 's' : ''}</span>`;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.point.x + 12) + 'px';
      tooltip.style.top = (e.point.y - 10) + 'px';
    });

    map.on('mouseleave', 'short-names-halo', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });
  });

  return map;
}
