// commune-names/charts.js
// Renders duplication bar chart and name-length histogram as inline SVG.

const DUPES = [
  ['Sainte-Colombe', 12],
  ['Saint-Sauveur', 11],
  ['Saint-Aubin', 10],
  ['Beaulieu', 10],
  ['Saint-Marcel', 9],
  ['Saint-Michel', 9],
  ['Le Pin', 9],
  ['Saint-Pierre', 9],
  ['Sainte-Marie', 9],
  ['Saint-Rémy', 8],
  ['Saint-Clément', 8],
  ['Saint-Hilaire', 8],
  ['Saint-Loup', 8],
  ['Beaumont', 8],
  ['Verrières', 8],
  ['Saint-Hippolyte', 8],
  ['Saint-Georges', 8],
  ['Saint-Médard', 8],
  ['Saint-Paul', 8],
  ['Brion', 7],
];

const LENGTHS = [
  [1,1],[2,13],[3,154],[4,720],[5,1969],[6,3223],
  [7,3695],[8,3695],[9,3000],[10,2522],[11,1884],[12,1435],
  [13,1167],[14,1018],[15,1095],[16,1177],[17,1186],[18,1202],
  [19,1117],[20,1028],[21,923],[22,819],[23,649],[24,501],
  [25,329],[26,200],[27,105],[28,55],[29,53],[30,29],
];

function svgEl(tag, attrs = {}, text = '') {
  const NS = 'http://www.w3.org/2000/svg';
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text) el.textContent = text;
  return el;
}

function svg(width, height) {
  return svgEl('svg', {
    viewBox: `0 0 ${width} ${height}`,
    width: '100%',
    style: 'display:block; max-width:100%',
    'aria-hidden': 'true',
  });
}

export function drawDupeChart(mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const W = 600, ROW_H = 28, PAD_TOP = 8, PAD_BOT = 4;
  const LABEL_W = 148, BAR_AREA = W - LABEL_W - 48;
  const H = PAD_TOP + DUPES.length * ROW_H + PAD_BOT;
  const maxVal = DUPES[0][1];

  const root = svg(W, H);

  DUPES.forEach(([name, count], i) => {
    const y = PAD_TOP + i * ROW_H;
    const barW = Math.round((count / maxVal) * BAR_AREA);
    const cx = LABEL_W + barW;

    // row background on hover handled by CSS
    const g = svgEl('g', { class: 'dupe-row' });

    // label
    g.appendChild(svgEl('text', {
      x: LABEL_W - 8,
      y: y + ROW_H * 0.62,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': '13',
      fill: '#1a1a1a',
    }, name));

    // bar
    g.appendChild(svgEl('rect', {
      x: LABEL_W,
      y: y + 5,
      width: barW,
      height: ROW_H - 10,
      fill: '#b32020',
      opacity: '0.75',
      rx: '2',
    }));

    // count label
    g.appendChild(svgEl('text', {
      x: cx + 6,
      y: y + ROW_H * 0.62,
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '12',
      fill: '#666',
    }, String(count)));

    root.appendChild(g);
  });

  mount.appendChild(root);
}

export function drawLengthChart(mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const W = 640, H = 180;
  const PAD_L = 40, PAD_R = 20, PAD_T = 12, PAD_B = 36;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const maxVal = Math.max(...LENGTHS.map(([, v]) => v));
  const barW = Math.floor(chartW / LENGTHS.length) - 1;

  const root = svg(W, H);

  // Y-axis gridlines
  [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = PAD_T + chartH * (1 - frac);
    root.appendChild(svgEl('line', {
      x1: PAD_L - 4, y1: y, x2: W - PAD_R, y2: y,
      stroke: frac === 0 ? '#1a1a1a' : '#e0d8cc',
      'stroke-width': frac === 0 ? '1' : '0.5',
    }));
    if (frac > 0) {
      root.appendChild(svgEl('text', {
        x: PAD_L - 6, y: y + 4,
        'text-anchor': 'end',
        'font-family': "'Helvetica Neue', sans-serif",
        'font-size': '10',
        fill: '#888',
      }, String(Math.round(maxVal * frac))));
    }
  });

  // Bars
  LENGTHS.forEach(([len, count], i) => {
    const x = PAD_L + i * (barW + 1);
    const barH = Math.round((count / maxVal) * chartH);
    const y = PAD_T + chartH - barH;

    root.appendChild(svgEl('rect', {
      x, y,
      width: barW,
      height: barH,
      fill: '#b32020',
      opacity: (len >= 7 && len <= 9) ? '0.9' : '0.5',
      rx: '1',
    }));

    // X-axis labels every 5
    if (len === 1 || len % 5 === 0) {
      root.appendChild(svgEl('text', {
        x: x + barW / 2,
        y: PAD_T + chartH + 14,
        'text-anchor': 'middle',
        'font-family': "'Helvetica Neue', sans-serif",
        'font-size': '10',
        fill: '#666',
      }, String(len)));
    }
  });

  // X-axis label
  root.appendChild(svgEl('text', {
    x: PAD_L + chartW / 2,
    y: H - 2,
    'text-anchor': 'middle',
    'font-family': "'Helvetica Neue', sans-serif",
    'font-size': '11',
    fill: '#888',
  }, 'characters in name'));

  mount.appendChild(root);
}
