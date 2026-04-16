// stories/pharmacy-myth/charts.js
// Three map functions, called once data is loaded. Each takes a CSS selector
// and a refs object: { pharmacies, communes, meta }.
// Implementations land in subsequent tasks (6.3, 6.4, 6.5).

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

function placeholder(selector, label) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = `
    <div style="
      min-height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0ece4;
      border: 1px dashed #999;
      color: #666;
      font-family: 'Helvetica Neue', sans-serif;
      font-size: 13px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    ">${label}</div>`;
}

export function drawTimelapseMap(selector, refs) {
  const container = document.querySelector(selector);
  if (!container) return;

  const { pharmacies, communes } = refs;

  // ── Layout ──────────────────────────────────────────────────────────────────
  const width = container.clientWidth || 800;
  const height = Math.min(Math.round(width * (10 / 16)), 640);
  const isNarrow = width < 600;
  const PIN_R = isNarrow ? 2 : 2.5;

  // Make container position:relative so tooltip offsets work
  container.style.position = 'relative';

  // ── SVG ─────────────────────────────────────────────────────────────────────
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('display', 'block')
    .style('background', '#f7f4ee');

  // ── Projection ───────────────────────────────────────────────────────────────
  const projection = d3.geoMercator()
    .fitSize([width, height], communes);
  const path = d3.geoPath(projection);

  // ── Bakery colour scale (95th percentile cap) ────────────────────────────────
  const bpValues = communes.features
    .map(f => f.properties.bakeriesPer10k || 0)
    .filter(v => v > 0)
    .sort(d3.ascending);
  const p95 = d3.quantile(bpValues, 0.95) || 1;
  const colorScale = d3.scaleSequential(d3.interpolateYlOrBr).domain([0, p95]);

  // ── Background: commune choropleth ──────────────────────────────────────────
  const communeGroup = svg.append('g').attr('class', 'communes');
  communeGroup.selectAll('path')
    .data(communes.features)
    .join('path')
    .attr('d', path)
    .attr('fill', d => {
      const v = d.properties.bakeriesPer10k || 0;
      return v === 0 ? colorScale(0) : colorScale(v);
    })
    .attr('stroke', '#1a1a1a')
    .attr('stroke-width', 0.3);

  // ── Foreground: pharmacy circles (all pre-rendered, hidden) ──────────────────
  const pinGroup = svg.append('g').attr('class', 'pharmacies');
  const circles = pinGroup.selectAll('circle')
    .data(pharmacies)
    .join('circle')
    .attr('cx', d => {
      const pt = projection([d.lng, d.lat]);
      return pt ? pt[0] : -9999;
    })
    .attr('cy', d => {
      const pt = projection([d.lng, d.lat]);
      return pt ? pt[1] : -9999;
    })
    .attr('r', PIN_R)
    .attr('fill', 'rgba(179,32,32,0.70)')
    .attr('stroke', 'rgba(255,255,255,0.60)')
    .attr('stroke-width', 0.5)
    .style('display', 'none')
    .style('pointer-events', 'none');

  // ── Year counter overlay ─────────────────────────────────────────────────────
  const overlayBg = svg.append('rect')
    .attr('x', 12).attr('y', 12)
    .attr('rx', 3)
    .attr('fill', 'rgba(250,247,242,0.82)')
    .style('pointer-events', 'none');

  const yearLabel = svg.append('text')
    .attr('x', 18).attr('y', 46)
    .attr('font-size', 32)
    .attr('font-weight', 600)
    .attr('font-family', 'Georgia, serif')
    .attr('fill', '#1a1a1a')
    .style('pointer-events', 'none')
    .text('1943');

  function updateOverlayBg() {
    const bbox = yearLabel.node().getBBox();
    overlayBg
      .attr('width', bbox.width + 12)
      .attr('height', bbox.height + 8)
      .attr('y', bbox.y - 4);
  }

  // ── Tooltip ──────────────────────────────────────────────────────────────────
  const tooltip = d3.select(container)
    .append('div')
    .attr('class', 'timelapse-tooltip')
    .style('display', 'none');

  // ── Control bar (HTML below the SVG) ────────────────────────────────────────
  const controls = document.createElement('div');
  controls.className = 'timelapse-controls';
  controls.innerHTML = `
    <button class="tl-btn tl-play" aria-label="Play">&#9654; Play</button>
    <span class="tl-year-start">1943</span>
    <input type="range" class="tl-scrubber" min="0" max="1000" step="1" value="0" aria-label="Timeline scrubber">
    <span class="tl-year-end">2013</span>
    <span class="tl-year-counter">1943</span>
    <button class="tl-btn tl-reset" aria-label="Reset">&#8635;</button>
  `;
  container.after(controls);

  const playBtn    = controls.querySelector('.tl-play');
  const scrubber   = controls.querySelector('.tl-scrubber');
  const yearCounter = controls.querySelector('.tl-year-counter');

  // ── Animation state ──────────────────────────────────────────────────────────
  const DURATION = 30000; // ms for full play-through
  const START_DATE = new Date('1943-01-01').getTime();
  const END_DATE   = new Date('2013-12-31').getTime();
  const DATE_SPAN  = END_DATE - START_DATE;

  // Pre-parse dates as timestamps for fast comparison
  const pharmDates = pharmacies.map(p => new Date(p.dateouv).getTime());

  let playing = false;
  let startTimestamp = null; // performance.now() when play began
  let tAtPause = 0;          // t ∈ [0,1] when last paused
  let cursor = -1;           // index of last revealed pharmacy
  let hasStarted = false;    // for IntersectionObserver autoplay
  let rafId = null;

  function tToDate(t) {
    return new Date(START_DATE + t * DATE_SPAN);
  }

  function tToYear(t) {
    return tToDate(t).getFullYear();
  }

  function tToTimestamp(t) {
    return START_DATE + t * DATE_SPAN;
  }

  // Binary search: find last index where pharmDates[i] <= ts
  function bsearch(ts) {
    let lo = 0, hi = pharmacies.length - 1, result = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (pharmDates[mid] <= ts) { result = mid; lo = mid + 1; }
      else { hi = mid - 1; }
    }
    return result;
  }

  function revealUpTo(newCursor) {
    if (newCursor === cursor) return;
    if (newCursor > cursor) {
      // Reveal newly added pharmacies (forward)
      circles.each(function(d, i) {
        if (i > cursor && i <= newCursor) {
          d3.select(this).style('display', null);
        }
      });
    } else {
      // Scrubbed backward: hide everything above newCursor
      circles.each(function(d, i) {
        if (i > newCursor) {
          d3.select(this).style('display', 'none');
        }
        // Also ensure those within range are visible (handles scrub back then forward)
        if (i >= 0 && i <= newCursor) {
          d3.select(this).style('display', null);
        }
      });
    }
    cursor = newCursor;
  }

  function setT(t) {
    t = Math.max(0, Math.min(1, t));
    tAtPause = t;
    const ts = tToTimestamp(t);
    const newCursor = bsearch(ts);
    revealUpTo(newCursor);

    const year = tToYear(t);
    scrubber.value = Math.round(t * 1000);
    yearCounter.textContent = year;
    if (t >= 1) {
      yearLabel.text('1943–2013 · 3,991 pharmacies');
    } else {
      yearLabel.text(String(year));
    }
    updateOverlayBg();
  }

  function frame(now) {
    if (!playing) return;
    const elapsed = now - startTimestamp;
    const t = tAtPause + elapsed / DURATION;
    if (t >= 1) {
      setT(1);
      pause();
      return;
    }
    setT(t);
    rafId = requestAnimationFrame(frame);
  }

  function play() {
    if (tAtPause >= 1) {
      // Restart from beginning
      setT(0);
    }
    playing = true;
    startTimestamp = performance.now();
    playBtn.innerHTML = '&#9646;&#9646; Pause';
    // Disable pointer events on circles during animation
    circles.style('pointer-events', 'none');
    rafId = requestAnimationFrame(frame);
  }

  function pause() {
    playing = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    playBtn.innerHTML = '&#9654; Play';
    // Re-enable pointer events when paused
    circles.filter(function() {
      return d3.select(this).style('display') !== 'none';
    }).style('pointer-events', null);
  }

  function reset() {
    pause();
    setT(0);
  }

  // ── Control interactions ─────────────────────────────────────────────────────
  playBtn.addEventListener('click', () => {
    if (playing) pause(); else play();
  });

  controls.querySelector('.tl-reset').addEventListener('click', reset);

  scrubber.addEventListener('mousedown', () => { if (playing) pause(); });
  scrubber.addEventListener('touchstart', () => { if (playing) pause(); }, { passive: true });

  scrubber.addEventListener('input', () => {
    const t = parseInt(scrubber.value, 10) / 1000;
    setT(t);
  });

  // ── Pharmacy pin tooltip ─────────────────────────────────────────────────────
  circles.on('mouseover', function(event, d) {
    if (playing) return;
    const year = d.dateouv ? d.dateouv.slice(0, 4) : '?';
    tooltip
      .style('display', 'block')
      .html(`<strong>${d.name}</strong><br>${d.address}<br>Opened ${year}`);
    positionTooltip(event);
  });

  circles.on('mousemove', function(event) {
    if (playing) return;
    positionTooltip(event);
  });

  circles.on('mouseout', function() {
    tooltip.style('display', 'none');
  });

  function positionTooltip(event) {
    // event.offsetX/Y are relative to the SVG element; we want coords
    // relative to the container div (which is position:relative).
    const containerRect = container.getBoundingClientRect();
    let x = event.clientX - containerRect.left + 14;
    let y = event.clientY - containerRect.top - 14;
    // Clamp so tooltip doesn't overflow the right edge
    const ttNode = tooltip.node();
    if (ttNode) {
      const ttW = ttNode.offsetWidth || 200;
      if (x + ttW > containerRect.width - 8) x = x - ttW - 28;
    }
    tooltip
      .style('left', x + 'px')
      .style('top', y + 'px');
  }

  // ── IntersectionObserver: autoplay on first scroll-into-view ────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasStarted) {
        hasStarted = true;
        observer.disconnect();
        play();
      }
    });
  }, { threshold: 0.30 });
  observer.observe(container);

  // ── Initial render ───────────────────────────────────────────────────────────
  setT(0);
  updateOverlayBg();
}

export function drawTwinChoropleths(selector, _refs) {
  placeholder(selector, 'Map B — twin choropleths · coming next');
}

export function drawWalkingExplorer(selector, _refs) {
  placeholder(selector, 'Map C — walking explorer · coming next');
}
