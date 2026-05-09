/* four-corners/charts.js — MapLibre GL map with four corner markers */

export function initMap(containerId, corners) {
  const map = new maplibregl.Map({
    container: containerId,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [2.5, 46.5],
    zoom: 4.8,
    minZoom: 3,
    maxZoom: 14,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  const COLORS = {
    north: '#2a6fa8',
    west:  '#2e8b57',
    south: '#c04040',
    east:  '#9b6d00',
  };

  const APL_LABEL = {
    'desert':      'medical desert',
    'severe':      'no doctor access',
    'well-served': 'well-served',
    'adequate':    'adequate',
  };

  map.on('load', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: corners.map(c => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: {
          id:        c.id,
          direction: c.direction,
          commune:   c.commune,
          deptName:  c.deptName,
          pop:       c.pop,
          apl:       c.apl,
          aplCat:    c.aplCategory,
          barCount:  c.barCount,
          color:     COLORS[c.id] || '#888',
        },
      })),
    };

    map.addSource('corners', { type: 'geojson', data: geojson });

    /* Halo (large circle) */
    map.addLayer({
      id: 'corners-halo',
      type: 'circle',
      source: 'corners',
      paint: {
        'circle-radius': 22,
        'circle-color':  ['get', 'color'],
        'circle-opacity': 0.15,
        'circle-stroke-width': 0,
      },
    });

    /* Main dot */
    map.addLayer({
      id: 'corners-dot',
      type: 'circle',
      source: 'corners',
      paint: {
        'circle-radius': 10,
        'circle-color':  ['get', 'color'],
        'circle-opacity': 0.9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });

    /* Direction label */
    map.addLayer({
      id: 'corners-label',
      type: 'symbol',
      source: 'corners',
      layout: {
        'text-field':  ['get', 'direction'],
        'text-font':   ['Noto Sans Bold', 'Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size':   11,
        'text-offset': [0, 1.8],
        'text-anchor': 'top',
      },
      paint: {
        'text-color': '#1a1a1a',
        'text-halo-color': '#fff',
        'text-halo-width': 1.5,
      },
    });

    /* Tooltip */
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: '280px',
    });

    map.on('mouseenter', 'corners-dot', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const p = e.features[0].properties;
      const aplLabel = APL_LABEL[p.aplCat] || p.aplCat;
      const pop = p.pop.toLocaleString('fr-FR');
      popup
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(`
          <div style="font-family:'Helvetica Neue',sans-serif;font-size:13px;line-height:1.5">
            <strong>${p.commune}</strong> <span style="color:#888;font-size:11px">${p.deptName}</span><br>
            ${p.barCount} bar${p.barCount !== 1 ? 's' : ''} · pop. ${pop}<br>
            <span style="color:#${p.aplCat === 'well-served' ? '2e8b57' : p.aplCat === 'severe' ? 'c04040' : p.aplCat === 'desert' ? '9b4010' : '555'}">
              APL ${p.apl} — ${aplLabel}
            </span>
          </div>`)
        .addTo(map);
    });

    map.on('mouseleave', 'corners-dot', () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });

    /* Compass rose thin lines from centre to each corner */
    const centre = [2.5, 46.5];
    const lineFeatures = corners.map(c => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [centre, [c.lng, c.lat]],
      },
      properties: { color: COLORS[c.id] || '#888' },
    }));
    map.addSource('lines', { type: 'geojson', data: { type: 'FeatureCollection', features: lineFeatures } });
    map.addLayer({
      id: 'corner-lines',
      type: 'line',
      source: 'lines',
      layout: { 'line-cap': 'round' },
      paint: {
        'line-color':   ['get', 'color'],
        'line-width':   1,
        'line-opacity': 0.25,
        'line-dasharray': [3, 3],
      },
    }, 'corners-halo');
  });

  return map;
}
