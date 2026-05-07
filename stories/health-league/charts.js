/* charts.js — health-league story */

export function drawLeagueTable(selector, regions) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Sort best → worst (best at top)
  const sorted = [...regions].sort((a, b) => b.avg_apl - a.avg_apl);

  const DESERT_THRESHOLD = 2.5;
  const MAX_APL = 5.0;

  // Colour by tier
  function barColour(apl) {
    if (apl >= 4.0) return '#2a7a4f';   // dark green
    if (apl >= 3.5) return '#5aaa72';   // mid green
    if (apl >= 3.0) return '#d4860a';   // amber
    return '#c0392b';                    // red
  }

  const rowH = 38;
  const labelW = 220;
  const barMaxW = 380;
  const totalW = labelW + barMaxW + 120;
  const totalH = sorted.length * rowH + 60;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = 'var(--sans, "Helvetica Neue", sans-serif)';
  svg.style.fontSize = '13px';
  svg.style.overflow = 'visible';

  // Background
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', totalW);
  bg.setAttribute('height', totalH);
  bg.setAttribute('fill', '#faf7f2');
  svg.appendChild(bg);

  // Header
  const headerY = 22;
  function svgText(x, y, text, opts = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    if (opts.fill) el.setAttribute('fill', opts.fill);
    if (opts.fontSize) el.setAttribute('font-size', opts.fontSize);
    if (opts.fontWeight) el.setAttribute('font-weight', opts.fontWeight);
    if (opts.textAnchor) el.setAttribute('text-anchor', opts.textAnchor);
    if (opts.letterSpacing) el.setAttribute('letter-spacing', opts.letterSpacing);
    if (opts.fontStyle) el.setAttribute('font-style', opts.fontStyle);
    el.textContent = text;
    return el;
  }

  svg.appendChild(svgText(0, headerY, 'Region', {
    fill: '#888', fontSize: '10', fontWeight: '600', letterSpacing: '1'
  }));
  svg.appendChild(svgText(labelW + barMaxW / 2, headerY, 'Population-weighted APL score ▸', {
    fill: '#888', fontSize: '10', fontWeight: '600', textAnchor: 'middle', letterSpacing: '0.5'
  }));
  svg.appendChild(svgText(totalW, headerY, '% in desert', {
    fill: '#888', fontSize: '10', fontWeight: '600', textAnchor: 'end', letterSpacing: '0.5'
  }));

  sorted.forEach((region, i) => {
    const rowY = 30 + i * rowH;
    const midY = rowY + rowH / 2;

    // Alternating row background
    if (i % 2 === 0) {
      const rowBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rowBg.setAttribute('x', 0);
      rowBg.setAttribute('y', rowY);
      rowBg.setAttribute('width', totalW);
      rowBg.setAttribute('height', rowH);
      rowBg.setAttribute('fill', '#f5f1ea');
      svg.appendChild(rowBg);
    }

    // Rank badge
    const rankX = 0;
    svg.appendChild(svgText(rankX, midY + 4.5, `${i + 1}`, {
      fill: '#bbb', fontSize: '10', fontWeight: '600'
    }));

    // Region label
    svg.appendChild(svgText(18, midY + 4.5, region.name, {
      fill: '#1a1a1a', fontSize: '12'
    }));

    // Bar track
    const trackX = labelW;
    const trackH = 16;
    const trackY = midY - trackH / 2;
    const track = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    track.setAttribute('x', trackX);
    track.setAttribute('y', trackY);
    track.setAttribute('width', barMaxW);
    track.setAttribute('height', trackH);
    track.setAttribute('fill', '#e8e0d8');
    track.setAttribute('rx', '2');
    svg.appendChild(track);

    // Bar fill
    const barW = (region.avg_apl / MAX_APL) * barMaxW;
    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar.setAttribute('x', trackX);
    bar.setAttribute('y', trackY);
    bar.setAttribute('width', barW);
    bar.setAttribute('height', trackH);
    bar.setAttribute('fill', barColour(region.avg_apl));
    bar.setAttribute('rx', '2');
    svg.appendChild(bar);

    // Threshold line at APL 2.5
    const threshX = trackX + (DESERT_THRESHOLD / MAX_APL) * barMaxW;
    const threshLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    threshLine.setAttribute('x1', threshX);
    threshLine.setAttribute('y1', trackY - 2);
    threshLine.setAttribute('x2', threshX);
    threshLine.setAttribute('y2', trackY + trackH + 2);
    threshLine.setAttribute('stroke', '#c0392b');
    threshLine.setAttribute('stroke-width', '1');
    threshLine.setAttribute('stroke-dasharray', '2,2');
    svg.appendChild(threshLine);

    // APL value label
    svg.appendChild(svgText(trackX + barW + 5, midY + 4.5, region.avg_apl.toFixed(2), {
      fill: barColour(region.avg_apl), fontSize: '11', fontWeight: '600'
    }));

    // Desert % on the right
    const desertStr = `${region.desert_pct_pop.toFixed(1)}%`;
    svg.appendChild(svgText(totalW, midY + 4.5, desertStr, {
      fill: region.desert_pct_pop > 25 ? '#c0392b' : (region.desert_pct_pop > 15 ? '#d4860a' : '#555'),
      fontSize: '11', fontWeight: '600', textAnchor: 'end'
    }));
  });

  // Threshold label (bottom row annotation)
  const lastY = 30 + sorted.length * rowH;
  const threshX = labelW + (DESERT_THRESHOLD / MAX_APL) * barMaxW;
  svg.appendChild(svgText(threshX, lastY + 14, 'desert', {
    fill: '#c0392b', fontSize: '9', textAnchor: 'middle', letterSpacing: '0.5'
  }));
  svg.appendChild(svgText(threshX, lastY + 24, 'threshold', {
    fill: '#c0392b', fontSize: '9', textAnchor: 'middle', letterSpacing: '0.5'
  }));
  svg.appendChild(svgText(threshX, lastY + 34, '(APL 2.5)', {
    fill: '#c0392b', fontSize: '9', textAnchor: 'middle', fontStyle: 'italic'
  }));

  // APL axis ticks
  [1, 2, 3, 4, 5].forEach(tick => {
    const tickX = labelW + (tick / MAX_APL) * barMaxW;
    const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tickLine.setAttribute('x1', tickX);
    tickLine.setAttribute('y1', 30);
    tickLine.setAttribute('x2', tickX);
    tickLine.setAttribute('y2', lastY);
    tickLine.setAttribute('stroke', '#ddd');
    tickLine.setAttribute('stroke-width', '0.5');
    svg.insertBefore(tickLine, svg.firstChild.nextSibling); // insert after bg
    svg.appendChild(svgText(tickX, lastY + 14, `${tick}`, {
      fill: '#aaa', fontSize: '9', textAnchor: 'middle'
    }));
  });

  container.appendChild(svg);
}


export function drawDesertBubbles(selector, regions) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Sort by desert_pop descending for display
  const sorted = [...regions].sort((a, b) => b.desert_pop - a.desert_pop);
  const maxPop = sorted[0].desert_pop;

  const rowH = 32;
  const labelW = 220;
  const barMaxW = 320;
  const numW = 100;
  const totalW = labelW + barMaxW + numW;
  const totalH = sorted.length * rowH + 30;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = 'var(--sans, "Helvetica Neue", sans-serif)';

  // Header
  svg.appendChild(mkText(0, 16, 'Region', { fill: '#888', size: 10, weight: '600', ls: '1' }));
  svg.appendChild(mkText(labelW + barMaxW / 2, 16, 'Residents in a medical desert ▸', { fill: '#888', size: 10, weight: '600', anchor: 'middle', ls: '0.5' }));

  sorted.forEach((r, i) => {
    const rowY = 20 + i * rowH;
    const midY = rowY + rowH / 2;

    if (i % 2 === 0) {
      const rowBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rowBg.setAttribute('x', 0); rowBg.setAttribute('y', rowY);
      rowBg.setAttribute('width', totalW); rowBg.setAttribute('height', rowH);
      rowBg.setAttribute('fill', '#f5f1ea');
      svg.appendChild(rowBg);
    }

    svg.appendChild(mkText(0, midY + 4, r.name, { fill: '#1a1a1a', size: 12 }));

    const trackX = labelW;
    const trackH = 14;
    const trackY = midY - trackH / 2;
    const track = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    track.setAttribute('x', trackX); track.setAttribute('y', trackY);
    track.setAttribute('width', barMaxW); track.setAttribute('height', trackH);
    track.setAttribute('fill', '#e8e0d8'); track.setAttribute('rx', '2');
    svg.appendChild(track);

    const bw = (r.desert_pop / maxPop) * barMaxW;
    const fill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    fill.setAttribute('x', trackX); fill.setAttribute('y', trackY);
    fill.setAttribute('width', bw); fill.setAttribute('height', trackH);
    fill.setAttribute('fill', r.desert_pop > 2000000 ? '#c0392b' : r.desert_pop > 500000 ? '#d4860a' : '#888');
    fill.setAttribute('rx', '2');
    svg.appendChild(fill);

    const numStr = r.desert_pop >= 1000000
      ? `${(r.desert_pop / 1000000).toFixed(2)}M`
      : `${Math.round(r.desert_pop / 1000)}k`;
    svg.appendChild(mkText(totalW, midY + 4, numStr, { fill: '#333', size: 11, weight: '600', anchor: 'end' }));
  });

  container.appendChild(svg);
}

function mkText(x, y, text, opts = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('x', x);
  el.setAttribute('y', y);
  if (opts.fill) el.setAttribute('fill', opts.fill);
  if (opts.size) el.setAttribute('font-size', opts.size);
  if (opts.weight) el.setAttribute('font-weight', opts.weight);
  if (opts.anchor) el.setAttribute('text-anchor', opts.anchor);
  if (opts.ls) el.setAttribute('letter-spacing', opts.ls);
  if (opts.style) el.setAttribute('font-style', opts.style);
  el.style.fontFamily = 'var(--sans, "Helvetica Neue", sans-serif)';
  el.textContent = text;
  return el;
}
