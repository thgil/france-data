/* charts.js — density-extremes story */

export function drawDenseChart(selector, communes) {
  const container = document.querySelector(selector);
  if (!container) return;

  const top15 = communes.slice(0, 15);
  const MAX_DENSITY = top15[0].density;

  const rowH = 36;
  const labelW = 240;
  const barMaxW = 340;
  const numW = 100;
  const totalW = labelW + barMaxW + numW;
  const totalH = top15.length * rowH + 56;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = 'var(--sans, "Helvetica Neue", sans-serif)';
  svg.style.fontSize = '13px';
  svg.style.display = 'block';

  function el(tag, attrs, text) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // Background
  svg.appendChild(el('rect', { width: totalW, height: totalH, fill: '#faf7f2' }));

  // Header row
  svg.appendChild(el('text', { x: 0, y: 18, fill: '#888', 'font-size': '10',
    'font-weight': '600', 'letter-spacing': '1' }, 'Commune'));
  svg.appendChild(el('text', { x: labelW + barMaxW / 2, y: 18, fill: '#888',
    'font-size': '10', 'font-weight': '600', 'text-anchor': 'middle',
    'letter-spacing': '0.5' }, 'People per km² ▸'));
  svg.appendChild(el('text', { x: totalW, y: 18, fill: '#888', 'font-size': '10',
    'font-weight': '600', 'text-anchor': 'end', 'letter-spacing': '0.5' }, 'pop/km²'));

  top15.forEach((c, i) => {
    const rowY = 24 + i * rowH;
    const midY = rowY + rowH / 2 + 1;

    // Alternating row bg
    if (i % 2 === 0) {
      svg.appendChild(el('rect', { x: 0, y: rowY, width: totalW, height: rowH, fill: '#f5f1ea' }));
    }

    // Bar colour: Paris arrondissements in accent red, suburbs/other in steel blue
    const isParis = c.dept === '75';
    const isInnerSub = ['92', '93', '94'].includes(c.dept);
    const barColour = isParis ? '#b32020' : isInnerSub ? '#2a5a8a' : '#5a8a5a';

    const barW = (c.density / MAX_DENSITY) * barMaxW;
    svg.appendChild(el('rect', { x: labelW, y: rowY + 8, width: barW, height: rowH - 16,
      fill: barColour, opacity: '0.85' }));

    // Label
    const shortName = c.name.replace(' Arrondissement', 'e');
    svg.appendChild(el('text', { x: labelW - 6, y: midY, fill: '#1a1a1a',
      'font-size': '12', 'text-anchor': 'end', 'font-family': 'Georgia, serif' }, shortName));

    // Value
    svg.appendChild(el('text', { x: totalW, y: midY, fill: '#333',
      'font-size': '12', 'text-anchor': 'end',
      'font-variant-numeric': 'tabular-nums' },
      c.density.toLocaleString('fr-FR')));
  });

  // Legend
  const legY = totalH - 6;
  const items = [
    { colour: '#b32020', label: 'Paris arrondissement' },
    { colour: '#2a5a8a', label: 'Inner suburb (Hauts-de-Seine / Val-de-Marne)' },
    { colour: '#5a8a5a', label: 'Other' }
  ];
  let legX = 0;
  items.forEach(({ colour, label }) => {
    svg.appendChild(el('rect', { x: legX, y: legY - 8, width: 10, height: 10,
      fill: colour, rx: '2' }));
    const t = el('text', { x: legX + 14, y: legY, fill: '#888', 'font-size': '10' }, label);
    svg.appendChild(t);
    legX += label.length * 6.2 + 24;
  });

  container.appendChild(svg);
}

export function drawSparseTable(selector, communes) {
  const container = document.querySelector(selector);
  if (!container) return;

  const top10 = communes.slice(0, 10);

  const table = document.createElement('table');
  table.className = 'stats-table sparse-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th class="rank">#</th>
        <th class="place">Commune</th>
        <th style="text-align:right">Area (km²)</th>
        <th style="text-align:right">Population</th>
        <th style="text-align:right">Density (pop/km²)</th>
      </tr>
    </thead>
    <tbody>
      ${top10.map((c, i) => `
        <tr>
          <td class="rank">${i + 1}</td>
          <td class="place">${c.name}<br><span class="dept-tag">${c.deptName}</span></td>
          <td style="text-align:right;font-variant-numeric:tabular-nums">${c.area_km2.toLocaleString('fr-FR')}</td>
          <td style="text-align:right;font-variant-numeric:tabular-nums">${c.pop.toLocaleString('fr-FR')}</td>
          <td style="text-align:right;font-variant-numeric:tabular-nums">${c.densityStr}</td>
        </tr>`).join('')}
    </tbody>`;

  container.appendChild(table);
}
