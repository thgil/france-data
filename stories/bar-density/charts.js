// stories/bar-density/charts.js
// SVG horizontal bar chart for department per-capita rankings.

const BAR_COLOR      = '#c67c00';
const BAR_COLOR_LOW  = '#b32020';
const NATIONAL_COLOR = '#888';

function fmt(n) {
  return n.toLocaleString('fr-FR');
}

function fmtRate(n) {
  return n.toFixed(1);
}

export function drawDeptChart(selector, depts, nationalRate) {
  const container = document.querySelector(selector);
  if (!container) return;

  const isMobile = window.innerWidth < 600;
  const margin = { top: 8, right: isMobile ? 70 : 90, bottom: 36, left: isMobile ? 130 : 160 };
  const totalW = container.clientWidth || 680;
  const innerW = totalW - margin.left - margin.right;
  const rowH = isMobile ? 22 : 26;
  const totalH = margin.top + margin.bottom + depts.length * rowH;

  const maxVal = Math.max(...depts.map(d => d.per10k), nationalRate) * 1.05;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  svg.style.overflow = 'visible';

  function x(val) {
    return margin.left + (val / maxVal) * innerW;
  }

  // National average reference line
  const nx = x(nationalRate);
  const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  lineEl.setAttribute('x1', nx);
  lineEl.setAttribute('x2', nx);
  lineEl.setAttribute('y1', margin.top);
  lineEl.setAttribute('y2', totalH - margin.bottom);
  lineEl.setAttribute('stroke', NATIONAL_COLOR);
  lineEl.setAttribute('stroke-width', '1');
  lineEl.setAttribute('stroke-dasharray', '4 3');
  svg.appendChild(lineEl);

  const labelEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  labelEl.setAttribute('x', nx + 4);
  labelEl.setAttribute('y', margin.top);
  labelEl.setAttribute('font-size', isMobile ? '9' : '10');
  labelEl.setAttribute('fill', NATIONAL_COLOR);
  labelEl.setAttribute('dominant-baseline', 'hanging');
  labelEl.textContent = `national avg ${fmtRate(nationalRate)}`;
  svg.appendChild(labelEl);

  // Bars
  depts.forEach((d, i) => {
    const y = margin.top + i * rowH;
    const barW = Math.max(0, x(d.per10k) - margin.left);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', margin.left);
    rect.setAttribute('y', y + 3);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', rowH - 6);
    rect.setAttribute('fill', d.per10k >= nationalRate ? BAR_COLOR : '#c0a060');
    rect.setAttribute('opacity', '0.85');
    g.appendChild(rect);

    // Dept name label
    const nameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameEl.setAttribute('x', margin.left - 6);
    nameEl.setAttribute('y', y + rowH / 2);
    nameEl.setAttribute('text-anchor', 'end');
    nameEl.setAttribute('dominant-baseline', 'middle');
    nameEl.setAttribute('font-size', isMobile ? '10' : '12');
    nameEl.setAttribute('fill', '#1a1a1a');
    nameEl.textContent = d.name;
    g.appendChild(nameEl);

    // Value label
    const valEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    valEl.setAttribute('x', x(d.per10k) + 4);
    valEl.setAttribute('y', y + rowH / 2);
    valEl.setAttribute('dominant-baseline', 'middle');
    valEl.setAttribute('font-size', isMobile ? '10' : '11');
    valEl.setAttribute('fill', '#444');
    valEl.textContent = fmtRate(d.per10k);
    g.appendChild(valEl);

    svg.appendChild(g);
  });

  // X axis label
  const axisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  axisLabel.setAttribute('x', margin.left + innerW / 2);
  axisLabel.setAttribute('y', totalH - 2);
  axisLabel.setAttribute('text-anchor', 'middle');
  axisLabel.setAttribute('font-size', '11');
  axisLabel.setAttribute('fill', '#888');
  axisLabel.textContent = 'bars per 10,000 residents';
  svg.appendChild(axisLabel);

  container.appendChild(svg);
}

export function drawBottomChart(selector, depts, nationalRate) {
  const container = document.querySelector(selector);
  if (!container) return;

  const isMobile = window.innerWidth < 600;
  const margin = { top: 8, right: isMobile ? 70 : 90, bottom: 36, left: isMobile ? 130 : 180 };
  const totalW = container.clientWidth || 680;
  const innerW = totalW - margin.left - margin.right;
  const rowH = isMobile ? 22 : 26;
  const totalH = margin.top + margin.bottom + depts.length * rowH;

  const maxVal = nationalRate * 1.05;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  svg.style.overflow = 'visible';

  function x(val) {
    return margin.left + (val / maxVal) * innerW;
  }

  // National average reference line
  const nx = x(nationalRate);
  const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  lineEl.setAttribute('x1', nx);
  lineEl.setAttribute('x2', nx);
  lineEl.setAttribute('y1', margin.top);
  lineEl.setAttribute('y2', totalH - margin.bottom);
  lineEl.setAttribute('stroke', NATIONAL_COLOR);
  lineEl.setAttribute('stroke-width', '1');
  lineEl.setAttribute('stroke-dasharray', '4 3');
  svg.appendChild(lineEl);

  const labelEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  labelEl.setAttribute('x', nx - 4);
  labelEl.setAttribute('y', margin.top);
  labelEl.setAttribute('text-anchor', 'end');
  labelEl.setAttribute('font-size', isMobile ? '9' : '10');
  labelEl.setAttribute('fill', NATIONAL_COLOR);
  labelEl.setAttribute('dominant-baseline', 'hanging');
  labelEl.textContent = `national avg ${fmtRate(nationalRate)}`;
  svg.appendChild(labelEl);

  depts.forEach((d, i) => {
    const y = margin.top + i * rowH;
    const barW = Math.max(0, x(d.per10k) - margin.left);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', margin.left);
    rect.setAttribute('y', y + 3);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', rowH - 6);
    rect.setAttribute('fill', BAR_COLOR_LOW);
    rect.setAttribute('opacity', '0.7');
    g.appendChild(rect);

    const nameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameEl.setAttribute('x', margin.left - 6);
    nameEl.setAttribute('y', y + rowH / 2);
    nameEl.setAttribute('text-anchor', 'end');
    nameEl.setAttribute('dominant-baseline', 'middle');
    nameEl.setAttribute('font-size', isMobile ? '10' : '12');
    nameEl.setAttribute('fill', '#1a1a1a');
    nameEl.textContent = d.name;
    g.appendChild(nameEl);

    const valEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    valEl.setAttribute('x', x(d.per10k) + 4);
    valEl.setAttribute('y', y + rowH / 2);
    valEl.setAttribute('dominant-baseline', 'middle');
    valEl.setAttribute('font-size', isMobile ? '10' : '11');
    valEl.setAttribute('fill', '#444');
    valEl.textContent = fmtRate(d.per10k);
    g.appendChild(valEl);

    svg.appendChild(g);
  });

  const axisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  axisLabel.setAttribute('x', margin.left + innerW / 2);
  axisLabel.setAttribute('y', totalH - 2);
  axisLabel.setAttribute('text-anchor', 'middle');
  axisLabel.setAttribute('font-size', '11');
  axisLabel.setAttribute('fill', '#888');
  axisLabel.textContent = 'bars per 10,000 residents';
  svg.appendChild(axisLabel);

  container.appendChild(svg);
}
