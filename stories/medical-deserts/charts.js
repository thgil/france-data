// stories/medical-deserts/charts.js
// Single map: full-France APL choropleth using Maplibre GL JS v4.
// Export: drawMedicalDesertMap(selector, refs)
// refs shape: { geojson, meta }

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const PRESETS = [
  { label: 'France',       center: [2.5, 46.6],   zoom: 5.5 },
  { label: 'Île-de-France', center: [2.35, 48.85], zoom: 9   },
  { label: 'Guyane',       center: [-53.5, 3.9],   zoom: 7   },
  { label: 'Provence',     center: [5.5, 43.8],    zoom: 8   },
  { label: 'Bretagne',     center: [-2.8, 48.2],   zoom: 8   },
];

// APL category label for tooltip
function categoryLabel(cat) {
  switch (cat) {
    case 'severe':     return 'Severe desert (APL < 1.0)';
    case 'desert':     return 'Medical desert (APL < 2.5)';
    case 'adequate':   return 'Adequate (APL 2.5–4.0)';
    case 'well-served': return 'Well-served (APL ≥ 4.0)';
    default:           return 'No data';
  }
}

// Format population with thousands separator
function fmtPop(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('fr-FR');
}

// Dept number → name lookup (partial; covers the ones mentioned in prose)
const DEPT_NAMES = {
  '75': 'Paris',
  '77': 'Seine-et-Marne',
  '78': 'Yvelines',
  '91': 'Essonne',
  '92': 'Hauts-de-Seine',
  '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne',
  '95': 'Val-d\'Oise',
  '97': 'DOM',
};

export function drawMedicalDesertMap(selector, refs) {
  const container = document.querySelector(selector);
  if (!container) return;

  const { geojson } = refs;

  // ── Container height ──────────────────────────────────────────────────────
  const vh = window.innerHeight || 800;
  container.style.height = Math.max(Math.round(vh * 0.8), 500) + 'px';
  container.style.position = 'relative';

  // ── Loading overlay ───────────────────────────────────────────────────────
  const loadingEl = document.createElement('div');
  loadingEl.className = 'md-loading';
  loadingEl.textContent = 'Loading 35,000 communes…';
  container.appendChild(loadingEl);

  // ── Map ───────────────────────────────────────────────────────────────────
  const map = new maplibregl.Map({
    container,
    style: BASEMAP,
    center: PRESETS[0].center,
    zoom: PRESETS[0].zoom,
    attributionControl: false,
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  // ── APL colour expression (interpolate for smoothness) ────────────────────
  const aplColor = [
    'case',
    ['==', ['get', 'apl'], null], 'rgba(0,0,0,0)',
    ['interpolate', ['linear'], ['get', 'apl'],
      0,   '#7a1818',
      1.0, '#c0392b',
      2.5, '#f5c242',
      4.0, '#27ae60',
      6.0, '#1a7a1a',
    ],
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let desertsOnly = false;
  let hoveredId   = null;
  let popup       = null;

  map.on('load', () => {
    // Remove loading overlay
    loadingEl.remove();

    // ── GeoJSON source ──────────────────────────────────────────────────────
    map.addSource('communes', {
      type: 'geojson',
      data: geojson,
      generateId: true,
      tolerance: 0.5,
    });

    // ── Fill layer ──────────────────────────────────────────────────────────
    map.addLayer({
      id: 'communes-fill',
      type: 'fill',
      source: 'communes',
      paint: {
        'fill-color': aplColor,
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false], 0.9,
          0.75,
        ],
      },
    });

    // ── Border layer ────────────────────────────────────────────────────────
    map.addLayer({
      id: 'communes-border',
      type: 'line',
      source: 'communes',
      paint: {
        'line-color': '#333333',
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'hover'], false], 2,
          0.3,
        ],
        'line-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false], 0.8,
          0.2,
        ],
      },
    });

    // ── Hover logic ─────────────────────────────────────────────────────────
    popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'md-popup',
      maxWidth: '280px',
    });

    map.on('mousemove', 'communes-fill', (e) => {
      if (!e.features || !e.features.length) return;
      const feat = e.features[0];
      const p    = feat.properties;
      const id   = feat.id;

      map.getCanvas().style.cursor = 'pointer';

      // Clear previous hover
      if (hoveredId !== null && hoveredId !== id) {
        map.setFeatureState({ source: 'communes', id: hoveredId }, { hover: false });
      }
      hoveredId = id;
      map.setFeatureState({ source: 'communes', id: id }, { hover: true });

      // Build tooltip HTML
      const aplStr  = p.apl != null ? Number(p.apl).toFixed(2) : 'no data';
      const catStr  = categoryLabel(p.category);
      const deptStr = p.dept ? ` (${p.dept})` : '';
      const deptName = DEPT_NAMES[p.dept] || '';

      popup
        .setLngLat(e.lngLat)
        .setHTML(
          `<span class="tt-name">${p.communeName || '—'} <span class="tt-code">(${p.code || '?'})</span></span>` +
          `<span class="tt-row"><span class="tt-label">APL:</span> ${aplStr} · ${catStr}</span>` +
          `<span class="tt-row"><span class="tt-label">Pop:</span> ${fmtPop(p.pop)}</span>` +
          `<span class="tt-row"><span class="tt-label">Dept:</span> ${deptName}${deptStr}</span>`
        )
        .addTo(map);
    });

    map.on('mouseleave', 'communes-fill', () => {
      map.getCanvas().style.cursor = '';
      if (hoveredId !== null) {
        map.setFeatureState({ source: 'communes', id: hoveredId }, { hover: false });
        hoveredId = null;
      }
      popup.remove();
    });

    // ── Build controls (injected after map ──────────────────────────────────
    buildControls();
  });

  // ── Controls builder ──────────────────────────────────────────────────────
  function buildControls() {
    const wrap = container.closest('.map-figure') || container.parentElement;

    // Controls bar
    const bar = document.createElement('div');
    bar.className = 'md-controls';

    // -- Preset pills --------------------------------------------------------
    const pillGroup = document.createElement('div');
    pillGroup.className = 'md-pill-group';

    const pillLabel = document.createElement('span');
    pillLabel.className = 'md-controls-label';
    pillLabel.textContent = 'Zoom to:';
    pillGroup.appendChild(pillLabel);

    PRESETS.forEach((preset, i) => {
      const btn = document.createElement('button');
      btn.className = 'md-preset-pill' + (i === 0 ? ' md-preset-active' : '');
      btn.textContent = preset.label;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.md-preset-pill').forEach(p => p.classList.remove('md-preset-active'));
        btn.classList.add('md-preset-active');
        map.flyTo({ center: preset.center, zoom: preset.zoom, duration: 900 });
      });
      pillGroup.appendChild(btn);
    });

    bar.appendChild(pillGroup);

    // -- Toggle: deserts only ------------------------------------------------
    const toggleWrap = document.createElement('label');
    toggleWrap.className = 'md-toggle';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id  = 'md-deserts-only';

    const toggleLabel = document.createElement('span');
    toggleLabel.textContent = 'Show deserts only';

    toggleWrap.appendChild(cb);
    toggleWrap.appendChild(toggleLabel);

    cb.addEventListener('change', () => {
      desertsOnly = cb.checked;
      applyDesertFilter();
    });

    bar.appendChild(toggleWrap);
    wrap.appendChild(bar);

    // -- Legend --------------------------------------------------------------
    const legend = document.createElement('div');
    legend.className = 'md-legend';
    legend.innerHTML = `
      <div class="md-legend-title">APL score (GP consultations / resident / year)</div>
      <div class="md-legend-bar-wrap">
        <div class="md-legend-bar"></div>
        <div class="md-legend-ticks">
          <span class="md-tick" style="left:0%">0</span>
          <span class="md-tick md-tick-threshold" style="left:${(2.5/6)*100}%" title="2.5 = sous-dense threshold">2.5 ▲</span>
          <span class="md-tick" style="left:${(4/6)*100}%">4.0</span>
          <span class="md-tick" style="left:100%">6+</span>
        </div>
      </div>
      <div class="md-legend-key">
        <span><span class="md-swatch" style="background:#7a1818"></span> Severe (&lt;1.0)</span>
        <span><span class="md-swatch" style="background:#c0392b"></span> Desert (&lt;2.5)</span>
        <span><span class="md-swatch" style="background:#f5c242"></span> Adequate (2.5–4.0)</span>
        <span><span class="md-swatch" style="background:#27ae60"></span> Well-served (≥4.0)</span>
        <span><span class="md-swatch md-swatch-nodata"></span> No data</span>
      </div>
    `;
    wrap.appendChild(legend);
  }

  // ── Apply deserts-only filter ─────────────────────────────────────────────
  function applyDesertFilter() {
    if (!map.getLayer('communes-fill')) return;

    if (desertsOnly) {
      // Hide non-desert communes (adequate + well-served + no-data)
      map.setPaintProperty('communes-fill', 'fill-opacity', [
        'case',
        ['in', ['get', 'category'], ['literal', ['severe', 'desert']]],
        ['case', ['boolean', ['feature-state', 'hover'], false], 0.9, 0.8],
        0,
      ]);
      map.setPaintProperty('communes-border', 'line-opacity', [
        'case',
        ['in', ['get', 'category'], ['literal', ['severe', 'desert']]],
        ['case', ['boolean', ['feature-state', 'hover'], false], 0.8, 0.25],
        0,
      ]);
    } else {
      map.setPaintProperty('communes-fill', 'fill-opacity', [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 0.9,
        0.75,
      ]);
      map.setPaintProperty('communes-border', 'line-opacity', [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 0.8,
        0.2,
      ]);
    }
  }
}
