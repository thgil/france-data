import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.js';

// Generate an approximated great-circle polygon for a given center + radius
function circlePolygon(centerLng, centerLat, radiusKm, steps = 120) {
  const coords = [];
  const latRad = centerLat * Math.PI / 180;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dLat = (radiusKm / 111) * Math.cos(angle);
    const dLng = (radiusKm / (111 * Math.cos(latRad))) * Math.sin(angle);
    coords.push([centerLng + dLng, centerLat + dLat]);
  }
  return coords;
}

export function drawCenterMap(containerId, data) {
  const el = document.querySelector(containerId);
  if (!el) return null;

  const POP = data.popCenter;    // { lat, lng }
  const GEO = data.geoCenter;    // { lat, lng }
  const HALF_R = data.halfRadiusKm; // 301

  const map = new maplibregl.Map({
    container: el,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [POP.lng, POP.lat],
    zoom: 5.0,
    minZoom: 4,
    maxZoom: 10,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  map.on('load', () => {
    // 301 km circle (half-population ring)
    map.addSource('half-circle', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [circlePolygon(POP.lng, POP.lat, HALF_R)] },
      },
    });
    map.addLayer({
      id: 'half-circle-fill',
      type: 'fill',
      source: 'half-circle',
      paint: {
        'fill-color': '#3a6b3c',
        'fill-opacity': 0.08,
      },
    });
    map.addLayer({
      id: 'half-circle-line',
      type: 'line',
      source: 'half-circle',
      paint: {
        'line-color': '#3a6b3c',
        'line-width': 1.5,
        'line-dasharray': [4, 3],
        'line-opacity': 0.7,
      },
    });

    // Geographic centroid marker (smaller, muted)
    map.addSource('geo-center', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'Point', coordinates: [GEO.lng, GEO.lat] } },
    });
    map.addLayer({
      id: 'geo-center-dot',
      type: 'circle',
      source: 'geo-center',
      paint: {
        'circle-radius': 6,
        'circle-color': '#bbb',
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#888',
        'circle-opacity': 0.8,
      },
    });

    // Population centroid marker (prominent)
    map.addSource('pop-center', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'Point', coordinates: [POP.lng, POP.lat] } },
    });
    map.addLayer({
      id: 'pop-center-dot',
      type: 'circle',
      source: 'pop-center',
      paint: {
        'circle-radius': 10,
        'circle-color': '#c8430a',
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#fff',
      },
    });

    // City reference points
    const CITIES = [
      { name: 'Paris', lng: 2.3522, lat: 48.8566 },
      { name: 'Lyon', lng: 4.8357, lat: 45.7640 },
      { name: 'Marseille', lng: 5.3698, lat: 43.2965 },
      { name: 'Nantes', lng: -1.5536, lat: 47.2184 },
      { name: 'Bordeaux', lng: -0.5792, lat: 44.8378 },
      { name: 'Lille', lng: 3.0573, lat: 50.6292 },
      { name: 'Strasbourg', lng: 7.7521, lat: 48.5734 },
      { name: 'Bourges', lng: 2.4000, lat: 47.0833 },
    ];
    map.addSource('cities', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: CITIES.map(c => ({
          type: 'Feature',
          properties: { name: c.name },
          geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        })),
      },
    });
    map.addLayer({
      id: 'city-dots',
      type: 'circle',
      source: 'cities',
      paint: {
        'circle-radius': 3.5,
        'circle-color': '#555',
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      },
    });

    // Show controls
    document.getElementById('map-controls').style.display = '';
  });

  // Tooltip for centroid points
  const tooltip = document.getElementById('map-tooltip');

  map.on('mouseenter', 'pop-center-dot', () => {
    map.getCanvas().style.cursor = 'default';
    tooltip.style.display = 'block';
    tooltip.innerHTML =
      '<span class="tt-name">Population centroid</span>' +
      '<span class="tt-row"><span class="tt-label">Coordinates</span>: 47.06°N, 2.64°E</span>' +
      '<span class="tt-row"><span class="tt-label">Nearest commune</span>: Farges-en-Septaine (Cher)</span>' +
      '<span class="tt-row"><span class="tt-label">From Paris</span>: 201 km</span>';
  });
  map.on('mousemove', 'pop-center-dot', e => {
    const rect = map.getCanvas().getBoundingClientRect();
    tooltip.style.left = (e.point.x + 12) + 'px';
    tooltip.style.top  = (e.point.y - 10) + 'px';
  });
  map.on('mouseleave', 'pop-center-dot', () => {
    map.getCanvas().style.cursor = '';
    tooltip.style.display = 'none';
  });

  map.on('mouseenter', 'geo-center-dot', () => {
    map.getCanvas().style.cursor = 'default';
    tooltip.style.display = 'block';
    tooltip.innerHTML =
      '<span class="tt-name">Geographic centroid</span>' +
      '<span class="tt-row"><span class="tt-label">Coordinates</span>: 46.95°N, 2.82°E</span>' +
      '<span class="tt-row"><span class="tt-label">Distance from pop. centroid</span>: 18 km</span>';
  });
  map.on('mousemove', 'geo-center-dot', e => {
    const rect = map.getCanvas().getBoundingClientRect();
    tooltip.style.left = (e.point.x + 12) + 'px';
    tooltip.style.top  = (e.point.y - 10) + 'px';
  });
  map.on('mouseleave', 'geo-center-dot', () => {
    map.getCanvas().style.cursor = '';
    tooltip.style.display = 'none';
  });

  return {
    flyToFrance: () => map.flyTo({ center: [POP.lng, POP.lat], zoom: 5.0, duration: 800 }),
    flyToCenter: () => map.flyTo({ center: [POP.lng, POP.lat], zoom: 8.5, duration: 1000 }),
    flyToParis: () => map.flyTo({ center: [2.35, 48.86], zoom: 8, duration: 800 }),
  };
}
