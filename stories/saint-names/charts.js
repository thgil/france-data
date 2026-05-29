// stories/saint-names/charts.js
// Map showing the 12 Sainte-Colombe communes across France.
// Exports: drawNameMap(selector, stats)

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP       = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const FRANCE_CENTER = [2.5, 46.6];
const FRANCE_ZOOM   = 5.2;

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
  '94': 'Val-de-Marne', "95": "Val-d'Oise",
};

function setHeight(el) {
  const vh = window.innerHeight || 800;
  el.style.height = Math.max(Math.round(vh * 0.72), 420) + 'px';
  el.style.position = 'relative';
}

function makeGeoJSON(communes) {
  return {
    type: 'FeatureCollection',
    features: communes.map((c, i) => ({
      type: 'Feature',
      id: i,
      geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
      properties: {
        name: c.name,
        dept: c.dept,
        deptName: DEPT_NAMES[c.dept] || c.dept,
        pop: c.pop,
        apl: c.apl,
        code: c.code,
      },
    })),
  };
}

export function drawNameMap(selector, stats) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;

  setHeight(container);

  const map = new maplibregl.Map({
    container,
    style: BASEMAP,
    center: FRANCE_CENTER,
    zoom: FRANCE_ZOOM,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  container.appendChild(tooltip);

  const geojson = makeGeoJSON(stats.sainteColombes);

  map.on('load', () => {
    map.addSource('sainte-colombes', { type: 'geojson', data: geojson });

    // Glow ring
    map.addLayer({
      id: 'sc-halo',
      type: 'circle',
      source: 'sainte-colombes',
      paint: {
        'circle-radius': 14,
        'circle-color': '#c0392b',
        'circle-opacity': 0.15,
        'circle-stroke-width': 0,
      },
    });

    // Main dot
    map.addLayer({
      id: 'sc-dot',
      type: 'circle',
      source: 'sainte-colombes',
      paint: {
        'circle-radius': 7,
        'circle-color': '#c0392b',
        'circle-opacity': 0.9,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      },
    });

    // Hover state
    let hoverId = null;

    map.on('mousemove', 'sc-dot', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const f = e.features[0];
      if (!f) return;

      const p = f.properties;
      const deptLabel = p.deptName ? `${p.dept} — ${p.deptName}` : p.dept;
      const aplLabel = p.apl != null ? p.apl.toFixed(2) : '–';
      const popLabel = p.pop != null ? p.pop.toLocaleString('fr-FR') : '–';

      tooltip.innerHTML = `
        <span class="tt-name">${p.name}</span>
        <span class="tt-row"><span class="tt-label">Département</span> ${deptLabel}</span>
        <span class="tt-row"><span class="tt-label">Population</span> ${popLabel}</span>
        <span class="tt-row"><span class="tt-label">APL score</span> ${aplLabel}</span>
      `;
      tooltip.style.display = '';

      if (hoverId !== null && hoverId !== f.id) {
        map.setFeatureState({ source: 'sainte-colombes', id: hoverId }, { hover: false });
      }
      hoverId = f.id;
      map.setFeatureState({ source: 'sainte-colombes', id: hoverId }, { hover: true });
    });

    map.on('mouseleave', 'sc-dot', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
      if (hoverId !== null) {
        map.setFeatureState({ source: 'sainte-colombes', id: hoverId }, { hover: false });
        hoverId = null;
      }
    });

    map.on('mousemove', (e) => {
      if (tooltip.style.display !== 'none') {
        const rect = container.getBoundingClientRect();
        let x = e.point.x + 14;
        let y = e.point.y - 10;
        if (x + 240 > container.offsetWidth) x = e.point.x - 240 - 14;
        if (y + 120 > container.offsetHeight) y = e.point.y - 120;
        tooltip.style.left = x + 'px';
        tooltip.style.top  = y + 'px';
      }
    });
  });

  return {
    flyToFrance: () => map.flyTo({ center: FRANCE_CENTER, zoom: FRANCE_ZOOM, duration: 900 }),
  };
}
