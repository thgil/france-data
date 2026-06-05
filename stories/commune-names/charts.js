import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.esm.js';

const STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const DOT_COLOR = '#c0392b';

export function drawNameMap(container, { stats }) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;

  const map = new maplibregl.Map({
    container: el,
    style: STYLE,
    center: [2.35, 46.5],
    zoom: 5,
    minZoom: 3,
    maxZoom: 14,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  el.appendChild(tooltip);

  let currentName = null;

  map.on('load', () => {
    map.addSource('dots', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    map.addLayer({
      id: 'dots-circle',
      type: 'circle',
      source: 'dots',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 6, 10, 12],
        'circle-color': DOT_COLOR,
        'circle-opacity': 0.85,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      },
    });

    map.addLayer({
      id: 'dots-label',
      type: 'symbol',
      source: 'dots',
      minzoom: 7,
      layout: {
        'text-field': ['get', 'dept'],
        'text-size': 10,
        'text-anchor': 'top',
        'text-offset': [0, 0.8],
        'text-font': ['Noto Sans Regular'],
      },
      paint: {
        'text-color': '#444',
        'text-halo-color': '#fff',
        'text-halo-width': 1,
      },
    });

    map.on('mouseenter', 'dots-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'dots-circle', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });

    map.on('mousemove', 'dots-circle', e => {
      const f = e.features[0];
      if (!f) return;
      const { name, dept, pop } = f.properties;
      tooltip.innerHTML = `
        <span class="tt-name">${name}</span>
        <span class="tt-row"><span class="tt-label">Dept</span> ${dept}</span>
        <span class="tt-row"><span class="tt-label">Population</span> ${pop.toLocaleString('fr-FR')}</span>
      `;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.point.x + 14) + 'px';
      tooltip.style.top  = (e.point.y - 14) + 'px';
    });

    showName(stats.topNames[0].name);
  });

  function showName(name) {
    currentName = name;
    const communes = stats.nameMap[name] || [];
    const features = communes
      .filter(c => c.lon != null && c.lat != null)
      .map(c => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
        properties: { name, dept: c.dept, pop: c.pop },
      }));

    map.getSource('dots').setData({ type: 'FeatureCollection', features });

    if (features.length > 0) {
      const lons = features.map(f => f.geometry.coordinates[0]);
      const lats = features.map(f => f.geometry.coordinates[1]);
      const bounds = [
        [Math.min(...lons) - 0.5, Math.min(...lats) - 0.5],
        [Math.max(...lons) + 0.5, Math.max(...lats) + 0.5],
      ];
      map.fitBounds(bounds, { padding: 80, maxZoom: 10, duration: 600 });
    }

    return communes.length;
  }

  return { showName, getCurrentName: () => currentName };
}
