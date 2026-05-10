import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.esm.min.js';

const LANG_COLORS = {
  alsatian: '#c82a2a',
  occitan:  '#c08a00',
  breton:   '#1a6bcc',
  flemish:  '#8b35a4',
  norman:   '#1a9950',
};

const LANG_LABELS = {
  alsatian: 'Alsatian',
  occitan:  'Occitan',
  breton:   'Breton',
  flemish:  'Flemish',
  norman:   'Norman-Norse',
};

const LANG_PATTERNS = {
  alsatian: '-heim, -willer, -bach',
  occitan:  '-ac (Latin -acum)',
  breton:   'Ker-, Plou-, Lan-',
  flemish:  '-ghem, -cappel',
  norman:   '-tot, -bec (Norse)',
};

export function drawLangMap(mountSelector, { communes, langMeta }) {
  const el = document.querySelector(mountSelector);
  if (!el) throw new Error(`Mount not found: ${mountSelector}`);

  const vh = window.innerHeight;
  el.style.height = Math.max(Math.round(vh * 0.78), 480) + 'px';

  const map = new maplibregl.Map({
    container: el,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [2.35, 46.6],
    zoom: 5,
    minZoom: 4,
    maxZoom: 13,
    attributionControl: false,
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.style.display = 'none';
  el.appendChild(tooltip);

  // Convert communes array to GeoJSON FeatureCollection
  const geojson = {
    type: 'FeatureCollection',
    features: communes.map(c => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
      properties: {
        name: c.n,
        dept: c.d,
        lang: c.lang,
        pop:  c.pop,
      }
    }))
  };

  const LANGS = Object.keys(LANG_COLORS);

  map.on('load', () => {
    // Add one source per language for easy show/hide
    for (const lang of LANGS) {
      const features = geojson.features.filter(f => f.properties.lang === lang);
      map.addSource(`src-${lang}`, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
      });

      map.addLayer({
        id: `layer-${lang}`,
        type: 'circle',
        source: `src-${lang}`,
        paint: {
          'circle-color': LANG_COLORS[lang],
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            4,  3.5,
            7,  5,
            10, 7,
          ],
          'circle-opacity': 0.82,
          'circle-stroke-width': 0.5,
          'circle-stroke-color': 'rgba(0,0,0,0.25)',
        },
      });
    }

    // Animate: stagger each language layer in
    LANGS.forEach((lang, i) => {
      const layerId = `layer-${lang}`;
      map.setPaintProperty(layerId, 'circle-opacity', 0);
      setTimeout(() => {
        let t = 0;
        const target = 0.82;
        const step = () => {
          t += 0.05;
          const opacity = Math.min(t, target);
          if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, 'circle-opacity', opacity);
          }
          if (t < target) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 300 + i * 250);
    });

    // Hover tooltip for all language layers
    for (const lang of LANGS) {
      map.on('mousemove', `layer-${lang}`, e => {
        el.style.cursor = 'pointer';
        const f = e.features[0];
        if (!f) return;
        const { name, dept, lang: l, pop } = f.properties;
        const color = LANG_COLORS[l] || '#888';
        const label = LANG_LABELS[l] || l;
        const pattern = LANG_PATTERNS[l] || '';
        const popStr = pop > 0 ? `${pop.toLocaleString('fr-FR')} residents` : 'no data';
        tooltip.innerHTML = `
          <span class="tt-name">${name}</span>
          <span class="tt-row">Département ${dept} · ${popStr}</span>
          <span class="tt-lang" style="color:${color}">${label} · <em>${pattern}</em></span>`;
        tooltip.style.display = 'block';
        positionTooltip(e.originalEvent);
      });

      map.on('mouseleave', `layer-${lang}`, () => {
        el.style.cursor = '';
        tooltip.style.display = 'none';
      });
    }
  });

  el.addEventListener('mousemove', e => {
    if (tooltip.style.display !== 'none') positionTooltip(e);
  });

  function positionTooltip(e) {
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left + 12;
    let y = e.clientY - rect.top + 12;
    if (x + 250 > rect.width)  x -= 260;
    if (y + 100 > rect.height) y -= 90;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
  }

  // Fly-to functions
  function flyToFrance()    { map.flyTo({ center: [2.35, 46.6],   zoom: 5.2,  duration: 900 }); }
  function flyToAlsace()    { map.flyTo({ center: [7.52, 48.3],   zoom: 8.2,  duration: 900 }); }
  function flyToBretagne()  { map.flyTo({ center: [-3.5, 48.2],   zoom: 7.8,  duration: 900 }); }
  function flyToOccitanie() { map.flyTo({ center: [2.6, 43.7],    zoom: 7.0,  duration: 900 }); }
  function flyToNord()      { map.flyTo({ center: [2.5, 50.7],    zoom: 9.0,  duration: 900 }); }
  function flyToNormandie() { map.flyTo({ center: [0.5, 49.3],    zoom: 7.8,  duration: 900 }); }

  function showLayer(lang) {
    if (map.getLayer(`layer-${lang}`)) {
      map.setLayoutProperty(`layer-${lang}`, 'visibility', 'visible');
    }
  }

  function hideLayer(lang) {
    if (map.getLayer(`layer-${lang}`)) {
      map.setLayoutProperty(`layer-${lang}`, 'visibility', 'none');
    }
  }

  return { flyToFrance, flyToAlsace, flyToBretagne, flyToOccitanie, flyToNord, flyToNormandie, showLayer, hideLayer };
}
