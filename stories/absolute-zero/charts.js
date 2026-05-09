/* charts.js — absolute-zero story */

export function drawDeptChart(selector, depts) {
  const el = document.querySelector(selector);
  if (!el) return;

  const labels = depts.map(d => d.name);
  const counts = depts.map(d => d.count);
  const colors = depts.map(d =>
    (d.dept === '2B' || d.dept === '2A') ? '#c0392b' : '#e07b54'
  );

  const Chart = window.Chart;
  new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              const d = depts[ctx.dataIndex];
              return [
                ` ${d.count} communes`,
                ` ${d.pop.toLocaleString('fr-FR')} residents`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#eae6de' },
          ticks: { font: { family: "'Helvetica Neue', sans-serif", size: 11 }, color: '#555' },
          title: {
            display: true,
            text: 'Communes with APL = 0',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          grid: { display: false },
          ticks: { font: { family: "'Helvetica Neue', sans-serif", size: 11 }, color: '#222' },
        },
      },
    },
  });
}

export function drawMap(selector, geojson) {
  const container = document.querySelector(selector);
  if (!container) return;

  const maplibregl = window.maplibregl;

  const map = new maplibregl.Map({
    container: container,
    style: {
      version: 8,
      glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
      sources: {
        carto: {
          type: 'raster',
          tiles: ['https://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© CARTO © OpenStreetMap',
          maxzoom: 19,
        },
      },
      layers: [{ id: 'carto-base', type: 'raster', source: 'carto' }],
    },
    center: [2.3, 46.5],
    zoom: 5,
    maxZoom: 13,
    minZoom: 4,
  });

  const tooltip = document.getElementById('map-tooltip');

  map.on('load', () => {
    map.addSource('zero-communes', {
      type: 'geojson',
      data: geojson,
    });

    map.addLayer({
      id: 'zero-fill',
      type: 'fill',
      source: 'zero-communes',
      paint: {
        'fill-color': '#c0392b',
        'fill-opacity': 0.75,
      },
    });

    map.addLayer({
      id: 'zero-outline',
      type: 'line',
      source: 'zero-communes',
      paint: {
        'line-color': '#922b21',
        'line-width': 0.5,
      },
    });

    map.on('mousemove', 'zero-fill', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const props = e.features[0].properties;
      if (tooltip) {
        tooltip.style.display = 'block';
        tooltip.style.left = (e.point.x + 14) + 'px';
        tooltip.style.top = (e.point.y - 10) + 'px';
        const deptLabel = props.dept.startsWith('97') ? 'Overseas' : `Dept. ${props.dept}`;
        tooltip.innerHTML = `
          <span class="tt-name">${props.communeName}</span>
          <span class="tt-row"><span class="tt-label">Population:</span> ${Number(props.pop).toLocaleString('fr-FR')}</span>
          <span class="tt-row"><span class="tt-label">APL score:</span> 0.00</span>
          <span class="tt-row"><span class="tt-label">${deptLabel}</span></span>
        `;
      }
    });

    map.on('mouseleave', 'zero-fill', () => {
      map.getCanvas().style.cursor = '';
      if (tooltip) tooltip.style.display = 'none';
    });
  });

  /* zoom controls */
  document.getElementById('btn-france')?.addEventListener('click', () => {
    map.flyTo({ center: [2.3, 46.5], zoom: 5, duration: 900 });
  });
  document.getElementById('btn-corsica')?.addEventListener('click', () => {
    map.flyTo({ center: [9.1, 42.15], zoom: 7.5, duration: 900 });
  });
  document.getElementById('btn-alpes-maritimes')?.addEventListener('click', () => {
    map.flyTo({ center: [7.3, 43.85], zoom: 9, duration: 900 });
  });
  document.getElementById('btn-massif')?.addEventListener('click', () => {
    map.flyTo({ center: [3.5, 44.9], zoom: 7, duration: 900 });
  });

  return map;
}
