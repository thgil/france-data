// stories/commune-names/charts.js
// Three charts: name length distribution, top prefixes, most common names
// No external deps beyond the browser — pure SVG/DOM

const COLOR_ACCENT = '#b32020';
const COLOR_MUTED  = '#d8d0c0';
const COLOR_FILL   = '#c8392040'; // translucent accent

function qs(sel) { return document.querySelector(sel); }

// ── Utility: responsive SVG container ────────────────────────────────────────
function makeSVG(container, width, height) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.style.width = '100%';
  svg.style.height = 'auto';
  svg.style.display = 'block';
  container.appendChild(svg);
  return svg;
}

function svgEl(tag, attrs = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const el = document.createElementNS(ns, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ── Chart 1: Name length distribution ────────────────────────────────────────
export function drawLengthChart(selector, lengthDist) {
  const container = qs(selector);
  if (!container) return;

  const margin = { top: 20, right: 24, bottom: 48, left: 52 };
  const W = 700, H = 280;
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = makeSVG(container, W, H);

  // Filter to lengths 1–30 (30+ grouping)
  const dist = lengthDist.filter(d => d.len <= 30);
  // Add a 30+ bucket
  const over30 = lengthDist.filter(d => d.len > 30).reduce((s, d) => s + d.count, 0);
  const plotData = [...dist, { len: '30+', count: over30 }];

  const maxCount = Math.max(...plotData.map(d => d.count));
  const barW = iW / plotData.length;

  const scaleX = (i) => margin.left + i * barW;
  const scaleY = (v) => margin.top + iH - (v / maxCount) * iH;

  // Gridlines
  const gridVals = [1000, 2000, 3000];
  for (const gv of gridVals) {
    const y = scaleY(gv);
    svg.appendChild(svgEl('line', {
      x1: margin.left, y1: y, x2: W - margin.right, y2: y,
      stroke: COLOR_MUTED, 'stroke-width': 1, 'stroke-dasharray': '3 3'
    }));
    const t = svgEl('text', {
      x: margin.left - 6, y: y + 4,
      'text-anchor': 'end', 'font-size': 11, fill: '#888'
    });
    t.textContent = gv.toLocaleString();
    svg.appendChild(t);
  }

  // Bars
  plotData.forEach((d, i) => {
    const x = scaleX(i);
    const y = scaleY(d.count);
    const h = scaleY(0) - y;

    const rect = svgEl('rect', {
      x: x + 1, y, width: Math.max(barW - 2, 1), height: Math.max(h, 0),
      fill: d.len === 7 || d.len === 8 ? COLOR_ACCENT : '#c0bab0',
      rx: 1
    });
    svg.appendChild(rect);

    // X label every 5 chars
    if (i % 5 === 0 || d.len === '30+') {
      const t = svgEl('text', {
        x: x + barW / 2, y: H - margin.bottom + 16,
        'text-anchor': 'middle', 'font-size': 11, fill: '#666'
      });
      t.textContent = d.len;
      svg.appendChild(t);
    }
  });

  // Axis labels
  const xAxisLabel = svgEl('text', {
    x: W / 2, y: H - 4,
    'text-anchor': 'middle', 'font-size': 12, fill: '#555'
  });
  xAxisLabel.textContent = 'Name length (characters)';
  svg.appendChild(xAxisLabel);

  const yAxisLabel = svgEl('text', {
    x: 12, y: margin.top + iH / 2,
    'text-anchor': 'middle', 'font-size': 12, fill: '#555',
    transform: `rotate(-90, 12, ${margin.top + iH / 2})`
  });
  yAxisLabel.textContent = 'Communes';
  svg.appendChild(yAxisLabel);

  // Annotation: peak
  const peakLabel = svgEl('text', {
    x: scaleX(6) + barW / 2, y: scaleY(3695) - 6,
    'text-anchor': 'middle', 'font-size': 11, fill: COLOR_ACCENT,
    'font-weight': '600'
  });
  peakLabel.textContent = 'peak: 7–8 chars';
  svg.appendChild(peakLabel);
}

// ── Chart 2: Top prefixes (horizontal bar) ────────────────────────────────────
export function drawPrefixChart(selector, topPrefixes) {
  const container = qs(selector);
  if (!container) return;

  const margin = { top: 12, right: 80, bottom: 12, left: 140 };
  const BAR_H = 22;
  const BAR_GAP = 5;
  const N = Math.min(topPrefixes.length, 12);
  const W = 640;
  const H = margin.top + N * (BAR_H + BAR_GAP) + margin.bottom;

  const maxCount = topPrefixes[0].count;
  const iW = W - margin.left - margin.right;

  const svg = makeSVG(container, W, H);

  topPrefixes.slice(0, N).forEach((d, i) => {
    const y = margin.top + i * (BAR_H + BAR_GAP);
    const bW = (d.count / maxCount) * iW;

    // Bar
    svg.appendChild(svgEl('rect', {
      x: margin.left, y, width: Math.max(bW, 1), height: BAR_H,
      fill: i === 0 ? COLOR_ACCENT : (i < 3 ? '#c8392080' : '#c0bab0'),
      rx: 2
    }));

    // Label left
    const labelL = svgEl('text', {
      x: margin.left - 8, y: y + BAR_H / 2 + 4,
      'text-anchor': 'end', 'font-size': 12,
      'font-style': 'italic',
      fill: '#333'
    });
    labelL.textContent = d.prefix;
    svg.appendChild(labelL);

    // Count right
    const labelR = svgEl('text', {
      x: margin.left + bW + 6, y: y + BAR_H / 2 + 4,
      'text-anchor': 'start', 'font-size': 12, fill: '#555'
    });
    labelR.textContent = d.count.toLocaleString();
    svg.appendChild(labelR);
  });
}

// ── Chart 3: Most common names table ─────────────────────────────────────────
export function drawTopNamesTable(selector, topNames) {
  const container = qs(selector);
  if (!container) return;

  const table = document.createElement('table');
  table.className = 'stats-table';
  table.style.width = '100%';

  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th style="text-align:left">Name</th><th style="text-align:right">Communes</th><th style="text-align:left" style="padding-left:16px">Départements</th></tr>';
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  topNames.slice(0, 15).forEach((d, i) => {
    const tr = document.createElement('tr');
    const deptStr = d.depts.length <= 6
      ? d.depts.join(', ')
      : d.depts.slice(0, 6).join(', ') + `… +${d.depts.length - 6}`;
    tr.innerHTML = `
      <td style="font-style:italic;padding:5px 12px 5px 0">${d.name}</td>
      <td style="text-align:right;font-weight:700;padding:5px 12px;color:${i === 0 ? COLOR_ACCENT : 'inherit'}">${d.count}</td>
      <td style="color:#666;font-size:12px;padding:5px 0">${deptStr}</td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}
