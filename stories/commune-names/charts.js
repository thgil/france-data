// charts.js — commune-names story

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.js';

const CARTO_POSITRON = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// ── Tiny-communes map ────────────────────────────────────────────────────────

export function drawTinyMap(mountId, data) {
  const el = document.getElementById(mountId);
  if (!el) return;

  el.style.height = '520px';

  const map = new maplibregl.Map({
    container: mountId,
    style: CARTO_POSITRON,
    center: [2.3, 46.8],
    zoom: 4.8,
    minZoom: 3,
    maxZoom: 14,
    attributionControl: false,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  map.on('load', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: data.tinyCommunes.map(c => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: {
          name: c.n,
          dept: c.d,
          pop: c.p,
          isY: c.n === 'Y',
          label: c.n,
        },
      })),
    };

    map.addSource('tiny', { type: 'geojson', data: geojson });

    // Outer halo for Y
    map.addLayer({
      id: 'tiny-halo',
      type: 'circle',
      source: 'tiny',
      filter: ['==', ['get', 'isY'], true],
      paint: {
        'circle-radius': 22,
        'circle-color': '#b32020',
        'circle-opacity': 0.12,
      },
    });

    // Regular dots (2-letter communes)
    map.addLayer({
      id: 'tiny-dots',
      type: 'circle',
      source: 'tiny',
      filter: ['==', ['get', 'isY'], false],
      paint: {
        'circle-radius': 7,
        'circle-color': '#3a6fa8',
        'circle-opacity': 0.85,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      },
    });

    // Y dot (red, larger)
    map.addLayer({
      id: 'tiny-y',
      type: 'circle',
      source: 'tiny',
      filter: ['==', ['get', 'isY'], true],
      paint: {
        'circle-radius': 11,
        'circle-color': '#b32020',
        'circle-opacity': 1,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });

    // Labels
    map.addLayer({
      id: 'tiny-labels',
      type: 'symbol',
      source: 'tiny',
      layout: {
        'text-field': ['get', 'label'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 11,
        'text-offset': [0, 1.6],
        'text-anchor': 'top',
      },
      paint: {
        'text-color': '#1a1a1a',
        'text-halo-color': '#fff',
        'text-halo-width': 1.5,
      },
    });

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    tooltip.style.display = 'none';
    el.appendChild(tooltip);

    const deptNames = {
      '08': 'Ardennes','25': 'Doubs','28': 'Eure-et-Loir','31': 'Haute-Garonne',
      '38': 'Isère','61': 'Orne','65': 'Hautes-Pyrénées','66': 'Pyrénées-Orientales',
      '70': 'Haute-Saône','76': 'Seine-Maritime','80': 'Somme','95': "Val-d'Oise",
    };

    ['tiny-dots', 'tiny-y'].forEach(layer => {
      map.on('mouseenter', layer, (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const p = e.features[0].properties;
        const deptName = deptNames[p.dept] || `Dept ${p.dept}`;
        const chars = p.name.length === 1 ? '1 character' : `${p.name.length} characters`;
        tooltip.innerHTML = `
          <div class="tt-name">${p.name}</div>
          <div>${deptName} (${p.dept})</div>
          <div>Population: ${p.pop.toLocaleString('en')}</div>
          <div style="color:#888;font-size:11px;margin-top:3px">${chars}</div>`;
        tooltip.style.display = 'block';
      });
      map.on('mousemove', layer, (e) => {
        const rect = el.getBoundingClientRect();
        tooltip.style.left = (e.originalEvent.clientX - rect.left + 12) + 'px';
        tooltip.style.top  = (e.originalEvent.clientY - rect.top  - 10) + 'px';
      });
      map.on('mouseleave', layer, () => {
        map.getCanvas().style.cursor = '';
        tooltip.style.display = 'none';
      });
    });

    document.getElementById('controls-tiny')?.style.setProperty('display', 'flex');
  });

  return map;
}

// ── Name-length histogram ───────────────────────────────────────────────────

export function drawHistogram(mountId, histogram) {
  const container = document.getElementById(mountId);
  if (!container) return;

  const W = container.clientWidth || 720;
  const H = 240;
  const marginL = 42, marginR = 16, marginT = 16, marginB = 36;
  const innerW = W - marginL - marginR;
  const innerH = H - marginT - marginB;

  const maxLen = Math.max(...histogram.map(r => r[0]));
  const maxCount = Math.max(...histogram.map(r => r[1]));

  // Build lookup
  const byLen = Object.fromEntries(histogram.map(r => [r[0], r[1]]));

  // X: length 1..maxLen
  const lengths = Array.from({ length: maxLen }, (_, i) => i + 1);
  const barW = Math.max(1, innerW / maxLen - 1);
  const xScale = (l) => marginL + (l - 1) * (innerW / maxLen) + (innerW / maxLen - barW) / 2;
  const yScale = (v) => marginT + innerH - (v / maxCount) * innerH;

  // Y axis ticks
  const yTicks = [0, 1000, 2000, 3000];

  let svgParts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" role="img" aria-label="Name length distribution">`];

  // Y grid lines + labels
  for (const tick of yTicks) {
    const y = yScale(tick);
    svgParts.push(`<line x1="${marginL}" y1="${y}" x2="${marginL + innerW}" y2="${y}" stroke="#e0d8cc" stroke-width="1"/>`);
    svgParts.push(`<text x="${marginL - 6}" y="${y + 4}" text-anchor="end" font-family="Helvetica Neue,sans-serif" font-size="10" fill="#888">${tick === 0 ? '0' : (tick / 1000) + 'k'}</text>`);
  }

  // Bars
  for (const l of lengths) {
    const count = byLen[l] || 0;
    if (count === 0) continue;
    const x = xScale(l);
    const y = yScale(count);
    const h = innerH - (y - marginT);
    const isY = l === 1;
    const fill = isY ? '#b32020' : l <= 2 ? '#3a6fa8' : '#c8bfb0';
    svgParts.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}" rx="1"/>`);
  }

  // X axis ticks at every 5 chars
  for (let l = 5; l <= maxLen; l += 5) {
    const x = xScale(l) + barW / 2;
    svgParts.push(`<line x1="${x}" y1="${marginT + innerH}" x2="${x}" y2="${marginT + innerH + 4}" stroke="#888" stroke-width="1"/>`);
    svgParts.push(`<text x="${x}" y="${marginT + innerH + 16}" text-anchor="middle" font-family="Helvetica Neue,sans-serif" font-size="10" fill="#888">${l}</text>`);
  }

  // X axis label
  svgParts.push(`<text x="${marginL + innerW / 2}" y="${H - 2}" text-anchor="middle" font-family="Helvetica Neue,sans-serif" font-size="10" fill="#888">Name length (characters)</text>`);

  // Annotation: Y
  {
    const x = xScale(1) + barW / 2;
    svgParts.push(`<text x="${x}" y="${marginT - 4}" text-anchor="middle" font-family="Helvetica Neue,sans-serif" font-size="9" fill="#b32020" font-weight="600">Y</text>`);
  }

  // Annotation: mode (7 or 8 chars)
  {
    const modeLen = histogram.reduce((best, r) => r[1] > (byLen[best] || 0) ? r[0] : best, 1);
    const x = xScale(modeLen) + barW / 2;
    const y = yScale(byLen[modeLen]) - 6;
    svgParts.push(`<text x="${x}" y="${y}" text-anchor="middle" font-family="Helvetica Neue,sans-serif" font-size="9" fill="#555">mode: ${modeLen}</text>`);
  }

  svgParts.push('</svg>');

  container.innerHTML = svgParts.join('');
}

// ── Sainte-Colombe scatter map ──────────────────────────────────────────────

export function drawSainteColombe(mountId, communes) {
  const el = document.getElementById(mountId);
  if (!el) return;

  el.style.height = '420px';

  const map = new maplibregl.Map({
    container: mountId,
    style: CARTO_POSITRON,
    center: [1.5, 46.5],
    zoom: 4.6,
    minZoom: 3,
    maxZoom: 12,
    attributionControl: false,
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  map.on('load', () => {
    const valid = communes.filter(c => c.lng != null && c.lat != null);
    const geojson = {
      type: 'FeatureCollection',
      features: valid.map(c => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: { dept: c.d, pop: c.p },
      })),
    };

    map.addSource('sc', { type: 'geojson', data: geojson });
    map.addLayer({
      id: 'sc-dots',
      type: 'circle',
      source: 'sc',
      paint: {
        'circle-radius': 9,
        'circle-color': '#c67c00',
        'circle-opacity': 0.9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });
    map.addLayer({
      id: 'sc-labels',
      type: 'symbol',
      source: 'sc',
      layout: {
        'text-field': 'Sainte-Colombe',
        'text-font': ['Noto Sans Italic'],
        'text-size': 9,
        'text-offset': [0, 1.8],
        'text-anchor': 'top',
      },
      paint: {
        'text-color': '#5a4a2a',
        'text-halo-color': '#fff',
        'text-halo-width': 1.5,
      },
    });

    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    tooltip.style.display = 'none';
    el.appendChild(tooltip);

    const deptNames = {
      '05': 'Hautes-Alpes','17': 'Charente-Maritime','25': 'Doubs',
      '33': 'Gironde','35': 'Ille-et-Vilaine','40': 'Landes',
      '46': 'Lot','50': 'Manche','69': 'Rhône','76': 'Seine-Maritime',
      '77': 'Seine-et-Marne','89': 'Yonne',
    };

    map.on('mouseenter', 'sc-dots', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const p = e.features[0].properties;
      const deptName = deptNames[p.dept] || `Dept ${p.dept}`;
      tooltip.innerHTML = `<div class="tt-name">Sainte-Colombe</div><div>${deptName} (${p.dept})</div><div>Population: ${p.pop.toLocaleString('en')}</div>`;
      tooltip.style.display = 'block';
    });
    map.on('mousemove', 'sc-dots', (e) => {
      const rect = el.getBoundingClientRect();
      tooltip.style.left = (e.originalEvent.clientX - rect.left + 12) + 'px';
      tooltip.style.top  = (e.originalEvent.clientY - rect.top  - 10) + 'px';
    });
    map.on('mouseleave', 'sc-dots', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });
  });
}
