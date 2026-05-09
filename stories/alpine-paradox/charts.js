/* charts.js — alpine-paradox: 97 département APL league table */

export function drawLeagueTable(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const depts = [...stats.departments].sort((a, b) => b.avg_apl - a.avg_apl);
  const national = stats.national_avg_apl;

  const rowH = 26;
  const labelW = 190;
  const barMaxW = 340;
  const pctW = 70;
  const totalW = labelW + barMaxW + pctW + 16;
  const headerH = 48;
  const totalH = headerH + depts.length * rowH + 20;
  const MAX_APL = 5.5;

  function barColor(apl) {
    if (apl >= 4.0) return '#2a7a4f';
    if (apl >= 3.0) return '#5aaa72';
    if (apl >= 2.5) return '#d4860a';
    return '#c0392b';
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs = {}, text) {
    const e = document.createElementNS(svgNS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text !== undefined) e.textContent = text;
    return e;
  }

  const svg = el('svg', {
    viewBox: `0 0 ${totalW} ${totalH}`,
    width: '100%',
    style: 'font-family:var(--sans,"Helvetica Neue",sans-serif);font-size:12px;overflow:visible'
  });

  // Background
  svg.appendChild(el('rect', { width: totalW, height: totalH, fill: '#faf7f2' }));

  // Column headers
  const hY = 28;
  const headers = [
    { x: 0, text: 'Département', anchor: 'start', size: '10', weight: '600', ls: '0.8', fill: '#888' },
    { x: labelW + barMaxW / 2, text: 'Population-weighted APL ▸', anchor: 'middle', size: '10', weight: '600', ls: '0.5', fill: '#888' },
    { x: totalW, text: '% in desert', anchor: 'end', size: '10', weight: '600', ls: '0.5', fill: '#888' },
  ];
  for (const h of headers) {
    svg.appendChild(el('text', {
      x: h.x, y: hY, fill: h.fill,
      'font-size': h.size, 'font-weight': h.weight,
      'text-anchor': h.anchor || 'start',
      'letter-spacing': h.ls || '0',
      'text-transform': 'uppercase'
    }, h.text));
  }
  // Header underline
  svg.appendChild(el('line', { x1: 0, y1: hY + 8, x2: totalW, y2: hY + 8, stroke: '#d8d0c0', 'stroke-width': '1' }));

  // Desert threshold line position
  const threshX = labelW + (2.5 / MAX_APL) * barMaxW;
  const natX = labelW + (national / MAX_APL) * barMaxW;

  // National avg line
  svg.appendChild(el('line', {
    x1: natX, y1: hY + 10, x2: natX, y2: totalH - 10,
    stroke: '#9b9b9b', 'stroke-width': '1', 'stroke-dasharray': '3,3'
  }));

  // Each row
  for (let i = 0; i < depts.length; i++) {
    const d = depts[i];
    const y = headerH + i * rowH;
    const midY = y + rowH / 2 + 4;
    const barW = (d.avg_apl / MAX_APL) * barMaxW;
    const bgColor = d.idf ? '#fff3f3' : (i % 2 === 0 ? '#faf7f2' : '#f5f1ea');

    // Row background
    svg.appendChild(el('rect', { x: 0, y, width: totalW, height: rowH, fill: bgColor }));

    // Rank number
    svg.appendChild(el('text', {
      x: 0, y: midY, fill: '#ccc', 'font-size': '9', 'text-anchor': 'start'
    }, String(i + 1)));

    // Dept name
    const nameColor = d.idf ? '#8b1a1a' : (d.dept === '05' ? '#1a4a8b' : '#1a1a1a');
    const nameWeight = (d.idf || d.dept === '05') ? '700' : '400';
    svg.appendChild(el('text', {
      x: 22, y: midY,
      fill: nameColor, 'font-size': '11', 'font-weight': nameWeight,
      'text-anchor': 'start'
    }, d.name));

    // Bar track
    svg.appendChild(el('rect', {
      x: labelW, y: y + 6, width: barMaxW, height: rowH - 12,
      fill: '#e8e0d8', rx: '2'
    }));

    // Value bar
    svg.appendChild(el('rect', {
      x: labelW, y: y + 6, width: barW, height: rowH - 12,
      fill: barColor(d.avg_apl), rx: '2', opacity: d.idf ? '0.9' : '0.85'
    }));

    // APL value text
    svg.appendChild(el('text', {
      x: labelW + barW + 4, y: midY,
      fill: '#333', 'font-size': '10', 'font-weight': '600', 'text-anchor': 'start'
    }, d.avg_apl.toFixed(2)));

    // Desert pct
    const pctColor = d.desert_pct >= 40 ? '#c0392b' : (d.desert_pct >= 20 ? '#d4860a' : '#555');
    svg.appendChild(el('text', {
      x: totalW, y: midY,
      fill: pctColor, 'font-size': '10', 'text-anchor': 'end'
    }, d.desert_pct.toFixed(0) + '%'));
  }

  // Desert threshold line on top of bars
  svg.appendChild(el('line', {
    x1: threshX, y1: hY + 10, x2: threshX, y2: totalH - 10,
    stroke: '#c0392b', 'stroke-width': '1', 'stroke-dasharray': '2,3', opacity: '0.6'
  }));
  svg.appendChild(el('text', {
    x: threshX, y: hY - 2,
    fill: '#c0392b', 'font-size': '8', 'text-anchor': 'middle', 'letter-spacing': '0.3'
  }, 'DESERT ←'));

  // National avg label
  svg.appendChild(el('text', {
    x: natX, y: hY - 2,
    fill: '#666', 'font-size': '8', 'text-anchor': 'middle', 'letter-spacing': '0.3'
  }, '▼ national avg'));

  container.appendChild(svg);
}
