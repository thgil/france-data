// commune-names/charts.js

// Pre-computed stats (derived from communes-apl.geojson, 35,014 communes)
const STATS = {
  total: 35014,
  uniqueNames: 32764,
  minLength: 1,
  maxLength: 45,
  avgLength: 11.8,
  hyphenated: 13410,
  saintTotal: 3898,
  // communes sharing a name with at least one other
  collisionCommunes: 2250,
  collisionGroups: 1450,

  top15: [
    { name: 'Sainte-Colombe', count: 12 },
    { name: 'Saint-Sauveur',  count: 11 },
    { name: 'Saint-Aubin',    count: 10 },
    { name: 'Beaulieu',       count: 10 },
    { name: 'Saint-Marcel',   count:  9 },
    { name: 'Saint-Michel',   count:  9 },
    { name: 'Le Pin',         count:  9 },
    { name: 'Saint-Pierre',   count:  9 },
    { name: 'Sainte-Marie',   count:  9 },
    { name: 'Saint-Rémy',     count:  8 },
    { name: 'Saint-Clément',  count:  8 },
    { name: 'Saint-Hilaire',  count:  8 },
    { name: 'Saint-Loup',     count:  8 },
    { name: 'Beaumont',       count:  8 },
    { name: 'Verrières',      count:  8 },
  ],

  // Length distribution: [chars, count], chars 1..45
  lengthDist: [
    [1,1],[2,13],[3,154],[4,720],[5,1969],[6,3223],[7,3695],[8,3695],
    [9,3000],[10,2522],[11,1884],[12,1435],[13,1167],[14,1018],[15,1095],
    [16,1177],[17,1186],[18,1202],[19,1117],[20,1028],[21,923],[22,819],
    [23,649],[24,501],[25,329],[26,200],[27,105],[28,55],[29,53],[30,29],
    [31,12],[32,8],[33,2],[34,6],[35,7],[36,2],[37,3],[38,3],[39,1],
    [40,3],[41,1],[42,0],[43,1],[44,0],[45,1],
  ],
};

// ── Colour palette ─────────────────────────────────────────────────────────
const C = {
  primary:   '#b32020',
  bar:       '#c67c00',
  barLight:  '#e8c97a',
  muted:     '#888',
  rule:      '#e0d8cc',
  text:      '#1a1a1a',
  sans:      "'Helvetica Neue', Helvetica, Arial, sans-serif",
  serif:     "Georgia, 'Times New Roman', serif",
};

// ── Shared SVG helpers ─────────────────────────────────────────────────────
function makeSVG(el, w, h) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  el.appendChild(svg);
  return svg;
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(svg, x, y, content, attrs = {}) {
  const t = svgEl('text', { x, y, ...attrs });
  t.textContent = content;
  svg.appendChild(t);
  return t;
}

// ── Chart 1: Name length histogram ────────────────────────────────────────
export function drawLengthHistogram(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = 680, H = 220;
  const pad = { top: 16, right: 12, bottom: 36, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const svg = makeSVG(container, W, H);

  const dist = STATS.lengthDist;
  const maxCount = Math.max(...dist.map(d => d[1]));
  const barCount = dist.length; // 45 bars
  const bw = chartW / barCount;

  // gridlines
  const gridVals = [1000, 2000, 3000];
  for (const gv of gridVals) {
    const gy = pad.top + chartH - (gv / maxCount) * chartH;
    svg.appendChild(svgEl('line', {
      x1: pad.left, y1: gy,
      x2: pad.left + chartW, y2: gy,
      stroke: C.rule, 'stroke-width': 1,
    }));
    svgText(svg, pad.left - 4, gy + 4, gv.toLocaleString('fr-FR'), {
      'text-anchor': 'end',
      'font-size': 10,
      fill: C.muted,
      'font-family': C.sans,
    });
  }

  // bars
  for (const [chars, count] of dist) {
    const i = chars - 1;
    const bh = (count / maxCount) * chartH;
    const x = pad.left + i * bw;
    const y = pad.top + chartH - bh;
    const fill = chars === 1 ? C.primary :
                 chars === 45 ? C.primary :
                 chars <= 3 ? C.barLight : C.bar;

    const rect = svgEl('rect', {
      x: x + 1, y, width: Math.max(bw - 2, 1), height: Math.max(bh, 1),
      fill, opacity: 0.9,
    });

    // tooltip
    rect.setAttribute('data-chars', chars);
    rect.setAttribute('data-count', count);
    rect.style.cursor = 'default';
    svg.appendChild(rect);
  }

  // x-axis labels at every 5
  for (let chars = 5; chars <= 45; chars += 5) {
    const i = chars - 1;
    const x = pad.left + i * bw + bw / 2;
    svgText(svg, x, H - 4, chars, {
      'text-anchor': 'middle',
      'font-size': 10,
      fill: C.muted,
      'font-family': C.sans,
    });
  }
  // axis label
  svgText(svg, pad.left + chartW / 2, H, 'characters in commune name', {
    'text-anchor': 'middle',
    'font-size': 10,
    fill: C.muted,
    'font-family': C.sans,
  });

  // annotate the outliers
  // Y (1 char) — bar 0
  const yBar = dist[0];
  const yX = pad.left + 0 * bw + bw / 2;
  const yY = pad.top + chartH - (yBar[1] / maxCount) * chartH;
  svgText(svg, yX + 16, yY - 4, '"Y"', {
    'font-size': 10, fill: C.primary,
    'font-family': C.serif, 'font-style': 'italic',
  });

  // longest (45 chars)
  const longBar = dist[44];
  const longX = pad.left + 44 * bw + bw / 2;
  const longY = pad.top + chartH - (longBar[1] / maxCount) * chartH;
  svgText(svg, longX - 4, longY - 6, '45 chars', {
    'font-size': 10, fill: C.primary, 'text-anchor': 'end',
    'font-family': C.sans,
  });
}

// ── Chart 2: Top-15 names horizontal bar ─────────────────────────────────
export function drawTopNames(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const names = STATS.top15;
  const W = 680;
  const rowH = 26;
  const pad = { top: 8, right: 60, bottom: 8, left: 160 };
  const H = pad.top + names.length * rowH + pad.bottom;
  const chartW = W - pad.left - pad.right;
  const maxCount = names[0].count;

  const svg = makeSVG(container, W, H);

  for (let i = 0; i < names.length; i++) {
    const { name, count } = names[i];
    const y = pad.top + i * rowH;
    const bw = (count / maxCount) * chartW;

    // label
    svgText(svg, pad.left - 8, y + rowH / 2 + 4, name, {
      'text-anchor': 'end',
      'font-size': 12,
      fill: i === 0 ? C.primary : C.text,
      'font-family': C.serif,
      'font-style': i === 0 ? 'normal' : 'normal',
      'font-weight': i === 0 ? 700 : 400,
    });

    // bar
    svg.appendChild(svgEl('rect', {
      x: pad.left, y: y + 4,
      width: Math.max(bw, 2), height: rowH - 8,
      fill: i === 0 ? C.primary : C.bar,
      opacity: i === 0 ? 1 : 0.75,
      rx: 2,
    }));

    // count
    svgText(svg, pad.left + bw + 6, y + rowH / 2 + 4, count + '×', {
      'font-size': 11,
      fill: C.muted,
      'font-family': C.sans,
    });
  }
}

// ── Stat cards ──────────────────────────────────────────────────────────────
export function renderStatCards(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const cards = [
    { value: '1',    label: 'shortest name', sub: '"Y", in the Somme' },
    { value: '45',   label: 'characters in the longest name', sub: 'Saint-Remy-en-Bouzemont-Saint-Genest-et-Isson' },
    { value: '4,195', label: 'communes begin with Saint or Sainte', sub: 'one in eight of all French communes' },
    { value: '12',   label: 'different communes named Sainte-Colombe', sub: 'spread across 12 départements' },
    { value: '2,250', label: 'communes share their name with another', sub: 'in 1,450 collision groups' },
    { value: '38%',  label: 'of commune names contain a hyphen', sub: '13,410 hyphenated communes' },
  ];

  container.innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${c.label}</div>
      <div class="stat-sub">${c.sub}</div>
    </div>
  `).join('');
}
