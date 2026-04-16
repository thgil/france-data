// stories/pharmacy-myth/charts.js
// Three map functions using Maplibre GL JS v4 + CARTO Positron basemap.
// Signatures: drawTimelapseMap(selector, refs), drawTwinChoropleths(selector, refs),
//             drawWalkingExplorer(selector, refs)
// refs shape: { pharmacies, communes, meta }

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@4/+esm';

const BASEMAP = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const PARIS_CENTER = [2.3522, 48.8566];
const MAP_ZOOM = 10;

// ── Shared: set container height ─────────────────────────────────────────────
function setContainerHeight(el) {
  const vh = window.innerHeight || 800;
  el.style.height = Math.max(Math.round(vh * 0.8), 500) + 'px';
  el.style.position = 'relative';
}

// ── Shared: build pharmacy GeoJSON FeatureCollection ─────────────────────────
function pharmaciesToGeoJSON(pharmacies) {
  return {
    type: 'FeatureCollection',
    features: pharmacies.map((p, i) => ({
      type: 'Feature',
      id: i,
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: {
        name: p.name,
        address: p.address,
        dateouv: p.dateouv || '1943-01-01',
        commune: p.commune || '',
      },
    })),
  };
}

// ── GeoJSON circle polygon (for walking radii) ────────────────────────────────
function geoCircle(center, radiusKm, steps = 64) {
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);
    const lat = center[1] + (dy / 111.32);
    const lng = center[0] + (dx / (111.32 * Math.cos(center[1] * Math.PI / 180)));
    coords.push([lng, lat]);
  }
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAP A — Time-lapse
// ─────────────────────────────────────────────────────────────────────────────
export function drawTimelapseMap(selector, refs) {
  const container = document.querySelector(selector);
  if (!container) return;

  const { pharmacies, communes } = refs;

  setContainerHeight(container);

  // Bakery opacity scale (85th-percentile cap)
  const bpValues = communes.features
    .map(f => f.properties.bakeriesPer10k || 0)
    .filter(v => v > 0)
    .sort(d3.ascending);
  const capValue = d3.quantile(bpValues, 0.85) || 1;

  // ── Map ───────────────────────────────────────────────────────────────────
  const map = new maplibregl.Map({
    container,
    style: BASEMAP,
    center: PARIS_CENTER,
    zoom: MAP_ZOOM,
    maxZoom: 16,
    minZoom: 9,
    attributionControl: false,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

  // Year counter overlay
  const yearOverlay = document.createElement('div');
  yearOverlay.style.cssText = [
    'position:absolute', 'top:12px', 'left:12px',
    'background:rgba(250,247,242,0.88)', 'padding:6px 12px 4px',
    'border-radius:3px', 'font-family:Georgia,serif', 'font-size:32px',
    'font-weight:600', 'color:#1a1a1a', 'pointer-events:none', 'z-index:10',
    'line-height:1.1',
  ].join(';');
  yearOverlay.textContent = '1943';
  container.appendChild(yearOverlay);

  // Tooltip popup
  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });

  // ── Animation state ───────────────────────────────────────────────────────
  const DURATION  = 60000;
  const START_MS  = new Date('1943-01-01').getTime();
  const END_MS    = new Date('2013-12-31').getTime();
  const SPAN_MS   = END_MS - START_MS;

  let playing = false, startTS = null, tAtPause = 0, hasStarted = false, rafId = null;

  function msToDateStr(ms) {
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  // Update DOM/filter to reflect progress t ∈ [0,1]. No state mutation.
  function updateVisuals(t) {
    t = Math.max(0, Math.min(1, t));
    const ms   = START_MS + t * SPAN_MS;
    const year = new Date(ms).getFullYear();
    scrubber.value      = Math.round(t * 1000);
    yearCounter.textContent = year;
    yearOverlay.textContent = t >= 1 ? '1943–2013 · 3,991' : String(year);

    if (map.isStyleLoaded() && map.getLayer('pharmacy-dots')) {
      map.setFilter('pharmacy-dots', ['<=', ['get', 'dateouv'], msToDateStr(ms)]);
    }
  }

  // Set tAtPause AND update visuals — for scrubber, reset, end-of-animation.
  function setT(t) {
    t = Math.max(0, Math.min(1, t));
    tAtPause = t;
    updateVisuals(t);
  }

  function frame(now) {
    if (!playing) return;
    const t = tAtPause + (now - startTS) / DURATION;
    if (t >= 1) { setT(1); pause(); return; }
    updateVisuals(t);  // don't call setT — would compound tAtPause
    rafId = requestAnimationFrame(frame);
  }

  function play() {
    if (tAtPause >= 1) setT(0);
    playing = true; startTS = performance.now();
    playBtn.innerHTML = '&#9646;&#9646; Pause';
    rafId = requestAnimationFrame(frame);
  }

  function pause() {
    // Freeze tAtPause at the current progress before stopping
    if (playing && startTS) {
      tAtPause = Math.min(tAtPause + (performance.now() - startTS) / DURATION, 1);
    }
    playing = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    playBtn.innerHTML = '&#9654; Play';
  }

  // ── Map load ──────────────────────────────────────────────────────────────
  map.on('load', () => {
    // Bakery fill below commune borders
    map.addSource('communes', { type: 'geojson', data: communes });
    map.addLayer({
      id: 'commune-bakery-fill',
      type: 'fill',
      source: 'communes',
      paint: {
        'fill-color': '#1a1a1a',
        'fill-opacity': [
          'interpolate', ['linear'],
          ['coalesce', ['get', 'bakeriesPer10k'], 0],
          0, 0.02, capValue, 0.25,
        ],
      },
    });
    map.addLayer({
      id: 'commune-borders',
      type: 'line',
      source: 'communes',
      paint: { 'line-color': '#1a1a1a', 'line-width': 0.5, 'line-opacity': 0.3 },
    });

    // Pharmacy dots — start before first date
    map.addSource('pharmacies', { type: 'geojson', data: pharmaciesToGeoJSON(pharmacies) });
    map.addLayer({
      id: 'pharmacy-dots',
      type: 'circle',
      source: 'pharmacies',
      filter: ['<=', ['get', 'dateouv'], '1942-01-01'],
      paint: {
        'circle-radius': 3,
        'circle-color': '#b32020',
        'circle-opacity': 0.85,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 0.8,
        'circle-stroke-opacity': 0.6,
      },
    });

    setT(tAtPause);
  });

  // Hover tooltip (only when paused)
  map.on('mouseenter', 'pharmacy-dots', (e) => {
    if (playing) return;
    map.getCanvas().style.cursor = 'pointer';
    const p = e.features[0].properties;
    const year = p.dateouv ? p.dateouv.slice(0, 4) : '?';
    popup
      .setLngLat(e.features[0].geometry.coordinates)
      .setHTML(
        `<strong style="font-family:Georgia,serif;font-size:13px;display:block;margin-bottom:4px">${p.name}</strong>` +
        `<div style="font-size:12px;color:#444">${p.address}</div>` +
        `<div style="font-size:12px;color:#666;margin-top:3px">Opened ${year}</div>`
      )
      .addTo(map);
  });
  map.on('mouseleave', 'pharmacy-dots', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

  // ── Controls ──────────────────────────────────────────────────────────────
  const controls = document.createElement('div');
  controls.className = 'timelapse-controls';
  controls.innerHTML = `
    <button class="tl-btn tl-play">&#9654; Play</button>
    <span class="tl-year-start">1943</span>
    <input type="range" class="tl-scrubber" min="0" max="1000" step="1" value="0">
    <span class="tl-year-end">2013</span>
    <span class="tl-year-counter">1943</span>
    <button class="tl-btn tl-reset">&#8635;</button>
  `;
  container.after(controls);

  const playBtn     = controls.querySelector('.tl-play');
  const scrubber    = controls.querySelector('.tl-scrubber');
  const yearCounter = controls.querySelector('.tl-year-counter');

  playBtn.addEventListener('click', () => playing ? pause() : play());
  controls.querySelector('.tl-reset').addEventListener('click', () => { pause(); setT(0); });
  scrubber.addEventListener('mousedown', () => { if (playing) pause(); });
  scrubber.addEventListener('touchstart', () => { if (playing) pause(); }, { passive: true });
  scrubber.addEventListener('input', () => setT(parseInt(scrubber.value, 10) / 1000));

  // Autoplay on scroll
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !hasStarted) {
      hasStarted = true; io.disconnect(); play();
    }
  }, { threshold: 0.30 });
  io.observe(container);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAP B — Twin choropleths
// ─────────────────────────────────────────────────────────────────────────────
export function drawTwinChoropleths(selector, refs) {
  const container = document.querySelector(selector);
  if (!container) return;

  const { communes } = refs;
  const features = communes.features;
  const N = features.length;
  const PAPER = '#faf7f2';

  // Colour scales (95th-percentile cap)
  const pharmValues = features.map(f => f.properties.pharmaciesPer10k || 0)
    .filter(v => v > 0).sort(d3.ascending);
  const bakValues   = features.map(f => f.properties.bakeriesPer10k  || 0)
    .filter(v => v > 0).sort(d3.ascending);

  const p95Pharm = d3.quantile(pharmValues, 0.95) || 1;
  const p95Bak   = d3.quantile(bakValues,   0.95) || 1;

  const pharmCS = d3.scaleSequential(d3.interpolateRgb(PAPER, '#b32020')).domain([0, p95Pharm]);
  const bakCS   = d3.scaleSequential(d3.interpolateRgb(PAPER, '#1a1a1a')).domain([0, p95Bak]);

  const clamp = (v, cap) => Math.min(Math.max(v || 0, 0), cap);
  const pharmColor = v => pharmCS(clamp(v, p95Pharm));
  const bakColor   = v => bakCS(clamp(v, p95Bak));

  // Rank arrays
  function buildRanks(acc) {
    return features.map((f, i) => ({ i, v: acc(f) || 0 }))
      .sort((a, b) => b.v - a.v || a.i - b.i).map(o => o.i);
  }
  const leftRanks  = buildRanks(f => f.properties.pharmaciesPer10k);
  const rightRanks = buildRanks(f => f.properties.bakeriesPer10k);

  const pharmRank = new Array(N), bakRank = new Array(N);
  leftRanks.forEach((fi, r) => { pharmRank[fi] = r + 1; });
  rightRanks.forEach((fi, r) => { bakRank[fi]  = r + 1; });

  // Add feature IDs for setFeatureState — use index as ID
  features.forEach((f, i) => { f.id = i; });

  const codeToIdx = new Map(features.map((f, i) => [f.properties.code || String(i), i]));

  // ── Layout ─────────────────────────────────────────────────────────────────
  const GAP = 16;
  const totalWidth = container.clientWidth || 800;
  const isNarrow = totalWidth < 720;
  const mapW = isNarrow ? totalWidth : Math.floor((totalWidth - GAP) / 2);
  const mapH = Math.max(Math.round(mapW * (5 / 4)), 400);

  container.style.position = 'relative';

  const wrapper = document.createElement('div');
  wrapper.className = 'twin-wrapper';
  wrapper.style.cssText = isNarrow
    ? 'display:flex;flex-direction:column;gap:16px;'
    : `display:flex;flex-direction:row;gap:${GAP}px;align-items:flex-start;`;
  container.appendChild(wrapper);

  function buildPanel(label, color, mapId) {
    const panel = document.createElement('div');
    panel.className = 'twin-panel';
    panel.style.cssText = `display:flex;flex-direction:column;flex:0 0 auto;width:${mapW}px;`;
    const caption = document.createElement('div');
    caption.className = 'twin-caption';
    caption.textContent = label;
    caption.style.color = color;
    panel.appendChild(caption);
    const mapDiv = document.createElement('div');
    mapDiv.id = mapId;
    mapDiv.style.cssText = `width:${mapW}px;height:${mapH}px;`;
    panel.appendChild(mapDiv);
    wrapper.appendChild(panel);
    return mapDiv;
  }

  const leftDiv  = buildPanel('Pharmacies / 10k', '#b32020', 'twin-map-left');
  const rightDiv = buildPanel('Bakeries / 10k',   '#1a1a1a', 'twin-map-right');

  const baseOpts = { style: BASEMAP, center: PARIS_CENTER, zoom: 8.5,
    maxZoom: 16, minZoom: 9, attributionControl: false };
  const mapLeft  = new maplibregl.Map({ ...baseOpts, container: leftDiv });
  const mapRight = new maplibregl.Map({ ...baseOpts, container: rightDiv });

  [mapLeft, mapRight].forEach(m => {
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    m.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
  });

  // View sync
  let syncing = false;
  function syncMaps(src, dst) {
    src.on('move', () => {
      if (syncing) return;
      syncing = true;
      dst.jumpTo({ center: src.getCenter(), zoom: src.getZoom(),
        bearing: src.getBearing(), pitch: src.getPitch() });
      syncing = false;
    });
  }
  syncMaps(mapLeft, mapRight);
  syncMaps(mapRight, mapLeft);

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip twin-tooltip';
  tooltip.style.display = 'none';
  container.appendChild(tooltip);

  function positionTooltip(e) {
    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left + 14, y = e.clientY - rect.top - 14;
    if (x + (tooltip.offsetWidth || 220) > rect.width - 8) x -= (tooltip.offsetWidth || 220) + 28;
    tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px';
  }

  let hoverEnabled = false, hoveredCode = null;

  function highlightCommune(code, e) {
    if (!hoverEnabled || !code) return;
    const idx = codeToIdx.get(code);
    if (idx == null) return;
    hoveredCode = code;
    [mapLeft, mapRight].forEach(m => {
      if (m.getLayer('commune-highlight'))
        m.setFilter('commune-highlight', ['==', ['get', 'code'], code]);
    });
    const f = features[idx];
    const pVal = (f.properties.pharmaciesPer10k || 0).toFixed(2);
    const bVal = (f.properties.bakeriesPer10k  || 0).toFixed(2);
    tooltip.innerHTML =
      `<strong class="tt-name">${f.properties.name || code}</strong>` +
      `<div class="tt-row"><span class="tt-label">Pharmacies</span> · ${pVal} / 10k · rank ${pharmRank[idx] || '–'} of ${N}</div>` +
      `<div class="tt-row"><span class="tt-label">Bakeries</span> · ${bVal} / 10k · rank ${bakRank[idx] || '–'} of ${N}</div>`;
    tooltip.style.display = 'block';
    if (e) positionTooltip(e);
  }

  function clearHighlight() {
    hoveredCode = null;
    [mapLeft, mapRight].forEach(m => {
      if (m.getLayer('commune-highlight'))
        m.setFilter('commune-highlight', ['==', ['get', 'code'], '']);
    });
    tooltip.style.display = 'none';
  }

  // ── Map load ──────────────────────────────────────────────────────────────
  // Both maps load independently; once both are ready we set up layers.
  // We use setFeatureState for per-commune fill colours during animation
  // — much cheaper than rebuilding match expressions per frame.

  // feature-state expression: use 'fill' state, fallback to PAPER
  const fillExpr = ['coalesce', ['feature-state', 'fill'], PAPER];

  // Cloned commune GeoJSON for right map (independent source)
  const communesRight = JSON.parse(JSON.stringify(communes));

  function setupMap(m, communeData, isLeft) {
    // features have f.id = i (top-level GeoJSON feature ID), so setFeatureState works by index
    m.addSource('communes', { type: 'geojson', data: communeData });
    m.addLayer({ id: 'commune-fill', type: 'fill', source: 'communes',
      paint: { 'fill-color': fillExpr, 'fill-opacity': 0.9 } });
    m.addLayer({ id: 'commune-borders', type: 'line', source: 'communes',
      paint: { 'line-color': '#1a1a1a', 'line-width': 0.5, 'line-opacity': 0.25 } });
    m.addLayer({ id: 'commune-highlight', type: 'line', source: 'communes',
      filter: ['==', ['get', 'code'], ''],
      paint: { 'line-color': '#1a1a1a', 'line-width': 2, 'line-opacity': 0.9 } });

    m.on('mousemove', 'commune-fill', (e) => {
      if (!hoverEnabled) return;
      const code = e.features[0]?.properties?.code;
      if (code && code !== hoveredCode) highlightCommune(code, e.originalEvent);
      else if (e.originalEvent) positionTooltip(e.originalEvent);
      m.getCanvas().style.cursor = 'default';
    });
    m.on('mouseleave', 'commune-fill', () => { clearHighlight(); m.getCanvas().style.cursor = ''; });
  }

  let leftLoaded = false, rightLoaded = false;
  function onBothLoaded() {
    if (!leftLoaded || !rightLoaded) return;
    setupMap(mapLeft,  communes,       true);
    setupMap(mapRight, communesRight,  false);
  }
  mapLeft.on('load',  () => { leftLoaded  = true; onBothLoaded(); });
  mapRight.on('load', () => { rightLoaded = true; onBothLoaded(); });

  // ── Animation using setFeatureState ───────────────────────────────────────
  const ANIM_DURATION = 6000;
  let animStart = null, animRaf = null;
  let leftRevCount = 0, rightRevCount = 0;

  function revealFrame(now) {
    if (animStart === null) animStart = now;
    const t = Math.min((now - animStart) / ANIM_DURATION, 1);
    const k = Math.floor(t * N);

    for (let r = leftRevCount; r < k; r++) {
      const li = leftRanks[r];
      const fill = pharmColor(features[li].properties.pharmaciesPer10k);
      if (mapLeft.getSource('communes'))
        mapLeft.setFeatureState({ source: 'communes', id: li }, { fill });
    }
    leftRevCount = k;

    for (let r = rightRevCount; r < k; r++) {
      const ri = rightRanks[r];
      const fill = bakColor(features[ri].properties.bakeriesPer10k);
      if (mapRight.getSource('communes'))
        mapRight.setFeatureState({ source: 'communes', id: ri }, { fill });
    }
    rightRevCount = k;

    if (t < 1) {
      animRaf = requestAnimationFrame(revealFrame);
    } else {
      // Fill any stragglers
      for (let r = leftRevCount; r < N; r++) {
        const li = leftRanks[r];
        mapLeft.setFeatureState({ source: 'communes', id: li },
          { fill: pharmColor(features[li].properties.pharmaciesPer10k) });
      }
      for (let r = rightRevCount; r < N; r++) {
        const ri = rightRanks[r];
        mapRight.setFeatureState({ source: 'communes', id: ri },
          { fill: bakColor(features[ri].properties.bakeriesPer10k) });
      }
      leftRevCount = N; rightRevCount = N;
      hoverEnabled = true;
    }
  }

  function resetAnimation() {
    if (animRaf) { cancelAnimationFrame(animRaf); animRaf = null; }
    animStart = null; hoverEnabled = false;
    leftRevCount = 0; rightRevCount = 0;
    clearHighlight();
    if (mapLeft.getSource('communes'))  mapLeft.removeFeatureState({ source: 'communes' });
    if (mapRight.getSource('communes')) mapRight.removeFeatureState({ source: 'communes' });
  }

  function startAnimation() {
    resetAnimation();
    animRaf = requestAnimationFrame(revealFrame);
  }

  // ── Legend ────────────────────────────────────────────────────────────────
  const pharmScaleLeg = d3.scaleSequential(d3.interpolateReds).domain([0, p95Pharm]);
  const bakScaleLeg   = d3.scaleSequential(d3.interpolateGreys).domain([0, p95Bak]);

  const legendEl = document.createElement('div');
  legendEl.className = 'twin-legend';

  function makeLegendBar(label, scale, sorted, p95, accent) {
    const div = document.createElement('div');
    div.className = 'twin-legend-row';
    const wrap = document.createElement('div');
    wrap.className = 'twin-legend-label';
    const nm = document.createElement('span');
    nm.className = 'twin-legend-name'; nm.style.color = accent; nm.textContent = label;
    wrap.appendChild(nm);
    const bw = document.createElement('div');
    bw.className = 'twin-legend-bar-wrap';
    const cv = document.createElement('canvas');
    cv.width = 200; cv.height = 12;
    const ctx = cv.getContext('2d');
    for (let x = 0; x < 200; x++) {
      ctx.fillStyle = scale(p95 * x / 199); ctx.fillRect(x, 0, 1, 12);
    }
    bw.appendChild(cv);
    const p50 = d3.quantile(sorted, 0.5) || p95 / 2;
    const fmt = v => v < 10 ? v.toFixed(1) : Math.round(v);
    function tick(pct, text, cls) {
      const s = document.createElement('span');
      s.className = 'twin-legend-tick' + (cls ? ' ' + cls : '');
      s.style.left = pct.toFixed(1) + '%';
      if (cls) s.title = 'Communes above this value use the darkest colour.';
      s.textContent = text;
      bw.appendChild(s);
    }
    tick(0, '0', '');
    tick(p50 / p95 * 100, fmt(p50), '');
    tick(100, fmt(p95) + ' ↑', 'twin-legend-cap');
    wrap.appendChild(bw); div.appendChild(wrap);
    return div;
  }

  legendEl.appendChild(makeLegendBar('Pharmacies / 10k', pharmScaleLeg, pharmValues, p95Pharm, '#b32020'));
  legendEl.appendChild(makeLegendBar('Bakeries / 10k',   bakScaleLeg,   bakValues,   p95Bak,   '#1a1a1a'));
  container.appendChild(legendEl);

  // Replay button
  const rw = document.createElement('div');
  rw.className = 'twin-replay-wrap';
  const rb = document.createElement('button');
  rb.className = 'twin-replay-btn';
  rb.innerHTML = '&#8635; Replay';
  rb.addEventListener('click', startAnimation);
  rw.appendChild(rb); container.appendChild(rw);

  // Autoplay on scroll
  let hasAutoplayed = false;
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !hasAutoplayed) {
      hasAutoplayed = true; io.disconnect(); startAnimation();
    }
  }, { threshold: 0.30 });
  io.observe(container);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAP C — Walking-distance explorer
// ─────────────────────────────────────────────────────────────────────────────
export function drawWalkingExplorer(selector, refs) {
  const container = document.querySelector(selector);
  if (!container) return;

  const { pharmacies, communes } = refs;

  const RADII_KM = [0.417, 0.833, 1.250];
  const RADII_M  = [417,   833,   1250];
  const RING_LABELS = ['5 min', '10 min', '15 min'];
  const COS_LAT = Math.cos(48.85 * Math.PI / 180);
  const M_PER_LAT = 111320, M_PER_LNG = 73500;

  const RING_STYLES = [
    { fill: '#b32020', fillOp: 0.10, stroke: '#b32020', width: 1.5, dash: [1,0], lineOp: 1.0 },
    { fill: '#b32020', fillOp: 0.05, stroke: '#b32020', width: 1.0, dash: [4,3], lineOp: 1.0 },
    { fill: '#b32020', fillOp: 0.00, stroke: '#b32020', width: 1.0, dash: [2,4], lineOp: 0.5 },
  ];

  const CORNERS = [
    { name: 'Champs-Élysées', lat: 48.8700, lng: 2.3075 },
    { name: 'Bastille',       lat: 48.8532, lng: 2.3692 },
    { name: 'Gare du Nord',   lat: 48.8809, lng: 2.3553 },
    { name: 'Marais',         lat: 48.8554, lng: 2.3657 },
    { name: 'Montmartre',     lat: 48.8867, lng: 2.3431 },
    { name: 'Versailles',     lat: 48.8014, lng: 2.1301 },
  ];

  setContainerHeight(container);

  // Commune centroids for bakery counts
  const communeCentroids = communes.features.map(f => {
    let sLng = 0, sLat = 0, n = 0;
    function ring(r) { r.forEach(([lng, lat]) => { sLng += lng; sLat += lat; n++; }); }
    const c = f.geometry.coordinates;
    if (f.geometry.type === 'Polygon') ring(c[0]);
    else if (f.geometry.type === 'MultiPolygon') c.forEach(p => ring(p[0]));
    return { lat: n ? sLat/n : 0, lng: n ? sLng/n : 0, bakeries: f.properties.bakeries || 0 };
  });

  // ── Map ───────────────────────────────────────────────────────────────────
  const map = new maplibregl.Map({
    container, style: BASEMAP, center: PARIS_CENTER,
    zoom: MAP_ZOOM, maxZoom: 16, minZoom: 9, attributionControl: false,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

  let activeCorner = null, clickMarker = null;

  function dist(lat1, lng1, lat2, lng2) {
    const dx = (lng2 - lng1) * M_PER_LNG * COS_LAT;
    const dy = (lat2 - lat1) * M_PER_LAT;
    return Math.sqrt(dx*dx + dy*dy);
  }

  function countPharm(lat, lng, r) {
    let n = 0;
    for (let i = 0; i < pharmacies.length; i++)
      if (dist(lat, lng, pharmacies[i].lat, pharmacies[i].lng) <= r) n++;
    return n;
  }

  function countBak(lat, lng, r) {
    let n = 0;
    for (const c of communeCentroids)
      if (dist(lat, lng, c.lat, c.lng) <= r) n += c.bakeries;
    return n;
  }

  // Point-in-polygon (ray casting)
  function pip([px, py], geom) {
    function testRing(ring) {
      let inside = false;
      for (let i = 0, j = ring.length-1; i < ring.length; j = i++) {
        const [xi,yi] = ring[i], [xj,yj] = ring[j];
        if (((yi>py)!==(yj>py)) && (px < (xj-xi)*(py-yi)/(yj-yi)+xi)) inside = !inside;
      }
      return inside;
    }
    if (geom.type === 'Polygon') return testRing(geom.coordinates[0]);
    if (geom.type === 'MultiPolygon') return geom.coordinates.some(p => testRing(p[0]));
    return false;
  }

  map.on('load', () => {
    map.addSource('communes', { type: 'geojson', data: communes });
    map.addLayer({ id: 'commune-borders', type: 'line', source: 'communes',
      paint: { 'line-color': '#1a1a1a', 'line-width': 0.5, 'line-opacity': 0.35 } });

    map.addSource('walk-rings', { type: 'geojson',
      data: { type: 'FeatureCollection', features: [] } });

    for (let i = RING_STYLES.length - 1; i >= 0; i--) {
      const s = RING_STYLES[i];
      map.addLayer({ id: `ring-fill-${i}`, type: 'fill', source: 'walk-rings',
        filter: ['==', ['get', 'idx'], i],
        paint: { 'fill-color': s.fill, 'fill-opacity': s.fillOp } });
      map.addLayer({ id: `ring-line-${i}`, type: 'line', source: 'walk-rings',
        filter: ['==', ['get', 'idx'], i],
        paint: { 'line-color': s.stroke, 'line-width': s.width,
          'line-dasharray': s.dash, 'line-opacity': s.lineOp } });
    }

    map.addSource('pharmacies', { type: 'geojson', data: pharmaciesToGeoJSON(pharmacies) });
    map.addLayer({ id: 'pharmacy-dots', type: 'circle', source: 'pharmacies',
      paint: { 'circle-radius': 3, 'circle-color': '#b32020', 'circle-opacity': 0.75,
        'circle-stroke-color': '#ffffff', 'circle-stroke-width': 0.8,
        'circle-stroke-opacity': 0.5 } });

    map.getCanvas().style.cursor = 'crosshair';
  });

  function updateRings(lat, lng) {
    if (!map.getSource('walk-rings')) return;
    map.getSource('walk-rings').setData({
      type: 'FeatureCollection',
      features: RADII_KM.map((rKm, i) => {
        const f = geoCircle([lng, lat], rKm);
        f.properties = { idx: i };
        return f;
      }),
    });
  }

  function handlePoint(lat, lng) {
    if (clickMarker) {
      clickMarker.setLngLat([lng, lat]);
    } else {
      const el = document.createElement('div');
      el.style.cssText = 'width:16px;height:16px;background:#1a1a1a;border:2px solid white;' +
        'border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);';
      clickMarker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat]).addTo(map);
    }
    updateRings(lat, lng);

    let communeName = null;
    for (const f of communes.features) {
      if (pip([lng, lat], f.geometry)) { communeName = f.properties.name || null; break; }
    }
    updatePanel(lat, lng, communeName);
  }

  map.on('click', (e) => {
    activeCorner = null;
    handlePoint(e.lngLat.lat, e.lngLat.lng);
    panel.querySelectorAll('.walk-corner-pill').forEach(b => b.classList.remove('walk-corner-active'));
  });

  // ── Panel ─────────────────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.className = 'walk-panel';
  container.after(panel);

  function cornerPills() {
    return CORNERS.map((c, i) =>
      `<button class="walk-corner-pill${activeCorner===i?' walk-corner-active':''}" data-corner="${i}">${c.name}</button>`
    ).join('');
  }

  function attachCorners() {
    panel.querySelectorAll('.walk-corner-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.corner, 10);
        activeCorner = i;
        handlePoint(CORNERS[i].lat, CORNERS[i].lng);
      });
    });
  }

  function updatePanel(lat, lng, communeName) {
    const counts = RADII_M.map(r => ({ pharm: countPharm(lat,lng,r), bak: countBak(lat,lng,r) }));
    const loc = communeName ? `${communeName} · ${lat.toFixed(4)}, ${lng.toFixed(4)}` : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    panel.innerHTML = `
      <div class="walk-panel-inner">
        <div class="walk-panel-left">
          <div class="walk-loc-name">${loc}</div>
          <div class="walk-counts">${counts.map((c,i) => `
            <div class="walk-count-row">
              <span class="walk-ring-label">${RING_LABELS[i]}</span>
              <span class="walk-count-sep">·</span>
              <span class="walk-count-val">${c.pharm} pharmacies</span>
              <span class="walk-count-sep">·</span>
              <span class="walk-count-val walk-approx">≈ ${c.bak} bakeries</span>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="walk-corners">
        <div class="walk-corners-label">Featured corners</div>
        <div class="walk-corners-pills">${cornerPills()}</div>
      </div>
      <div class="walk-footnote">Straight-line radii, not street-network distance. · Bakery counts are estimates from commune-level totals.</div>
    `;
    attachCorners();
  }

  function emptyPanel() {
    panel.innerHTML = `
      <div class="walk-empty-prompt">Click the map to pick a spot, or try a featured corner below.</div>
      <div class="walk-corners">
        <div class="walk-corners-label">Featured corners</div>
        <div class="walk-corners-pills">${cornerPills()}</div>
      </div>
      <div class="walk-footnote">Straight-line radii, not street-network distance. · Bakery counts estimated from commune totals.</div>
    `;
    attachCorners();
  }

  emptyPanel();
}
