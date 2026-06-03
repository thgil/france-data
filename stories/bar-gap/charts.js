/* bar-gap/charts.js — horizontal ranked bar chart, per-capita bars by département */

const REGION_COLORS = {
  'Corse':             '#c67c00',  // amber — tourist/island
  'Bretagne':          '#2a7a5c',  // teal — Celtic cluster
  'Île-de-France':     '#b32020',  // red — bottom of the chart
  'PACA':              '#6b5ba8',  // purple — Provence-Alpes
  'Auvergne-Rhône-Alpes': '#5a8ab0',
};
const COLOR_DEFAULT = '#8a8070';

const REGION_LABELS = {
  'Corse': 'Corse',
  'Bretagne': 'Bretagne',
  'Île-de-France': 'Île-de-France',
};

function barColor(d) {
  return REGION_COLORS[d.region] || COLOR_DEFAULT;
}

export function drawBarChart(container, stats) {
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;
  if (!el) return;

  const depts = stats.depts;
  const avg = stats.national_avg_per10k;
  const maxVal = depts[0].per10k;

  const ROW_H = 22;
  const MARGIN = { top: 16, right: 80, bottom: 32, left: 160 };
  const CHART_W = Math.min(el.clientWidth || 640, 800);
  const BAR_W = CHART_W - MARGIN.left - MARGIN.right;
  const CHART_H = depts.length * ROW_H + MARGIN.top + MARGIN.bottom;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', CHART_W);
  svg.setAttribute('height', CHART_H);
  svg.setAttribute('viewBox', `0 0 ${CHART_W} ${CHART_H}`);
  svg.style.maxWidth = '100%';
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";
  svg.style.overflow = 'visible';

  function xScale(v) { return (v / maxVal) * BAR_W; }

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${MARGIN.left},${MARGIN.top})`);
  svg.appendChild(g);

  // average line
  const avgX = xScale(avg);
  const avgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  avgLine.setAttribute('x1', avgX);
  avgLine.setAttribute('x2', avgX);
  avgLine.setAttribute('y1', -8);
  avgLine.setAttribute('y2', CHART_H - MARGIN.top - MARGIN.bottom + 8);
  avgLine.setAttribute('stroke', '#1a1a1a');
  avgLine.setAttribute('stroke-width', '1');
  avgLine.setAttribute('stroke-dasharray', '3,3');
  avgLine.setAttribute('opacity', '0.45');
  g.appendChild(avgLine);

  // avg label
  const avgLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  avgLabel.setAttribute('x', avgX + 4);
  avgLabel.setAttribute('y', -10);
  avgLabel.setAttribute('font-size', '10');
  avgLabel.setAttribute('fill', '#666');
  avgLabel.textContent = `avg ${avg}`;
  g.appendChild(avgLabel);

  // rows
  depts.forEach((d, i) => {
    const y = i * ROW_H;
    const barW = xScale(d.per10k);
    const color = barColor(d);
    const isIDF = d.region === 'Île-de-France';

    const row = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    row.setAttribute('transform', `translate(0, ${y})`);
    row.style.cursor = 'default';

    // hover background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', -MARGIN.left);
    bg.setAttribute('y', 1);
    bg.setAttribute('width', CHART_W);
    bg.setAttribute('height', ROW_H - 2);
    bg.setAttribute('fill', 'transparent');
    row.appendChild(bg);

    // dept name label
    const nameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameEl.setAttribute('x', -6);
    nameEl.setAttribute('y', ROW_H / 2 + 4);
    nameEl.setAttribute('text-anchor', 'end');
    nameEl.setAttribute('font-size', '11');
    nameEl.setAttribute('fill', isIDF ? '#b32020' : '#333');
    nameEl.setAttribute('font-weight', isIDF ? '600' : '400');
    nameEl.textContent = d.name;
    row.appendChild(nameEl);

    // bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', ROW_H / 2 - 5);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', 10);
    rect.setAttribute('fill', color);
    rect.setAttribute('opacity', '0.85');
    row.appendChild(rect);

    // value label
    const valLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    valLabel.setAttribute('x', barW + 5);
    valLabel.setAttribute('y', ROW_H / 2 + 4);
    valLabel.setAttribute('font-size', '10');
    valLabel.setAttribute('fill', color);
    valLabel.textContent = d.per10k.toFixed(1);
    row.appendChild(valLabel);

    // tooltip on hover
    row.addEventListener('mouseenter', () => {
      bg.setAttribute('fill', '#f0ece4');
      showTooltip(d, svg, MARGIN.left + barW + 20, MARGIN.top + y + ROW_H / 2);
    });
    row.addEventListener('mouseleave', () => {
      bg.setAttribute('fill', 'transparent');
      hideTooltip();
    });

    g.appendChild(row);
  });

  // tooltip element
  const tt = document.createElement('div');
  tt.style.cssText = `
    position:fixed;
    display:none;
    background:#faf7f2;
    border:1px solid #b8b0a0;
    border-radius:3px;
    padding:8px 12px;
    font-family:var(--sans,'Helvetica Neue',sans-serif);
    font-size:12px;
    line-height:1.6;
    color:#1a1a1a;
    max-width:220px;
    box-shadow:0 2px 8px rgba(0,0,0,0.12);
    pointer-events:none;
    z-index:1000;
  `;
  document.body.appendChild(tt);

  function showTooltip(d, svgEl, svgX, svgY) {
    const rect = svgEl.getBoundingClientRect();
    const scaleX = rect.width / (parseInt(svgEl.getAttribute('width')) || rect.width);
    const scaleY = rect.height / (parseInt(svgEl.getAttribute('height')) || rect.height);
    tt.innerHTML = `
      <strong style="font-family:Georgia,serif;font-size:13px">${d.name}</strong><br>
      <span style="color:#666;font-size:11px">Dept ${d.dept} · ${d.region}</span><br>
      <span style="color:#444">${d.bars.toLocaleString('fr-FR')} bars</span><br>
      <span style="color:#444">${d.pop.toLocaleString('fr-FR')} residents</span><br>
      <strong style="color:${barColor(d)}">${d.per10k.toFixed(1)} per 10,000</strong>
    `;
    tt.style.display = 'block';
    const x = rect.left + svgX * scaleX + 8;
    const y = rect.top + svgY * scaleY - 40;
    tt.style.left = Math.min(x, window.innerWidth - 230) + 'px';
    tt.style.top = Math.max(y, 4) + 'px';
  }

  function hideTooltip() {
    tt.style.display = 'none';
  }

  // legend
  const legendEntries = [
    { label: 'Corse', color: REGION_COLORS['Corse'] },
    { label: 'Bretagne', color: REGION_COLORS['Bretagne'] },
    { label: 'Île-de-France', color: REGION_COLORS['Île-de-France'] },
    { label: 'PACA', color: REGION_COLORS['PACA'] },
    { label: 'Other', color: COLOR_DEFAULT },
  ];

  el.appendChild(svg);

  // build legend below chart
  const legend = document.createElement('div');
  legend.style.cssText = `
    display:flex;flex-wrap:wrap;gap:12px 20px;
    margin-top:12px;
    font-family:var(--sans,'Helvetica Neue',sans-serif);
    font-size:11px;color:#444;
  `;
  legendEntries.forEach(e => {
    const item = document.createElement('span');
    item.style.display = 'inline-flex';
    item.style.alignItems = 'center';
    item.style.gap = '5px';
    const swatch = document.createElement('span');
    swatch.style.cssText = `display:inline-block;width:12px;height:12px;border-radius:2px;background:${e.color};opacity:0.85`;
    item.appendChild(swatch);
    item.appendChild(document.createTextNode(e.label));
    legend.appendChild(item);
  });
  el.appendChild(legend);
}
