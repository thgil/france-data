// stories/bar-density/charts.js
// Per-capita bar density by département: ranked chart + colour-coded dot map.
// Exports: drawRankingChart(canvasId, data), drawDensityMap(selector, refs)

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP       = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const FRANCE_CENTER = [2.5, 46.6];
const FRANCE_ZOOM   = 5.5;

// ── Colour scale: cold blue → warm amber ────────────────────────────────────
// Maps a per-10k value in [MIN, MAX] to a hex colour.
const MIN_VAL = 3.0;
const MAX_VAL = 22.0;

function lerpColour(t) {
  // cold: #5b8db8  mid: #c8b89a  hot: #b84800
  const stops = [
    [0.00, [91,  141, 184]],
    [0.35, [200, 184, 154]],
    [1.00, [184, 72,  0  ]],
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      lo = stops[i]; hi = stops[i + 1]; break;
    }
  }
  const s = (t - lo[0]) / (hi[0] - lo[0]);
  const r = Math.round(lo[1][0] + (hi[1][0] - lo[1][0]) * s);
  const g = Math.round(lo[1][1] + (hi[1][1] - lo[1][1]) * s);
  const b = Math.round(lo[1][2] + (hi[1][2] - lo[1][2]) * s);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function deptColour(per10k) {
  const t = Math.max(0, Math.min(1, (per10k - MIN_VAL) / (MAX_VAL - MIN_VAL)));
  return lerpColour(t);
}

// ── Ranked horizontal bar chart ─────────────────────────────────────────────
export function drawRankingChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const depts  = [...data.depts].reverse(); // bottom-to-top for horizontal bar
  const labels = depts.map(d => `${d.dept} · ${d.name}`);
  const values = depts.map(d => d.per10k);
  const colours = depts.map(d => deptColour(d.per10k));

  // Dynamically import Chart.js from CDN
  import('https://cdn.jsdelivr.net/npm/chart.js@4/+esm').then(({ Chart }) => {
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colours,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.raw.toFixed(2)} bars per 10,000 residents`,
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Bars per 10,000 residents', font: { size: 11 } },
            grid: { color: '#ede8e0' },
            ticks: { font: { size: 10 } },
          },
          y: {
            ticks: {
              font: { size: 9.5 },
              autoSkip: false,
            },
            grid: { display: false },
          },
        },
      },
    });
  });
}

// ── Dot-density map coloured by département per-capita rank ──────────────────
export function drawDensityMap(selector, refs) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!container) return;

  const { bars, data } = refs;

  // Build dept → colour lookup
  const deptColorMap = {};
  for (const d of data.depts) {
    deptColorMap[d.dept] = deptColour(d.per10k);
  }

  // Build Maplibre 'match' expression: ['match', ['get', 'dept'], d1, c1, d2, c2, ..., fallback]
  const matchExpr = ['match', ['get', 'dept']];
  for (const [dept, col] of Object.entries(deptColorMap)) {
    matchExpr.push(dept, col);
  }
  matchExpr.push('#aaaaaa'); // fallback (DOM-TOM etc.)

  // Build per-10k lookup for tooltip
  const deptPer10k = {};
  const deptBarCount = {};
  for (const d of data.depts) {
    deptPer10k[d.dept]   = d.per10k;
    deptBarCount[d.dept] = d.bars;
  }

  // Per-commune count for tooltip
  const communeCount = new Map();
  for (const b of bars) {
    const k = b.commune || '';
    communeCount.set(k, (communeCount.get(k) || 0) + 1);
  }

  // Set height
  const vh = window.innerHeight || 800;
  container.style.height = Math.max(Math.round(vh * 0.8), 500) + 'px';
  container.style.position = 'relative';

  // Sort bars by distance from centre (for animation)
  const [cx, cy] = FRANCE_CENTER;
  const sorted = [...bars].sort((a, b) => {
    const da = (a.lng - cx) ** 2 + (a.lat - cy) ** 2;
    const db = (b.lng - cx) ** 2 + (b.lat - cy) ** 2;
    return da - db;
  });

  const geojson = {
    type: 'FeatureCollection',
    features: sorted.map((b, rank) => ({
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

  const total = sorted.length;

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
    let x = e.point.x + 12, y = e.point.y - 10;
    if (x + 240 > container.clientWidth)  x = e.point.x - 250;
    if (y + 100 > container.clientHeight) y = e.point.y - 110;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
  }
  function hideTooltip() { tooltip.style.display = 'none'; }

  let animationDone = false;

  function runAnimation() {
    if (animationDone) return;
    animationDone = true;
    const DURATION_MS = 3000, STEPS = 60;
    const batchSize = Math.ceil(total / STEPS);
    const interval  = DURATION_MS / STEPS;
    let step = 0, visible = 0;
    const tick = setInterval(() => {
      step++;
      visible = Math.min(step * batchSize, total);
      map.setFilter('bar-dots', ['<', ['get', 'rank'], visible]);
      if (visible >= total) clearInterval(tick);
    }, interval);
  }

  map.on('load', () => {
    map.addSource('bars', { type: 'geojson', data: geojson });

    map.addLayer({
      id: 'bar-dots',
      type: 'circle',
      source: 'bars',
      filter: ['<', ['get', 'rank'], 0],
      paint: {
        'circle-radius':         2,
        'circle-color':          matchExpr,
        'circle-opacity':        0.75,
        'circle-stroke-color':   '#ffffff',
        'circle-stroke-width':   0.3,
        'circle-stroke-opacity': 0.3,
      },
    });

    map.on('mouseenter', 'bar-dots', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const { name, commune, dept } = e.features[0].properties;
      const per10k = deptPer10k[dept];
      const count  = deptBarCount[dept] || '?';
      const commCount = communeCount.get(commune) || '?';
      const displayName = name || 'Bar';
      showTooltip(e,
        `<span class="tt-name">${displayName}</span>` +
        `<span class="tt-row">${commune} · Dept ${dept}</span>` +
        `<span class="tt-row"><span class="tt-label">${commCount}</span> bar${commCount === 1 ? '' : 's'} in this commune</span>` +
        (per10k !== undefined
          ? `<span class="tt-row"><span class="tt-label">${per10k.toFixed(1)}</span> bars/10k in this dept</span>`
          : '')
      );
    });
    map.on('mouseleave', 'bar-dots', () => {
      map.getCanvas().style.cursor = '';
      hideTooltip();
    });

    runAnimation();
  });

  return {
    map,
    flyToFrance()   { map.flyTo({ center: FRANCE_CENTER, zoom: FRANCE_ZOOM, duration: 800 }); },
    flyToParis()    { map.flyTo({ center: [2.35, 48.86],  zoom: 12,          duration: 800 }); },
    flyToCorse()    { map.flyTo({ center: [9.1,  42.0],   zoom: 8,           duration: 800 }); },
    flyToBretagne() { map.flyTo({ center: [-3.0, 48.1],   zoom: 8,           duration: 800 }); },
    flyToIDF()      { map.flyTo({ center: [2.35, 48.7],   zoom: 9,           duration: 800 }); },
    replay() {
      if (!map.getLayer('bar-dots')) return;
      map.setFilter('bar-dots', ['<', ['get', 'rank'], 0]);
      animationDone = false;
      setTimeout(runAnimation, 200);
    },
  };
}
