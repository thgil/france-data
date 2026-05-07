// stories/republic-of-saints/charts.js
// Dot-density map: every saint-named commune in France.
// Export: drawSaintMap(selector, refs)
// refs shape: { saints, stats }

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP       = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const FRANCE_CENTER = [2.5, 46.6];
const FRANCE_ZOOM   = 5.5;

// Indigo — evokes stained glass, medieval illumination
const SAINT_COLOR = '#5B4BD4';

const DEPT_NAMES = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
  '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
  '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud',
  '2B': 'Haute-Corse', '21': "Côte-d'Or", '22': "Côtes-d'Armor", '23': 'Creuse',
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
  '94': 'Val-de-Marne', '95': "Val-d'Oise",
};

function setHeight(el) {
  const vh = window.innerHeight || 800;
  el.style.height = Math.max(Math.round(vh * 0.8), 500) + 'px';
  el.style.position = 'relative';
}

function saintGeoJSON(saints) {
  const [cx, cy] = FRANCE_CENTER;
  const sorted = saints
    .filter(s => s.lat && s.lng)
    .map(s => ({ ...s, _d: Math.sqrt((s.lng - cx) ** 2 + (s.lat - cy) ** 2) }))
    .sort((a, b) => a._d - b._d);

  return {
    type: 'FeatureCollection',
    features: sorted.map((s, rank) => ({
      type: 'Feature',
      id: rank,
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: { name: s.n, dept: s.d, pop: s.p, rank },
    })),
  };
}

export function drawSaintMap(selector, refs) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!container) { console.error('drawSaintMap: container not found', selector); return; }

  setHeight(container);

  const { saints } = refs;
  const total = saints.length;
  const geojson = saintGeoJSON(saints);

  const map = new maplibregl.Map({
    container,
    style:  BASEMAP,
    center: FRANCE_CENTER,
    zoom:   FRANCE_ZOOM,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  // Tooltip
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

  // Animation
  let animationDone = false;

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
      const visible = Math.min(step * batchSize, total);
      map.setFilter('saint-dots', ['<', ['get', 'rank'], visible]);
      if (visible >= total) clearInterval(tick);
    }, interval);
  }

  map.on('load', () => {
    map.addSource('saints', { type: 'geojson', data: geojson });

    map.addLayer({
      id:     'saint-dots',
      type:   'circle',
      source: 'saints',
      filter: ['<', ['get', 'rank'], 0],
      paint: {
        'circle-radius':         3,
        'circle-color':          SAINT_COLOR,
        'circle-opacity':        0.75,
        'circle-stroke-color':   '#ffffff',
        'circle-stroke-width':   0.4,
        'circle-stroke-opacity': 0.4,
      },
    });

    map.on('mouseenter', 'saint-dots', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const { name, dept, pop } = e.features[0].properties;
      const deptName = DEPT_NAMES[dept] || dept || '—';
      const popStr   = pop ? pop.toLocaleString('fr-FR') + ' residents' : 'population unknown';
      showTooltip(e,
        `<span class="tt-name">${name}</span>` +
        `<span class="tt-row">${deptName}</span>` +
        `<span class="tt-row">${popStr}</span>`
      );
    });
    map.on('mouseleave', 'saint-dots', () => {
      map.getCanvas().style.cursor = '';
      hideTooltip();
    });

    runAnimation();
  });

  return {
    map,
    flyToFrance()    { map.flyTo({ center: FRANCE_CENTER,   zoom: FRANCE_ZOOM, duration: 800 }); },
    flyToMassif()    { map.flyTo({ center: [2.8, 45.2],     zoom: 7.5,         duration: 800 }); },
    flyToAlsace()    { map.flyTo({ center: [7.5, 48.4],     zoom: 8.5,         duration: 800 }); },
    flyToBretagne()  { map.flyTo({ center: [-3.0, 48.0],    zoom: 8,           duration: 800 }); },
    flyToParis()     { map.flyTo({ center: [2.35, 48.86],   zoom: 10,          duration: 800 }); },
    replay() {
      if (!map.getLayer('saint-dots')) return;
      map.setFilter('saint-dots', ['<', ['get', 'rank'], 0]);
      animationDone = false;
      setTimeout(runAnimation, 200);
    },
  };
}

// ---------------------------------------------------------------------------
// Top-saints bar chart (pure DOM/CSS — no canvas dependency)
// ---------------------------------------------------------------------------
export function drawSaintChart(selector, topSaints) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!container || !topSaints?.length) return;

  const max = topSaints[0].count;

  container.innerHTML = topSaints.slice(0, 15).map(({ name, count }) => {
    const pct = (count / max * 100).toFixed(1);
    return `
      <div class="saint-row">
        <span class="saint-label">Saint-${name}</span>
        <div class="saint-bar-wrap">
          <div class="saint-bar" style="width:${pct}%"></div>
          <span class="saint-count">${count}</span>
        </div>
      </div>`;
  }).join('');
}
