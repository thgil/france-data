// stories/commune-names/charts.js
// Three visualisations for the commune-names story:
//   drawShortMap(selector, ultraShort)  — MapLibre dot+label map of ≤2-char communes
//   drawNamesChart(selector, topNames)  — horizontal bar chart of most-repeated names
//   drawLengthHistogram(selector, dist) — bar histogram of name lengths

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const ACCENT  = '#b32020';

// ── Utility: parse query selector to element ─────────────────────────────────
function el(selector) {
  return typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
}

// ── 1. MapLibre map: short commune dots + labels ──────────────────────────────
export function drawShortMap(selector, ultraShort) {
  const container = el(selector);
  if (!container) return;

  const vh = window.innerHeight || 800;
  container.style.height = Math.max(Math.round(vh * 0.65), 420) + 'px';
  container.style.position = 'relative';

  const map = new maplibregl.Map({
    container,
    style: BASEMAP,
    center: [2.5, 46.8],
    zoom: 4.8,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  // Tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  container.appendChild(tooltip);

  const geojson = {
    type: 'FeatureCollection',
    features: ultraShort.map(c => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
      properties: {
        name: c.name,
        dept: c.dept,
        pop: c.pop,
        chars: c.name.length,
      },
    })),
  };

  map.on('load', () => {
    map.addSource('shorts', { type: 'geojson', data: geojson });

    // Circle layer
    map.addLayer({
      id: 'short-circles',
      type: 'circle',
      source: 'shorts',
      paint: {
        'circle-radius': 8,
        'circle-color': ACCENT,
        'circle-opacity': 0.9,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      },
    });

    // Label layer
    map.addLayer({
      id: 'short-labels',
      type: 'symbol',
      source: 'shorts',
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Bold', 'Open Sans Bold'],
        'text-size': 13,
        'text-offset': [0, -1.4],
        'text-anchor': 'bottom',
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': '#1a1a1a',
        'text-halo-color': '#faf7f2',
        'text-halo-width': 2,
      },
    });

    // Tooltip on hover
    map.on('mouseenter', 'short-circles', e => {
      map.getCanvas().style.cursor = 'pointer';
      const p = e.features[0].properties;
      const pop = p.pop ? p.pop.toLocaleString('fr-FR') : '–';
      tooltip.innerHTML = `
        <span class="tt-name">${p.name}</span>
        <span class="tt-row"><span class="tt-label">Département</span> ${p.dept}</span>
        <span class="tt-row"><span class="tt-label">Population</span> ${pop}</span>
        <span class="tt-row"><span class="tt-label">Name length</span> ${p.chars} character${p.chars > 1 ? 's' : ''}</span>
      `;
      tooltip.style.display = 'block';
    });

    map.on('mousemove', 'short-circles', e => {
      const rect = container.getBoundingClientRect();
      const x = e.originalEvent.clientX - rect.left;
      const y = e.originalEvent.clientY - rect.top;
      tooltip.style.left = (x + 14) + 'px';
      tooltip.style.top  = (y - 14) + 'px';
    });

    map.on('mouseleave', 'short-circles', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });
  });

  return map;
}

// ── 2. Horizontal bar chart: top commune names ────────────────────────────────
export function drawNamesChart(selector, topNames) {
  const container = el(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const BAR_H = 28;
  const GAP = 6;
  const LABEL_W = 160;
  const COUNT_W = 40;
  const MARGIN = { top: 8, right: COUNT_W + 8, bottom: 8, left: LABEL_W };
  const items = topNames.slice(0, 15);
  const maxCount = items[0].count;
  const innerW = W - MARGIN.left - MARGIN.right;
  const H = items.length * (BAR_H + GAP) + MARGIN.top + MARGIN.bottom;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.overflow = 'visible';
  svg.style.display = 'block';

  items.forEach((d, i) => {
    const y = MARGIN.top + i * (BAR_H + GAP);
    const barW = Math.round((d.count / maxCount) * innerW);

    // Name label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', MARGIN.left - 8);
    label.setAttribute('y', y + BAR_H / 2 + 5);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-family', 'Georgia, serif');
    label.setAttribute('font-size', '14');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = d.name;
    svg.appendChild(label);

    // Bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', MARGIN.left);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', BAR_H);
    rect.setAttribute('fill', ACCENT);
    rect.setAttribute('opacity', '0.85');
    rect.setAttribute('rx', '2');
    svg.appendChild(rect);

    // Count label
    const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    count.setAttribute('x', MARGIN.left + barW + 6);
    count.setAttribute('y', y + BAR_H / 2 + 5);
    count.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    count.setAttribute('font-size', '13');
    count.setAttribute('fill', '#666');
    count.textContent = `×${d.count}`;
    svg.appendChild(count);
  });

  container.appendChild(svg);
}

// ── 3. Name-length histogram ──────────────────────────────────────────────────
export function drawLengthHistogram(selector, dist) {
  const container = el(selector);
  if (!container) return;

  // Only show lengths 1–35 (after 35 the counts are very small)
  const data = dist.filter(d => d.chars <= 35);
  const W = container.clientWidth || 680;
  const MARGIN = { top: 16, right: 16, bottom: 36, left: 52 };
  const H = 200;
  const innerW = W - MARGIN.left - MARGIN.right;
  const innerH = H - MARGIN.top - MARGIN.bottom;

  const maxCount = Math.max(...data.map(d => d.count));
  const xStep = innerW / data.length;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.display = 'block';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${MARGIN.left},${MARGIN.top})`);
  svg.appendChild(g);

  // Y axis gridlines + labels
  [0, 1000, 2000, 3000].forEach(v => {
    if (v > maxCount) return;
    const y = innerH - Math.round((v / maxCount) * innerH);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 0);
    line.setAttribute('x2', innerW);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', '#e0d8cc');
    line.setAttribute('stroke-width', '1');
    g.appendChild(line);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', -6);
    label.setAttribute('y', y + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '11');
    label.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    label.setAttribute('fill', '#888');
    label.textContent = v === 0 ? '0' : (v / 1000).toFixed(0) + 'k';
    g.appendChild(label);
  });

  // Bars
  data.forEach((d, i) => {
    const barH = Math.round((d.count / maxCount) * innerH);
    const x = Math.round(i * xStep);
    const y = innerH - barH;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x + 1);
    rect.setAttribute('y', y);
    rect.setAttribute('width', Math.max(xStep - 2, 1));
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', ACCENT);
    rect.setAttribute('opacity', '0.75');
    g.appendChild(rect);

    // X axis labels every 5 chars
    if (d.chars % 5 === 0) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x + xStep / 2);
      label.setAttribute('y', innerH + 18);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '11');
      label.setAttribute('font-family', "'Helvetica Neue', sans-serif");
      label.setAttribute('fill', '#888');
      label.textContent = d.chars;
      g.appendChild(label);
    }
  });

  // X axis line
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', 0);
  xAxis.setAttribute('x2', innerW);
  xAxis.setAttribute('y1', innerH);
  xAxis.setAttribute('y2', innerH);
  xAxis.setAttribute('stroke', '#1a1a1a');
  xAxis.setAttribute('stroke-width', '1');
  g.appendChild(xAxis);

  // X axis title
  const xTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xTitle.setAttribute('x', innerW / 2);
  xTitle.setAttribute('y', innerH + 34);
  xTitle.setAttribute('text-anchor', 'middle');
  xTitle.setAttribute('font-size', '11');
  xTitle.setAttribute('font-family', "'Helvetica Neue', sans-serif");
  xTitle.setAttribute('fill', '#888');
  xTitle.setAttribute('letter-spacing', '1');
  xTitle.textContent = 'NAME LENGTH (CHARACTERS)';
  g.appendChild(xTitle);

  container.appendChild(svg);
}
