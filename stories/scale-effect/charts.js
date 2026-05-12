const ACCENT = '#c0392b';

export function drawDesertChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const brackets = stats.brackets;
  const maxPct = Math.max(...brackets.map(b => b.pctDesert));

  const table = document.createElement('div');
  table.className = 'bracket-table';

  for (const b of brackets) {
    const barWidth = (b.pctDesert / maxPct * 100).toFixed(1);
    // Highlight the paradox brackets
    const isParadox = b.lo === 10000;
    const row = document.createElement('div');
    row.className = 'bracket-row' + (isParadox ? ' bracket-row--paradox' : '');
    row.innerHTML = `
      <div class="bracket-label">${b.label}</div>
      <div class="bracket-bars">
        <div class="bracket-bar-wrap">
          <div class="bracket-bar" style="width:calc(${barWidth}% * 0.72); max-width:380px"></div>
          <span class="bracket-bar-pct">${b.pctDesert}% desert</span>
          ${isParadox ? '<span class="bracket-tag">↑ paradox</span>' : ''}
        </div>
        <div class="bracket-subtext">${b.communes.toLocaleString()} communes · avg APL ${b.avgAPL}</div>
      </div>
    `;
    table.appendChild(row);
  }

  el.replaceChildren(table);
}

export function drawExceptionsTable(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const wrap = document.createElement('div');
  wrap.className = 'exceptions-grid';

  // Small but mighty
  const colA = document.createElement('div');
  colA.className = 'exc-col';
  colA.innerHTML = `<h3 class="exc-heading">Small communes, exceptional access</h3>`;
  const tableA = document.createElement('table');
  tableA.className = 'exc-table';
  tableA.innerHTML = `<thead><tr><th>Commune</th><th>Pop.</th><th>APL</th></tr></thead>`;
  const bodyA = document.createElement('tbody');
  for (const c of stats.smallHighAPL) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.name} <span class="dept-badge">${c.dept}</span></td><td>${c.pop.toLocaleString()}</td><td class="apl-good">${c.apl.toFixed(1)}</td>`;
    bodyA.appendChild(tr);
  }
  tableA.appendChild(bodyA);
  colA.appendChild(tableA);

  // Big but barren
  const colB = document.createElement('div');
  colB.className = 'exc-col';
  colB.innerHTML = `<h3 class="exc-heading">Large communes still in the desert</h3>`;
  const tableB = document.createElement('table');
  tableB.className = 'exc-table';
  tableB.innerHTML = `<thead><tr><th>Commune</th><th>Pop.</th><th>APL</th></tr></thead>`;
  const bodyB = document.createElement('tbody');
  for (const c of stats.largeDeserts) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.name} <span class="dept-badge">${c.dept}</span></td><td>${c.pop.toLocaleString()}</td><td class="apl-bad">${c.apl.toFixed(2)}</td>`;
    bodyB.appendChild(tr);
  }
  tableB.appendChild(bodyB);
  colB.appendChild(tableB);

  wrap.appendChild(colA);
  wrap.appendChild(colB);
  el.replaceChildren(wrap);
}
