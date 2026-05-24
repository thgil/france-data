// stories/commune-names/charts.js
// Sainte-Colombe dot map: 12 communes sharing the same name, spread across France.

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP       = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const FRANCE_CENTER = [2.3, 46.6];
const FRANCE_ZOOM   = 5.0;

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
  const vh = window.innerHeight || 700;
  el.style.height = Math.max(Math.round(vh * 0.65), 400) + 'px';
  el.style.position = 'relative';
}

export function drawSainteColombeMap(selector, sainteColombes) {
  const container = document.querySelector(selector);
  if (!container) return;
  setHeight(container);

  const map = new maplibregl.Map({
    container,
    style: BASEMAP,
    center: FRANCE_CENTER,
    zoom: FRANCE_ZOOM,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  container.appendChild(tooltip);

  map.on('load', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: sainteColombes.map((c, i) => ({
        type: 'Feature',
        id: i,
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: { dept: c.dept, pop: c.pop, code: c.code },
      })),
    };

    map.addSource('sainte-colombe', { type: 'geojson', data: geojson });

    map.addLayer({
      id: 'sc-dots',
      type: 'circle',
      source: 'sainte-colombe',
      paint: {
        'circle-radius': 9,
        'circle-color': '#b32020',
        'circle-opacity': 0.85,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      },
    });

    map.addLayer({
      id: 'sc-labels',
      type: 'symbol',
      source: 'sainte-colombe',
      layout: {
        'text-field': ['to-string', ['get', 'dept']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 9,
        'text-offset': [0, 0],
        'text-anchor': 'center',
        'text-allow-overlap': true,
      },
      paint: {
        'text-color': '#fff',
        'text-halo-color': 'transparent',
        'text-halo-width': 0,
      },
    });

    map.on('mousemove', 'sc-dots', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const p = e.features[0].properties;
      const deptName = DEPT_NAMES[p.dept] || `Dept ${p.dept}`;
      const pop = Number(p.pop).toLocaleString('fr-FR');
      tooltip.innerHTML = `
        <span class="tt-name">Sainte-Colombe (${p.dept})</span>
        <span class="tt-row"><span class="tt-label">Département:</span> ${deptName}</span>
        <span class="tt-row"><span class="tt-label">Population:</span> ${pop}</span>
      `;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.point.x + 14) + 'px';
      tooltip.style.top  = (e.point.y - 10) + 'px';
    });

    map.on('mouseleave', 'sc-dots', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });
  });

  return map;
}
