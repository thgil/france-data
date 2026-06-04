// charts.js — commune-names story
// Renders: Sainte-Colombe scatter map + saint bar chart

const CARTO_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export function drawDuplicatesMap(container, sainteColombe) {
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  el.style.width = '100%';
  el.style.height = '420px';

  const map = new maplibregl.Map({
    container: el,
    style: CARTO_STYLE,
    center: [2.5, 46.8],
    zoom: 4.8,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  el.appendChild(tooltip);

  map.on('load', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: sainteColombe.map((c) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: { dept: c.dept, deptName: c.deptName, pop: c.pop },
      })),
    };

    map.addSource('sc', { type: 'geojson', data: geojson });

    map.addLayer({
      id: 'sc-halo',
      type: 'circle',
      source: 'sc',
      paint: {
        'circle-radius': 12,
        'circle-color': '#c94040',
        'circle-opacity': 0.15,
      },
    });

    map.addLayer({
      id: 'sc-dot',
      type: 'circle',
      source: 'sc',
      paint: {
        'circle-radius': 6,
        'circle-color': '#c94040',
        'circle-opacity': 0.85,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      },
    });

    map.on('mousemove', 'sc-dot', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const props = e.features[0].properties;
      tooltip.innerHTML =
        `<span class="tt-name">Sainte-Colombe</span>` +
        `<span class="tt-row"><span class="tt-label">Département:</span> ${props.deptName} (${props.dept})</span>` +
        `<span class="tt-row"><span class="tt-label">Population:</span> ${Number(props.pop).toLocaleString('fr-FR')}</span>`;
      const rect = el.getBoundingClientRect();
      const x = e.originalEvent.clientX - rect.left;
      const y = e.originalEvent.clientY - rect.top;
      tooltip.style.display = 'block';
      tooltip.style.left = `${x + 14}px`;
      tooltip.style.top = `${y - 10}px`;
    });

    map.on('mouseleave', 'sc-dot', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });
  });

  return map;
}

export function drawSaintBars(container, topSaints) {
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;
  if (!el) return;

  const max = topSaints[0].count;
  el.innerHTML = topSaints.map((s) => {
    const pct = (s.count / max * 100).toFixed(1);
    return `
      <div class="saint-row">
        <span class="saint-name">${s.name}</span>
        <div class="saint-bar-wrap">
          <div class="saint-bar" style="width:${pct}%"></div>
        </div>
        <span class="saint-count">${s.count}</span>
      </div>`;
  }).join('');
}
