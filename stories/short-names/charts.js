/* charts.js — short-names story */

const TILE_URL = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

/* ── Dept code → name lookup (partial, for tooltip) ──────────────── */
const DEPT_NAMES = {
  '01':'Ain','02':'Aisne','03':'Allier','04':'Alpes-de-Haute-Provence',
  '05':'Hautes-Alpes','06':'Alpes-Maritimes','07':'Ardèche','08':'Ardennes',
  '09':'Ariège','10':'Aube','11':'Aude','12':'Aveyron','13':'Bouches-du-Rhône',
  '14':'Calvados','15':'Cantal','16':'Charente','17':'Charente-Maritime',
  '18':'Cher','19':'Corrèze','2A':'Corse-du-Sud','2B':'Haute-Corse',
  '21':'Côte-d\'Or','22':'Côtes-d\'Armor','23':'Creuse','24':'Dordogne',
  '25':'Doubs','26':'Drôme','27':'Eure','28':'Eure-et-Loir','29':'Finistère',
  '30':'Gard','31':'Haute-Garonne','32':'Gers','33':'Gironde','34':'Hérault',
  '35':'Ille-et-Vilaine','36':'Indre','37':'Indre-et-Loire','38':'Isère',
  '39':'Jura','40':'Landes','41':'Loir-et-Cher','42':'Loire',
  '43':'Haute-Loire','44':'Loire-Atlantique','45':'Loiret','46':'Lot',
  '47':'Lot-et-Garonne','48':'Lozère','49':'Maine-et-Loire','50':'Manche',
  '51':'Marne','52':'Haute-Marne','53':'Mayenne','54':'Meurthe-et-Moselle',
  '55':'Meuse','56':'Morbihan','57':'Moselle','58':'Nièvre','59':'Nord',
  '60':'Oise','61':'Orne','62':'Pas-de-Calais','63':'Puy-de-Dôme',
  '64':'Pyrénées-Atlantiques','65':'Hautes-Pyrénées','66':'Pyrénées-Orientales',
  '67':'Bas-Rhin','68':'Haut-Rhin','69':'Rhône','70':'Haute-Saône',
  '71':'Saône-et-Loire','72':'Sarthe','73':'Savoie','74':'Haute-Savoie',
  '75':'Paris','76':'Seine-Maritime','77':'Seine-et-Marne',
  '78':'Yvelines','79':'Deux-Sèvres','80':'Somme','81':'Tarn',
  '82':'Tarn-et-Garonne','83':'Var','84':'Vaucluse','85':'Vendée',
  '86':'Vienne','87':'Haute-Vienne','88':'Vosges','89':'Yonne',
  '90':'Territoire de Belfort','91':'Essonne','92':'Hauts-de-Seine',
  '93':'Seine-Saint-Denis','94':'Val-de-Marne','95':'Val-d\'Oise',
};

function deptName(code) {
  return DEPT_NAMES[code] || `Dept. ${code}`;
}

/* ── Map: short communes ─────────────────────────────────────────── */
export function drawShortMap(selector, { highlights }) {
  const el = document.querySelector(selector);
  if (!el) return null;
  el.style.height = '520px';

  const map = new maplibregl.Map({
    container: el,
    style: TILE_URL,
    center: [2.3, 46.5],
    zoom: 4.8,
    minZoom: 3,
    maxZoom: 14,
    attributionControl: { compact: true },
  });

  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  el.appendChild(tooltip);

  /* Only show 1-2 letter communes on the map — these are the stars */
  const starred = highlights.filter(c => c.len <= 2);

  map.on('load', () => {
    /* GeoJSON source */
    map.addSource('short-communes', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: starred.map(c => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
          properties: {
            name: c.name,
            dept: c.dept,
            pop: c.pop,
            len: c.len,
          },
        })),
      },
    });

    /* Circle layer */
    map.addLayer({
      id: 'communes-circle',
      type: 'circle',
      source: 'short-communes',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 5, 10, 9],
        'circle-color': [
          'case',
          ['==', ['get', 'len'], 1], '#1a6b5c',
          '#3d9e8a',
        ],
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 1.5,
        'circle-opacity': 0.9,
      },
    });

    /* Label layer */
    map.addLayer({
      id: 'communes-label',
      type: 'symbol',
      source: 'short-communes',
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Italic'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 4, 10, 10, 15],
        'text-offset': [0, 1.4],
        'text-anchor': 'top',
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#1a1a1a',
        'text-halo-color': '#fff',
        'text-halo-width': 1.5,
      },
    });

    /* Hover tooltip */
    map.on('mousemove', 'communes-circle', e => {
      map.getCanvas().style.cursor = 'pointer';
      const props = e.features[0].properties;
      const pop = props.pop > 0 ? props.pop.toLocaleString('fr-FR') : 'unknown';
      tooltip.innerHTML = `
        <span class="tt-name">${props.name}</span>
        <span class="tt-row"><span class="tt-label">Département:</span> ${deptName(props.dept)}</span>
        <span class="tt-row"><span class="tt-label">Population:</span> ${pop}</span>
        <span class="tt-row"><span class="tt-label">Name length:</span> ${props.len} character${props.len === 1 ? '' : 's'}</span>
      `;
      tooltip.style.display = 'block';
    });

    map.on('mouseleave', 'communes-circle', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });

    map.on('mousemove', e => {
      if (tooltip.style.display !== 'none') {
        tooltip.style.left = (e.point.x + 12) + 'px';
        tooltip.style.top = (e.point.y - 10) + 'px';
      }
    });
  });

  return map;
}

/* ── Histogram: name-length distribution ─────────────────────────── */
export function drawLengthHistogram(selector, { length_dist }) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = 660, H = 200, PAD = { top: 10, right: 20, bottom: 36, left: 48 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  /* Flatten the dist array [[len, count], ...] */
  const pairs = Array.isArray(length_dist) ? length_dist : Object.entries(length_dist).map(([k,v])=>[+k,v]);
  const maxLen = Math.max(...pairs.map(([l]) => l));
  const maxCount = Math.max(...pairs.map(([, c]) => c));

  /* Scale functions */
  const xScale = l => PAD.left + ((l - 1) / (maxLen)) * plotW;
  const barW = plotW / maxLen - 1;
  const yScale = c => PAD.top + plotH - (c / maxCount) * plotH;

  /* Build SVG */
  const bars = pairs.map(([l, c]) => {
    const x = xScale(l);
    const y = yScale(c);
    const barHeight = plotH - (y - PAD.top);
    const fill = l <= 2 ? '#1a6b5c' : l >= 30 ? '#b03a2e' : '#c8a96e';
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(barW, 1).toFixed(1)}" height="${barHeight.toFixed(1)}" fill="${fill}" opacity="0.85"/>`;
  }).join('\n');

  /* X-axis ticks at 1, 5, 10, 15, 20, 25, 30, 35, 40, 45 */
  const xTicks = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
  const xTickEls = xTicks.map(l => {
    const x = xScale(l) + barW / 2;
    return `<line x1="${x}" y1="${PAD.top + plotH}" x2="${x}" y2="${PAD.top + plotH + 4}" stroke="#aaa" stroke-width="1"/>
            <text x="${x}" y="${PAD.top + plotH + 16}" text-anchor="middle" font-size="10" fill="#666">${l}</text>`;
  }).join('\n');

  /* Y-axis ticks */
  const yTicks = [0, 1000, 2000, 3000];
  const yTickEls = yTicks.map(v => {
    const y = PAD.top + plotH - (v / maxCount) * plotH;
    return `<line x1="${PAD.left - 4}" y1="${y}" x2="${PAD.left + plotW}" y2="${y}" stroke="#e8e2d8" stroke-width="1"/>
            <text x="${PAD.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#888">${v.toLocaleString('fr-FR')}</text>`;
  }).join('\n');

  /* Median line at 10 */
  const medX = xScale(10) + barW / 2;
  const medLine = `<line x1="${medX}" y1="${PAD.top}" x2="${medX}" y2="${PAD.top + plotH}" stroke="#888" stroke-width="1" stroke-dasharray="4 3"/>
    <text x="${medX + 4}" y="${PAD.top + 14}" font-size="10" fill="#888">median (10)</text>`;

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;display:block">
      ${yTickEls}
      ${bars}
      ${medLine}
      ${xTickEls}
      <line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${PAD.top + plotH}" stroke="#aaa" stroke-width="1"/>
      <line x1="${PAD.left}" y1="${PAD.top + plotH}" x2="${PAD.left + plotW}" y2="${PAD.top + plotH}" stroke="#aaa" stroke-width="1"/>
      <text x="${W / 2}" y="${H - 2}" text-anchor="middle" font-size="11" fill="#666">Name length (characters)</text>
      <text x="${PAD.left - 36}" y="${PAD.top + plotH / 2}" text-anchor="middle" font-size="11" fill="#666" transform="rotate(-90 ${PAD.left - 36} ${PAD.top + plotH / 2})">Communes</text>
      <rect x="${PAD.left + plotW - 120}" y="${PAD.top + 4}" width="10" height="10" fill="#1a6b5c" opacity="0.85"/>
      <text x="${PAD.left + plotW - 106}" y="${PAD.top + 13}" font-size="10" fill="#444">1–2 chars</text>
      <rect x="${PAD.left + plotW - 120}" y="${PAD.top + 20}" width="10" height="10" fill="#b03a2e" opacity="0.85"/>
      <text x="${PAD.left + plotW - 106}" y="${PAD.top + 29}" font-size="10" fill="#444">30+ chars</text>
    </svg>
  `;
}
