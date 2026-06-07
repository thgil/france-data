import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.esm.min.js';

const BREAD_COLORS = [
  [0,   '#f5f0e8'],
  [1,   '#fde8b4'],
  [4,   '#f5c842'],
  [8,   '#d4900c'],
  [12,  '#9b5c00'],
  [20,  '#5c2d00'],
];

function colorRamp(property) {
  const stops = BREAD_COLORS.flatMap(([v, c]) => [v, c]);
  return ['interpolate', ['linear'], ['coalesce', ['get', property], 0], ...stops];
}

export function drawBaguetteCapitalMap(containerSelector, { communes }) {
  const container = document.querySelector(containerSelector);
  if (!container) throw new Error(`container not found: ${containerSelector}`);
  container.style.height = '560px';

  const map = new maplibregl.Map({
    container: container,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [2.35, 48.72],
    zoom: 8.2,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  container.parentElement.style.position = 'relative';
  container.parentElement.appendChild(tooltip);

  map.on('load', () => {
    map.addSource('communes', {
      type: 'geojson',
      data: communes,
    });

    map.addLayer({
      id: 'communes-fill',
      type: 'fill',
      source: 'communes',
      paint: {
        'fill-color': colorRamp('bakeriesPer10k'),
        'fill-opacity': 0.85,
      },
    });

    map.addLayer({
      id: 'communes-outline',
      type: 'line',
      source: 'communes',
      paint: {
        'line-color': '#b8a080',
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.3, 12, 0.8],
        'line-opacity': 0.5,
      },
    });

    map.on('mousemove', 'communes-fill', (e) => {
      const props = e.features[0].properties;
      const per10k = typeof props.bakeriesPer10k === 'number'
        ? props.bakeriesPer10k.toFixed(1)
        : '0.0';
      tooltip.innerHTML = `
        <span class="tt-name">${props.name}</span>
        <span class="tt-row"><span class="tt-label">Dép. </span>${props.dept}</span>
        <span class="tt-row"><span class="tt-label">Bakeries: </span>${props.bakeries}</span>
        <span class="tt-row"><span class="tt-label">Per 10,000: </span>${per10k}</span>
        <span class="tt-row"><span class="tt-label">Population: </span>${(props.population || 0).toLocaleString('fr-FR')}</span>
      `;
      tooltip.style.display = 'block';
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const parentRect = container.parentElement.getBoundingClientRect();
      let left = e.originalEvent.clientX - parentRect.left + 12;
      let top = e.originalEvent.clientY - parentRect.top - 10;
      if (left + 200 > parentRect.width) left -= 220;
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    });

    map.on('mouseleave', 'communes-fill', () => {
      tooltip.style.display = 'none';
      map.getCanvas().style.cursor = '';
    });
  });

  return {
    flyToParis() {
      map.flyTo({ center: [2.347, 48.859], zoom: 11.5, duration: 1200 });
    },
    flyToIDF() {
      map.flyTo({ center: [2.35, 48.72], zoom: 8.2, duration: 1200 });
    },
    flyToSeineMarne() {
      map.flyTo({ center: [3.05, 48.6], zoom: 9.0, duration: 1200 });
    },
  };
}

export function drawDeptChart(containerSelector, deptSummary) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const sorted = [...deptSummary].sort((a, b) => b.per10k - a.per10k);
  const maxVal = sorted[0].per10k;

  container.innerHTML = sorted.map(d => {
    const pct = (d.per10k / maxVal * 100).toFixed(1);
    const isTop = d.per10k === maxVal;
    return `
      <div class="dept-row" title="${d.name}: ${d.per10k}/10k (${d.bakeries.toLocaleString('fr-FR')} bakeries)">
        <div class="dept-label">${d.name}</div>
        <div class="dept-bar-wrap">
          <div class="dept-bar${isTop ? ' dept-bar-top' : ''}" style="width:${pct}%"></div>
        </div>
        <div class="dept-val">${d.per10k}</div>
      </div>
    `;
  }).join('');
}
