/* charts.js — name-extremes story */

export async function initStory() {
  const resp = await fetch('./data.json');
  const data = await resp.json();

  drawLengthHistogram(data.histogram);
  drawTopNames(data.most_common);
  drawSainteColombeMap(data.top_name_instances);
  buildShortTable(data.shortest);
}

/* ── Name-length histogram ─────────────────────────────────────────── */
function drawLengthHistogram(histogram) {
  const canvas = document.getElementById('chart-histogram');
  if (!canvas) return;

  const labels = histogram.map(d => d.length);
  const counts = histogram.map(d => d.count);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: histogram.map(d =>
          d.length === 1 ? '#b32020' : d.length <= 5 ? '#d4826e' : '#c8bfae'
        ),
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: items => `${items[0].label} character${items[0].label == 1 ? '' : 's'}`,
            label: item => `${item.raw.toLocaleString('en-US')} communes`,
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Name length (characters)', font: { family: 'Helvetica Neue, sans-serif', size: 11 }, color: '#666' },
          ticks: { font: { size: 10 }, color: '#666' },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: 'Number of communes', font: { family: 'Helvetica Neue, sans-serif', size: 11 }, color: '#666' },
          ticks: {
            font: { size: 10 }, color: '#666',
            callback: v => v.toLocaleString('en-US'),
          },
          grid: { color: '#e8e0d0' },
        }
      }
    }
  });
}

/* ── Top 20 most common names ──────────────────────────────────────── */
function drawTopNames(mostCommon) {
  const canvas = document.getElementById('chart-top-names');
  if (!canvas) return;

  const top = mostCommon.slice(0, 20);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: top.map(d => d.name),
      datasets: [{
        data: top.map(d => d.count),
        backgroundColor: top.map(d => d.name.startsWith('Saint') || d.name.startsWith('Sainte') ? '#b32020' : '#c8bfae'),
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: item => `${item.raw} communes with this name`,
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Communes sharing this name', font: { family: 'Helvetica Neue, sans-serif', size: 11 }, color: '#666' },
          ticks: { font: { size: 10 }, color: '#666' },
          grid: { color: '#e8e0d0' },
        },
        y: {
          ticks: {
            font: { size: 11, family: 'Georgia, serif' },
            color: '#1a1a1a',
          },
          grid: { display: false },
        }
      }
    }
  });
}

/* ── Sainte-Colombe map ────────────────────────────────────────────── */
function drawSainteColombeMap(instances) {
  const mapEl = document.getElementById('sainte-colombe-map');
  if (!mapEl || typeof maplibregl === 'undefined') return;

  const validInstances = instances.filter(d => d.lon != null && d.lat != null);

  const map = new maplibregl.Map({
    container: mapEl,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [2.5, 46.8],
    zoom: 5.0,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.scrollZoom.disable();

  const tooltip = document.getElementById('sc-tooltip');

  map.on('load', () => {
    map.addSource('sainte-colombe', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: validInstances.map(d => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [d.lon, d.lat] },
          properties: {
            dept: d.dept,
            pop: d.pop,
            apl: d.apl,
            code: d.code,
          }
        }))
      }
    });

    map.addLayer({
      id: 'sc-dots',
      type: 'circle',
      source: 'sainte-colombe',
      paint: {
        'circle-radius': 8,
        'circle-color': '#b32020',
        'circle-opacity': 0.85,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      }
    });

    map.on('mouseenter', 'sc-dots', e => {
      map.getCanvas().style.cursor = 'pointer';
      if (!tooltip) return;
      const p = e.features[0].properties;
      const aplText = p.apl === 0 ? 'APL: 0.00 — no GP' : p.apl < 2.5 ? `APL: ${p.apl} — medical desert` : `APL: ${p.apl}`;
      tooltip.style.display = 'block';
      tooltip.innerHTML = `<strong>Sainte-Colombe</strong><br>Département ${p.dept}<br>Pop. ${Number(p.pop).toLocaleString('en-US')}<br>${aplText}`;
    });

    map.on('mousemove', 'sc-dots', e => {
      if (!tooltip) return;
      const rect = mapEl.getBoundingClientRect();
      const x = e.point.x + 12;
      const y = e.point.y - 10;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    });

    map.on('mouseleave', 'sc-dots', () => {
      map.getCanvas().style.cursor = '';
      if (tooltip) tooltip.style.display = 'none';
    });
  });
}

/* ── Short-names table ─────────────────────────────────────────────── */
function buildShortTable(shortest) {
  const tbody = document.getElementById('short-table-body');
  if (!tbody) return;

  const deptNames = {
    '80': 'Somme', '76': 'Seine-Maritime', '25': 'Doubs', '28': 'Eure-et-Loir',
    '31': 'Haute-Garonne', '38': 'Isère', '61': 'Orne', '65': 'Hautes-Pyrénées',
    '66': 'Pyrénées-Orientales', '70': 'Haute-Saône', '08': 'Ardennes', '89': 'Yonne',
    '95': 'Val-d\'Oise', '46': 'Lot', '33': 'Gironde', '50': 'Manche',
    '69': 'Rhône', '77': 'Seine-et-Marne', '05': 'Hautes-Alpes', '17': 'Charente-Maritime',
    '35': 'Ille-et-Vilaine', '40': 'Landes',
  };

  const rows = shortest.slice(0, 20).map(d => {
    const aplLabel = d.apl === null ? '—'
      : d.apl === 0 ? '<span style="color:#b32020">0.00</span>'
      : d.apl < 2.5 ? `<span style="color:#b32020">${d.apl}</span>`
      : d.apl;
    const deptLabel = deptNames[d.dept] ? `${deptNames[d.dept]} (${d.dept})` : d.dept;
    return `<tr>
      <td class="col-name">${d.name}</td>
      <td class="col-chars">${d.nchars}</td>
      <td class="col-pop">${Number(d.pop).toLocaleString('en-US')}</td>
      <td class="col-dept">${deptLabel}</td>
      <td class="col-apl">${aplLabel}</td>
    </tr>`;
  }).join('');

  tbody.innerHTML = rows;
}
