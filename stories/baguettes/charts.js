// stories/baguettes/charts.js
// Dot-density map: every bakery in Île-de-France.
// Export: drawBaguetteMap(selector, refs)
// refs shape: { bakeries, communes, pharmacies? }

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP   = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const PARIS_CENTER = [2.3522, 48.8566];

// Colour palette
const GOLD       = '#d4a017';
const GOLD_DIM   = '#d4a017';
const RED_PHARM  = '#c0392b';

function setHeight(el) {
  const vh = window.innerHeight || 800;
  el.style.height = Math.max(Math.round(vh * 0.8), 500) + 'px';
  el.style.position = 'relative';
}

// Build GeoJSON FeatureCollection from bakeries array, adding index for animation
function bakeriesGeoJSON(bakeries) {
  // Sort by distance from Paris center so animation radiates outward
  const [cx, cy] = PARIS_CENTER;
  const withDist = bakeries.map((b, i) => ({
    ...b,
    _d: Math.sqrt((b.lng - cx) ** 2 + (b.lat - cy) ** 2),
    _i: i,
  }));
  withDist.sort((a, b) => a._d - b._d);

  return {
    type: 'FeatureCollection',
    features: withDist.map((b, rank) => ({
      type: 'Feature',
      id: rank,
      geometry: { type: 'Point', coordinates: [b.lng, b.lat] },
      properties: {
        commune: b.commune,
        dept:    b.dept,
        rank,         // animation order (0 = closest to Paris)
      },
    })),
  };
}

function pharmaciesGeoJSON(pharmacies) {
  return {
    type: 'FeatureCollection',
    features: pharmacies.map((p, i) => ({
      type: 'Feature',
      id: i,
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: {
        name:    p.name    || '',
        address: p.address || '',
        commune: p.commune || '',
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function drawBaguetteMap(selector, refs) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!container) { console.error('drawBaguetteMap: container not found', selector); return; }

  setHeight(container);

  const { bakeries, communes, pharmacies } = refs;
  const total = bakeries.length;

  // ── Build sources ──────────────────────────────────────────────────────────
  const bakGeoJSON   = bakeriesGeoJSON(bakeries);
  const pharmGeoJSON = pharmacies ? pharmaciesGeoJSON(pharmacies) : null;

  // ── Map instance ───────────────────────────────────────────────────────────
  const map = new maplibregl.Map({
    container,
    style:  BASEMAP,
    center: PARIS_CENTER,
    zoom:   10,
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
    const rect = container.getBoundingClientRect();
    let x = e.point.x + 12;
    let y = e.point.y - 10;
    if (x + 220 > container.clientWidth) x = e.point.x - 230;
    if (y + 70  > container.clientHeight) y = e.point.y - 80;
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

    // Reveal all dots in ~3 seconds in 60 batches
    const DURATION_MS = 3000;
    const STEPS       = 60;
    const batchSize   = Math.ceil(total / STEPS);
    const interval    = DURATION_MS / STEPS;
    let step = 0;

    const tick = setInterval(() => {
      step++;
      visibleCount = Math.min(step * batchSize, total);
      map.setFilter('bakery-dots', ['<', ['get', 'rank'], visibleCount]);
      if (visibleCount >= total) clearInterval(tick);
    }, interval);
  }

  // ── Map load ───────────────────────────────────────────────────────────────
  map.on('load', () => {
    // Commune outlines
    map.addSource('communes', {
      type: 'geojson',
      data: communes,
    });
    map.addLayer({
      id:   'commune-outline',
      type: 'line',
      source: 'communes',
      paint: {
        'line-color': '#b8b0a0',
        'line-width': 0.4,
        'line-opacity': 0.6,
      },
    });

    // Bakery dots — initially hidden (rank < 0 matches nothing)
    map.addSource('bakeries', {
      type: 'geojson',
      data: bakGeoJSON,
    });
    map.addLayer({
      id:     'bakery-dots',
      type:   'circle',
      source: 'bakeries',
      filter: ['<', ['get', 'rank'], 0],   // start hidden
      paint: {
        'circle-radius':       2.5,
        'circle-color':        GOLD,
        'circle-opacity':      0.8,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 0.5,
        'circle-stroke-opacity': 0.4,
      },
    });

    // Pharmacy dots — hidden initially
    if (pharmGeoJSON) {
      map.addSource('pharmacies', {
        type: 'geojson',
        data: pharmGeoJSON,
      });
      map.addLayer({
        id:     'pharmacy-dots',
        type:   'circle',
        source: 'pharmacies',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius':       2.5,
          'circle-color':        RED_PHARM,
          'circle-opacity':      0.75,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 0.5,
          'circle-stroke-opacity': 0.35,
        },
      });
    }

    // Hover — bakeries
    map.on('mouseenter', 'bakery-dots', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const { commune, dept } = e.features[0].properties;
      // Count bakeries in commune from GeoJSON (pre-computed via feature count)
      const communeBakeries = bakGeoJSON.features.filter(
        f => f.properties.commune === commune
      ).length;
      showTooltip(e,
        `<span class="tt-name">${commune}</span>` +
        `<span class="tt-row"><span class="tt-label">Département</span> ${dept}</span>` +
        `<span class="tt-row"><span class="tt-label">Bakeries</span> ${communeBakeries}</span>`
      );
    });
    map.on('mouseleave', 'bakery-dots', () => {
      map.getCanvas().style.cursor = '';
      hideTooltip();
    });

    // Hover — pharmacies
    if (pharmGeoJSON) {
      map.on('mouseenter', 'pharmacy-dots', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const { name, address } = e.features[0].properties;
        showTooltip(e,
          `<span class="tt-name">${name || 'Pharmacy'}</span>` +
          `<span class="tt-row">${address || ''}</span>`
        );
      });
      map.on('mouseleave', 'pharmacy-dots', () => {
        map.getCanvas().style.cursor = '';
        hideTooltip();
      });
    }

    // Start animation
    runAnimation();
  });

  // ── Public API (returned for external control) ─────────────────────────────
  const api = {
    map,

    // Show / hide pharmacy overlay
    setPharmacyOverlay(visible) {
      if (!pharmGeoJSON) return;
      map.setLayoutProperty('pharmacy-dots', 'visibility', visible ? 'visible' : 'none');
    },

    // Zoom presets
    flyToParis()   { map.flyTo({ center: PARIS_CENTER, zoom: 12, duration: 800 }); },
    flyToIDF()     { map.flyTo({ center: PARIS_CENTER, zoom: 10, duration: 800 }); },
    flyToSM()      { map.flyTo({ center: [2.95, 48.55], zoom: 9,  duration: 800 }); },

    // Replay animation
    replay() {
      if (!map.getLayer('bakery-dots')) return;
      map.setFilter('bakery-dots', ['<', ['get', 'rank'], 0]);
      animationDone = false;
      visibleCount  = 0;
      setTimeout(runAnimation, 200);
    },
  };

  return api;
}
