// stories/commune-names/charts.js
// Renders all interactive elements for the commune-names story.
// No external dependencies — pure SVG + DOM.

const ACCENT = '#b32020';
const BAR_COLOR = '#c0a882';
const BAR_HOVER = '#8c6a3c';

// ── Utilities ────────────────────────────────────────────────────────────────

function svg(tag, attrs, children = []) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (const child of children) {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else el.appendChild(child);
  }
  return el;
}

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') e.className = v;
    else if (k === 'textContent') e.textContent = v;
    else e.setAttribute(k, v);
  }
  for (const child of children) {
    if (typeof child === 'string') e.appendChild(document.createTextNode(child));
    else if (child) e.appendChild(child);
  }
  return e;
}

function fmt(n) { return n.toLocaleString('en-GB'); }

// ── Two-letter highlights ────────────────────────────────────────────────────

const TWO_LETTER = [
  { name: 'Eu',  dept: '76', pop: 6591, note: 'largest of the two-letter clubs' },
  { name: 'Gy',  dept: '70', pop: 1001, note: 'Haute-Saône' },
  { name: 'Bû',  dept: '28', pop: 2022, note: 'Eure-et-Loir' },
  { name: 'Oô',  dept: '31', pop: 103,  note: 'Haute-Garonne' },
  { name: 'Uz',  dept: '65', pop: 36,   note: 'smallest — Hautes-Pyrénées' },
];

function renderTwoLetterHighlights() {
  const container = document.getElementById('two-letter-highlights');
  if (!container) return;
  for (const c of TWO_LETTER) {
    const card = el('div', { className: 'highlight-card' }, [
      el('div', { className: 'h-val', textContent: c.name }),
      el('div', { className: 'h-label', textContent: `Dept ${c.dept} · pop ${fmt(c.pop)}` }),
    ]);
    container.appendChild(card);
  }
}

// ── Duplicate names table ────────────────────────────────────────────────────

const DEPT_NAMES = {
  '01':'Ain','02':'Aisne','03':'Allier','04':'Alpes-de-Haute-Provence',
  '05':'Hautes-Alpes','06':'Alpes-Maritimes','07':'Ardèche','08':'Ardennes',
  '09':'Ariège','10':'Aube','11':'Aude','12':'Aveyron',
  '13':'Bouches-du-Rhône','14':'Calvados','15':'Cantal','16':'Charente',
  '17':'Charente-Maritime','18':'Cher','19':'Corrèze','2A':'Corse-du-Sud',
  '2B':'Haute-Corse','21':'Côte-d\'Or','22':'Côtes-d\'Armor','23':'Creuse',
  '24':'Dordogne','25':'Doubs','26':'Drôme','27':'Eure',
  '28':'Eure-et-Loir','29':'Finistère','30':'Gard','31':'Haute-Garonne',
  '32':'Gers','33':'Gironde','34':'Hérault','35':'Ille-et-Vilaine',
  '36':'Indre','37':'Indre-et-Loire','38':'Isère','39':'Jura',
  '40':'Landes','41':'Loir-et-Cher','42':'Loire','43':'Haute-Loire',
  '44':'Loire-Atlantique','45':'Loiret','46':'Lot','47':'Lot-et-Garonne',
  '48':'Lozère','49':'Maine-et-Loire','50':'Manche','51':'Marne',
  '52':'Haute-Marne','53':'Mayenne','54':'Meurthe-et-Moselle','55':'Meuse',
  '56':'Morbihan','57':'Moselle','58':'Nièvre','59':'Nord',
  '60':'Oise','61':'Orne','62':'Pas-de-Calais','63':'Puy-de-Dôme',
  '64':'Pyrénées-Atlantiques','65':'Hautes-Pyrénées','66':'Pyrénées-Orientales',
  '67':'Bas-Rhin','68':'Haut-Rhin','69':'Rhône','70':'Haute-Saône',
  '71':'Saône-et-Loire','72':'Sarthe','73':'Savoie','74':'Haute-Savoie',
  '75':'Paris','76':'Seine-Maritime','77':'Seine-et-Marne','78':'Yvelines',
  '79':'Deux-Sèvres','80':'Somme','81':'Tarn','82':'Tarn-et-Garonne',
  '83':'Var','84':'Vaucluse','85':'Vendée','86':'Vienne',
  '87':'Haute-Vienne','88':'Vosges','89':'Yonne','90':'Territoire de Belfort',
  '91':'Essonne','92':'Hauts-de-Seine','93':'Seine-Saint-Denis',
  '94':'Val-de-Marne','95':'Val-d\'Oise',
  '971':'Guadeloupe','972':'Martinique','973':'Guyane','974':'La Réunion','976':'Mayotte',
};

function deptLabel(d) { return DEPT_NAMES[d] ? `${d} – ${DEPT_NAMES[d]}` : d; }

async function renderDupeTable(communes) {
  const tbody = document.querySelector('#dupe-table tbody');
  if (!tbody) return;

  // Build name → depts map
  const map = new Map();
  for (const c of communes) {
    if (!map.has(c.name)) map.set(c.name, []);
    map.get(c.name).push(c.dept);
  }

  const dupes = [...map.entries()]
    .filter(([, depts]) => depts.length >= 5)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);

  tbody.innerHTML = '';
  for (const [name, depts] of dupes) {
    const row = el('tr', {}, [
      el('td', { textContent: name }),
      el('td', { textContent: String(depts.length) }),
      el('td', { textContent: depts.sort().map(d => DEPT_NAMES[d] || d).join(', ') }),
    ]);
    tbody.appendChild(row);
  }
}

// ── First-word bar chart ─────────────────────────────────────────────────────

function renderFirstWordChart(communes) {
  const container = document.getElementById('first-word-chart');
  if (!container) return;

  // Count first words
  const counts = new Map();
  for (const c of communes) {
    const word = c.name.split(/[-\s']/)[0];
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  const data = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word, count]) => ({ word, count }));

  const W = 680, padL = 90, padR = 20, padT = 10, padB = 10;
  const barH = 26, gap = 6;
  const H = data.length * (barH + gap) + padT + padB;
  const maxVal = data[0].count;
  const chartW = W - padL - padR;

  const bars = data.map(({ word, count }, i) => {
    const y = padT + i * (barH + gap);
    const bw = Math.round((count / maxVal) * chartW);
    const isSaint = word === 'Saint';
    const fill = isSaint ? ACCENT : BAR_COLOR;
    return [
      svg('rect', { x: padL, y, width: bw, height: barH, fill, rx: 2 }),
      svg('text', {
        x: padL - 6, y: y + barH / 2 + 5,
        'text-anchor': 'end',
        'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
        'font-size': '13',
        fill: '#3a3a3a',
      }, [word]),
      svg('text', {
        x: padL + bw + 6, y: y + barH / 2 + 5,
        'text-anchor': 'start',
        'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
        'font-size': '12',
        fill: '#888',
      }, [fmt(count)]),
    ];
  }).flat();

  const chart = svg('svg', {
    width: W, height: H, viewBox: `0 0 ${W} ${H}`,
    style: 'font-size:13px',
  }, bars);

  container.appendChild(chart);
}

// ── Length distribution chart ────────────────────────────────────────────────

function renderLengthChart(communes) {
  const container = document.getElementById('length-chart');
  if (!container) return;

  // Build length bins
  const counts = new Map();
  for (const c of communes) {
    const l = c.name.length;
    counts.set(l, (counts.get(l) || 0) + 1);
  }
  const minLen = Math.min(...counts.keys());
  const maxLen = Math.max(...counts.keys());
  const data = [];
  for (let l = minLen; l <= maxLen; l++) {
    data.push({ len: l, count: counts.get(l) || 0 });
  }

  const W = 720, padL = 50, padR = 20, padT = 10, padB = 36;
  const H = 200;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxCount = Math.max(...data.map(d => d.count));
  const barW = innerW / data.length;

  const bars = data.map(({ len, count }, i) => {
    const x = padL + i * barW;
    const bh = Math.round((count / maxCount) * innerH);
    const y = padT + innerH - bh;
    const isShort = len <= 3;
    const fill = isShort ? ACCENT : BAR_COLOR;
    return svg('rect', {
      x: x + 1, y, width: Math.max(barW - 2, 1), height: bh,
      fill,
      'data-len': len, 'data-count': count,
    });
  });

  // X-axis ticks: every 5 characters
  const ticks = data
    .filter(d => d.len % 5 === 0)
    .map(({ len }, _) => {
      const i = len - minLen;
      const x = padL + (i + 0.5) * barW;
      return [
        svg('line', { x1: x, y1: padT + innerH, x2: x, y2: padT + innerH + 4, stroke: '#ccc', 'stroke-width': '1' }),
        svg('text', {
          x, y: padT + innerH + 16,
          'text-anchor': 'middle',
          'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
          'font-size': '11',
          fill: '#888',
        }, [String(len)]),
      ];
    }).flat();

  // Y-axis
  const yMax = maxCount;
  const yAxis = [
    svg('text', {
      x: padL - 6, y: padT + 5,
      'text-anchor': 'end',
      'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
      'font-size': '11', fill: '#888',
    }, [fmt(yMax)]),
    svg('text', {
      x: padL - 6, y: padT + innerH,
      'text-anchor': 'end',
      'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
      'font-size': '11', fill: '#888',
    }, ['0']),
    svg('text', {
      x: padL - 6, y: padT + innerH / 2 + 4,
      'text-anchor': 'end',
      'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
      'font-size': '11', fill: '#888',
    }, [fmt(Math.round(yMax / 2))]),
  ];

  // X-axis label
  const xLabel = svg('text', {
    x: W / 2, y: H - 2,
    'text-anchor': 'middle',
    'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif',
    'font-size': '11', fill: '#888',
  }, ['characters in commune name']);

  const chart = svg('svg', {
    width: W, height: H, viewBox: `0 0 ${W} ${H}`,
    style: 'cursor:default',
  }, [...bars, ...ticks, ...yAxis, xLabel]);

  // Tooltip on hover
  const tooltip = el('div', {
    style: 'position:fixed;display:none;background:#1a1a1a;color:#faf7f2;padding:6px 10px;border-radius:3px;font-family:sans-serif;font-size:12px;pointer-events:none;z-index:100',
  });
  document.body.appendChild(tooltip);

  chart.addEventListener('mousemove', (e) => {
    const rect = e.target.closest('rect[data-len]');
    if (rect) {
      tooltip.textContent = `${rect.dataset.len} chars: ${fmt(Number(rect.dataset.count))} communes`;
      tooltip.style.display = 'block';
      tooltip.style.left = e.clientX + 12 + 'px';
      tooltip.style.top = e.clientY - 28 + 'px';
    } else {
      tooltip.style.display = 'none';
    }
  });
  chart.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });

  container.appendChild(chart);
}

// ── Commune search ────────────────────────────────────────────────────────────

function renderSearch(communes) {
  const input = document.getElementById('commune-search');
  const results = document.getElementById('search-results');
  const hint = document.getElementById('search-hint');
  if (!input || !results) return;

  // Build a simple lowercase index
  const index = communes.map(c => ({
    ...c,
    _lower: c.name.toLowerCase(),
  }));

  function search(q) {
    if (!q || q.length < 1) {
      results.innerHTML = '';
      hint.textContent = 'Showing top results as you type.';
      return;
    }
    const ql = q.toLowerCase();
    const exact = index.filter(c => c._lower === ql);
    const starts = index.filter(c => c._lower.startsWith(ql) && c._lower !== ql);
    const contains = index.filter(c => c._lower.includes(ql) && !c._lower.startsWith(ql));
    const hits = [...exact, ...starts, ...contains].slice(0, 20);

    hint.textContent = hits.length === 0
      ? 'No commune found.'
      : `${hits.length === 20 ? '20+' : hits.length} result${hits.length === 1 ? '' : 's'}`;

    results.innerHTML = '';
    for (const c of hits) {
      const item = el('div', { className: 'search-result-item' }, [
        el('span', { className: 'r-name', textContent: c.name }),
        el('span', { className: 'r-meta', textContent: `Dept ${c.dept}${DEPT_NAMES[c.dept] ? ' – ' + DEPT_NAMES[c.dept] : ''} · ${fmt(c.pop)} pop.` }),
      ]);
      results.appendChild(item);
    }
  }

  input.addEventListener('input', () => search(input.value.trim()));
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  const resp = await fetch('./communes-index.json');
  const communes = await resp.json();

  renderTwoLetterHighlights();
  renderFirstWordChart(communes);
  renderLengthChart(communes);
  await renderDupeTable(communes);
  renderSearch(communes);
}

main();
