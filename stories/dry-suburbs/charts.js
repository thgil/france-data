/**
 * Ranked bar chart — bars per 10k residents by département
 */
export function drawRankChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const depts = data.depts;
  const national = data.national.per10k;

  const ROW_H = 22;
  const LABEL_W = 168;
  const VALUE_W = 42;
  const BAR_MAX = 340;
  const PADDING = { top: 28, right: VALUE_W + 8, bottom: 20, left: LABEL_W };
  const W = LABEL_W + BAR_MAX + VALUE_W + 24;
  const H = depts.length * ROW_H + PADDING.top + PADDING.bottom;

  const maxPer10k = depts[0].per10k;

  const colours = {
    corsica:  '#c0392b',
    paris:    '#c67c00',
    'idf-ring': '#5b8dce',
    metro:    '#4a4a4a',
    overseas: '#999',
  };

  const labelColours = {
    corsica:  '#a0291e',
    paris:    '#9e6200',
    'idf-ring': '#3a6aab',
    metro:    '#2a2a2a',
    overseas: '#777',
  };

  // SVG
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Bars per 10,000 residents — ranked by département');
  svg.style.display = 'block';
  svg.style.maxWidth = `${W}px`;

  // Background
  const bg = document.createElementNS(ns, 'rect');
  bg.setAttribute('width', W);
  bg.setAttribute('height', H);
  bg.setAttribute('fill', '#faf7f2');
  svg.appendChild(bg);

  // National average line
  const avgX = PADDING.left + (national / maxPer10k) * BAR_MAX;
  const avgLine = document.createElementNS(ns, 'line');
  avgLine.setAttribute('x1', avgX);
  avgLine.setAttribute('x2', avgX);
  avgLine.setAttribute('y1', PADDING.top - 20);
  avgLine.setAttribute('y2', H - PADDING.bottom);
  avgLine.setAttribute('stroke', '#c8bfb0');
  avgLine.setAttribute('stroke-width', '1');
  avgLine.setAttribute('stroke-dasharray', '3,3');
  svg.appendChild(avgLine);

  // Average label
  const avgLabel = document.createElementNS(ns, 'text');
  avgLabel.setAttribute('x', avgX + 4);
  avgLabel.setAttribute('y', PADDING.top - 8);
  avgLabel.setAttribute('font-family', 'var(--sans, Helvetica Neue, sans-serif)');
  avgLabel.setAttribute('font-size', '10');
  avgLabel.setAttribute('fill', '#999');
  avgLabel.textContent = `national avg ${national.toFixed(1)}`;
  svg.appendChild(avgLabel);

  // Rows
  depts.forEach((d, i) => {
    const y = PADDING.top + i * ROW_H;
    const barW = Math.max(1, (d.per10k / maxPer10k) * BAR_MAX);
    const color = colours[d.tag] || colours.metro;
    const labelColor = labelColours[d.tag] || labelColours.metro;
    const isHighlight = d.tag !== 'metro' && d.tag !== 'overseas';

    // Row hover zone
    const zone = document.createElementNS(ns, 'rect');
    zone.setAttribute('x', 0);
    zone.setAttribute('y', y);
    zone.setAttribute('width', W);
    zone.setAttribute('height', ROW_H - 1);
    zone.setAttribute('fill', 'transparent');
    zone.style.cursor = 'default';
    zone.addEventListener('mouseenter', () => {
      zone.setAttribute('fill', 'rgba(0,0,0,0.04)');
    });
    zone.addEventListener('mouseleave', () => {
      zone.setAttribute('fill', 'transparent');
    });
    svg.appendChild(zone);

    // Dept label
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', LABEL_W - 8);
    label.setAttribute('y', y + ROW_H * 0.65);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-family', isHighlight ? 'Georgia, serif' : 'var(--sans, Helvetica Neue, sans-serif)');
    label.setAttribute('font-size', isHighlight ? '12' : '11');
    label.setAttribute('font-weight', isHighlight ? '400' : '400');
    label.setAttribute('fill', labelColor);
    label.textContent = d.name;
    svg.appendChild(label);

    // Bar
    const bar = document.createElementNS(ns, 'rect');
    bar.setAttribute('x', LABEL_W);
    bar.setAttribute('y', y + 4);
    bar.setAttribute('width', barW);
    bar.setAttribute('height', ROW_H - 9);
    bar.setAttribute('fill', color);
    bar.setAttribute('opacity', isHighlight ? '0.9' : '0.55');
    bar.setAttribute('rx', '1');
    svg.appendChild(bar);

    // Value
    const val = document.createElementNS(ns, 'text');
    val.setAttribute('x', LABEL_W + barW + 5);
    val.setAttribute('y', y + ROW_H * 0.65);
    val.setAttribute('font-family', 'var(--sans, Helvetica Neue, sans-serif)');
    val.setAttribute('font-size', '10.5');
    val.setAttribute('fill', labelColor);
    val.textContent = d.per10k.toFixed(1);
    svg.appendChild(val);
  });

  container.appendChild(svg);

  // Build legend
  const legend = document.querySelector('#chart-legend');
  if (legend) {
    const items = [
      { color: colours.corsica, label: 'Corsica' },
      { color: colours.paris, label: 'Paris' },
      { color: colours['idf-ring'], label: 'IDF suburbs' },
      { color: colours.metro, label: 'Metropolitan France' },
      { color: colours.overseas, label: 'Overseas' },
    ];
    legend.innerHTML = items.map(item =>
      `<span class="legend-item">
        <span class="legend-swatch" style="background:${item.color}"></span>
        ${item.label}
      </span>`
    ).join('');
  }
}
