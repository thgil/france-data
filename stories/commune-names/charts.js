// stories/commune-names/charts.js
// Renders two charts for the commune-names story:
//   drawPrefixChart(selector, prefixes)  — horizontal bar chart of top name prefixes
//   drawDupTable(selector, dupNames)     — ranked table of most-duplicated names

const ACCENT = '#b32020';
const INK    = '#1a1a1a';
const MUTED  = '#888';
const RULE   = '#e0d8cc';
const PAPER  = '#faf7f2';

export function drawPrefixChart(selector, prefixes) {
  const container = document.querySelector(selector);
  if (!container || !prefixes || !prefixes.length) return;

  const W        = container.clientWidth || 640;
  const BAR_H    = 28;
  const GAP      = 6;
  const LABEL_W  = 130;
  const COUNT_W  = 52;
  const PAD_TOP  = 8;
  const PAD_BOT  = 8;

  const data    = prefixes.slice(0, 12);
  const maxVal  = data[0].count;
  const barAreaW = W - LABEL_W - COUNT_W - 24;
  const H        = PAD_TOP + data.length * (BAR_H + GAP) - GAP + PAD_BOT;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  svg.style.fontSize = '13px';

  data.forEach((d, i) => {
    const y     = PAD_TOP + i * (BAR_H + GAP);
    const barW  = Math.max(2, Math.round((d.count / maxVal) * barAreaW));
    const isSaint = d.prefix === 'Saint' || d.prefix === 'Sainte';

    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', LABEL_W - 8);
    label.setAttribute('y', y + BAR_H / 2 + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('fill', INK);
    label.setAttribute('font-size', '13');
    label.textContent = d.prefix + '-';
    svg.appendChild(label);

    // Bar background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', LABEL_W);
    bg.setAttribute('y', y);
    bg.setAttribute('width', barAreaW);
    bg.setAttribute('height', BAR_H);
    bg.setAttribute('fill', '#ede8e0');
    svg.appendChild(bg);

    // Bar fill
    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar.setAttribute('x', LABEL_W);
    bar.setAttribute('y', y);
    bar.setAttribute('width', barW);
    bar.setAttribute('height', BAR_H);
    bar.setAttribute('fill', isSaint ? ACCENT : INK);
    bar.setAttribute('opacity', isSaint ? '1' : '0.65');
    svg.appendChild(bar);

    // Count label
    const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    count.setAttribute('x', LABEL_W + barAreaW + 8);
    count.setAttribute('y', y + BAR_H / 2 + 4);
    count.setAttribute('fill', MUTED);
    count.setAttribute('font-size', '12');
    count.setAttribute('font-variant-numeric', 'tabular-nums');
    count.textContent = d.count.toLocaleString('fr-FR');
    svg.appendChild(count);
  });

  container.appendChild(svg);
}

export function drawDupTable(selector, dupNames) {
  const container = document.querySelector(selector);
  if (!container || !dupNames || !dupNames.length) return;

  const table = document.createElement('table');
  table.className = 'dup-table';
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  `;

  const tbody = document.createElement('tbody');
  dupNames.slice(0, 15).forEach((d, i) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = `1px solid ${RULE}`;

    const rank = document.createElement('td');
    rank.style.cssText = `padding: 6px 8px 6px 0; color: ${MUTED}; font-size: 11px; width: 2em; vertical-align: baseline;`;
    rank.textContent = i + 1;

    const name = document.createElement('td');
    name.style.cssText = `padding: 6px 0; font-family: Georgia, serif; font-size: 15px; vertical-align: baseline;`;
    name.textContent = d.name;

    const countCell = document.createElement('td');
    countCell.style.cssText = `padding: 6px 0; text-align: right; font-variant-numeric: tabular-nums; color: #333; vertical-align: baseline;`;
    countCell.textContent = `${d.count}×`;

    tr.appendChild(rank);
    tr.appendChild(name);
    tr.appendChild(countCell);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}
