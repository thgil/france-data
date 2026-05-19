// stories/name-games/charts.js
// Bar chart of most-duplicated commune names; short-name card grid.

export function drawDupesChart(selector, topDupes) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = topDupes.slice(0, 12);
  const maxCount = data[0].count;

  const BAR_COLOR = '#8b2020';
  const TRACK_COLOR = '#e8e0d4';

  const rows = data.map((d, i) => {
    const pct = (d.count / maxCount) * 100;
    const deptLabel = d.depts.slice(0, 4).join(', ') + (d.depts.length > 4 ? ` +${d.depts.length - 4}` : '');
    return `
      <div class="dupes-row" style="display:grid;grid-template-columns:140px 1fr 32px;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid #ece8e0;">
        <span style="font-family:Georgia,serif;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${d.name}">${d.name}</span>
        <div style="position:relative;height:14px;background:${TRACK_COLOR};border-radius:2px;overflow:hidden;">
          <div style="position:absolute;left:0;top:0;height:100%;width:${pct.toFixed(1)}%;background:${BAR_COLOR};border-radius:2px;transition:width 0.8s ease ${i * 0.05}s;"></div>
          <span style="position:absolute;left:${pct > 50 ? 4 : pct + 2}%;top:50%;transform:translateY(-50%);font-size:10px;color:${pct > 50 ? '#faf7f2' : '#666'};white-space:nowrap;pointer-events:none;">${deptLabel}</span>
        </div>
        <span style="font-size:13px;font-variant-numeric:tabular-nums;text-align:right;color:#333;">${d.count}</span>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div style="font-family:'Helvetica Neue',sans-serif;">
      <div style="display:grid;grid-template-columns:140px 1fr 32px;gap:10px;padding:0 0 6px;border-bottom:2px solid #1a1a1a;margin-bottom:2px;">
        <span style="font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#888;">Name</span>
        <span style="font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#888;">Departments</span>
        <span style="font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#888;text-align:right;">#</span>
      </div>
      ${rows}
    </div>`;
}

export function drawShortNamesGrid(selector, shortest) {
  const container = document.querySelector(selector);
  if (!container) return;

  const cards = shortest.map(s => {
    const DEPT_NAMES = {
      '08': 'Ardennes', '14': 'Calvados', '19': 'Corrèze', '23': 'Creuse',
      '25': 'Doubs', '26': 'Drôme', '28': 'Eure-et-Loir', '31': 'Haute-Garonne',
      '38': 'Isère', '40': 'Landes', '46': 'Lot', '50': 'Manche',
      '61': 'Orne', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
      '70': 'Haute-Saône', '76': 'Seine-Maritime', '80': 'Somme',
      '95': 'Val-d\'Oise',
    };
    const deptName = DEPT_NAMES[s.dept] || `Dept. ${s.dept}`;
    return `
      <div style="border:1px solid #d8d0c0;border-radius:4px;padding:14px 16px;background:#fff;">
        <div style="font-family:Georgia,serif;font-size:28px;font-weight:700;letter-spacing:1px;color:#1a1a1a;margin-bottom:4px;">${s.name}</div>
        <div style="font-size:11px;color:#888;">${deptName}</div>
        <div style="font-size:11px;color:#888;">${(s.pop || 0).toLocaleString('fr-FR')} residents</div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px;">
      ${cards}
    </div>`;
}
