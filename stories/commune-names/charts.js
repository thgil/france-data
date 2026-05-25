/* charts.js — commune-names story */

function svgBar(container, data, { labelKey, valueKey, color = '#b32020', maxWidth = 640 } = {}) {
  const margin = { top: 8, right: 60, bottom: 8, left: 180 };
  const rowH = 28;
  const h = data.length * rowH + margin.top + margin.bottom;
  const w = maxWidth;
  const innerW = w - margin.left - margin.right;

  const maxVal = Math.max(...data.map(d => d[valueKey]));

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  data.forEach((d, i) => {
    const y = margin.top + i * rowH;
    const barW = (d[valueKey] / maxVal) * innerW;

    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', margin.left - 8);
    label.setAttribute('y', y + rowH / 2 + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-family', "Georgia, 'Times New Roman', serif");
    label.setAttribute('font-size', '13');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = d[labelKey];
    svg.appendChild(label);

    // Bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', margin.left);
    rect.setAttribute('y', y + 5);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', rowH - 10);
    rect.setAttribute('fill', color);
    rect.setAttribute('opacity', '0.82');
    svg.appendChild(rect);

    // Value label
    const val = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    val.setAttribute('x', margin.left + barW + 6);
    val.setAttribute('y', y + rowH / 2 + 4);
    val.setAttribute('font-family', "'Helvetica Neue', Helvetica, Arial, sans-serif");
    val.setAttribute('font-size', '12');
    val.setAttribute('fill', '#666');
    val.textContent = d[valueKey].toLocaleString('en');
    svg.appendChild(val);
  });

  container.appendChild(svg);
}

function svgHistogram(container, data, { labelKey = 'len', valueKey = 'count', color = '#b32020', xLabel = '', maxWidth = 720 } = {}) {
  const margin = { top: 20, right: 20, bottom: 48, left: 52 };
  const h = 220;
  const w = maxWidth;
  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;

  const maxVal = Math.max(...data.map(d => d[valueKey]));
  const barCount = data.length;
  const barW = innerW / barCount;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';

  // Y gridlines at 25%, 50%, 75%, 100%
  [0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = margin.top + innerH - frac * innerH;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', margin.left); line.setAttribute('x2', margin.left + innerW);
    line.setAttribute('y1', y); line.setAttribute('y2', y);
    line.setAttribute('stroke', '#ddd'); line.setAttribute('stroke-width', '1');
    svg.appendChild(line);

    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tick.setAttribute('x', margin.left - 6);
    tick.setAttribute('y', y + 4);
    tick.setAttribute('text-anchor', 'end');
    tick.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    tick.setAttribute('font-size', '10');
    tick.setAttribute('fill', '#999');
    tick.textContent = Math.round(frac * maxVal).toLocaleString('en');
    svg.appendChild(tick);
  });

  data.forEach((d, i) => {
    const barH = (d[valueKey] / maxVal) * innerH;
    const x = margin.left + i * barW;
    const y = margin.top + innerH - barH;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x + 1);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW - 2);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', color);
    rect.setAttribute('opacity', '0.8');
    svg.appendChild(rect);

    // X tick every 5 chars
    if (d[labelKey] % 5 === 0 || d[labelKey] === 1 || d[labelKey] === 2) {
      const xt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xt.setAttribute('x', x + barW / 2);
      xt.setAttribute('y', margin.top + innerH + 16);
      xt.setAttribute('text-anchor', 'middle');
      xt.setAttribute('font-family', "'Helvetica Neue', sans-serif");
      xt.setAttribute('font-size', '11');
      xt.setAttribute('fill', '#888');
      xt.textContent = d[labelKey];
      svg.appendChild(xt);
    }
  });

  // Axis label
  if (xLabel) {
    const xl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xl.setAttribute('x', margin.left + innerW / 2);
    xl.setAttribute('y', h - 4);
    xl.setAttribute('text-anchor', 'middle');
    xl.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    xl.setAttribute('font-size', '11');
    xl.setAttribute('fill', '#999');
    xl.textContent = xLabel;
    svg.appendChild(xl);
  }

  container.appendChild(svg);
}

export function drawNameCharts(stats) {
  // Chart 1: Name length histogram
  const lenEl = document.getElementById('chart-length');
  if (lenEl) {
    svgHistogram(lenEl, stats.length_dist, {
      labelKey: 'len',
      valueKey: 'count',
      color: '#b32020',
      xLabel: 'characters in name',
      maxWidth: 720,
    });
  }

  // Chart 2: Most common names
  const namesEl = document.getElementById('chart-names');
  if (namesEl) {
    svgBar(namesEl, stats.top_names.slice(0, 15), {
      labelKey: 'name',
      valueKey: 'count',
      color: '#b32020',
      maxWidth: 640,
    });
  }

  // Chart 3: Most common prefixes (excluding Saint/Sainte — already headlined)
  const prefEl = document.getElementById('chart-prefixes');
  if (prefEl) {
    svgBar(prefEl, stats.top_prefixes.slice(0, 12), {
      labelKey: 'prefix',
      valueKey: 'count',
      color: '#5c3a6e',
      maxWidth: 640,
    });
  }
}
