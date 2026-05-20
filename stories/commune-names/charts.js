// stories/commune-names/charts.js
// Draws three SVG charts for the commune-names story.

function hBar(container, rows, { valueKey = 'count', labelKey = 'name', color = '#b32020', unit = '' } = {}) {
  const maxVal = Math.max(...rows.map(r => r[valueKey]));
  const rowH = 28;
  const labelW = 220;
  const barMaxW = 340;
  const numW = 52;
  const padV = 8;
  const w = labelW + barMaxW + numW + 16;
  const h = rows.length * rowH + padV * 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";
  svg.style.fontSize = '12px';

  rows.forEach((row, i) => {
    const y = padV + i * rowH;
    const cy = y + rowH / 2;
    const barW = Math.max(2, (row[valueKey] / maxVal) * barMaxW);

    // label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelW - 8);
    label.setAttribute('y', cy + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = row[labelKey];
    svg.appendChild(label);

    // bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', labelW);
    rect.setAttribute('y', cy - 8);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', 14);
    rect.setAttribute('fill', color);
    rect.setAttribute('rx', 2);
    svg.appendChild(rect);

    // value
    const val = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    val.setAttribute('x', labelW + barW + 6);
    val.setAttribute('y', cy + 4);
    val.setAttribute('fill', '#444');
    val.textContent = row[valueKey].toLocaleString('fr-FR') + unit;
    svg.appendChild(val);
  });

  container.appendChild(svg);
}

function lengthHistogram(container, lengthDist) {
  // Show lengths 1–30 (the long tail beyond is nearly invisible)
  const rows = lengthDist.filter(d => d.length <= 30 && d.count > 0);
  const maxVal = Math.max(...rows.map(r => r.count));
  const barW = 18;
  const gap = 4;
  const barMaxH = 120;
  const labelH = 24;
  const axisH = 20;
  const padH = 16;
  const padV = 16;
  const w = rows.length * (barW + gap) + padH * 2;
  const h = barMaxH + labelH + axisH + padV * 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";
  svg.style.fontSize = '10px';

  rows.forEach((row, i) => {
    const bh = Math.max(2, (row.count / maxVal) * barMaxH);
    const x = padH + i * (barW + gap);
    const y = padV + barMaxH - bh;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', bh);

    // Color: highlight the mode (7–8 chars) in accent
    const isMode = row.length === 7 || row.length === 8;
    const isSpecial = row.length === 1;
    rect.setAttribute('fill', isSpecial ? '#b32020' : isMode ? '#6b3fa0' : '#bbb');
    rect.setAttribute('rx', 2);
    svg.appendChild(rect);

    // x-axis label (every 5 characters + 1)
    if (row.length === 1 || row.length % 5 === 0) {
      const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl.setAttribute('x', x + barW / 2);
      lbl.setAttribute('y', padV + barMaxH + axisH);
      lbl.setAttribute('text-anchor', 'middle');
      lbl.setAttribute('fill', '#888');
      lbl.textContent = row.length;
      svg.appendChild(lbl);
    }
  });

  // Y-axis labels
  for (const frac of [0, 0.5, 1]) {
    const yPos = padV + barMaxH - frac * barMaxH;
    const val = Math.round(frac * maxVal);
    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', padH - 4);
    lbl.setAttribute('y', yPos + 3);
    lbl.setAttribute('text-anchor', 'end');
    lbl.setAttribute('fill', '#aaa');
    lbl.textContent = val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val;
    svg.appendChild(lbl);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', padH);
    line.setAttribute('y1', yPos);
    line.setAttribute('x2', w - padH);
    line.setAttribute('y2', yPos);
    line.setAttribute('stroke', '#e0d8cc');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  }

  container.appendChild(svg);
}

export { hBar, lengthHistogram };
