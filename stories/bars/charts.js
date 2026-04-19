// stories/bars/charts.js
// Full-France dot-density map: every bar (débit de boissons) in France.
// Export: drawBarMap(selector, refs)
// refs shape: { bars, stats }

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP       = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const FRANCE_CENTER = [2.5, 46.6];
const FRANCE_ZOOM   = 5.5;

// Amber/golden colour for bar dots
const AMBER = '#c67c00';

// Full département name lookup
const DEPT_NAMES = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
  '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
  '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud',
  '2B': 'Haute-Corse', '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor', '23': 'Creuse',
  '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure',
  '28': 'Eure-et-Loir', '29': 'Finistère', '30': 'Gard', '31': 'Haute-Garonne',
  '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
  '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
  '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
  '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
  '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
  '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
  '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
  '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
  '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
  '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
  '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
  '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne', '95': 'Val-d\'Oise',
  '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane', '974': 'La Réunion',
  '976': 'Mayotte',
};

function setHeight(el) {
  const vh = window.innerHeight || 800;
  el.style.height = Math.max(Math.round(vh * 0.8), 500) + 'px';
  el.style.position = 'relative';
}

// Build GeoJSON from bars array, sorted by distance from France centroid
function barsGeoJSON(bars) {
  const [cx, cy] = FRANCE_CENTER;
  const withDist = bars.map((b) => ({
    ...b,
    _d: Math.sqrt((b.lng - cx) ** 2 + (b.lat - cy) ** 2),
  }));
  withDist.sort((a, b) => a._d - b._d);

  return {
    type: 'FeatureCollection',
    features: withDist.map((b, rank) => ({
      type: 'Feature',
      id: rank,
      geometry: { type: 'Point', coordinates: [b.lng, b.lat] },
      properties: {
        name:    b.name   || '',
        commune: b.commune || '',
        dept:    b.dept   || '',
        rank,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function drawBarMap(selector, refs) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!container) { console.error('drawBarMap: container not found', selector); return; }

  setHeight(container);

  const { bars, stats } = refs;
  const total = bars.length;

  const barGeoJSON = barsGeoJSON(bars);

  // Per-commune bar count (for tooltip)
  const communeBarCounts = new Map();
  for (const b of bars) {
    const key = b.commune || '';
    communeBarCounts.set(key, (communeBarCounts.get(key) || 0) + 1);
  }

  // ── Map instance ───────────────────────────────────────────────────────────
  const map = new maplibregl.Map({
    container,
    style:  BASEMAP,
    center: FRANCE_CENTER,
    zoom:   FRANCE_ZOOM,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  // ── Tooltip ────────────────────────────────────────────────────────────────
  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  container.appendChild(tooltip);

  function showTooltip(e, html) {
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    let x = e.point.x + 12;
    let y = e.point.y - 10;
    if (x + 240 > container.clientWidth)  x = e.point.x - 250;
    if (y + 80  > container.clientHeight) y = e.point.y - 90;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
  }
  function hideTooltip() { tooltip.style.display = 'none'; }

  // ── Animation state ────────────────────────────────────────────────────────
  let animationDone = false;
  let visibleCount  = 0;

  function runAnimation() {
    if (animationDone) return;
    animationDone = true;

    const DURATION_MS = 3000;
    const STEPS       = 60;
    const batchSize   = Math.ceil(total / STEPS);
    const interval    = DURATION_MS / STEPS;
    let step = 0;

    const tick = setInterval(() => {
      step++;
      visibleCount = Math.min(step * batchSize, total);
      map.setFilter('bar-dots', ['<', ['get', 'rank'], visibleCount]);
      if (visibleCount >= total) clearInterval(tick);
    }, interval);
  }

  // ── Map load ───────────────────────────────────────────────────────────────
  map.on('load', () => {
    map.addSource('bars', {
      type: 'geojson',
      data: barGeoJSON,
    });

    map.addLayer({
      id:     'bar-dots',
      type:   'circle',
      source: 'bars',
      filter: ['<', ['get', 'rank'], 0],   // start hidden
      paint: {
        'circle-radius':         2,
        'circle-color':          AMBER,
        'circle-opacity':        0.7,
        'circle-stroke-color':   '#ffffff',
        'circle-stroke-width':   0.3,
        'circle-stroke-opacity': 0.3,
      },
    });

    // Hover
    map.on('mouseenter', 'bar-dots', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const { name, commune, dept } = e.features[0].properties;
      const deptName    = DEPT_NAMES[dept] || dept || '—';
      const count       = communeBarCounts.get(commune) || '?';
      const displayName = name || 'Bar';
      showTooltip(e,
        `<span class="tt-name">${displayName}</span>` +
        `<span class="tt-row">${commune} · ${deptName}</span>` +
        `<span class="tt-row"><span class="tt-label">${count}</span> bar${count === 1 ? '' : 's'} in this commune</span>`
      );
    });
    map.on('mouseleave', 'bar-dots', () => {
      map.getCanvas().style.cursor = '';
      hideTooltip();
    });

    runAnimation();
  });

  // ── Public API ─────────────────────────────────────────────────────────────
  const api = {
    map,

    // Zoom presets
    flyToFrance()   { map.flyTo({ center: FRANCE_CENTER, zoom: FRANCE_ZOOM,  duration: 800 }); },
    flyToParis()    { map.flyTo({ center: [2.35, 48.86],  zoom: 12,           duration: 800 }); },
    flyToBretagne() { map.flyTo({ center: [-3.0, 48.1],   zoom: 8,            duration: 800 }); },
    flyToNord()     { map.flyTo({ center: [2.8, 50.4],    zoom: 8.5,          duration: 800 }); },
    flyToCoteAzur() { map.flyTo({ center: [6.5, 43.6],    zoom: 9,            duration: 800 }); },
    flyToLyon()     { map.flyTo({ center: [4.83, 45.76],  zoom: 11,           duration: 800 }); },

    // Replay animation
    replay() {
      if (!map.getLayer('bar-dots')) return;
      map.setFilter('bar-dots', ['<', ['get', 'rank'], 0]);
      animationDone = false;
      visibleCount  = 0;
      setTimeout(runAnimation, 200);
    },
  };

  return api;
}
