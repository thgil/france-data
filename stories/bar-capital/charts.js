// stories/bar-capital/charts.js
// SVG horizontal bar charts for per-capita bar density story.

const CAT_COLORS = {
  alpine:   '#3a7bd5',
  pyrenees: '#2d9e6e',
  bretagne: '#c67c00',
  other:    '#888888',
};

const CAT_LABELS = {
  alpine:   'Alps ski resort',
  pyrenees: 'Pyrénées',
  bretagne: 'Bretagne',
  other:    'Other',
};

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function formatNum(n) {
  return n.toLocaleString('fr-FR');
}

export function drawRankingChart(selector, rows) {
  const container = document.querySelector(selector);
  if (!container) return;

  const ROW_H   = 28;
  const LABEL_W = 180;
  const BAR_MAX = 220; // max per10k value in data ~205
  const W       = LABEL_W + 380 + 60; // label + bar area + value label
  const H       = rows.length * ROW_H + 40;

  const BAR_AREA = W - LABEL_W - 60;
  const scale = (v) => (v / BAR_MAX) * BAR_AREA;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    'font-family': "Helvetica Neue, Helvetica, Arial, sans-serif",
    'font-size': '12',
  });

  // Axis line
  const axis = svgEl('line', {
    x1: LABEL_W, y1: 0,
    x2: LABEL_W, y2: H - 24,
    stroke: '#d0c8bc', 'stroke-width': 1,
  });
  svg.appendChild(axis);

  // Reference line: national median 10.8 per 10k
  const medianX = LABEL_W + scale(10.8);
  const medLine = svgEl('line', {
    x1: medianX, y1: 0,
    x2: medianX, y2: H - 24,
    stroke: '#b0a090', 'stroke-width': 1,
    'stroke-dasharray': '4 3',
  });
  svg.appendChild(medLine);

  const medLabel = svgEl('text', {
    x: medianX + 3, y: H - 10,
    fill: '#999', 'font-size': '10',
    'font-style': 'italic',
  });
  medLabel.textContent = 'national median (10.8)';
  svg.appendChild(medLabel);

  rows.forEach((row, i) => {
    const y = i * ROW_H + ROW_H * 0.5;
    const color = CAT_COLORS[row.category] || CAT_COLORS.other;
    const barW = scale(row.per10k);

    // Background stripe for readability
    if (i % 2 === 0) {
      svg.appendChild(svgEl('rect', {
        x: 0, y: i * ROW_H,
        width: W, height: ROW_H,
        fill: '#f5f2ec',
      }));
    }

    // Name label (right-aligned before axis)
    const nameEl = svgEl('text', {
      x: LABEL_W - 6, y: y + 4,
      'text-anchor': 'end',
      fill: '#1a1a1a',
      'font-family': "Georgia, 'Times New Roman', serif",
      'font-size': '12',
    });
    nameEl.textContent = row.name;
    svg.appendChild(nameEl);

    // Dept label
    const deptEl = svgEl('text', {
      x: LABEL_W - 6, y: y + 15,
      'text-anchor': 'end',
      fill: '#999',
      'font-size': '10',
    });
    deptEl.textContent = row.deptName;
    svg.appendChild(deptEl);

    // Bar
    svg.appendChild(svgEl('rect', {
      x: LABEL_W, y: i * ROW_H + 6,
      width: Math.max(barW, 2), height: ROW_H - 12,
      fill: color, rx: 2,
    }));

    // Value label
    const valEl = svgEl('text', {
      x: LABEL_W + barW + 5, y: y + 4,
      fill: '#333',
      'font-size': '11',
      'font-variant-numeric': 'tabular-nums',
    });
    valEl.textContent = row.per10k.toFixed(1);
    svg.appendChild(valEl);

    // Small counts
    const countEl = svgEl('text', {
      x: LABEL_W + barW + 5, y: y + 15,
      fill: '#999',
      'font-size': '10',
    });
    countEl.textContent = `${row.bars} bars · ${formatNum(row.pop)} residents`;
    svg.appendChild(countEl);
  });

  container.appendChild(svg);

  // Legend
  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;font-family:var(--sans);font-size:12px;color:#555;margin-top:8px;';
  for (const [key, label] of Object.entries(CAT_LABELS)) {
    const item = document.createElement('span');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.gap = '5px';
    const dot = document.createElement('span');
    dot.style.cssText = `width:10px;height:10px;border-radius:2px;background:${CAT_COLORS[key]};display:inline-block;flex-shrink:0;`;
    item.appendChild(dot);
    item.appendChild(document.createTextNode(label));
    legend.appendChild(item);
  }
  container.appendChild(legend);
}

export function drawCityChart(selector, cities, parisRows) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Combine cities + selected Paris arrondissements (1er, 2e, 8e)
  const parisHighlight = parisRows
    .filter(p => [1, 2, 8].includes(p.arrondissement))
    .map(p => ({ ...p, category: 'paris', deptName: 'Paris' }));

  const all = [...cities, ...parisHighlight].sort((a, b) => b.per10k - a.per10k);

  const ROW_H   = 26;
  const LABEL_W = 160;
  const BAR_MAX = Math.max(...all.map(r => r.per10k)) * 1.1;
  const W       = LABEL_W + 340;
  const H       = all.length * ROW_H + 40;
  const BAR_AREA = W - LABEL_W - 60;
  const scale = (v) => (v / BAR_MAX) * BAR_AREA;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    'font-family': "Helvetica Neue, Helvetica, Arial, sans-serif",
    'font-size': '12',
  });

  const axis = svgEl('line', {
    x1: LABEL_W, y1: 0,
    x2: LABEL_W, y2: H - 24,
    stroke: '#d0c8bc', 'stroke-width': 1,
  });
  svg.appendChild(axis);

  all.forEach((row, i) => {
    const y = i * ROW_H + ROW_H * 0.5;
    const isParisArr = row.category === 'paris';
    const color = isParisArr ? '#b32020' : '#888';
    const barW = scale(row.per10k);

    if (i % 2 === 0) {
      svg.appendChild(svgEl('rect', {
        x: 0, y: i * ROW_H,
        width: W, height: ROW_H,
        fill: '#f5f2ec',
      }));
    }

    const nameEl = svgEl('text', {
      x: LABEL_W - 6, y: y + 4,
      'text-anchor': 'end',
      fill: isParisArr ? '#b32020' : '#1a1a1a',
      'font-family': "Georgia, 'Times New Roman', serif",
      'font-size': '12',
    });
    nameEl.textContent = row.name;
    svg.appendChild(nameEl);

    svg.appendChild(svgEl('rect', {
      x: LABEL_W, y: i * ROW_H + 5,
      width: Math.max(barW, 2), height: ROW_H - 10,
      fill: color, rx: 2, opacity: isParisArr ? '0.85' : '0.7',
    }));

    const valEl = svgEl('text', {
      x: LABEL_W + barW + 5, y: y + 4,
      fill: '#333',
      'font-size': '11',
      'font-variant-numeric': 'tabular-nums',
    });
    valEl.textContent = row.per10k.toFixed(1);
    svg.appendChild(valEl);
  });

  // Legend note
  const note = svgEl('text', {
    x: LABEL_W, y: H - 8,
    fill: '#b32020',
    'font-size': '10',
    'font-style': 'italic',
  });
  note.textContent = 'Paris arrondissements shown in red';
  svg.appendChild(note);

  container.appendChild(svg);
}
