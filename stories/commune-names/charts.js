/* charts.js — commune-names story */

export function drawNameLengthChart(selector, lenDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const filtered = lenDist.filter(d => d.len >= 1 && d.len <= 35);
  const maxCount = Math.max(...filtered.map(d => d.count));
  const total = filtered.reduce((s, d) => s + d.count, 0);

  const barH = 18;
  const gap = 2;
  const labelW = 32;
  const barMaxW = 340;
  const countW = 54;
  const h = filtered.length * (barH + gap);
  const w = labelW + barMaxW + countW + 8;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.maxWidth = `${w}px`;
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";

  filtered.forEach((d, i) => {
    const y = i * (barH + gap);
    const barW = (d.count / maxCount) * barMaxW;

    // label
    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', labelW - 6);
    lbl.setAttribute('y', y + barH * 0.72);
    lbl.setAttribute('text-anchor', 'end');
    lbl.setAttribute('font-size', '11');
    lbl.setAttribute('fill', '#888');
    lbl.textContent = d.len;
    svg.appendChild(lbl);

    // bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', labelW);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('opacity', '0.75');
    svg.appendChild(rect);

    // count label
    const cnt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    cnt.setAttribute('x', labelW + barW + 5);
    cnt.setAttribute('y', y + barH * 0.72);
    cnt.setAttribute('font-size', '11');
    cnt.setAttribute('fill', '#444');
    cnt.textContent = d.count.toLocaleString('fr-FR');
    svg.appendChild(cnt);
  });

  container.appendChild(svg);
}

export function drawTopNamesChart(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = topNames.slice(0, 20);
  const maxCount = data[0].count;

  const barH = 20;
  const gap = 3;
  const labelW = 200;
  const barMaxW = 180;
  const countW = 32;
  const h = data.length * (barH + gap);
  const w = labelW + barMaxW + countW + 8;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.maxWidth = `${w}px`;
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";

  data.forEach((d, i) => {
    const y = i * (barH + gap);
    const barW = (d.count / maxCount) * barMaxW;

    // name label
    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', labelW - 8);
    lbl.setAttribute('y', y + barH * 0.72);
    lbl.setAttribute('text-anchor', 'end');
    lbl.setAttribute('font-size', '12');
    lbl.setAttribute('fill', '#1a1a1a');
    lbl.setAttribute('font-family', "Georgia, serif");
    lbl.textContent = d.name;
    svg.appendChild(lbl);

    // bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', labelW);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('opacity', '0.72');
    svg.appendChild(rect);

    // count
    const cnt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    cnt.setAttribute('x', labelW + barW + 5);
    cnt.setAttribute('y', y + barH * 0.72);
    cnt.setAttribute('font-size', '11');
    cnt.setAttribute('fill', '#555');
    cnt.textContent = `×${d.count}`;
    svg.appendChild(cnt);
  });

  container.appendChild(svg);
}

export function drawSaintDeptChart(selector, topSaintDepts) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = topSaintDepts.slice(0, 12);
  const maxCount = data[0].saint;

  const barH = 20;
  const gap = 3;
  const labelW = 88;
  const barMaxW = 200;
  const countW = 80;
  const h = data.length * (barH + gap);
  const w = labelW + barMaxW + countW + 8;

  const deptNames = {
    '24': 'Dordogne', '33': 'Gironde', '38': 'Isère', '71': 'Saône-et-Loire',
    '17': 'Charente-Maritime', '76': 'Seine-Maritime', '07': 'Ardèche',
    '63': 'Puy-de-Dôme', '42': 'Loire', '50': 'Manche',
    '27': 'Eure', '30': 'Gard', '61': 'Orne', '23': 'Creuse', '14': 'Calvados'
  };

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.maxWidth = `${w}px`;
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";

  data.forEach((d, i) => {
    const y = i * (barH + gap);
    const barW = (d.saint / maxCount) * barMaxW;
    const deptLabel = deptNames[d.dept] || `Dept ${d.dept}`;

    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', labelW - 8);
    lbl.setAttribute('y', y + barH * 0.72);
    lbl.setAttribute('text-anchor', 'end');
    lbl.setAttribute('font-size', '12');
    lbl.setAttribute('fill', '#1a1a1a');
    lbl.setAttribute('font-family', "Georgia, serif");
    lbl.textContent = deptLabel;
    svg.appendChild(lbl);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', labelW);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('opacity', '0.7');
    svg.appendChild(rect);

    const cnt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    cnt.setAttribute('x', labelW + barW + 6);
    cnt.setAttribute('y', y + barH * 0.72);
    cnt.setAttribute('font-size', '11');
    cnt.setAttribute('fill', '#555');
    cnt.textContent = `${d.saint} (${d.pct}%)`;
    svg.appendChild(cnt);
  });

  container.appendChild(svg);
}
