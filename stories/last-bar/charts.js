/* charts.js — last-bar story: scatter plot of bars/10k vs APL by département */

const LABELED = new Set(['18', '75', '95', '91', '77', '67', '2B', '05', '29', '59', '33', '78', '48', '15']);

export function drawScatter(selector, departments) {
  const svg = document.querySelector(selector);
  if (!svg) return;

  const VW = 700, VH = 440;
  const M = { top: 20, right: 120, bottom: 56, left: 56 };
  const W = VW - M.left - M.right;
  const H = VH - M.top - M.bottom;

  // Scales
  const xMax = Math.ceil(Math.max(...departments.map(d => d.barsP10k)) / 2) * 2 + 1;
  const xMin = 0;
  const yMin = 1.8;
  const yMax = 5.5;

  function xScale(v) { return M.left + (v - xMin) / (xMax - xMin) * W; }
  function yScale(v) { return M.top + H - (v - yMin) / (yMax - yMin) * H; }

  // Color by desert %
  function desertColor(pct) {
    if (pct >= 40) return '#c0392b';
    if (pct >= 20) return '#e67e22';
    if (pct >= 10) return '#f39c12';
    return '#27ae60';
  }

  // Radius by population (sqrt scale)
  const maxPop = Math.max(...departments.map(d => d.pop));
  function radius(pop) {
    return 3 + Math.sqrt(pop / maxPop) * 12;
  }

  let el = '';

  // Background zones
  el += `<rect x="${M.left}" y="${M.top}" width="${W}" height="${H}" fill="#f9f6f0" stroke="#e0d8cc"/>`;

  // Desert threshold line (APL = 2.5)
  const y25 = yScale(2.5);
  if (y25 >= M.top && y25 <= M.top + H) {
    el += `<line x1="${M.left}" y1="${y25}" x2="${M.left + W}" y2="${y25}"
      stroke="#c0392b" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>`;
    el += `<text x="${M.left + W + 4}" y="${y25 + 4}" font-size="9"
      font-family="'Helvetica Neue', sans-serif" fill="#c0392b" opacity="0.8">APL 2.5</text>`;
  }

  // Average lines
  const xAvg = departments.reduce((s, d) => s + d.barsP10k * d.pop, 0) / departments.reduce((s, d) => s + d.pop, 0);
  const yAvg = departments.reduce((s, d) => s + d.apl * d.pop, 0) / departments.reduce((s, d) => s + d.pop, 0);
  const xAvgPx = xScale(xAvg);
  const yAvgPx = yScale(yAvg);

  el += `<line x1="${xAvgPx}" y1="${M.top}" x2="${xAvgPx}" y2="${M.top + H}"
    stroke="#aaa" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>`;
  el += `<line x1="${M.left}" y1="${yAvgPx}" x2="${M.left + W}" y2="${yAvgPx}"
    stroke="#aaa" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>`;

  // Dots (two passes: unlabeled then labeled on top)
  const unlabeled = departments.filter(d => !LABELED.has(d.dept));
  const labeled = departments.filter(d => LABELED.has(d.dept));

  function dot(d) {
    const cx = xScale(d.barsP10k);
    const cy = yScale(Math.max(yMin, Math.min(yMax, d.apl)));
    const r = radius(d.pop);
    const col = desertColor(d.desertPct);
    const title = `${d.name} (${d.dept})\n${d.barsP10k.toFixed(1)} bars/10k · APL ${d.apl.toFixed(2)} · ${d.desertPct.toFixed(0)}% desert`;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" fill-opacity="0.72"
      stroke="white" stroke-width="0.8"><title>${title}</title></circle>`;
  }

  unlabeled.forEach(d => { el += dot(d); });
  labeled.forEach(d => { el += dot(d); });

  // Labels for notable departments
  function labelOffset(dept) {
    const offsets = {
      '75': [6, -8],   // Paris — right/up
      '18': [6, 4],    // Cher — right
      '95': [-6, 12],  // Val-d'Oise — left/down
      '91': [6, 12],   // Essonne — right/down
      '77': [6, -10],  // Seine-et-Marne — right/up
      '67': [-8, -10], // Bas-Rhin — left/up
      '2B': [6, 0],    // Haute-Corse — right
      '05': [6, -6],   // Hautes-Alpes — right/up
      '29': [-6, 12],  // Finistère — left/down
      '59': [6, 4],    // Nord — right
      '33': [-8, 12],  // Gironde — left/down
      '78': [-8, 4],   // Yvelines — left
      '48': [6, -8],   // Lozère — right/up
      '15': [6, 4],    // Cantal — right
    };
    return offsets[dept] || [6, 0];
  }

  labeled.forEach(d => {
    const cx = xScale(d.barsP10k);
    const cy = yScale(Math.max(yMin, Math.min(yMax, d.apl)));
    const [dx, dy] = labelOffset(d.dept);
    const anchor = dx < 0 ? 'end' : 'start';
    const shortName = d.name.length > 14 ? d.name.slice(0, 13) + '…' : d.name;
    el += `<text x="${cx + dx}" y="${cy + dy}" font-size="10"
      font-family="'Helvetica Neue', sans-serif" fill="#222" text-anchor="${anchor}"
      font-weight="600">${shortName}</text>`;
  });

  // X axis
  const xTicks = [0, 5, 10, 15, 20];
  xTicks.forEach(t => {
    const px = xScale(t);
    el += `<line x1="${px}" y1="${M.top + H}" x2="${px}" y2="${M.top + H + 4}" stroke="#aaa"/>`;
    el += `<text x="${px}" y="${M.top + H + 16}" text-anchor="middle" font-size="11"
      font-family="'Helvetica Neue', sans-serif" fill="#666">${t}</text>`;
  });
  el += `<text x="${M.left + W / 2}" y="${VH - 4}" text-anchor="middle" font-size="11"
    font-family="'Helvetica Neue', sans-serif" fill="#555">Bars per 10,000 residents</text>`;

  // Y axis
  const yTicks = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5];
  yTicks.forEach(t => {
    const py = yScale(t);
    if (py < M.top || py > M.top + H) return;
    el += `<line x1="${M.left - 4}" y1="${py}" x2="${M.left}" y2="${py}" stroke="#aaa"/>`;
    el += `<text x="${M.left - 8}" y="${py + 4}" text-anchor="end" font-size="11"
      font-family="'Helvetica Neue', sans-serif" fill="#666">${t.toFixed(1)}</text>`;
  });
  el += `<text x="${14}" y="${M.top + H / 2}" text-anchor="middle" font-size="11"
    font-family="'Helvetica Neue', sans-serif" fill="#555"
    transform="rotate(-90, 14, ${M.top + H / 2})">APL score (medical access)</text>`;

  // Legend
  const lgX = M.left + W + 8;
  const lgY = M.top + 10;
  const items = [
    { col: '#27ae60', label: '< 10% desert' },
    { col: '#f39c12', label: '10–20% desert' },
    { col: '#e67e22', label: '20–40% desert' },
    { col: '#c0392b', label: '> 40% desert' },
  ];
  el += `<text x="${lgX}" y="${lgY}" font-size="9" font-family="'Helvetica Neue', sans-serif"
    fill="#888" font-weight="700" letter-spacing="0.8">DESERT %</text>`;
  items.forEach((it, i) => {
    const iy = lgY + 14 + i * 18;
    el += `<circle cx="${lgX + 5}" cy="${iy}" r="5" fill="${it.col}" fill-opacity="0.75" stroke="white" stroke-width="0.8"/>`;
    el += `<text x="${lgX + 14}" y="${iy + 4}" font-size="10"
      font-family="'Helvetica Neue', sans-serif" fill="#444">${it.label}</text>`;
  });

  // Size legend
  const szY = lgY + 100;
  el += `<text x="${lgX}" y="${szY}" font-size="9" font-family="'Helvetica Neue', sans-serif"
    fill="#888" font-weight="700" letter-spacing="0.8">POPULATION</text>`;
  [[500000, '0.5M'], [2000000, '2M']].forEach(([pop, label], i) => {
    const r = radius(pop);
    const sy = szY + 18 + i * 26;
    el += `<circle cx="${lgX + 7}" cy="${sy}" r="${r}" fill="#999" fill-opacity="0.35" stroke="#999" stroke-width="0.8"/>`;
    el += `<text x="${lgX + 18}" y="${sy + 4}" font-size="10"
      font-family="'Helvetica Neue', sans-serif" fill="#555">${label}</text>`;
  });

  svg.innerHTML = el;
}
