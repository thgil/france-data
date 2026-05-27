/**
 * commune-names/charts.js
 * SVG chart helpers for the commune-names story.
 * All charts are rendered from pre-computed stats.json.
 */

// ── Palette ─────────────────────────────────────────────────────────────────
const C = {
  ink:     '#1a1a1a',
  mute:    '#888888',
  rule:    '#d8d0c0',
  paper:   '#faf7f2',
  accent:  '#b32020',
  bar:     '#5a7fa8',
  barDim:  '#c8d8e8',
};

// ── Tiny SVG utility ─────────────────────────────────────────────────────────
function svg(tag, attrs = {}, children = []) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (const child of children) {
    if (typeof child === 'string') el.textContent = child;
    else el.appendChild(child);
  }
  return el;
}

function text(x, y, content, attrs = {}) {
  return svg('text', { x, y, ...attrs }, [content]);
}

function rect(x, y, w, h, attrs = {}) {
  return svg('rect', { x, y, width: w, height: h, ...attrs });
}

// ── Letter distribution chart ────────────────────────────────────────────────
export function drawLetterChart(mountId, stats) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const data = stats.letterDist; // [{letter, count}, ...]
  const maxCount = Math.max(...data.map(d => d.count));

  const W = 680, H = 220;
  const marginL = 28, marginR = 8, marginT = 12, marginB = 36;
  const plotW = W - marginL - marginR;
  const plotH = H - marginT - marginB;
  const barW = Math.floor(plotW / data.length) - 2;

  const root = svg('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:680px;display:block;margin:0 auto;',
    'aria-label': 'Bar chart: commune count by first letter',
    role: 'img',
  });

  const g = svg('g', { transform: `translate(${marginL},${marginT})` });
  root.appendChild(g);

  // Y-axis gridlines (4 lines)
  for (let i = 1; i <= 4; i++) {
    const y = plotH * (1 - i / 4);
    const label = Math.round(maxCount * i / 4).toLocaleString('fr-FR');
    g.appendChild(svg('line', {
      x1: 0, y1: y, x2: plotW, y2: y,
      stroke: C.rule, 'stroke-width': 1,
    }));
    g.appendChild(text(-4, y + 4, label, {
      'font-size': '9',
      fill: C.mute,
      'text-anchor': 'end',
      'font-family': 'Helvetica Neue, sans-serif',
    }));
  }

  // Bars
  data.forEach((d, i) => {
    const x = i * (plotW / data.length);
    const barH = (d.count / maxCount) * plotH;
    const y = plotH - barH;
    const isS = d.letter === 'S';
    g.appendChild(rect(x, y, barW, barH, {
      fill: isS ? C.accent : C.bar,
    }));

    // X-axis labels
    g.appendChild(text(x + barW / 2, plotH + 16, d.letter, {
      'font-size': '10',
      fill: isS ? C.accent : C.mute,
      'text-anchor': 'middle',
      'font-family': 'Helvetica Neue, sans-serif',
      'font-weight': isS ? '700' : '400',
    }));
  });

  // Bottom axis rule
  g.appendChild(svg('line', {
    x1: 0, y1: plotH, x2: plotW, y2: plotH,
    stroke: C.ink, 'stroke-width': 1,
  }));

  mount.appendChild(root);
}

// ── Saint patrons horizontal bar chart ──────────────────────────────────────
export function drawSaintsChart(mountId, stats) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const data = stats.topSaints.slice(0, 10); // top 10
  const maxCount = Math.max(...data.map(d => d.count));

  const W = 560, H = 260;
  const marginL = 100, marginR = 60, marginT = 8, marginB = 8;
  const plotW = W - marginL - marginR;
  const plotH = H - marginT - marginB;
  const rowH = plotH / data.length;
  const barH = Math.min(rowH - 6, 22);

  const root = svg('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:560px;display:block;margin:0 auto;',
    'aria-label': 'Horizontal bar chart: top saint patron names',
    role: 'img',
  });

  const g = svg('g', { transform: `translate(${marginL},${marginT})` });
  root.appendChild(g);

  data.forEach((d, i) => {
    const y = i * rowH + (rowH - barH) / 2;
    const barW = (d.count / maxCount) * plotW;
    const isFirst = i === 0;

    // Bar
    g.appendChild(rect(0, y, barW, barH, {
      fill: isFirst ? C.accent : C.bar,
    }));

    // Label (patron name, left)
    g.appendChild(text(-6, y + barH / 2 + 4, `Saint-${d.patron}`, {
      'font-size': '11',
      fill: C.ink,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
    }));

    // Count (right of bar)
    g.appendChild(text(barW + 5, y + barH / 2 + 4, d.count.toString(), {
      'font-size': '11',
      fill: isFirst ? C.accent : C.mute,
      'text-anchor': 'start',
      'font-family': 'Helvetica Neue, sans-serif',
      'font-weight': isFirst ? '700' : '400',
    }));
  });

  mount.appendChild(root);
}

// ── Duplicate names table ────────────────────────────────────────────────────
export function populateDuplicatesTable(tbodyId, stats) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const rows = stats.mostDuplicated.slice(0, 12).map((d, i) => {
    const pct = ((d.count / stats.total) * 100).toFixed(3);
    return `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${d.name}</td>
      <td>${d.count}</td>
    </tr>`;
  });
  tbody.innerHTML = rows.join('');
}

// ── Shortest names table ─────────────────────────────────────────────────────
export function populateShortestTable(tbodyId, stats) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const rows = stats.shortest14.map(d => `<tr>
    <td class="name-cell">${d.name}</td>
    <td class="len-cell">${d.name.length}</td>
    <td class="dept-cell">Dept. ${d.dept}</td>
    <td class="pop-cell">${d.pop.toLocaleString('fr-FR')}</td>
  </tr>`);
  tbody.innerHTML = rows.join('');
}

// ── Longest names table ──────────────────────────────────────────────────────
export function populateLongestTable(tbodyId, stats) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const rows = stats.longest10.slice(0, 8).map((d, i) => `<tr>
    <td class="rank">${i + 1}</td>
    <td class="place long-name">${d.name}</td>
    <td>${d.name.length}</td>
  </tr>`);
  tbody.innerHTML = rows.join('');
}

// ── Prepositions table ───────────────────────────────────────────────────────
export function populatePrepTable(tbodyId, stats) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const rows = stats.prepositions.map(d => `<tr>
    <td class="place">${d.prep}</td>
    <td>${d.meaning}</td>
    <td>${d.count.toLocaleString('fr-FR')}</td>
  </tr>`);
  tbody.innerHTML = rows.join('');
}
