/* ── commune-names/charts.js ─────────────────────────────────────── */

export function drawTopNamesChart(containerSelector, stats) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const items = stats.topNames.slice(0, 20);
  const maxCount = items[0].count;

  const LABEL_W = 180;
  const BAR_MAX = 320;
  const ROW_H   = 28;
  const PAD     = { top: 8, right: 60, bottom: 8, left: 0 };
  const W = LABEL_W + BAR_MAX + PAD.right;
  const H = PAD.top + items.length * ROW_H + PAD.bottom;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = "var(--sans, 'Helvetica Neue', sans-serif)";
  svg.style.fontSize   = '13px';
  svg.style.maxWidth   = `${W}px`;

  items.forEach((item, i) => {
    const y = PAD.top + i * ROW_H;
    const barW = (item.count / maxCount) * BAR_MAX;

    const g = document.createElementNS(svgNS, 'g');

    // Label
    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', LABEL_W - 8);
    label.setAttribute('y', y + ROW_H / 2 + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('fill', '#1a1a1a');
    label.setAttribute('font-family', 'Georgia, serif');
    label.setAttribute('font-size', '13');
    label.textContent = item.name;

    // Bar
    const bar = document.createElementNS(svgNS, 'rect');
    bar.setAttribute('x', LABEL_W);
    bar.setAttribute('y', y + 4);
    bar.setAttribute('width', barW);
    bar.setAttribute('height', ROW_H - 8);
    bar.setAttribute('fill', '#b32020');
    bar.setAttribute('rx', '2');

    // Count label
    const countLabel = document.createElementNS(svgNS, 'text');
    countLabel.setAttribute('x', LABEL_W + barW + 6);
    countLabel.setAttribute('y', y + ROW_H / 2 + 4);
    countLabel.setAttribute('fill', '#444');
    countLabel.setAttribute('font-size', '12');
    countLabel.textContent = `×${item.count}`;

    g.appendChild(label);
    g.appendChild(bar);
    g.appendChild(countLabel);
    svg.appendChild(g);
  });

  container.appendChild(svg);
}

export function drawShortTable(containerSelector, stats) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const rows = stats.shortCommunes;
  const table = document.createElement('table');
  table.className = 'names-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Département</th>
        <th>Population</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => `
        <tr>
          <td class="cell-name">${r.name}</td>
          <td class="cell-dept">${r.dept}</td>
          <td class="cell-pop">${r.pop.toLocaleString('fr-FR')}</td>
        </tr>`).join('')}
    </tbody>`;
  container.appendChild(table);
}

export function drawLongTable(containerSelector, stats) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const rows = stats.longCommunes.slice(0, 5);
  const table = document.createElement('table');
  table.className = 'names-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Chars</th>
        <th>Dept</th>
        <th>Pop</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => `
        <tr>
          <td class="cell-name" style="font-size:11px">${r.name}</td>
          <td class="cell-dept">${r.len}</td>
          <td class="cell-dept">${r.dept}</td>
          <td class="cell-pop">${r.pop.toLocaleString('fr-FR')}</td>
        </tr>`).join('')}
    </tbody>`;
  container.appendChild(table);
}
