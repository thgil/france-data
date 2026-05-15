// charts.js — name-twins story
// Exports: drawColombMap, drawDuplicateChart

/**
 * Draws a Maplibre GL dot map of the 12 Sainte-Colombes (or whichever
 * communes are passed in) on top of France.
 *
 * @param {string} containerId  - DOM id of the mount div
 * @param {Array}  communes     - array of {lat, lng, dept, pop, apl, code}
 * @returns {{ map }}
 */
export function drawColombMap(containerId, communes) {
  const maplibregl = window.maplibregl;
  if (!maplibregl) throw new Error('maplibregl not loaded');

  const map = new maplibregl.Map({
    container: containerId,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [2.5, 46.8],
    zoom: 5,
    minZoom: 3,
    maxZoom: 12,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  document.getElementById(containerId).parentNode.appendChild(tooltip);

  map.on('load', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: communes
        .filter(c => c.lat && c.lng)
        .map(c => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
          properties: {
            dept: c.dept,
            pop: c.pop ?? 0,
            apl: c.apl,
            code: c.code,
            category: c.category ?? 'unknown',
          },
        })),
    };

    map.addSource('colombes', { type: 'geojson', data: geojson });

    // Outer glow
    map.addLayer({
      id: 'colombes-glow',
      type: 'circle',
      source: 'colombes',
      paint: {
        'circle-radius': 14,
        'circle-color': '#7a3d8f',
        'circle-opacity': 0.12,
        'circle-blur': 1,
      },
    });

    // Main dot — color by medical category
    map.addLayer({
      id: 'colombes-dot',
      type: 'circle',
      source: 'colombes',
      paint: {
        'circle-radius': 7,
        'circle-color': [
          'match',
          ['get', 'category'],
          'desert', '#c0392b',
          '#7a3d8f',
        ],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
        'circle-opacity': 0.9,
      },
    });

    // Hover
    map.on('mousemove', 'colombes-dot', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const props = e.features[0].properties;
      const apl = props.apl != null ? Number(props.apl).toFixed(2) : 'n/a';
      const isDesert = props.category === 'desert';
      tooltip.innerHTML = `
        <span class="tt-name">Sainte-Colombe (${props.dept})</span>
        <span class="tt-row"><span class="tt-label">Population</span>: ${Number(props.pop).toLocaleString('fr-FR')}</span>
        <span class="tt-row"><span class="tt-label">APL score</span>: ${apl}${isDesert ? ' — medical desert' : ''}</span>
        <span class="tt-row"><span class="tt-label">INSEE code</span>: ${props.code}</span>
      `;
      tooltip.style.display = '';
      const rect = document.getElementById(containerId).getBoundingClientRect();
      const px = e.point;
      let left = px.x + 14;
      let top = px.y - 10;
      if (left + 240 > rect.width) left = px.x - 250;
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    });

    map.on('mouseleave', 'colombes-dot', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });
  });

  return { map };
}

/**
 * Renders a horizontal bar chart of the top duplicate commune names
 * using a pure CSS/HTML approach (no charting library needed).
 *
 * @param {string} containerId
 * @param {Array}  items  - [{name, count}], sorted descending
 * @param {number} limit  - how many bars to show
 */
export function drawDuplicateChart(containerId, items, limit = 15) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const top = items.slice(0, limit);
  const max = top[0].count;

  el.innerHTML = top.map((item, i) => {
    const pct = (item.count / max * 100).toFixed(1);
    const isSaint = /saint/i.test(item.name);
    const color = isSaint ? '#7a3d8f' : '#2a6496';
    return `
      <div class="dc-row">
        <div class="dc-label">${item.name}</div>
        <div class="dc-bar-wrap">
          <div class="dc-bar" style="width:${pct}%;background:${color}"></div>
          <span class="dc-val">${item.count}×</span>
        </div>
      </div>`;
  }).join('');
}
