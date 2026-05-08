import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.js';

const VERDUN_VIEW   = { center: [5.389, 49.238], zoom: 10.8 };
const MEUSE_VIEW    = { center: [5.35, 48.98],   zoom: 8.4 };

const GHOST_COLOR   = '#8b1520';
const GHOST_STROKE  = '#6b0f18';
const CONTEXT_FILL  = '#c8bfad';
const CONTEXT_STROKE = '#a09880';

const GHOST_NAMES = {
  '55039': 'Beaumont-en-Verdunois',
  '55050': 'Bezonvaux',
  '55139': 'Cumières-le-Mort-Homme',
  '55189': 'Fleury-devant-Douaumont',
  '55239': 'Haumont-près-Samogneux',
  '55307': 'Louvemont-Côte-du-Poivre',
};

export function drawVerdunMap(containerSelector, { ghostData, contextData }) {
  const container = document.querySelector(containerSelector);

  const map = new maplibregl.Map({
    container,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: VERDUN_VIEW.center,
    zoom: VERDUN_VIEW.zoom,
    attributionControl: true,
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  container.appendChild(tooltip);

  map.on('load', () => {
    /* ── Context layer (Meuse communes) ──────────────────────────── */
    map.addSource('meuse-context', {
      type: 'geojson',
      data: contextData,
    });

    map.addLayer({
      id: 'meuse-fill',
      type: 'fill',
      source: 'meuse-context',
      paint: {
        'fill-color': CONTEXT_FILL,
        'fill-opacity': 0.55,
      },
    });

    map.addLayer({
      id: 'meuse-stroke',
      type: 'line',
      source: 'meuse-context',
      paint: {
        'line-color': CONTEXT_STROKE,
        'line-width': 0.5,
        'line-opacity': 0.7,
      },
    });

    /* ── Ghost communes layer ────────────────────────────────────── */
    map.addSource('ghost-communes', {
      type: 'geojson',
      data: ghostData,
      promoteId: 'code',
    });

    map.addLayer({
      id: 'ghost-fill',
      type: 'fill',
      source: 'ghost-communes',
      paint: {
        'fill-color': GHOST_COLOR,
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.95,
          0.82,
        ],
      },
    });

    map.addLayer({
      id: 'ghost-stroke',
      type: 'line',
      source: 'ghost-communes',
      paint: {
        'line-color': GHOST_STROKE,
        'line-width': 1.5,
        'line-opacity': 1,
      },
    });

    /* ── Hover interaction ───────────────────────────────────────── */
    let hoveredId = null;

    function showTooltip(e, props) {
      const name = props.communeName || GHOST_NAMES[props.code] || props.code;
      const isGhost = props.pop === 0;

      tooltip.innerHTML = `
        <span class="tt-name">${name}</span>
        <span class="tt-row"><span class="tt-label">Population:</span> ${props.pop === 0 ? '0' : props.pop?.toLocaleString('fr-FR') ?? '—'}</span>
        ${isGhost ? '<span class="tt-ghost-tag">Commune morte pour la France</span>' : ''}
      `;
      tooltip.style.display = '';
      positionTooltip(e);
    }

    function positionTooltip(e) {
      const rect = container.getBoundingClientRect();
      const x = e.point.x;
      const y = e.point.y;
      const tw = 240;
      const left = x + 16 + tw > rect.width ? x - tw - 8 : x + 16;
      tooltip.style.left = `${left}px`;
      tooltip.style.top  = `${y - 20}px`;
    }

    map.on('mousemove', 'ghost-fill', (e) => {
      if (!e.features.length) return;
      map.getCanvas().style.cursor = 'pointer';
      const feature = e.features[0];
      const id = feature.properties.code;

      if (hoveredId && hoveredId !== id) {
        map.setFeatureState({ source: 'ghost-communes', id: hoveredId }, { hover: false });
      }
      hoveredId = id;
      map.setFeatureState({ source: 'ghost-communes', id }, { hover: true });

      showTooltip(e, feature.properties);
    });

    map.on('mousemove', 'meuse-fill', (e) => {
      if (!e.features.length) return;
      const props = e.features[0].properties;
      if (props.pop === 0) return; // handled by ghost layer

      map.getCanvas().style.cursor = '';
      if (hoveredId) {
        map.setFeatureState({ source: 'ghost-communes', id: hoveredId }, { hover: false });
        hoveredId = null;
      }

      tooltip.innerHTML = `
        <span class="tt-name">${props.communeName}</span>
        <span class="tt-row"><span class="tt-label">Population:</span> ${props.pop?.toLocaleString('fr-FR') ?? '—'}</span>
        <span class="tt-row"><span class="tt-label">Medical APL:</span> ${props.apl != null ? props.apl : 'n/a'}</span>
      `;
      tooltip.style.display = '';
      positionTooltip(e);
    });

    map.on('mouseleave', 'ghost-fill', () => {
      map.getCanvas().style.cursor = '';
      if (hoveredId) {
        map.setFeatureState({ source: 'ghost-communes', id: hoveredId }, { hover: false });
        hoveredId = null;
      }
      tooltip.style.display = 'none';
    });

    map.on('mouseleave', 'meuse-fill', () => {
      tooltip.style.display = 'none';
    });

    map.on('mousemove', (e) => {
      const ghostFeatures = map.queryRenderedFeatures(e.point, { layers: ['ghost-fill'] });
      if (!ghostFeatures.length) {
        const meuseFeatures = map.queryRenderedFeatures(e.point, { layers: ['meuse-fill'] });
        if (!meuseFeatures.length) {
          tooltip.style.display = 'none';
          if (hoveredId) {
            map.setFeatureState({ source: 'ghost-communes', id: hoveredId }, { hover: false });
            hoveredId = null;
          }
          map.getCanvas().style.cursor = '';
        }
      }
    });
  });

  return {
    flyToVerdun() {
      map.flyTo({ ...VERDUN_VIEW, duration: 900, essential: true });
    },
    flyToMeuse() {
      map.flyTo({ ...MEUSE_VIEW, duration: 900, essential: true });
    },
  };
}
