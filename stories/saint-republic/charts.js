// charts.js — saint-republic story charts

export function drawTopNamesChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const top = data.topNames.slice(0, 15);
  const max = top[0].count;

  el.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'bar-chart-table';

  top.forEach((d, i) => {
    const row = document.createElement('tr');
    const pct = (d.count / max) * 100;
    const isSaint = d.name.startsWith('Saint') || d.name.startsWith('Sainte');

    row.innerHTML = `
      <td class="bct-rank">${i + 1}</td>
      <td class="bct-label">${escHtml(d.name)}</td>
      <td class="bct-bar-cell">
        <div class="bct-bar-wrap">
          <div class="bct-bar ${isSaint ? 'bct-bar-saint' : 'bct-bar-other'}" style="width:${pct.toFixed(1)}%"></div>
        </div>
      </td>
      <td class="bct-val">${d.count}×</td>
    `;
    table.appendChild(row);
  });

  el.appendChild(table);
}

export function drawLengthChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const dist = data.lenDist;
  const maxCount = Math.max(...dist.map(d => d.count));

  el.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'len-chart';

  const bars = document.createElement('div');
  bars.className = 'len-bars';

  dist.forEach(d => {
    const bar = document.createElement('div');
    bar.className = 'len-bar-col';
    const h = Math.max(2, (d.count / maxCount) * 160);
    bar.innerHTML = `
      <div class="len-bar" style="height:${h}px" title="${d.length} chars: ${d.count.toLocaleString('fr-FR')} communes"></div>
      ${d.length % 5 === 0 ? `<div class="len-label">${d.length}</div>` : '<div class="len-label-empty"></div>'}
    `;
    bars.appendChild(bar);
  });

  wrap.appendChild(bars);

  const caption = document.createElement('p');
  caption.className = 'len-caption';
  caption.textContent = 'Number of communes by name length (in characters). Hover for exact counts.';
  wrap.appendChild(caption);

  el.appendChild(wrap);
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
