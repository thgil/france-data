// stories/altitude-bars/charts.js
// Choropleth: bars per 10,000 residents per commune.
// Export: drawAltitudeBarsMap(selector, geojson, barsLookup)

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const PRESETS = [
  { label: 'France',    center: [2.5, 46.6],    zoom: 5.5 },
  { label: 'Alps',      center: [6.7, 45.4],    zoom: 8.5 },
  { label: 'Pyrenees',  center: [0.1, 42.8],    zoom: 8.5 },
  { label: 'Île-de-France', center: [2.35, 48.85], zoom: 9 },
  { label: 'Bretagne',  center: [-3.2, 47.8],   zoom: 8   },
];

// Map bars_per10k → fill colour (stepped scale)
const COLOR_EXPR = [
  'case',
  ['==', ['get', 'per10k'], null],    '#dedbd4',   // no data (pop < 100)
  ['==', ['get', 'bars'],   0],       '#f5f1eb',   // zero bars
  ['<', ['get', 'per10k'],  5],       '#fde8b5',   // very sparse  (<5)
  ['<', ['get', 'per10k'],  10],      '#f8c355',   // sparse        (5–10)
  ['<', ['get', 'per10k'],  20],      '#e8952a',   // moderate     (10–20)
  ['<', ['get', 'per10k'],  40],      '#c85018',   // high         (20–40)
  '#8b2000',                                        // very high     (40+)
];

function fmtNum(n, decimals = 1) {
  if (n == null) return '—';
  return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: decimals });
}

const DEPT_NAMES = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhône',
  '14': 'Calvados', '15': 'Cantal', '16': 'Charente', '17': 'Charente-Maritime',
  '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud', '2B': 'Haute-Corse',
  '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor', '23': 'Creuse', '24': 'Dordogne',
  '25': 'Doubs', '26': 'Drôme', '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère',
  '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde', '34': 'Hérault',
  '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère',
  '39': 'Jura', '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire',
  '43': 'Haute-Loire', '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot',
  '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche',
  '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle',
  '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
  '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
  '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
  '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne', '87': 'Haute-Vienne',
  '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort', '91': 'Essonne',
  '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne',
  '95': 'Val-d\'Oise', '97': 'DOM-TOM',
};

export function drawAltitudeBarsMap(selector, geojson, barsLookup) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Merge bar counts + per10k into each feature
  for (const feat of geojson.features) {
    const code = feat.properties.code;
    const pop  = feat.properties.pop;
    const bars = barsLookup[code] || 0;
    feat.properties.bars = bars;
    if (pop && pop >= 100) {
      feat.properties.per10k = bars / pop * 10000;
    } else {
      feat.properties.per10k = null;
    }
  }

  const vh = window.innerHeight || 800;
  container.style.height = Math.max(Math.round(vh * 0.78), 480) + 'px';
  container.style.position = 'relative';

  // Loading overlay
  const loadingEl = document.createElement('div');
  loadingEl.className = 'ab-loading';
  loadingEl.textContent = 'Loading 35,000 communes…';
  container.appendChild(loadingEl);

  const map = new maplibregl.Map({
    container,
    style: BASEMAP,
    center: PRESETS[0].center,
    zoom: PRESETS[0].zoom,
    attributionControl: false,
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  map.on('load', () => {
    loadingEl.style.display = 'none';

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
        'fill-color': COLOR_EXPR,
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false], 1.0,
          0.85,
        ],
      },
    });

    map.addLayer({
      id: 'communes-outline',
      type: 'line',
      source: 'communes',
      paint: {
        'line-color': '#a89880',
        'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.2, 10, 0.7],
        'line-opacity': 0.5,
      },
    });

    // Hover highlight
    let hoveredId = null;
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'ab-popup',
      maxWidth: '220px',
    });

    map.on('mousemove', 'communes-fill', (e) => {
      if (!e.features.length) return;
      map.getCanvas().style.cursor = 'crosshair';

      const feat = e.features[0];
      const props = feat.properties;
      const id = props.code;

      if (hoveredId !== null && hoveredId !== id) {
        map.setFeatureState({ source: 'communes', id: hoveredId }, { hover: false });
      }
      hoveredId = id;
      map.setFeatureState({ source: 'communes', id }, { hover: true });

      const deptName = DEPT_NAMES[props.dept] || `Dept. ${props.dept}`;
      const per10kStr = props.per10k != null ? fmtNum(props.per10k) : '—';
      const popStr = props.pop ? fmtNum(props.pop, 0) : '—';
      const barsStr = fmtNum(props.bars || 0, 0);

      popup.setLngLat(e.lngLat).setHTML(`
        <span class="tt-name">${props.communeName}</span>
        <span class="tt-code">${deptName}</span>
        <span class="tt-row"><span class="tt-label">Bars:</span> ${barsStr}</span>
        <span class="tt-row"><span class="tt-label">Population:</span> ${popStr}</span>
        <span class="tt-row"><span class="tt-label">Per 10,000:</span> ${per10kStr}</span>
      `).addTo(map);
    });

    map.on('mouseleave', 'communes-fill', () => {
      map.getCanvas().style.cursor = '';
      if (hoveredId !== null) {
        map.setFeatureState({ source: 'communes', id: hoveredId }, { hover: false });
        hoveredId = null;
      }
      popup.remove();
    });
  });

  // Wire up preset buttons
  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.preset, 10);
      const p = PRESETS[idx];
      if (!p) return;
      map.flyTo({ center: p.center, zoom: p.zoom, duration: 900 });
      document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('ab-preset-active'));
      btn.classList.add('ab-preset-active');
    });
  });

  // Mark first button active
  const firstBtn = document.querySelector('[data-preset="0"]');
  if (firstBtn) firstBtn.classList.add('ab-preset-active');
}
