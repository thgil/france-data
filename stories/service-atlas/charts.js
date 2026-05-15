// stories/service-atlas/charts.js
// IDF service-completeness choropleth: bakeries + pharmacies + bars per commune.
// Exports: drawServiceMap, drawDeptChart

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';
import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

const BASEMAP = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// Score 0–3 colours (warm to green)
const SCORE_COLORS = ['#e8d8d0', '#f0a55a', '#85ba7a', '#2d7a4a'];
const SCORE_LABELS = ['None', 'One', 'Two', 'All three'];

const DEPT_NAMES = {
  '75': 'Paris', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne', '95': "Val-d'Oise",
};

const PRESETS = [
  { label: 'Île-de-France', center: [2.45, 48.75], zoom: 8.3 },
  { label: 'Paris',          center: [2.35, 48.87], zoom: 11   },
  { label: 'Seine-et-Marne', center: [2.95, 48.70], zoom: 9    },
  { label: 'Outer ring',     center: [1.95, 48.70], zoom: 9    },
];

function scoreLabel(s) {
  return ['No services', '1 service', '2 services', 'All 3 services'][s] ?? 'Unknown';
}

export function drawServiceMap(selector, refs) {
  const { communes, barStats } = refs;
  const container = document.querySelector(selector);
  if (!container) return;

  // Merge bar data into GeoJSON features
  for (const f of communes.features) {
    const p = f.properties;
    const bars = barStats[p.code] || 0;
    p.bars = bars;
    const bak  = (p.bakeries  || 0) > 0 ? 1 : 0;
    const ph   = (p.pharmacies || 0) > 0 ? 1 : 0;
    const bar  = bars > 0 ? 1 : 0;
    p.score = bak + ph + bar;
  }

  const vh = window.innerHeight || 800;
  container.style.height = Math.max(Math.round(vh * 0.75), 480) + 'px';
  container.style.position = 'relative';

  const loadingEl = document.createElement('div');
  loadingEl.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#f8f5f0;font-family:sans-serif;font-size:13px;color:#888;z-index:10';
  loadingEl.textContent = 'Loading map…';
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

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  container.appendChild(tooltip);

  let hoveredId = null;

  map.on('load', () => {
    loadingEl.remove();

    map.addSource('communes', {
      type: 'geojson',
      data: communes,
      promoteId: 'code',
    });

    // Fill by service score
    map.addLayer({
      id: 'communes-fill',
      type: 'fill',
      source: 'communes',
      paint: {
        'fill-color': [
          'match', ['get', 'score'],
          0, SCORE_COLORS[0],
          1, SCORE_COLORS[1],
          2, SCORE_COLORS[2],
          3, SCORE_COLORS[3],
          '#ccc',
        ],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false], 0.9,
          0.75,
        ],
      },
    });

    // Border
    map.addLayer({
      id: 'communes-line',
      type: 'line',
      source: 'communes',
      paint: {
        'line-color': '#a09080',
        'line-width': 0.3,
        'line-opacity': 0.6,
      },
    });

    // Hover
    map.on('mousemove', 'communes-fill', (e) => {
      if (!e.features.length) return;
      const f = e.features[0];
      const p = f.properties;

      if (hoveredId !== null) map.setFeatureState({ source: 'communes', id: hoveredId }, { hover: false });
      hoveredId = f.id;
      map.setFeatureState({ source: 'communes', id: hoveredId }, { hover: true });

      const services = [];
      if ((p.bakeries || 0) > 0)  services.push(`${p.bakeries} bakeri${p.bakeries === 1 ? 'e' : 'es'}`);
      if ((p.pharmacies || 0) > 0) services.push(`${p.pharmacies} pharmaci${p.pharmacies === 1 ? 'e' : 'es'}`);
      if ((p.bars || 0) > 0)       services.push(`${p.bars} bar${p.bars === 1 ? '' : 's'}`);

      const serviceStr = services.length ? services.join(', ') : 'none recorded';
      const pop = p.population ? Number(p.population).toLocaleString('fr-FR') : '—';

      tooltip.innerHTML = `
        <span class="tt-name">${p.name}</span>
        <span class="tt-row"><span class="tt-label">Services:</span> ${scoreLabel(p.score)}</span>
        <span class="tt-row">${serviceStr}</span>
        <span class="tt-row"><span class="tt-label">Population:</span> ${pop}</span>
        <span class="tt-row"><span class="tt-label">Département:</span> ${DEPT_NAMES[p.dept] || p.dept}</span>
      `;
      tooltip.style.display = 'block';

      const rect = container.getBoundingClientRect();
      let x = e.point.x + 12;
      let y = e.point.y - 10;
      if (x + 200 > container.clientWidth) x = e.point.x - 215;
      tooltip.style.left = x + 'px';
      tooltip.style.top  = y + 'px';

      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'communes-fill', () => {
      if (hoveredId !== null) map.setFeatureState({ source: 'communes', id: hoveredId }, { hover: false });
      hoveredId = null;
      tooltip.style.display = 'none';
      map.getCanvas().style.cursor = '';
    });
  });

  return map;
}

export function drawDeptChart(selector, refs) {
  const { communes, barStats } = refs;
  const el = document.querySelector(selector);
  if (!el) return;

  const idfDepts = ['75','92','93','94','91','78','95','77'];
  const deptData = [];

  for (const f of communes.features) {
    const p = f.properties;
    const bars = barStats[p.code] || 0;
    const score = ((p.bakeries || 0) > 0 ? 1 : 0)
                + ((p.pharmacies || 0) > 0 ? 1 : 0)
                + (bars > 0 ? 1 : 0);
    deptData.push({ dept: p.dept, score, pop: p.population || 0 });
  }

  // Aggregate by dept + score
  const byDept = {};
  for (const d of deptData) {
    if (!byDept[d.dept]) byDept[d.dept] = { 0: 0, 1: 0, 2: 0, 3: 0, total: 0 };
    byDept[d.dept][d.score]++;
    byDept[d.dept].total++;
  }

  const rows = [];
  for (const dept of idfDepts) {
    const counts = byDept[dept] || { 0:0,1:0,2:0,3:0,total:0 };
    for (const s of [0, 1, 2, 3]) {
      rows.push({
        dept: DEPT_NAMES[dept] || dept,
        score: SCORE_LABELS[s],
        scoreVal: s,
        count: counts[s],
        pct: counts.total > 0 ? counts[s] / counts.total : 0,
      });
    }
  }

  const chart = Plot.plot({
    marginLeft: 120,
    marginBottom: 30,
    width: el.clientWidth || 680,
    height: 300,
    x: { label: '% of communes', tickFormat: d => `${Math.round(d * 100)}%` },
    y: { label: null, domain: idfDepts.map(d => DEPT_NAMES[d] || d) },
    color: {
      domain: SCORE_LABELS,
      range: SCORE_COLORS,
      legend: true,
    },
    marks: [
      Plot.barX(rows, Plot.stackX({
        x: 'pct',
        y: 'dept',
        fill: 'score',
        order: [3,2,1,0],
        title: d => `${d.dept} — ${d.score}: ${d.count} communes (${(d.pct*100).toFixed(0)}%)`,
      })),
      Plot.ruleX([0]),
    ],
  });

  el.appendChild(chart);
}
