import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.esm.min.js';

const CARTO_POSITRON = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

/* ── Bar chart of top saint names ──────────────────────────────────────── */
export function drawSaintChart(canvasId, top15) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const maxCount = top15[0].count;
  const rowH = 28;
  const labelW = 120;
  const barAreaW = W - labelW - 48;
  const padTop = 8;

  ctx.clearRect(0, 0, W, H);

  top15.forEach((d, i) => {
    const y = padTop + i * rowH;
    const barW = (d.count / maxCount) * barAreaW;

    // Bar
    ctx.fillStyle = '#b32020';
    ctx.globalAlpha = 0.15 + 0.7 * (1 - i / top15.length);
    ctx.fillRect(labelW, y + 4, barW, rowH - 8);
    ctx.globalAlpha = 1;

    // Name label
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `13px Georgia, serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.name, labelW - 8, y + rowH / 2);

    // Count label
    ctx.fillStyle = '#444';
    ctx.font = `11px Helvetica Neue, Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(d.count, labelW + barW + 6, y + rowH / 2);
  });
}

/* ── Map of Saint-Martin communes ──────────────────────────────────────── */
export function drawSaintMartinMap(containerId, communes) {
  const map = new maplibregl.Map({
    container: containerId,
    style: CARTO_POSITRON,
    center: [2.3, 46.5],
    zoom: 5,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  const geojson = {
    type: 'FeatureCollection',
    features: communes.map(c => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
      properties: { name: c.name, dept: c.dept, pop: c.pop },
    })),
  };

  map.on('load', () => {
    map.addSource('saint-martin', { type: 'geojson', data: geojson });

    map.addLayer({
      id: 'saint-martin-dots',
      type: 'circle',
      source: 'saint-martin',
      paint: {
        'circle-radius': 5,
        'circle-color': '#b32020',
        'circle-opacity': 0.75,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
        'circle-stroke-opacity': 0.5,
      },
    });

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    tooltip.style.display = 'none';
    map.getContainer().appendChild(tooltip);

    map.on('mousemove', 'saint-martin-dots', e => {
      map.getCanvas().style.cursor = 'pointer';
      const p = e.features[0].properties;
      tooltip.style.display = '';
      tooltip.style.left = (e.point.x + 12) + 'px';
      tooltip.style.top = (e.point.y - 8) + 'px';
      tooltip.innerHTML =
        `<span class="tt-name">${p.name}</span>` +
        `<span class="tt-row"><span class="tt-label">Département</span> ${p.dept}</span>` +
        (p.pop ? `<span class="tt-row"><span class="tt-label">Population</span> ${Number(p.pop).toLocaleString('fr-FR')}</span>` : '');
    });

    map.on('mouseleave', 'saint-martin-dots', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });
  });

  return map;
}
