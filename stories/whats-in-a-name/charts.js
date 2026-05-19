export function drawNameChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = data.top15;
  const maxCount = items[0].count;

  const BAR_H = 28;
  const GAP = 6;
  const LABEL_W = 160;
  const BAR_AREA = 220;
  const COUNT_W = 32;
  const PADDING = { top: 8, right: 16, bottom: 8, left: 16 };
  const totalW = LABEL_W + BAR_AREA + COUNT_W + PADDING.left + PADDING.right;
  const totalH = items.length * (BAR_H + GAP) - GAP + PADDING.top + PADDING.bottom;

  const svgNS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs = {}, text = '') {
    const e = document.createElementNS(svgNS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text) e.textContent = text;
    return e;
  }

  const svg = el('svg', {
    viewBox: `0 0 ${totalW} ${totalH}`,
    width: '100%',
    style: 'display:block;max-width:600px;',
    'aria-label': 'Most repeated commune names in France',
    role: 'img'
  });

  items.forEach((item, i) => {
    const y = PADDING.top + i * (BAR_H + GAP);
    const barW = Math.round((item.count / maxCount) * BAR_AREA);
    const isTop = i === 0;

    // Label
    const label = el('text', {
      x: PADDING.left + LABEL_W - 8,
      y: y + BAR_H / 2 + 5,
      'text-anchor': 'end',
      'font-family': "Georgia, 'Times New Roman', serif",
      'font-size': '13',
      fill: isTop ? '#1a1a1a' : '#3a3a3a',
      'font-weight': isTop ? '700' : '400'
    }, item.name);
    svg.appendChild(label);

    // Bar background
    const bg = el('rect', {
      x: PADDING.left + LABEL_W,
      y,
      width: BAR_AREA,
      height: BAR_H,
      fill: '#ede8e0',
      rx: '2'
    });
    svg.appendChild(bg);

    // Bar fill
    const bar = el('rect', {
      x: PADDING.left + LABEL_W,
      y,
      width: barW,
      height: BAR_H,
      fill: isTop ? '#b32020' : '#8a9e6e',
      rx: '2'
    });
    svg.appendChild(bar);

    // Count label
    const count = el('text', {
      x: PADDING.left + LABEL_W + BAR_AREA + 6,
      y: y + BAR_H / 2 + 5,
      'text-anchor': 'start',
      'font-family': "'Helvetica Neue', Helvetica, Arial, sans-serif",
      'font-size': '12',
      fill: '#555',
      'font-variant-numeric': 'tabular-nums'
    }, `×${item.count}`);
    svg.appendChild(count);
  });

  container.appendChild(svg);
}

export function drawShortTable(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const deptNames = {
    '80': 'Somme', '25': 'Doubs', '28': 'Eure-et-Loir', '76': 'Seine-Maritime',
    '70': 'Haute-Saône', '38': 'Isère', '31': 'Haute-Garonne', '66': 'Pyrénées-Orientales',
    '61': 'Orne', '08': 'Ardennes', '95': 'Val-d\'Oise', '65': 'Hautes-Pyrénées'
  };

  const shorts = data.shortNames.filter(d => d.length <= 2);

  const table = document.createElement('table');
  table.className = 'short-table';

  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>
    <th>Name</th>
    <th>Dept</th>
    <th>Population</th>
  </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  shorts.forEach(d => {
    const tr = document.createElement('tr');
    const deptLabel = deptNames[d.dept] || d.dept;
    tr.innerHTML = `
      <td class="short-name">${d.name}</td>
      <td class="short-dept">${deptLabel} (${d.dept})</td>
      <td class="short-pop">${d.pop.toLocaleString('fr-FR')}</td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.appendChild(table);
}
