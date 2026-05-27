/**
 * place-names/charts.js
 * Charts and map for the commune names story.
 * Draws:
 *   1. Horizontal bar chart — top 15 most common commune names
 *   2. Horizontal bar chart — top 12 saint-name prefixes
 *   3. Maplibre dot map — 12 Sainte-Colombe communes across France
 */

// ─── Colour palette ─────────────────────────────────────────────────────────
const ACCENT      = '#b32020';   // site accent red
const BAR_NORMAL  = '#c8bfa8';   // muted warm grey
const BAR_SAINT   = '#8a1515';   // deep red for saint names
const DOT_GOLD    = '#c67c00';   // consistent with bars / baguettes stories

// ─── SVG bar chart helper ────────────────────────────────────────────────────
/**
 * Draws a horizontal bar chart inside `containerSelector`.
 * @param {string} containerSelector  - CSS selector for the target <div>
 * @param {Array<{name: string, count: number}>} items
 * @param {Object} opts
 */
export function drawBarChart(containerSelector, items, opts = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const {
    width        = container.offsetWidth || 640,
    barHeight    = 26,
    gap          = 6,
    marginLeft   = 180,
    marginRight  = 50,
    colour       = BAR_NORMAL,
    saintColour  = BAR_SAINT,
    highlightSet = null,   // Set of names to colour differently
  } = opts;

  const maxCount = Math.max(...items.map(d => d.count));
  const chartWidth = width - marginLeft - marginRight;
  const svgHeight = items.length * (barHeight + gap) + 10;

  const rows = items.map((d, i) => {
    const y = i * (barHeight + gap);
    const barW = Math.max(2, (d.count / maxCount) * chartWidth);
    const isHighlight = highlightSet && highlightSet.has(d.name);
    const fill = isHighlight ? saintColour : colour;

    return `
      <g transform="translate(0,${y})">
        <text
          x="${marginLeft - 8}"
          y="${barHeight / 2 + 1}"
          text-anchor="end"
          dominant-baseline="middle"
          font-family="Georgia, serif"
          font-size="13"
          fill="#1a1a1a"
        >${d.name}</text>
        <rect
          x="${marginLeft}"
          y="0"
          width="${barW}"
          height="${barHeight}"
          fill="${fill}"
          rx="1"
        />
        <text
          x="${marginLeft + barW + 6}"
          y="${barHeight / 2 + 1}"
          dominant-baseline="middle"
          font-family="'Helvetica Neue', sans-serif"
          font-size="12"
          fill="#666"
          font-variant-numeric="tabular-nums"
        >${d.count}</text>
      </g>`;
  }).join('');

  container.innerHTML = `
    <svg
      viewBox="0 0 ${width} ${svgHeight}"
      width="100%"
      style="display:block;overflow:visible"
      aria-label="Horizontal bar chart"
    >
      ${rows}
    </svg>`;
}

// ─── Sainte-Colombe map ───────────────────────────────────────────────────────
/**
 * Draws a Maplibre GL map of the 12 Sainte-Colombe communes.
 * @param {string} mountId        - id of the mount div (without #)
 * @param {Array} communePoints   - array of {lat, lng, dept, deptName, pop, code}
 */
export function drawSainteColombeMap(mountId, communePoints) {
  if (typeof maplibregl === 'undefined') {
    console.warn('maplibregl not loaded');
    return null;
  }

  const validPoints = communePoints.filter(p => p.lat != null && p.lng != null);

  const map = new maplibregl.Map({
    container: mountId,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [2.5, 46.7],
    zoom: 4.8,
    minZoom: 3,
    maxZoom: 10,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  map.on('load', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: validPoints.map(p => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: {
          dept: p.dept,
          deptName: p.deptName,
          pop: p.pop,
          code: p.code,
        },
      })),
    };

    map.addSource('sc-points', { type: 'geojson', data: geojson });

    // Outer glow ring
    map.addLayer({
      id: 'sc-glow',
      type: 'circle',
      source: 'sc-points',
      paint: {
        'circle-radius': 14,
        'circle-color': ACCENT,
        'circle-opacity': 0.12,
      },
    });

    // Solid dot
    map.addLayer({
      id: 'sc-dot',
      type: 'circle',
      source: 'sc-points',
      paint: {
        'circle-radius': 7,
        'circle-color': ACCENT,
        'circle-opacity': 0.9,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      },
    });

    // Label
    map.addLayer({
      id: 'sc-label',
      type: 'symbol',
      source: 'sc-points',
      layout: {
        'text-field': ['get', 'deptName'],
        'text-font': ['Noto Sans Italic', 'Arial Unicode MS Regular'],
        'text-size': 11,
        'text-offset': [0, 1.6],
        'text-anchor': 'top',
        'text-max-width': 8,
      },
      paint: {
        'text-color': '#555',
        'text-halo-color': '#faf7f2',
        'text-halo-width': 1.5,
      },
    });
  });

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  map.getContainer().appendChild(tooltip);

  map.on('mouseenter', 'sc-dot', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    const p = e.features[0].properties;
    tooltip.innerHTML = `
      <span class="tt-name">Sainte-Colombe</span>
      <span class="tt-row"><span class="tt-label">Département</span> ${p.dept} — ${p.deptName}</span>
      <span class="tt-row"><span class="tt-label">Population</span> ${(p.pop || 0).toLocaleString('fr-FR')}</span>
      <span class="tt-row"><span class="tt-label">Code INSEE</span> ${p.code}</span>`;
    tooltip.style.display = 'block';
  });

  map.on('mousemove', 'sc-dot', (e) => {
    const rect = map.getContainer().getBoundingClientRect();
    tooltip.style.left = (e.point.x + 14) + 'px';
    tooltip.style.top  = (e.point.y - 10) + 'px';
  });

  map.on('mouseleave', 'sc-dot', () => {
    map.getCanvas().style.cursor = '';
    tooltip.style.display = 'none';
  });

  return map;
}
