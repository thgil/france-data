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
  const viewportH = window.innerHeight || 800;
  const height = Math.max(Math.round(viewportH * 0.8), 500);
  const isNarrow = width < 600;
  const PIN_R          = isNarrow ? 2.5 : 3;    // boosted for contrast against grey fills
  const PIN_STROKE_W   = isNarrow ? 0.8 : 1.2;  // cream halo width scales with viewport
  const COMMUNE_STROKE_W = 0.3;                  // base commune stroke (scaled with zoom)

  // Make container position:relative so tooltip offsets work
  container.style.position = 'relative';

  // ── SVG ─────────────────────────────────────────────────────────────────────
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('display', 'block')
    .style('background', '#f7f4ee')
    .style('cursor', 'grab');

  // ── World group (transformed by zoom) ────────────────────────────────────────
  const worldG = svg.append('g').attr('class', 'tl-world');

  // ── Projection: fit to Paris + petite couronne (dépts 75, 92, 93, 94) ────────
  // The fit uses only the inner-ring FeatureCollection so the default view is
  // ~4× tighter than full-IDF. ALL 1,300 communes and ALL 3,991 pins are still
  // rendered; outer dépts are initially clipped by the SVG viewport but appear
  // when the user pans or zooms out.
  const INNER_DEPTS = new Set(['75']);
  const innerFC = {
    type: 'FeatureCollection',
    features: communes.features.filter(f => INNER_DEPTS.has(f.properties.dept)),
  };
  const projection = d3.geoMercator()
    .fitSize([width, height], innerFC);
  const path = d3.geoPath(projection);

  // ── Bakery opacity scale (85th-percentile cap — reduced from 95th to suppress
  //    small-commune outliers that distort the visual hierarchy) ─────────────────
  const bpValues = communes.features
    .map(f => f.properties.bakeriesPer10k || 0)
    .filter(v => v > 0)
    .sort(d3.ascending);
  const capValue = d3.quantile(bpValues, 0.85) || 1; // 85th percentile cap
  const bakeryOpacityScale = d3.scaleLinear()
    .domain([0, capValue])
    .range([0.02, 0.28])
    .clamp(true);

  // ── Background: commune choropleth (monochrome grey, opacity-only encoding) ──
  // Fill is a fixed dark ink colour (#1a1a1a); only opacity varies with bakery
  // density. This keeps the backdrop neutral so red pharmacy pins read clearly.
  const communeGroup = worldG.append('g').attr('class', 'communes');
  communeGroup.selectAll('path')
    .data(communes.features)
    .join('path')
    .attr('class', 'commune')
    .attr('d', path)
    .attr('fill', '#1a1a1a')
    .attr('fill-opacity', d => bakeryOpacityScale(d.properties.bakeriesPer10k || 0))
    .attr('stroke', '#1a1a1a')
    .attr('stroke-width', COMMUNE_STROKE_W);

  // ── Foreground: pharmacy circles (all pre-rendered, hidden) ──────────────────
  const pinGroup = worldG.append('g').attr('class', 'pharmacies');
  const circles = pinGroup.selectAll('circle')
    .data(pharmacies)
    .join('circle')
    .attr('class', 'pharmacy-pin')
    .attr('cx', d => {
      const pt = projection([d.lng, d.lat]);
      return pt ? pt[0] : -9999;
    })
    .attr('cy', d => {
      const pt = projection([d.lng, d.lat]);
      return pt ? pt[1] : -9999;
    })
    .attr('r', PIN_R)
    .attr('fill', '#b32020')              // full-saturation red — punches through neutral grey
    .attr('stroke', 'rgba(250,247,242,0.80)')  // paper (#faf7f2) halo at 80% opacity
    .attr('stroke-width', PIN_STROKE_W)
    .style('display', 'none')
    .style('pointer-events', 'none');

  // ── Year counter overlay (stays fixed in SVG space, not in worldG) ──────────
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
    .attr('class', 'map-tooltip timelapse-tooltip')
    .style('display', 'none');

  // ── d3-zoom setup ────────────────────────────────────────────────────────────
  const zoom = d3.zoom()
    .scaleExtent([1, 12])
    .translateExtent([[-width * 0.5, -height * 0.5], [width * 1.5, height * 1.5]])
    .filter((event) => {
      // Allow drag always; wheel zoom only with ctrl/cmd held (pinch always works)
      if (event.type === 'wheel') return event.ctrlKey || event.metaKey;
      return !event.button; // no right-click pan
    })
    .on('zoom', (event) => {
      worldG.attr('transform', event.transform);
      // Keep pin radius visually consistent across zoom levels
      worldG.selectAll('.pharmacy-pin')
        .attr('r', PIN_R / event.transform.k)
        .attr('stroke-width', PIN_STROKE_W / event.transform.k);
      worldG.selectAll('.commune')
        .attr('stroke-width', COMMUNE_STROKE_W / event.transform.k);
    })
    .on('start', () => {
      svg.style('cursor', 'grabbing');
    })
    .on('end', () => {
      svg.style('cursor', 'grab');
    });

  svg.call(zoom);

  // ── Control bar (HTML below the SVG) ────────────────────────────────────────
  const controls = document.createElement('div');
  controls.className = 'timelapse-controls';
  controls.innerHTML = `
    <button class="tl-btn tl-play" aria-label="Play">&#9654; Play</button>
    <span class="tl-year-start">1943</span>
    <input type="range" class="tl-scrubber" min="0" max="1000" step="1" value="0" aria-label="Timeline scrubber">
    <span class="tl-year-end">2013</span>
    <span class="tl-year-counter">1943</span>
    <button class="tl-btn tl-reset" aria-label="Reset animation">&#8635;</button>
    <button class="tl-btn tl-zoom-out" aria-label="Zoom out">&#8722;</button>
    <button class="tl-btn tl-zoom-in" aria-label="Zoom in">&#43;</button>
    <button class="tl-btn tl-zoom-reset" aria-label="Reset zoom">&#8982; Zoom</button>
  `;
  container.after(controls);

  // ── Pan/zoom hint (below controls) ──────────────────────────────────────────
  const hint = document.createElement('p');
  hint.className = 'timelapse-zoom-hint';
  hint.textContent = 'Drag to pan · pinch or ⌘ + scroll to zoom';
  controls.after(hint);

  const playBtn    = controls.querySelector('.tl-play');
  const scrubber   = controls.querySelector('.tl-scrubber');
  const yearCounter = controls.querySelector('.tl-year-counter');

  // Zoom button handlers
  const MID_X = width / 2;
  const MID_Y = height / 2;

  controls.querySelector('.tl-zoom-in').addEventListener('click', () => {
    svg.transition().duration(300).call(zoom.scaleBy, 1.5, [MID_X, MID_Y]);
  });
  controls.querySelector('.tl-zoom-out').addEventListener('click', () => {
    svg.transition().duration(300).call(zoom.scaleBy, 1 / 1.5, [MID_X, MID_Y]);
  });
  controls.querySelector('.tl-zoom-reset').addEventListener('click', () => {
    svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
  });

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
    d3.select(this).style('cursor', 'pointer');
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
    d3.select(this).style('cursor', null);
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

export function drawTwinChoropleths(selector, refs) {
  const container = document.querySelector(selector);
  if (!container) return;

  const { communes } = refs;
  const features = communes.features;
  const N = features.length;

  // ── Layout ──────────────────────────────────────────────────────────────────
  const GAP = 16;
  const totalWidth = container.clientWidth || 800;
  const isNarrow = totalWidth < 720;
  const mapWidth  = isNarrow ? totalWidth : Math.floor((totalWidth - GAP) / 2);
  const mapHeight = Math.round(mapWidth * (5 / 4));

  container.style.position = 'relative';

  // ── Outer wrapper ────────────────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.className = 'twin-wrapper';
  wrapper.style.cssText = isNarrow
    ? 'display:flex;flex-direction:column;gap:16px;'
    : 'display:flex;flex-direction:row;gap:' + GAP + 'px;align-items:flex-start;';
  container.appendChild(wrapper);

  // ── Colour scales (95th-percentile cap) ─────────────────────────────────────
  const pharmValues = features.map(f => f.properties.pharmaciesPer10k || 0)
    .filter(v => v > 0).sort(d3.ascending);
  const bakValues   = features.map(f => f.properties.bakeriesPer10k  || 0)
    .filter(v => v > 0).sort(d3.ascending);

  const p95Pharm = d3.quantile(pharmValues, 0.95) || 1;
  const p95Bak   = d3.quantile(bakValues,   0.95) || 1;

  const pharmScale = d3.scaleSequential(d3.interpolateReds).domain([0, p95Pharm]);
  const bakScale   = d3.scaleSequential(d3.interpolateGreys).domain([0, p95Bak]);

  const PAPER = '#faf7f2';
  const PAPER_ALT = '#f5f0e8';

  function pharmColor(v) {
    return v <= 0 ? PAPER_ALT : pharmScale(Math.min(v, p95Pharm));
  }
  function bakColor(v) {
    return v <= 0 ? PAPER_ALT : bakScale(Math.min(v, p95Bak));
  }

  // ── Pre-sort ranks ───────────────────────────────────────────────────────────
  // leftRanks[0] = index of highest pharmacy-density commune, etc.
  function buildRanks(accessor) {
    return features
      .map((f, i) => ({ i, v: accessor(f) || 0 }))
      .sort((a, b) => b.v - a.v || (a.i < b.i ? -1 : 1))
      .map(o => o.i);
  }

  const leftRanks  = buildRanks(f => f.properties.pharmaciesPer10k);
  const rightRanks = buildRanks(f => f.properties.bakeriesPer10k);

  // rank lookup arrays (1-based rank for tooltip)
  const pharmRank = new Array(N);
  const bakRank   = new Array(N);
  leftRanks.forEach((fi, rank) => { pharmRank[fi] = rank + 1; });
  rightRanks.forEach((fi, rank) => { bakRank[fi]   = rank + 1; });

  // ── Build one map panel ──────────────────────────────────────────────────────
  function buildPanel(label, labelColor) {
    const panel = document.createElement('div');
    panel.className = 'twin-panel';
    panel.style.cssText = 'display:flex;flex-direction:column;flex:0 0 auto;width:' + mapWidth + 'px;';

    const caption = document.createElement('div');
    caption.className = 'twin-caption';
    caption.textContent = label;
    caption.style.color = labelColor;
    panel.appendChild(caption);

    const svg = d3.select(panel)
      .append('svg')
      .attr('width', mapWidth)
      .attr('height', mapHeight)
      .style('display', 'block')
      .style('background', PAPER);

    wrapper.appendChild(panel);
    return { panel, svg };
  }

  const { svg: leftSvg }  = buildPanel('Pharmacies / 10k', '#b32020');
  const { svg: rightSvg } = buildPanel('Bakeries / 10k',   '#1a1a1a');

  // ── Projection (shared parameters since both maps are same size) ─────────────
  const projection = d3.geoMercator().fitSize([mapWidth, mapHeight], communes);
  const path = d3.geoPath(projection);

  // ── Render commune paths ─────────────────────────────────────────────────────
  const leftPaths  = leftSvg.append('g').selectAll('path')
    .data(features).join('path')
    .attr('d', path)
    .attr('fill', PAPER)
    .attr('stroke', '#1a1a1a')
    .attr('stroke-width', 0.3)
    .attr('stroke-opacity', 0.2);

  const rightPaths = rightSvg.append('g').selectAll('path')
    .data(features).join('path')
    .attr('d', path)
    .attr('fill', PAPER)
    .attr('stroke', '#1a1a1a')
    .attr('stroke-width', 0.3)
    .attr('stroke-opacity', 0.2);

  // index → DOM node arrays for fast RAF access
  const leftNodes  = leftPaths.nodes();
  const rightNodes = rightPaths.nodes();

  // ── Tooltip ──────────────────────────────────────────────────────────────────
  const tooltip = d3.select(container)
    .append('div')
    .attr('class', 'map-tooltip twin-tooltip')
    .style('display', 'none');

  function positionTooltip(event) {
    const rect = container.getBoundingClientRect();
    let x = event.clientX - rect.left + 14;
    let y = event.clientY - rect.top  - 14;
    const ttNode = tooltip.node();
    if (ttNode) {
      const ttW = ttNode.offsetWidth || 220;
      if (x + ttW > rect.width - 8) x = x - ttW - 28;
    }
    tooltip.style('left', x + 'px').style('top', y + 'px');
  }

  // ── Hover sync ───────────────────────────────────────────────────────────────
  let hoverEnabled = false;

  // Build a fast feature→index lookup
  const featureIndex = new Map(features.map((f, i) => [f, i]));

  function attachHover(pathSel) {
    pathSel.on('mouseover', function(event, d) {
      if (!hoverEnabled) return;
      const idx = featureIndex.get(d);
      if (idx == null) return;

      // Highlight both sides
      [leftNodes[idx], rightNodes[idx]].forEach(node => {
        if (!node) return;
        node.setAttribute('stroke-width', '1.5');
        node.setAttribute('stroke-opacity', '1');
        node.parentNode && node.parentNode.appendChild(node); // raise
      });

      const pVal  = (d.properties.pharmaciesPer10k || 0).toFixed(2);
      const bVal  = (d.properties.bakeriesPer10k  || 0).toFixed(2);
      const pRank = pharmRank[idx] || '–';
      const bRank = bakRank[idx]   || '–';

      tooltip
        .style('display', 'block')
        .html(
          `<strong class="tt-name">${d.properties.name || d.properties.code || ''}</strong>` +
          `<div class="tt-row"><span class="tt-label">Pharmacies</span> · ${pVal} / 10k · rank ${pRank} of ${N}</div>` +
          `<div class="tt-row"><span class="tt-label">Bakeries</span>   · ${bVal} / 10k · rank ${bRank} of ${N}</div>`
        );
      positionTooltip(event);
    });

    pathSel.on('mousemove', function(event) {
      if (!hoverEnabled) return;
      positionTooltip(event);
    });

    pathSel.on('mouseout', function(event, d) {
      if (!hoverEnabled) return;
      const idx = featureIndex.get(d);
      if (idx == null) return;
      // Restore to revealed fill (or paper if not yet revealed)
      leftNodes[idx].setAttribute('stroke-width', '0.3');
      leftNodes[idx].setAttribute('stroke-opacity', leftRevealed[idx] ? '0.4' : '0.2');
      leftNodes[idx].setAttribute('fill',
        leftRevealed[idx] ? pharmColor(d.properties.pharmaciesPer10k) : PAPER);
      rightNodes[idx].setAttribute('stroke-width', '0.3');
      rightNodes[idx].setAttribute('stroke-opacity', rightRevealed[idx] ? '0.4' : '0.2');
      rightNodes[idx].setAttribute('fill',
        rightRevealed[idx] ? bakColor(d.properties.bakeriesPer10k) : PAPER);
      tooltip.style('display', 'none');
    });
  }

  attachHover(leftPaths);
  attachHover(rightPaths);

  // ── Animation engine ─────────────────────────────────────────────────────────
  const ANIM_DURATION = 6000; // ms
  let animStart = null;
  let animRaf   = null;
  let animDone  = false;

  // Track which communes have been revealed (to avoid redundant setAttribute)
  const leftRevealed  = new Uint8Array(N); // 0 = not revealed, 1 = revealed
  const rightRevealed = new Uint8Array(N);

  function revealFrame(now) {
    if (animStart === null) animStart = now;
    const t = Math.min((now - animStart) / ANIM_DURATION, 1);
    const k = Math.floor(t * N);

    // Reveal communes in rank order up to index k (exclusive)
    for (let r = 0; r < k; r++) {
      const li = leftRanks[r];
      if (!leftRevealed[li]) {
        leftRevealed[li] = 1;
        leftNodes[li].setAttribute('fill',
          pharmColor(features[li].properties.pharmaciesPer10k));
        leftNodes[li].setAttribute('stroke-opacity', '0.4');
      }
      const ri = rightRanks[r];
      if (!rightRevealed[ri]) {
        rightRevealed[ri] = 1;
        rightNodes[ri].setAttribute('fill',
          bakColor(features[ri].properties.bakeriesPer10k));
        rightNodes[ri].setAttribute('stroke-opacity', '0.4');
      }
    }

    if (t < 1) {
      animRaf = requestAnimationFrame(revealFrame);
    } else {
      // Ensure all communes revealed
      for (let r = 0; r < N; r++) {
        const li = leftRanks[r];
        if (!leftRevealed[li]) {
          leftNodes[li].setAttribute('fill', pharmColor(features[li].properties.pharmaciesPer10k));
          leftNodes[li].setAttribute('stroke-opacity', '0.4');
        }
        const ri = rightRanks[r];
        if (!rightRevealed[ri]) {
          rightNodes[ri].setAttribute('fill', bakColor(features[ri].properties.bakeriesPer10k));
          rightNodes[ri].setAttribute('stroke-opacity', '0.4');
        }
      }
      animDone = true;
      hoverEnabled = true;
    }
  }

  function resetAnimation() {
    if (animRaf) { cancelAnimationFrame(animRaf); animRaf = null; }
    animStart   = null;
    animDone    = false;
    hoverEnabled = false;
    leftRevealed.fill(0);
    rightRevealed.fill(0);
    // Reset all fills to paper
    leftNodes.forEach(n => {
      n.setAttribute('fill', PAPER);
      n.setAttribute('stroke-opacity', '0.2');
    });
    rightNodes.forEach(n => {
      n.setAttribute('fill', PAPER);
      n.setAttribute('stroke-opacity', '0.2');
    });
    tooltip.style('display', 'none');
  }

  function startAnimation() {
    resetAnimation();
    animRaf = requestAnimationFrame(revealFrame);
  }

  // ── Legend strip ─────────────────────────────────────────────────────────────
  const legendEl = document.createElement('div');
  legendEl.className = 'twin-legend';

  function makeLegendBar(label, scale, sortedValues, p95Val, accentColor) {
    const div = document.createElement('div');
    div.className = 'twin-legend-row';

    const wrap = document.createElement('div');
    wrap.className = 'twin-legend-label';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'twin-legend-name';
    nameSpan.style.color = accentColor;
    nameSpan.textContent = label;
    wrap.appendChild(nameSpan);

    const barWrap = document.createElement('div');
    barWrap.className = 'twin-legend-bar-wrap';

    const canvas = document.createElement('canvas');
    canvas.width  = 200;
    canvas.height = 12;
    const ctx = canvas.getContext('2d');
    for (let x = 0; x < 200; x++) {
      ctx.fillStyle = scale(p95Val * x / 199);
      ctx.fillRect(x, 0, 1, 12);
    }
    barWrap.appendChild(canvas);

    const p50Val = d3.quantile(sortedValues, 0.5) || p95Val / 2;
    const fmt = v => v < 10 ? v.toFixed(1) : Math.round(v);

    function tick(pct, text, cls) {
      const s = document.createElement('span');
      s.className = 'twin-legend-tick' + (cls ? ' ' + cls : '');
      s.style.left = pct.toFixed(1) + '%';
      if (cls) s.title = 'Communes above this value use the darkest colour.';
      s.textContent = text;
      barWrap.appendChild(s);
    }
    tick(0,   '0',            '');
    tick(p50Val / p95Val * 100, fmt(p50Val), '');
    tick(100, fmt(p95Val) + ' ↑', 'twin-legend-cap');

    wrap.appendChild(barWrap);
    div.appendChild(wrap);
    return div;
  }

  legendEl.appendChild(makeLegendBar('Pharmacies / 10k', pharmScale, pharmValues, p95Pharm, '#b32020'));
  legendEl.appendChild(makeLegendBar('Bakeries / 10k',   bakScale,   bakValues,   p95Bak,   '#1a1a1a'));

  container.appendChild(legendEl);

  // ── Replay button ─────────────────────────────────────────────────────────────
  const replayWrap = document.createElement('div');
  replayWrap.className = 'twin-replay-wrap';
  const replayBtn = document.createElement('button');
  replayBtn.className = 'twin-replay-btn';
  replayBtn.innerHTML = '&#8635; Replay';
  replayBtn.addEventListener('click', startAnimation);
  replayWrap.appendChild(replayBtn);
  container.appendChild(replayWrap);

  // ── IntersectionObserver ──────────────────────────────────────────────────────
  let hasAutoplayed = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAutoplayed) {
        hasAutoplayed = true;
        observer.disconnect();
        startAnimation();
      }
    });
  }, { threshold: 0.30 });
  observer.observe(container);
}

export function drawWalkingExplorer(selector, refs) {
  const container = document.querySelector(selector);
  if (!container) return;

  const { pharmacies, communes } = refs;

  // ── Constants ────────────────────────────────────────────────────────────────
  // Walking speed: 5 km/h = 83.33 m/min
  // Radii: 5 min = 417 m, 10 min = 833 m, 15 min = 1250 m
  const RADII_M = [417, 833, 1250];
  const RING_LABELS = ['5 min', '10 min', '15 min'];

  // Distance conversion at IDF latitude (~48.85°N)
  const LAT_CENTER_DEG = 48.85;
  const LAT_CENTER_RAD = LAT_CENTER_DEG * Math.PI / 180;
  const COS_LAT = Math.cos(LAT_CENTER_RAD);
  // 1° lat ≈ 111,320 m; 1° lng ≈ 73,500 m at this latitude (×cos for actual)
  const M_PER_DEG_LAT = 111320;
  const M_PER_DEG_LNG = 73500;

  // Ring stroke styles
  const RING_STYLES = [
    { fill: 'rgba(179,32,32,0.10)', stroke: '#b32020', strokeWidth: 1.5, strokeDasharray: null,   strokeOpacity: 1 },
    { fill: 'rgba(179,32,32,0.05)', stroke: '#b32020', strokeWidth: 1,   strokeDasharray: '4 3',  strokeOpacity: 1 },
    { fill: 'none',                 stroke: '#b32020', strokeWidth: 1,   strokeDasharray: '2 4',  strokeOpacity: 0.5 },
  ];

  // Featured corners
  const CORNERS = [
    { name: 'Champs-Élysées',       lat: 48.8700, lng: 2.3075 },
    { name: 'Bastille',             lat: 48.8532, lng: 2.3692 },
    { name: 'Gare du Nord',         lat: 48.8809, lng: 2.3553 },
    { name: 'Marais',               lat: 48.8554, lng: 2.3657 },
    { name: 'Montmartre',           lat: 48.8867, lng: 2.3431 },
    { name: 'Versailles',           lat: 48.8014, lng: 2.1301 },
  ];

  const PIN_R = 2.5;

  // ── Layout ───────────────────────────────────────────────────────────────────
  const width = container.clientWidth || 800;
  const viewportH = window.innerHeight || 800;
  const height = Math.max(Math.round(viewportH * 0.8), 500);

  container.style.position = 'relative';

  // ── SVG ──────────────────────────────────────────────────────────────────────
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('display', 'block')
    .style('background', '#f7f4ee')
    .style('cursor', 'crosshair');

  // ── Projection: fit to Paris intra-muros (dépt 75) ──────────────────────────
  const parisFC = {
    type: 'FeatureCollection',
    features: communes.features.filter(f => f.properties.dept === '75'),
  };
  const projection = d3.geoMercator()
    .fitSize([width, height], parisFC);
  const path = d3.geoPath(projection);

  // ── Precompute commune centroids ─────────────────────────────────────────────
  const communeCentroids = communes.features.map(f => {
    const [cLng, cLat] = d3.geoCentroid(f);
    return { lat: cLat, lng: cLng, bakeries: f.properties.bakeries || 0, name: f.properties.name || '' };
  });

  // ── Commune outlines (no choropleth fill) ────────────────────────────────────
  const communeGroup = svg.append('g').attr('class', 'walk-communes');
  communeGroup.selectAll('path')
    .data(communes.features)
    .join('path')
    .attr('d', path)
    .attr('fill', '#f7f4ee')
    .attr('stroke', '#1a1a1a')
    .attr('stroke-width', 0.3)
    .attr('stroke-opacity', 0.4);

  // ── Ring group (rendered below pins) ─────────────────────────────────────────
  const ringGroup = svg.append('g').attr('class', 'walk-rings');

  // ── Pharmacy pins ─────────────────────────────────────────────────────────────
  const pinGroup = svg.append('g').attr('class', 'walk-pins');
  const pharmCoords = pharmacies.map(d => {
    const pt = projection([d.lng, d.lat]);
    return { px: pt ? pt[0] : -9999, py: pt ? pt[1] : -9999, lat: d.lat, lng: d.lng, name: d.name, address: d.address };
  });

  const circles = pinGroup.selectAll('circle')
    .data(pharmCoords)
    .join('circle')
    .attr('cx', d => d.px)
    .attr('cy', d => d.py)
    .attr('r', PIN_R)
    .attr('fill', 'rgba(179,32,32,0.70)')
    .attr('stroke', 'rgba(255,255,255,0.60)')
    .attr('stroke-width', 0.5)
    .style('pointer-events', 'none');

  // ── Marker group (rendered above rings, above pins) ──────────────────────────
  const markerGroup = svg.append('g').attr('class', 'walk-marker');

  // ── State ────────────────────────────────────────────────────────────────────
  let activeCorner = null;

  // ── Distance helper ──────────────────────────────────────────────────────────
  function distMetres(lat1, lng1, lat2, lng2) {
    const dx = (lng2 - lng1) * M_PER_DEG_LNG * COS_LAT;
    const dy = (lat2 - lat1) * M_PER_DEG_LAT;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ── Count pharmacies within radius ───────────────────────────────────────────
  function countPharmacies(lat, lng, radiusM) {
    let count = 0;
    for (let i = 0; i < pharmacies.length; i++) {
      if (distMetres(lat, lng, pharmacies[i].lat, pharmacies[i].lng) <= radiusM) count++;
    }
    return count;
  }

  // ── Count bakeries (centroid approximation) ───────────────────────────────────
  function countBakeries(lat, lng, radiusM) {
    let count = 0;
    for (let i = 0; i < communeCentroids.length; i++) {
      const c = communeCentroids[i];
      if (distMetres(lat, lng, c.lat, c.lng) <= radiusM) count += c.bakeries;
    }
    return count;
  }

  // ── Convert metre radius to SVG pixel radius ──────────────────────────────────
  function metreToPixelRadius(lat, lng, radiusM) {
    // Project a point radiusM metres due east and measure the pixel distance
    const dLng = radiusM / (M_PER_DEG_LNG * COS_LAT);
    const ptCenter = projection([lng, lat]);
    const ptEast   = projection([lng + dLng, lat]);
    if (!ptCenter || !ptEast) return 0;
    const dx = ptEast[0] - ptCenter[0];
    const dy = ptEast[1] - ptCenter[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ── Identify commune at click ─────────────────────────────────────────────────
  function findCommune(lat, lng) {
    for (const f of communes.features) {
      if (d3.geoContains(f, [lng, lat])) return f.properties.name || '';
    }
    return null;
  }

  // ── Update rings and pin opacity ──────────────────────────────────────────────
  function updateMap(lat, lng) {
    const pt = projection([lng, lat]);
    if (!pt) return;
    const [px, py] = pt;

    // Remove old rings and marker
    ringGroup.selectAll('*').remove();
    markerGroup.selectAll('*').remove();

    // Draw rings in reverse order (largest first, so smaller ones render on top)
    for (let i = RADII_M.length - 1; i >= 0; i--) {
      const pxR = metreToPixelRadius(lat, lng, RADII_M[i]);
      const s = RING_STYLES[i];
      const c = ringGroup.append('circle')
        .attr('cx', px).attr('cy', py)
        .attr('r', pxR)
        .attr('fill', s.fill)
        .attr('stroke', s.stroke)
        .attr('stroke-width', s.strokeWidth)
        .attr('stroke-opacity', s.strokeOpacity)
        .style('pointer-events', 'none');
      if (s.strokeDasharray) c.attr('stroke-dasharray', s.strokeDasharray);
    }

    // Draw marker
    markerGroup.append('circle')
      .attr('cx', px).attr('cy', py)
      .attr('r', 8)
      .attr('fill', '#1a1a1a')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('pointer-events', 'none');

    // Pin opacity: inside 5-min ring → full; outside → dimmed
    const pxR5 = metreToPixelRadius(lat, lng, RADII_M[0]);
    circles.each(function(d) {
      const ddx = d.px - px;
      const ddy = d.py - py;
      const inside = (ddx * ddx + ddy * ddy) <= pxR5 * pxR5;
      d3.select(this)
        .transition().duration(200)
        .attr('opacity', inside ? 1.0 : 0.4)
        .attr('stroke-width', inside ? 0.8 : 0.5);
    });

    // Change cursor
    svg.style('cursor', 'default');
  }

  // ── Update panel ──────────────────────────────────────────────────────────────
  function updatePanel(lat, lng, communeName) {
    const counts = RADII_M.map(r => ({
      pharm: countPharmacies(lat, lng, r),
      bak:   countBakeries(lat, lng, r),
    }));

    const latStr = lat.toFixed(4);
    const lngStr = lng.toFixed(4);
    const locLabel = communeName
      ? `${communeName} · ${latStr}, ${lngStr}`
      : `${latStr}, ${lngStr}`;

    const rows = counts.map((c, i) =>
      `<div class="walk-count-row">
        <span class="walk-ring-label">${RING_LABELS[i]}</span>
        <span class="walk-count-sep">·</span>
        <span class="walk-count-val">${c.pharm} pharmacies</span>
        <span class="walk-count-sep">·</span>
        <span class="walk-count-val walk-approx">≈ ${c.bak} bakeries</span>
      </div>`
    ).join('');

    panel.innerHTML = `
      <div class="walk-panel-inner">
        <div class="walk-panel-left">
          <div class="walk-loc-name">${locLabel}</div>
          <div class="walk-counts">${rows}</div>
        </div>
      </div>
      <div class="walk-corners">
        <div class="walk-corners-label">Featured corners</div>
        <div class="walk-corners-pills">${cornerPills()}</div>
      </div>
      <div class="walk-footnote">Straight-line radii, not street-network distance. · Bakery counts are estimates from commune-level totals.</div>
    `;
    attachCornerListeners();
  }

  // ── Empty state panel ─────────────────────────────────────────────────────────
  function emptyPanel() {
    panel.innerHTML = `
      <div class="walk-empty-prompt">Click the map to pick a spot, or try a featured corner below.</div>
      <div class="walk-corners">
        <div class="walk-corners-label">Featured corners</div>
        <div class="walk-corners-pills">${cornerPills()}</div>
      </div>
      <div class="walk-footnote">Straight-line radii, not street-network distance. · Bakery counts estimated from commune totals.</div>
    `;
    attachCornerListeners();
  }

  // ── Corner pill HTML ──────────────────────────────────────────────────────────
  function cornerPills() {
    return CORNERS.map((c, i) =>
      `<button class="walk-corner-pill${activeCorner === i ? ' walk-corner-active' : ''}" data-corner="${i}">${c.name}</button>`
    ).join('');
  }

  // ── Attach corner button listeners ────────────────────────────────────────────
  function attachCornerListeners() {
    panel.querySelectorAll('.walk-corner-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.corner, 10);
        const c = CORNERS[i];
        activeCorner = i;
        handlePoint(c.lat, c.lng);
      });
    });
  }

  // ── Handle a new point selection ──────────────────────────────────────────────
  function handlePoint(lat, lng) {
    updateMap(lat, lng);
    const communeName = findCommune(lat, lng);
    updatePanel(lat, lng, communeName);
  }

  // ── Panel (below SVG) ─────────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.className = 'walk-panel';
  container.after(panel);

  emptyPanel();

  // ── Click handler ─────────────────────────────────────────────────────────────
  svg.on('click', function(event) {
    const [mx, my] = d3.pointer(event);
    const coords = projection.invert([mx, my]);
    if (!coords) return;
    const [lng, lat] = coords;
    activeCorner = null;
    handlePoint(lat, lng);
  });
}
