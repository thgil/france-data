// charts.js — name-twins story
// Draws the horizontal bar chart for top commune names and the
// dot map for the 12 Sainte-Colombe communes.

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.esm.min.js';

/* ── Horizontal bar chart ──────────────────────────────────────────── */

export function drawNameChart(selector, top25) {
  const container = document.querySelector(selector);
  if (!container || !top25?.length) return;

  const maxCount = top25[0].count; // already sorted descending

  const rows = top25.map((d, i) => {
    const isTop = i === 0;
    const pct = (d.count / maxCount) * 100;

    const row = document.createElement('div');
    row.className = 'bar-row';

    const label = document.createElement('div');
    label.className = 'bar-label' + (isTop ? ' is-top' : '');
    label.textContent = d.name;
    label.title = d.name;

    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = 'bar-fill' + (isTop ? ' is-top' : '');
    fill.style.width = pct + '%';

    track.appendChild(fill);

    const count = document.createElement('div');
    count.className = 'bar-count' + (isTop ? ' is-top' : '');
    count.textContent = d.count;

    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(count);
    container.appendChild(row);
  });

  return rows;
}

/* ── Sainte-Colombe dot map ────────────────────────────────────────── */

const DEPT_NAMES = {
  '05': 'Hautes-Alpes',
  '17': 'Charente-Maritime',
  '25': 'Doubs',
  '33': 'Gironde',
  '35': 'Ille-et-Vilaine',
  '40': 'Landes',
  '46': 'Lot',
  '50': 'Manche',
  '69': 'Rhône',
  '76': 'Seine-Maritime',
  '77': 'Seine-et-Marne',
  '89': 'Yonne',
};

export function drawColombeMap(selector, colombes) {
  const container = document.querySelector(selector);
  if (!container || !colombes?.length) return;

  container.innerHTML = '';

  const map = new maplibregl.Map({
    container,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
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

  map.on('load', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: colombes.map((c) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: { code: c.code, dept: c.dept, pop: c.pop },
      })),
    };

    map.addSource('colombes', { type: 'geojson', data: geojson });

    map.addLayer({
      id: 'colombe-shadow',
      type: 'circle',
      source: 'colombes',
      paint: {
        'circle-radius': 11,
        'circle-color': 'rgba(139,26,26,0.12)',
        'circle-blur': 0.5,
      },
    });

    map.addLayer({
      id: 'colombe-dots',
      type: 'circle',
      source: 'colombes',
      paint: {
        'circle-radius': 7,
        'circle-color': '#8b1a1a',
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      },
    });

    map.on('mouseenter', 'colombe-dots', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'colombe-dots', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });

    map.on('mousemove', 'colombe-dots', (e) => {
      const feat = e.features[0];
      if (!feat) return;
      const { dept, pop } = feat.properties;
      const deptName = DEPT_NAMES[dept] || `Dept. ${dept}`;
      tooltip.innerHTML = `
        <span class="tt-name">Sainte-Colombe</span>
        <span class="tt-row"><span class="tt-label">Département:</span> ${deptName} (${dept})</span>
        <span class="tt-row"><span class="tt-label">Population:</span> ${pop.toLocaleString('fr-FR')}</span>
      `;
      const rect = container.getBoundingClientRect();
      const x = e.originalEvent.clientX - rect.left;
      const y = e.originalEvent.clientY - rect.top;
      tooltip.style.display = 'block';
      tooltip.style.left = (x + 12) + 'px';
      tooltip.style.top = (y - 10) + 'px';
    });
  });

  return map;
}
