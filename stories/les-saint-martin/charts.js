/* ── Les Saint-Martin — charts ──────────────────────────────────────── */

const SAINTS = [
  { name: 'Saint-Martin',  count: 202 },
  { name: 'Saint-Jean',    count: 155 },
  { name: 'Saint-Pierre',  count: 144 },
  { name: 'Saint-Germain', count: 108 },
  { name: 'Saint-Julien',  count: 78  },
  { name: 'Saint-Laurent', count: 77  },
  { name: 'Saint-Hilaire', count: 68  },
  { name: 'Saint-Georges', count: 67  },
  { name: 'Saint-Étienne', count: 65  },
  { name: 'Saint-André',   count: 64  },
  { name: 'Saint-Aubin',   count: 62  },
  { name: 'Saint-Paul',    count: 54  },
];

const LENGTH_DIST = [
  1,13,154,720,1969,3223,3695,3695,3000,2522,
  1884,1435,1167,1018,1095,1177,1186,1202,1117,1028,
  923,819,649,501,329,200,105,55,53,29,
  12,8,2,6,7,2,3,3,1,3,
  1,0,1,0,1,
];

const PREPS = [
  { label: '-sur-',  count: 1991, tip: 'alongside a river or feature' },
  { label: '-lès-',  count: 1033, tip: '"near" — next to a larger place' },
  { label: '-de-',   count: 1145, tip: 'of / belonging to' },
  { label: '-en-',   count: 974,  tip: 'inside a territory or pays' },
  { label: '-le/-la',count: 1476, tip: 'article (le/la combined)' },
  { label: '-sous-', count: 257,  tip: '"under" — usually a hillside' },
];

const SHORT_NAMES = [
  { name: 'Y',  pop: 89,   dept: 'Somme (80)' },
  { name: 'By', pop: 86,   dept: 'Doubs (25)' },
  { name: 'Bû', pop: 2022, dept: 'Eure-et-Loir (28)' },
  { name: 'Eu', pop: 6591, dept: 'Seine-Maritime (76)' },
  { name: 'Gy', pop: 1001, dept: 'Haute-Saône (70)' },
  { name: 'Oz', pop: 213,  dept: 'Isère (38)' },
  { name: 'Oô', pop: 103,  dept: 'Haute-Garonne (31)' },
  { name: 'Py', pop: 79,   dept: 'Pyrénées-Orientales (66)' },
  { name: 'Ri', pop: 156,  dept: 'Orne (61)' },
  { name: 'Ry', pop: 775,  dept: 'Seine-Maritime (76)' },
  { name: 'Sy', pop: 54,   dept: 'Ardennes (08)' },
  { name: 'Ur', pop: 348,  dept: 'Pyrénées-Orientales (66)' },
  { name: 'Us', pop: 1338, dept: 'Val-d\'Oise (95)' },
  { name: 'Uz', pop: 36,   dept: 'Hautes-Pyrénées (65)' },
];

const LONG_NAMES = [
  { name: 'Saint-Remy-en-Bouzemont-Saint-Genest-et-Isson',   len: 45, pop: 491,  dept: 'Marne (51)' },
  { name: 'Beaujeu-Saint-Vallier-Pierrejux-et-Quitteur',      len: 43, pop: 923,  dept: 'Haute-Saône (70)' },
  { name: 'Saint-Martin-de-Bienfaite-la-Cressonnière',        len: 41, pop: 499,  dept: 'Calvados (14)' },
  { name: 'Roche-sur-Linotte-et-Sorans-les-Cordiers',         len: 40, pop: 64,   dept: 'Haute-Saône (70)' },
  { name: 'Montigny-Mornay-Villeneuve-sur-Vingeanne',          len: 40, pop: 381,  dept: 'Côte-d\'Or (21)' },
];

/* ── SVG helpers ─────────────────────────────────────────────────────── */

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(parent, x, y, text, attrs = {}) {
  const el = svgEl('text', { x, y, ...attrs });
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

/* ── Saints horizontal bar chart ─────────────────────────────────────── */

function drawSaintsChart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const barH = 26;
  const labelW = 120;
  const countW = 40;
  const maxBarW = 260;
  const gap = 6;
  const marginTop = 8;
  const maxCount = SAINTS[0].count;
  const totalH = marginTop + SAINTS.length * (barH + gap);
  const totalW = labelW + maxBarW + countW + 16;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${totalW} ${totalH}`,
    width: '100%',
    style: 'max-width:480px;display:block;overflow:visible',
  });

  SAINTS.forEach((d, i) => {
    const y = marginTop + i * (barH + gap);
    const bw = (d.count / maxCount) * maxBarW;

    const rect = svgEl('rect', {
      x: labelW,
      y,
      width: Math.max(bw, 1),
      height: barH,
      fill: '#b32020',
      opacity: i === 0 ? '1' : '0.62',
    });
    svg.appendChild(rect);

    svgText(svg, labelW - 8, y + barH / 2 + 5, d.name, {
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': '13',
      'fill': '#1a1a1a',
    });

    svgText(svg, labelW + bw + 8, y + barH / 2 + 5, d.count.toString(), {
      'text-anchor': 'start',
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '12',
      'fill': '#555',
    });
  });

  container.appendChild(svg);
}

/* ── Name length histogram ────────────────────────────────────────────── */

function drawLengthHistogram(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const marginL = 36;
  const marginB = 28;
  const marginT = 12;
  const marginR = 16;
  const chartW = 560;
  const chartH = 140;
  const totalW = chartW + marginL + marginR;
  const totalH = chartH + marginT + marginB;

  const maxCount = Math.max(...LENGTH_DIST);
  const barW = chartW / LENGTH_DIST.length;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${totalW} ${totalH}`,
    width: '100%',
    style: 'max-width:600px;display:block',
  });

  /* axis line */
  const axisLine = svgEl('line', {
    x1: marginL, y1: marginT + chartH,
    x2: marginL + chartW, y2: marginT + chartH,
    stroke: '#ccc', 'stroke-width': '1',
  });
  svg.appendChild(axisLine);

  /* y-axis ticks */
  [1000, 2000, 3000].forEach(v => {
    const y = marginT + chartH - (v / maxCount) * chartH;
    const tick = svgEl('line', {
      x1: marginL - 4, y1: y, x2: marginL + chartW, y2: y,
      stroke: '#e8e0d4', 'stroke-width': '1',
    });
    svg.appendChild(tick);
    svgText(svg, marginL - 6, y + 4, `${v / 1000}k`, {
      'text-anchor': 'end',
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '10',
      'fill': '#999',
    });
  });

  /* bars */
  LENGTH_DIST.forEach((count, i) => {
    const len = i + 1;
    const bh = (count / maxCount) * chartH;
    const x = marginL + i * barW;
    const y = marginT + chartH - bh;

    let fill = '#b32020';
    let opacity = '0.55';
    if (len === 1) { fill = '#1a1a1a'; opacity = '1'; }
    else if (len <= 2) { fill = '#b32020'; opacity = '0.9'; }
    else if (len >= 38) { fill = '#555'; opacity = '0.85'; }

    const rect = svgEl('rect', {
      x: x + 0.5,
      y,
      width: Math.max(barW - 1, 0.5),
      height: Math.max(bh, 0.5),
      fill,
      opacity,
    });
    svg.appendChild(rect);
  });

  /* x-axis labels at selected lengths */
  [1, 5, 10, 15, 20, 25, 30, 35, 40, 45].forEach(len => {
    const x = marginL + (len - 1) * barW + barW / 2;
    svgText(svg, x, marginT + chartH + 16, `${len}`, {
      'text-anchor': 'middle',
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '10',
      'fill': '#888',
    });
  });

  container.appendChild(svg);
}

/* ── Short names table ───────────────────────────────────────────────── */

function drawShortTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const rows = SHORT_NAMES.map((d, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="place" style="font-size:15px;font-weight:700">${d.name}</td>
      <td style="font-size:12px;color:#666">${d.dept}</td>
      <td style="text-align:right">${d.pop.toLocaleString('fr-FR')}</td>
    </tr>
  `).join('');

  container.innerHTML = `<table class="stats-table" style="width:100%"><tbody>${rows}</tbody></table>`;
}

/* ── Long names table ────────────────────────────────────────────────── */

function drawLongTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const rows = LONG_NAMES.map((d, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="place" style="font-size:12px;line-height:1.35">${d.name}</td>
      <td style="text-align:right;white-space:nowrap;font-size:12px;color:#666;padding-left:8px">${d.len} chars</td>
    </tr>
  `).join('');

  container.innerHTML = `<table class="stats-table" style="width:100%"><tbody>${rows}</tbody></table>`;
}

/* ── Entry point ─────────────────────────────────────────────────────── */

export function drawCharts() {
  drawSaintsChart('chart-saints');
  drawLengthHistogram('chart-lengths');
  drawShortTable('table-short');
  drawLongTable('table-long');
}
