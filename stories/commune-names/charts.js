export function drawBarChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const max = data[0].count;
  el.innerHTML = data.map((d, i) => {
    const pct = (d.count / max * 100).toFixed(1);
    return `
      <div class="bar-row">
        <div class="bar-rank">${i + 1}</div>
        <div class="bar-label">${d.name}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="bar-value">${d.count}</div>
      </div>`;
  }).join('');
}

export function drawShortTable(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const deptNames = {
    '08': 'Ardennes', '25': 'Doubs', '28': 'Eure-et-Loir', '31': 'Haute-Garonne',
    '38': 'Isère', '61': 'Orne', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
    '70': 'Haute-Saône', '76': 'Seine-Maritime', '80': 'Somme', '95': 'Val-d\'Oise',
    '01': 'Ain', '14': 'Calvados', '51': 'Marne', '34': 'Hérault'
  };

  el.innerHTML = `<table class="names-table">
    <thead><tr><th>Commune</th><th>Département</th><th>Population</th><th>Length</th></tr></thead>
    <tbody>${data.map(d => `
      <tr>
        <td class="name-cell">${d.name}</td>
        <td>${deptNames[d.dept] || d.dept}</td>
        <td>${d.pop.toLocaleString('fr-FR')}</td>
        <td>${d.len} letter${d.len === 1 ? '' : 's'}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}
