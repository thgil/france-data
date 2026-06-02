// stories/odd-names/charts.js
// Charts for the commune-names story.
// Exports: drawLengthHistogram, drawTopNamesChart, drawHighlightsMap

import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const FRANCE_CENTER = [2.5, 46.5];
const ACCENT = '#b32020';
const ACCENT_LIGHT = '#e8c8c8';
const BLUE = '#2563a8';

// ── Helpers ────────────────────────────────────────────────────────────────

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function fmt(n) { return n.toLocaleString('fr-FR'); }

// ── Chart 1: Name-length histogram ────────────────────────────────────────

export function drawLengthHistogram(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const dist = stats.lenDistribution;
  const maxLen = dist[dist.length - 1].len;
  const maxCount = Math.max(...dist.map(d => d.count));

  const W = 680, H = 260;
  const padL = 48, padR = 20, padT = 16, padB = 48;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, style: 'width:100%;max-width:680px;display:block;margin:0 auto;overflow:visible' });

  // Bars
  dist.forEach(d => {
    const x = padL + ((d.len - 1) / maxLen) * innerW;
    const barW = Math.max(1, (innerW / maxLen) - 1);
    const barH = (d.count / maxCount) * innerH;
    const y = padT + innerH - barH;

    const isY = d.len === 1;
    const rect = svgEl('rect', {
      x, y, width: barW, height: barH,
      fill: isY ? ACCENT : '#c8b89a',
      opacity: isY ? '1' : '0.85'
    });
    svg.appendChild(rect);

    if (isY) {
      const label = svgEl('text', {
        x: x + barW / 2, y: y - 6,
        'text-anchor': 'middle',
        fill: ACCENT,
        'font-family': 'Georgia, serif',
        'font-size': '11',
        'font-style': 'italic'
      });
      label.textContent = '"Y"';
      svg.appendChild(label);
    }
  });

  // X axis ticks: every 5 letters
  for (let l = 5; l <= maxLen; l += 5) {
    const x = padL + ((l - 1) / maxLen) * innerW;
    const tick = svgEl('line', { x1: x, y1: padT + innerH, x2: x, y2: padT + innerH + 5, stroke: '#999', 'stroke-width': '1' });
    svg.appendChild(tick);
    const label = svgEl('text', {
      x, y: padT + innerH + 17,
      'text-anchor': 'middle',
      fill: '#666',
      'font-family': 'Helvetica Neue, sans-serif',
      'font-size': '11'
    });
    label.textContent = l;
    svg.appendChild(label);
  }

  // X axis line
  svg.appendChild(svgEl('line', { x1: padL, y1: padT + innerH, x2: W - padR, y2: padT + innerH, stroke: '#aaa', 'stroke-width': '1' }));

  // X label
  const xLabel = svgEl('text', {
    x: padL + innerW / 2, y: H - 4,
    'text-anchor': 'middle',
    fill: '#666',
    'font-family': 'Helvetica Neue, sans-serif',
    'font-size': '12'
  });
  xLabel.textContent = 'Name length (characters)';
  svg.appendChild(xLabel);

  // Y axis ticks
  const yTicks = [1000, 2000, 3000, 4000];
  yTicks.forEach(t => {
    if (t > maxCount) return;
    const y = padT + innerH - (t / maxCount) * innerH;
    svg.appendChild(svgEl('line', { x1: padL - 4, y1: y, x2: padL, y2: y, stroke: '#999', 'stroke-width': '1' }));
    svg.appendChild(svgEl('line', { x1: padL, y1: y, x2: W - padR, y2: y, stroke: '#ddd', 'stroke-width': '1', 'stroke-dasharray': '3 3' }));
    const label = svgEl('text', { x: padL - 8, y: y + 4, 'text-anchor': 'end', fill: '#666', 'font-family': 'Helvetica Neue, sans-serif', 'font-size': '11' });
    label.textContent = (t / 1000) + 'k';
    svg.appendChild(label);
  });

  // Annotation: peak
  const peak = dist.reduce((a, b) => b.count > a.count ? b : a, dist[0]);
  const peakX = padL + ((peak.len - 1) / maxLen) * innerW;
  const peakY = padT + innerH - (peak.count / maxCount) * innerH;
  const ann = svgEl('text', {
    x: peakX + 8, y: peakY - 6,
    fill: '#555',
    'font-family': 'Helvetica Neue, sans-serif',
    'font-size': '11',
    'font-style': 'italic'
  });
  ann.textContent = `peak: ${peak.len} chars (${fmt(peak.count)} communes)`;
  svg.appendChild(ann);

  container.appendChild(svg);
}

// ── Chart 2: Top names horizontal bar chart ────────────────────────────────

export function drawTopNamesChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const names = stats.topNames.slice(0, 15);
  const maxCount = names[0].count;

  const W = 680, barH = 26, gap = 4, padL = 220, padR = 60, padT = 8, padB = 24;
  const H = padT + names.length * (barH + gap) + padB;

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, style: 'width:100%;max-width:680px;display:block;margin:0 auto' });
  const innerW = W - padL - padR;

  names.forEach((d, i) => {
    const y = padT + i * (barH + gap);
    const barWidth = (d.count / maxCount) * innerW;
    const isTop = i === 0;

    // Bar
    svg.appendChild(svgEl('rect', {
      x: padL, y, width: barWidth, height: barH,
      fill: isTop ? ACCENT : '#c8b89a',
      opacity: isTop ? '1' : '0.8'
    }));

    // Name label (left)
    const nameLabel = svgEl('text', {
      x: padL - 8, y: y + barH / 2 + 4,
      'text-anchor': 'end',
      fill: '#1a1a1a',
      'font-family': 'Georgia, serif',
      'font-size': '13'
    });
    nameLabel.textContent = d.name;
    svg.appendChild(nameLabel);

    // Count label (right)
    const countLabel = svgEl('text', {
      x: padL + barWidth + 6, y: y + barH / 2 + 4,
      fill: isTop ? ACCENT : '#555',
      'font-family': 'Helvetica Neue, sans-serif',
      'font-size': '12',
      'font-weight': isTop ? '700' : '400'
    });
    countLabel.textContent = `× ${d.count}`;
    svg.appendChild(countLabel);
  });

  container.appendChild(svg);
}

// ── Chart 3: Dot map of Sainte-Colombe + Y ────────────────────────────────

export function drawHighlightsMap(selector, highlights) {
  const container = document.querySelector(selector);
  if (!container) return;

  const vh = Math.min(window.innerHeight || 600, 500);
  container.style.height = Math.max(320, Math.round(vh * 0.55)) + 'px';
  container.style.position = 'relative';

  const map = new maplibregl.Map({
    container,
    style: BASEMAP,
    center: FRANCE_CENTER,
    zoom: 4.8,
    attributionControl: false,
    interactive: true,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  map.on('load', () => {
    const sainteColombe = highlights.filter(h => h.name === 'Sainte-Colombe');
    const shortNames    = highlights.filter(h => h.name !== 'Sainte-Colombe' && h.name.length <= 2);

    function makeGeoJSON(pts) {
      return {
        type: 'FeatureCollection',
        features: pts.map(h => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [h.lng, h.lat] },
          properties: { name: h.name, dept: h.dept, pop: h.pop }
        }))
      };
    }

    map.addSource('sainte-colombe', { type: 'geojson', data: makeGeoJSON(sainteColombe) });
    map.addSource('short-names',    { type: 'geojson', data: makeGeoJSON(shortNames) });

    map.addLayer({
      id: 'sainte-colombe-dots',
      type: 'circle',
      source: 'sainte-colombe',
      paint: {
        'circle-radius': 7,
        'circle-color': ACCENT,
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 1.5,
        'circle-opacity': 0.9
      }
    });

    map.addLayer({
      id: 'short-name-dots',
      type: 'circle',
      source: 'short-names',
      paint: {
        'circle-radius': 6,
        'circle-color': BLUE,
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 1.5,
        'circle-opacity': 0.9
      }
    });

    map.addLayer({
      id: 'short-name-labels',
      type: 'symbol',
      source: 'short-names',
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Italic', 'Noto Sans Regular'],
        'text-size': 11,
        'text-offset': [0, -1.2],
        'text-anchor': 'bottom'
      },
      paint: {
        'text-color': BLUE,
        'text-halo-color': '#fff',
        'text-halo-width': 1.5
      }
    });

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    tooltip.style.display = 'none';
    container.appendChild(tooltip);

    function showTooltip(e, features) {
      const f = features[0].properties;
      const deptName = deptLabel(f.dept);
      tooltip.innerHTML = `<span class="tt-name">${f.name}</span>
        <span class="tt-row"><span class="tt-label">Département</span> ${deptName}</span>
        <span class="tt-row"><span class="tt-label">Population</span> ${f.pop ? fmt(f.pop) : '—'}</span>`;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.point.x + 12) + 'px';
      tooltip.style.top  = (e.point.y - 12) + 'px';
    }

    ['sainte-colombe-dots', 'short-name-dots'].forEach(layer => {
      map.on('mouseenter', layer, e => {
        map.getCanvas().style.cursor = 'pointer';
        showTooltip(e, e.features);
      });
      map.on('mousemove', layer, e => showTooltip(e, e.features));
      map.on('mouseleave', layer, () => {
        map.getCanvas().style.cursor = '';
        tooltip.style.display = 'none';
      });
    });
  });

  return map;
}

// Département code → name lookup (partial, covers dept codes we use)
function deptLabel(code) {
  const MAP = {
    '05': 'Hautes-Alpes', '08': 'Ardennes', '17': 'Charente-Maritime',
    '25': 'Doubs', '28': 'Eure-et-Loir', '31': 'Haute-Garonne',
    '33': 'Gironde', '35': 'Ille-et-Vilaine', '38': 'Isère',
    '40': 'Landes', '46': 'Lot', '50': 'Manche',
    '51': 'Marne', '61': 'Orne', '65': 'Hautes-Pyrénées',
    '66': 'Pyrénées-Orientales', '69': 'Rhône', '70': 'Haute-Saône',
    '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '80': 'Somme',
    '89': 'Yonne', '95': 'Val-d\'Oise'
  };
  return MAP[code] || `Dept. ${code}`;
}
