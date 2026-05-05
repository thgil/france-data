// stories/commune-names/charts.js
// Three visualisations:
//   drawLengthHistogram(selector, stats)   — Observable Plot bar chart
//   drawNameTypeMap(selector, points)      — MapLibre dot map coloured by name type
//   drawRiverBars(selector, stats)         — Observable Plot horizontal bar chart

import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';
import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const IDF_CENTER = [2.4, 48.75];
const IDF_ZOOM = 9;

// ── Colour palette for name types ────────────────────────────────────────────
const TYPE_COLORS = {
  saint:   '#7b2d8b',   // purple
  sur:     '#1a6b9a',   // blue
  en:      '#2a7a3b',   // green
  article: '#b37a00',   // amber
  sous:    '#a04020',   // rust
  les:     '#4a7a60',   // teal
  paris:   '#b32020',   // red
  other:   '#aaaaaa',   // grey
};

const TYPE_LABELS = {
  saint:   'Saint-… (saint name)',
  sur:     '-sur-… (on a river / hill)',
  en:      '-en-… (in a region)',
  article: 'Le / La / Les…',
  sous:    '-sous-… (under a hill)',
  les:     '-lès-… (near a town)',
  paris:   'Paris arrondissements',
  other:   'other',
};

// ── Utility ───────────────────────────────────────────────────────────────────
function $(sel) { return document.querySelector(sel); }

// ── 1. Name-length histogram ──────────────────────────────────────────────────
export function drawLengthHistogram(selector, stats) {
  const container = $(selector);
  if (!container) return;

  const dist = stats.nameLengthDist;
  const data = Object.entries(dist).map(([len, count]) => ({
    len: +len,
    count: +count,
  }));

  const chart = Plot.plot({
    width: Math.min(container.clientWidth || 680, 680),
    height: 260,
    marginLeft: 48,
    marginBottom: 40,
    style: { background: 'transparent', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12 },
    x: {
      label: 'Name length (characters)',
      tickSpacing: 40,
    },
    y: {
      label: 'Communes',
      grid: true,
    },
    marks: [
      Plot.barY(data, {
        x: 'len',
        y: 'count',
        fill: d => d.len <= 4 ? '#b32020' : d.len >= 22 ? '#7b2d8b' : '#555',
        tip: true,
        title: d => `${d.len} chars: ${d.count} communes`,
      }),
      Plot.ruleY([0]),
    ],
  });

  container.appendChild(chart);
}

// ── 2. Name-type dot map ──────────────────────────────────────────────────────
export function drawNameTypeMap(selector, points) {
  const container = $(selector);
  if (!container) return;

  const vh = window.innerHeight || 800;
  container.style.height = Math.max(Math.round(vh * 0.75), 460) + 'px';
  container.style.position = 'relative';

  const map = new maplibregl.Map({
    container,
    style: BASEMAP,
    center: IDF_CENTER,
    zoom: IDF_ZOOM,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  map.on('load', () => {
    map.addSource('communes', {
      type: 'geojson',
      data: points,
    });

    // Circle layer — colour by name type
    map.addLayer({
      id: 'commune-dots',
      type: 'circle',
      source: 'communes',
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          7, 3.5,
          11, 6,
        ],
        'circle-color': [
          'match', ['get', 'nameType'],
          'saint',   TYPE_COLORS.saint,
          'sur',     TYPE_COLORS.sur,
          'en',      TYPE_COLORS.en,
          'article', TYPE_COLORS.article,
          'sous',    TYPE_COLORS.sous,
          'les',     TYPE_COLORS.les,
          'paris',   TYPE_COLORS.paris,
          TYPE_COLORS.other,
        ],
        'circle-opacity': [
          'match', ['get', 'nameType'],
          'other', 0.35,
          0.75,
        ],
        'circle-stroke-width': 0.5,
        'circle-stroke-color': '#fff',
        'circle-stroke-opacity': 0.5,
      },
    });

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    tooltip.style.display = 'none';
    container.appendChild(tooltip);

    map.on('mousemove', 'commune-dots', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const p = e.features[0].properties;
      const typeLabel = TYPE_LABELS[p.nameType] || p.nameType;
      tooltip.innerHTML = `
        <span class="tt-name">${p.name}</span>
        <span class="tt-row"><span class="tt-label">Département:</span> ${p.dept}</span>
        <span class="tt-row"><span class="tt-label">Name type:</span> ${typeLabel}</span>
        <span class="tt-row"><span class="tt-label">Length:</span> ${p.nameLen} characters</span>
        ${p.population ? `<span class="tt-row"><span class="tt-label">Population:</span> ${p.population.toLocaleString()}</span>` : ''}
      `;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.point.x + 12) + 'px';
      tooltip.style.top = (e.point.y - 10) + 'px';
    });

    map.on('mouseleave', 'commune-dots', () => {
      map.getCanvas().style.cursor = '';
      tooltip.style.display = 'none';
    });
  });

  // Legend
  const legend = buildMapLegend();
  container.appendChild(legend);
}

function buildMapLegend() {
  const wrap = document.createElement('div');
  wrap.className = 'name-type-legend';

  const types = ['saint', 'sur', 'en', 'article', 'sous', 'les', 'other'];
  types.forEach(t => {
    const row = document.createElement('div');
    row.className = 'legend-row';

    const swatch = document.createElement('span');
    swatch.className = 'legend-swatch';
    swatch.style.background = TYPE_COLORS[t];
    if (t === 'other') swatch.style.opacity = '0.45';

    const label = document.createElement('span');
    label.className = 'legend-label';
    label.textContent = TYPE_LABELS[t];

    row.appendChild(swatch);
    row.appendChild(label);
    wrap.appendChild(row);
  });

  return wrap;
}

// ── 3. River bar chart ────────────────────────────────────────────────────────
export function drawRiverBars(selector, stats) {
  const container = $(selector);
  if (!container) return;

  const rivers = Object.entries(stats.surVariants)
    .map(([name, count]) => ({ name: `–sur–${name}`, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const chart = Plot.plot({
    width: Math.min(container.clientWidth || 520, 520),
    height: 240,
    marginLeft: 120,
    marginBottom: 36,
    style: { background: 'transparent', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12 },
    x: { label: 'Communes with this river in their name', grid: true },
    y: { label: null },
    marks: [
      Plot.barX(rivers, {
        y: 'name',
        x: 'count',
        sort: { y: '-x' },
        fill: TYPE_COLORS.sur,
        tip: true,
        title: d => `${d.name}: ${d.count} communes`,
      }),
      Plot.ruleX([0]),
    ],
  });

  container.appendChild(chart);
}
