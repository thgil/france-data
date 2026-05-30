/* commune-names — chart renderers */

// ── Name-length histogram ───────────────────────────────────────────────────

export function drawLengthHistogram(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Group into buckets of 2 chars for readability
  const buckets = {};
  for (const { len, count } of lengthDist) {
    const bucket = len <= 5 ? len : Math.floor((len - 1) / 3) * 3 + 4;
    buckets[bucket] = (buckets[bucket] || 0) + count;
  }

  // Use raw distribution up to 30, then lump remainder
  const MAX_SHOW = 30;
  const distFiltered = lengthDist.filter(d => d.len <= MAX_SHOW);
  const tail = lengthDist.filter(d => d.len > MAX_SHOW).reduce((s, d) => s + d.count, 0);

  const maxCount = Math.max(...distFiltered.map(d => d.count));

  const rows = distFiltered.map(({ len, count }) => {
    const pct = (count / maxCount) * 100;
    const highlight = (len === 1) ? ' hist-bar--accent' : '';
    return `
      <div class="hist-row" title="${count.toLocaleString('fr-FR')} communes with ${len}-char names">
        <div class="hist-label">${len}</div>
        <div class="hist-track">
          <div class="hist-bar${highlight}" style="width:${pct.toFixed(1)}%"></div>
        </div>
        <div class="hist-count">${count.toLocaleString('fr-FR')}</div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="hist-axis-label">← character count in name</div>
    <div class="hist-chart">${rows}</div>
    ${tail ? `<p class="hist-tail">Names longer than 30 characters: ${tail.toLocaleString('fr-FR')} communes</p>` : ''}
  `;
}

// ── Most-common names horizontal bar ───────────────────────────────────────

export function drawMostCommon(selector, mostCommon) {
  const container = document.querySelector(selector);
  if (!container) return;

  const max = mostCommon[0].count;

  const rows = mostCommon.map(({ name, count }, i) => {
    const pct = (count / max) * 100;
    return `
      <div class="hist-row">
        <div class="hist-label hist-label--name">${name}</div>
        <div class="hist-track">
          <div class="hist-bar hist-bar--blue" style="width:${pct.toFixed(1)}%"></div>
        </div>
        <div class="hist-count">${count}</div>
      </div>`;
  }).join('');

  container.innerHTML = `<div class="hist-chart">${rows}</div>`;
}

// ── Letter frequency chart ──────────────────────────────────────────────────

export function drawLetterChart(selector, letterDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const max = Math.max(...letterDist.map(d => d.count));

  const rows = letterDist.map(({ letter, count }) => {
    const pct = (count / max) * 100;
    const highlight = letter === 'S' ? ' hist-bar--accent' : '';
    return `
      <div class="hist-row hist-row--letter" title="${count.toLocaleString('fr-FR')} communes starting with ${letter}">
        <div class="hist-label hist-label--letter">${letter}</div>
        <div class="hist-track">
          <div class="hist-bar${highlight}" style="width:${pct.toFixed(1)}%"></div>
        </div>
        <div class="hist-count">${count.toLocaleString('fr-FR')}</div>
      </div>`;
  }).join('');

  container.innerHTML = `<div class="hist-chart">${rows}</div>`;
}

// ── Sainte-Colombe map ──────────────────────────────────────────────────────

export function drawSainteColombeMap(selector, communes) {
  const container = document.querySelector(selector);
  if (!container || typeof maplibregl === 'undefined') return;

  const mapEl = document.createElement('div');
  mapEl.style.width = '100%';
  mapEl.style.height = '420px';
  container.appendChild(mapEl);

  const map = new maplibregl.Map({
    container: mapEl,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [2.3, 46.8],
    zoom: 4.8,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }));

  map.on('load', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: communes.map(c => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: { dept: c.dept, pop: c.pop }
      }))
    };

    map.addSource('sc', { type: 'geojson', data: geojson });
    map.addLayer({
      id: 'sc-dots',
      type: 'circle',
      source: 'sc',
      paint: {
        'circle-radius': 8,
        'circle-color': '#b32020',
        'circle-opacity': 0.85,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      }
    });

    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    tooltip.style.display = 'none';
    container.appendChild(tooltip);

    map.on('mouseenter', 'sc-dots', e => {
      map.getCanvas().style.cursor = 'pointer';
      const feat = e.features[0];
      const { dept, pop } = feat.properties;
      const deptNames = {
        '05': 'Hautes-Alpes', '17': 'Charente-Maritime', '25': 'Doubs',
        '33': 'Gironde', '35': 'Ille-et-Vilaine', '40': 'Landes',
        '46': 'Lot', '50': 'Manche', '69': 'Rhône', '76': 'Seine-Maritime',
        '77': 'Seine-et-Marne', '89': 'Yonne'
      };
      tooltip.innerHTML = `
        <span class="tt-name">Sainte-Colombe</span>
        <span class="tt-row"><span class="tt-label">Département:</span> ${deptNames[dept] || dept} (${dept})</span>
        <span class="tt-row"><span class="tt-label">Population:</span> ${pop ? pop.toLocaleString('fr-FR') : '?'}</span>
      `;
      tooltip.style.display = 'block';
    });

    map.on('mousemove', 'sc-dots', e => {
      const rect = container.getBoundingClientRect();
      const x = e.originalEvent.clientX - rect.left;
      const y = e.originalEvent.clientY - rect.top;
      tooltip.style.left = (x + 14) + 'px';
      tooltip.style.top = (y - 10) + 'px';
    });

    map.on('mouseleave', 'sc-dots', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });
  });

  return map;
}
