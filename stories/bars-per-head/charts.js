// stories/bars-per-head/charts.js
// Département-level choropleth: bars per 10,000 residents.
// Export: drawBarsPerHeadMap(selector, refs)
// refs shape: { geojson, stats }

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// Sequential colour scale: low (warm cream) → high (deep amber-brown)
// Stops tuned to the actual distribution (3–21 per 10K)
const COLOR_STOPS = [
  [3,  '#fef3d0'],
  [5,  '#fdd988'],
  [7,  '#f4a416'],
  [10, '#d4730a'],
  [14, '#a04500'],
  [21, '#6b2600'],
];

function barColor() {
  const interp = ['interpolate', ['linear'], ['get', 'bars_per_10k']];
  for (const [v, c] of COLOR_STOPS) interp.push(v, c);
  return ['case', ['has', 'bars_per_10k'], interp, '#e8e8e8'];
}

function fmtNum(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('fr-FR');
}

function fmtPer10k(n) {
  if (n == null) return '—';
  return Number(n).toFixed(1);
}

export function drawBarsPerHeadMap(selector, refs) {
  const container = document.querySelector(selector);
  if (!container) return;

  const { geojson } = refs;

  const vh = window.innerHeight || 800;
  container.style.height = Math.max(Math.round(vh * 0.75), 460) + 'px';
  container.style.position = 'relative';

  const loadingEl = document.createElement('div');
  loadingEl.className = 'map-loading';
  loadingEl.textContent = 'Loading map…';
  container.appendChild(loadingEl);

  const map = new maplibregl.Map({
    container,
    style: BASEMAP,
    center: [2.5, 46.8],
    zoom: 5.5,
    attributionControl: false,
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  container.appendChild(tooltip);

  map.on('load', () => {
    loadingEl.remove();

    map.addSource('depts', {
      type: 'geojson',
      data: geojson,
    });

    // Fill layer — choropleth
    map.addLayer({
      id: 'depts-fill',
      type: 'fill',
      source: 'depts',
      paint: {
        'fill-color': barColor(),
        'fill-opacity': 0.82,
      },
    });

    // Outline
    map.addLayer({
      id: 'depts-outline',
      type: 'line',
      source: 'depts',
      paint: {
        'line-color': '#fff',
        'line-width': 0.8,
        'line-opacity': 0.7,
      },
    });

    // Hover highlight
    let hoveredId = null;

    map.on('mousemove', 'depts-fill', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      if (!e.features.length) return;
      const f = e.features[0];
      const p = f.properties;

      if (hoveredId !== null) {
        map.setFeatureState({ source: 'depts', id: hoveredId }, { hover: false });
      }
      hoveredId = f.id;
      map.setFeatureState({ source: 'depts', id: hoveredId }, { hover: true });

      const rank = p.rank ? `#${p.rank} of 96` : '—';
      tooltip.innerHTML = `
        <span class="tt-name">${p.nom || p.code} (${p.code})</span>
        <span class="tt-row"><span class="tt-label">Bars per 10K:</span> ${fmtPer10k(p.bars_per_10k)}</span>
        <span class="tt-row"><span class="tt-label">Rank:</span> ${rank}</span>
        <span class="tt-row"><span class="tt-label">Total bars:</span> ${fmtNum(p.bars)}</span>
        <span class="tt-row"><span class="tt-label">Population:</span> ${fmtNum(p.pop)}</span>
        <span class="tt-row"><span class="tt-label">Avg APL:</span> ${p.avg_apl != null ? p.avg_apl.toFixed(2) : '—'}</span>
      `;
      tooltip.style.display = 'block';

      const rect = container.getBoundingClientRect();
      let x = e.originalEvent.clientX - rect.left + 14;
      let y = e.originalEvent.clientY - rect.top - 10;
      if (x + 220 > rect.width) x -= 240;
      tooltip.style.left = x + 'px';
      tooltip.style.top  = y + 'px';
    });

    map.on('mouseleave', 'depts-fill', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
      if (hoveredId !== null) {
        map.setFeatureState({ source: 'depts', id: hoveredId }, { hover: false });
        hoveredId = null;
      }
    });
  });

  return {
    flyToFrance:   () => map.flyTo({ center: [2.5, 46.8], zoom: 5.5, duration: 900 }),
    flyToParis:    () => map.flyTo({ center: [2.5, 48.6], zoom: 8,   duration: 900 }),
    flyToCorsica:  () => map.flyTo({ center: [9.1, 42.1], zoom: 7.5, duration: 900 }),
    flyToBretagne: () => map.flyTo({ center: [-2.8, 48.2], zoom: 7.5, duration: 900 }),
  };
}
