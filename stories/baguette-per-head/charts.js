import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.esm.min.js';

const CARTO_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const FILL_COLOR = [
  'case',
  ['==', ['get', 'bakeries'], 0],
  '#ccc8c0',
  [
    'interpolate', ['linear'], ['get', 'bakeriesPer10k'],
    0,   '#f5edd8',
    3,   '#e8cb78',
    6,   '#d4a020',
    10,  '#b87800',
    15,  '#8b5a00',
    22,  '#5c3000'
  ]
];

const FILL_OPACITY_START = 0;
const FILL_OPACITY_END   = 0.82;
const ANIM_DURATION_MS   = 2800;

const IDF_CENTER  = [2.35, 48.75];
const IDF_ZOOM    = 8.4;
const PARIS_CENTER = [2.347, 48.858];
const PARIS_ZOOM  = 11.5;

export function drawBaguetteMap(mountSelector, { geojson }) {
  const container = document.querySelector(mountSelector);
  if (!container) return null;

  container.style.height = '600px';

  const map = new maplibregl.Map({
    container,
    style: CARTO_STYLE,
    center: IDF_CENTER,
    zoom: IDF_ZOOM,
    minZoom: 7,
    maxZoom: 14,
    attributionControl: false,
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  container.style.position = 'relative';
  container.appendChild(tooltip);

  let animStart = null;
  let animFrame = null;
  let animDone  = false;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(ts) {
    if (!animStart) animStart = ts;
    const elapsed = ts - animStart;
    const t = Math.min(elapsed / ANIM_DURATION_MS, 1);
    const opacity = FILL_OPACITY_END * easeOutCubic(t);
    if (map.getLayer('communes-fill')) {
      map.setPaintProperty('communes-fill', 'fill-opacity', opacity);
    }
    if (t < 1) {
      animFrame = requestAnimationFrame(animate);
    } else {
      animDone = true;
    }
  }

  map.on('load', () => {
    map.addSource('communes', {
      type: 'geojson',
      data: geojson,
      promoteId: 'code',
    });

    map.addLayer({
      id: 'communes-fill',
      type: 'fill',
      source: 'communes',
      paint: {
        'fill-color': FILL_COLOR,
        'fill-opacity': FILL_OPACITY_START,
        'fill-outline-color': [
          'interpolate', ['linear'], ['zoom'],
          9,  'rgba(100,80,50,0)',
          11, 'rgba(100,80,50,0.25)',
          13, 'rgba(100,80,50,0.55)',
        ],
      },
    });

    animFrame = requestAnimationFrame(animate);

    map.on('mousemove', 'communes-fill', e => {
      map.getCanvas().style.cursor = 'pointer';
      const p = e.features[0].properties;
      const name = p.name || p.code;
      const bak  = p.bakeries ?? 0;
      const pop  = p.population ? Number(p.population).toLocaleString('fr-FR') : '—';
      const per  = (p.bakeriesPer10k ?? 0).toFixed(1);
      const dept = p.dept || '';
      tooltip.style.display = 'block';
      tooltip.innerHTML = `
        <span class="tt-name">${name}</span>
        <span class="tt-row"><span class="tt-label">Dépt</span> ${dept}</span>
        <span class="tt-row"><span class="tt-label">Bakeries</span> ${bak}</span>
        <span class="tt-row"><span class="tt-label">Population</span> ${pop}</span>
        <span class="tt-row"><span class="tt-label">Per 10,000</span> ${bak === 0 ? '—' : per}</span>
      `;
      const rect = container.getBoundingClientRect();
      const x = e.originalEvent.clientX - rect.left;
      const y = e.originalEvent.clientY - rect.top;
      tooltip.style.left = (x + 14) + 'px';
      tooltip.style.top  = (y - 10) + 'px';
    });

    map.on('mouseleave', 'communes-fill', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });
  });

  function flyToIDF() {
    map.flyTo({ center: IDF_CENTER, zoom: IDF_ZOOM, duration: 800 });
  }

  function flyToParis() {
    map.flyTo({ center: PARIS_CENTER, zoom: PARIS_ZOOM, duration: 800 });
  }

  function replay() {
    if (animFrame) cancelAnimationFrame(animFrame);
    animStart = null;
    animDone  = false;
    if (map.getLayer('communes-fill')) {
      map.setPaintProperty('communes-fill', 'fill-opacity', 0);
    }
    flyToIDF();
    setTimeout(() => {
      animFrame = requestAnimationFrame(animate);
    }, 900);
  }

  return { flyToIDF, flyToParis, replay };
}
