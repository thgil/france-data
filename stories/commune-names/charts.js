/* commune-names/charts.js
 *
 * Three charts:
 *  1. drawLengthHistogram(selector, lengthHist)   — name-length distribution
 *  2. drawDuplicatesChart(selector, duplicates)   — top duplicate names
 *  3. populateShortTable(selector, shortest)      — table of tiny communes
 */

const SANS = "'Helvetica Neue', Arial, sans-serif";
const SERIF = "Georgia, serif";
const GOLD = '#8b5c00';
const GOLD_LIGHT = '#d49a2b';
const MUTED = '#888';
const INK = '#1a1a1a';
const RULE = '#e0d8cc';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function setText(el, text) {
  el.textContent = text;
  return el;
}

/* ── 1. Name-length histogram ─────────────────────────────────────────────── */
export function drawLengthHistogram(selector, lengthHist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 700;
  const H = 220;
  const mt = 12, mr = 20, mb = 40, ml = 44;
  const cw = W - ml - mr;
  const ch = H - mt - mb;

  const data = lengthHist.filter(d => d.len <= 35); // trim extreme outliers visually
  const maxCount = Math.max(...data.map(d => d.count));
  const maxLen = Math.max(...data.map(d => d.len));
  const minLen = Math.min(...data.map(d => d.len));

  const xScale = (len) => ((len - minLen) / (maxLen - minLen)) * cw;
  const yScale = (count) => ch - (count / maxCount) * ch;
  const barW = Math.max(2, cw / (maxLen - minLen + 1) - 1);

  const svg = svgEl('svg', { width: W, height: H, 'aria-label': 'Commune name length distribution' });

  const g = svgEl('g', { transform: `translate(${ml},${mt})` });
  svg.appendChild(g);

  // Grid lines
  [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = ch * (1 - frac);
    const line = svgEl('line', { x1: 0, x2: cw, y1: y, y2: y, stroke: RULE, 'stroke-width': 1 });
    g.appendChild(line);
    if (frac > 0) {
      const label = svgEl('text', { x: -6, y: y + 4, 'text-anchor': 'end', fill: MUTED,
        'font-size': 10, 'font-family': SANS });
      setText(label, Math.round(maxCount * frac).toLocaleString('fr-FR'));
      g.appendChild(label);
    }
  });

  // Bars
  data.forEach(d => {
    const x = xScale(d.len);
    const y = yScale(d.count);
    const h = ch - y;
    const bar = svgEl('rect', {
      x: x - barW / 2,
      y: y,
      width: barW,
      height: h,
      fill: d.len === 7 || d.len === 8 ? GOLD : GOLD_LIGHT,
      opacity: 0.85,
    });
    bar.innerHTML = `<title>${d.len} chars: ${d.count.toLocaleString('fr-FR')} communes</title>`;
    g.appendChild(bar);
  });

  // X axis ticks: every 5 chars
  for (let l = 5; l <= 35; l += 5) {
    if (l < minLen || l > maxLen) continue;
    const x = xScale(l);
    const tick = svgEl('line', { x1: x, x2: x, y1: ch, y2: ch + 4, stroke: MUTED, 'stroke-width': 1 });
    g.appendChild(tick);
    const label = svgEl('text', { x: x, y: ch + 15, 'text-anchor': 'middle', fill: MUTED,
      'font-size': 10, 'font-family': SANS });
    setText(label, l);
    g.appendChild(label);
  }
  // X axis label
  const xLabel = svgEl('text', { x: cw / 2, y: ch + 32, 'text-anchor': 'middle', fill: MUTED,
    'font-size': 10, 'font-family': SANS });
  setText(xLabel, 'characters in commune name');
  g.appendChild(xLabel);

  // Highlight annotation for peak
  const peak = data.find(d => d.len === 7 || d.len === 8);
  if (peak) {
    const px = xScale(peak.len);
    const ann = svgEl('text', { x: px, y: yScale(peak.count) - 8, 'text-anchor': 'middle',
      fill: GOLD, 'font-size': 10, 'font-family': SANS, 'font-weight': '600' });
    setText(ann, `peak: ${peak.len} chars`);
    g.appendChild(ann);
  }

  container.appendChild(svg);
}

/* ── 2. Top duplicate names (horizontal bar chart) ───────────────────────── */
export function drawDuplicatesChart(selector, duplicates) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = duplicates.slice(0, 20);
  const W = container.clientWidth || 700;
  const rowH = 26;
  const H = items.length * rowH + 20;
  const ml = 170, mr = 50;
  const cw = W - ml - mr;
  const maxCount = items[0].count;

  const svg = svgEl('svg', { width: W, height: H });
  const g = svgEl('g', { transform: `translate(${ml},10)` });
  svg.appendChild(g);

  items.forEach((d, i) => {
    const y = i * rowH;
    const barLen = (d.count / maxCount) * cw;

    // Name label
    const label = svgEl('text', { x: -8, y: y + rowH * 0.62, 'text-anchor': 'end',
      fill: INK, 'font-size': 13, 'font-family': SERIF });
    setText(label, d.name);
    g.appendChild(label);

    // Bar background
    const bg = svgEl('rect', { x: 0, y: y + 4, width: cw, height: rowH - 8, fill: '#f5f0e8' });
    g.appendChild(bg);

    // Bar fill
    const bar = svgEl('rect', { x: 0, y: y + 4, width: barLen, height: rowH - 8,
      fill: i === 0 ? GOLD : GOLD_LIGHT, opacity: 0.9 });
    bar.innerHTML = `<title>${d.name}: appears in ${d.count} communes</title>`;
    g.appendChild(bar);

    // Count label
    const countLabel = svgEl('text', { x: barLen + 6, y: y + rowH * 0.62, 'text-anchor': 'start',
      fill: i === 0 ? GOLD : MUTED, 'font-size': 12, 'font-family': SANS, 'font-weight': i === 0 ? '700' : '400' });
    setText(countLabel, `×${d.count}`);
    g.appendChild(countLabel);
  });

  container.appendChild(svg);
}

/* ── 3. Shortest communes table ──────────────────────────────────────────── */
export function populateShortTable(selector, shortest) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;

  const DEPT_NAMES = {
    '80': 'Somme', '08': 'Ardennes', '25': 'Doubs', '28': 'Eure-et-Loir',
    '31': 'Haute-Garonne', '38': 'Isère', '61': 'Orne', '65': 'Hautes-Pyrénées',
    '66': 'Pyrénées-Orientales', '70': 'Haute-Saône', '76': 'Seine-Maritime',
    '95': 'Val-d\'Oise',
  };

  tbody.innerHTML = shortest.slice(0, 14).map((s, i) => {
    const deptName = DEPT_NAMES[s.dept] || `Dept. ${s.dept}`;
    const pop = s.pop ? s.pop.toLocaleString('fr-FR') : '—';
    return `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${s.name}</td>
      <td>${deptName}</td>
      <td>${pop}</td>
    </tr>`;
  }).join('');
}
