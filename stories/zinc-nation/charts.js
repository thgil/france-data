// Commune type classifier for bar chart colouring
const SKI_COMMUNES = new Set([
  'Les Deux Alpes', 'Morzine', 'Orcières', 'Risoul', 'Châtel', "Val-d'Isère",
  'Les Gets', 'Courchevel', 'Tignes', 'Champagny-en-Vanoise', 'La Salle-les-Alpes',
  'Montriond', 'Dévoluy', 'Les Allues', 'Les Belleville', 'Samoëns',
  'Chamonix-Mont-Blanc', 'Bagnères-de-Luchon', 'Laveissière',
]);

const SEA_COMMUNES = new Set([
  'Rogliano', 'Saint-Florent', 'Saint-Tropez', 'Deauville', 'Soorts-Hossegor',
  'Le Touquet-Paris-Plage', 'Le Lavandou', 'Noirmoutier-en-l\'Île',
  'Île-aux-Moines', 'La Roche-Bernard',
]);

function getType(name) {
  if (SKI_COMMUNES.has(name)) return 'ski';
  if (SEA_COMMUNES.has(name)) return 'sea';
  // Paris arrondissements
  if (/^Paris \d/.test(name)) return 'city';
  return 'other';
}

function renderCommuneChart(communes, maxVal) {
  const container = document.getElementById('chart-communes');
  if (!container) return;

  const rows = communes.map(c => {
    const type = getType(c.name);
    const pct = (c.per1k / maxVal * 100).toFixed(1);
    const displayName = c.name.replace(/ Arrondissement$/, '');
    return `
      <div class="bar-row">
        <div class="bar-label" title="${c.name}">${displayName}<span class="dept-tag">${c.dept}</span></div>
        <div class="bar-track">
          <div class="bar-fill ${type}" style="width:${pct}%"></div>
        </div>
        <div class="bar-value">${c.per1k.toFixed(1)}</div>
      </div>`;
  });

  container.innerHTML = rows.join('');
}

function renderDeptTable(depts, tableId, isBottom) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;

  const rows = depts.map((d, i) => `
    <tr>
      <td class="rank">${isBottom ? '▼' : i + 1}</td>
      <td class="place">${d.name}</td>
      <td>${d.per1k.toFixed(2)}<span style="font-size:10px;color:#aaa">/1k</span></td>
    </tr>`);

  tbody.innerHTML = rows.join('');
}

function renderBigNumbers(stats) {
  const topCommune = stats.topCommunes[0];
  const el = id => document.getElementById(id);

  if (topCommune) {
    const stat1 = el('stat-top-per1k');
    if (stat1) stat1.textContent = topCommune.per1k.toFixed(1);

    const mult = el('stat-multiplier');
    if (mult) mult.textContent = Math.round(topCommune.per1k / stats.nationalAvg) + '×';
  }

  const zeroPct = el('stat-zero-pct');
  if (zeroPct) zeroPct.textContent = stats.zeroBarPct.toFixed(0) + '%';
}

export function renderCharts(stats) {
  renderBigNumbers(stats);

  const topN = stats.topCommunes.slice(0, 20);
  const maxVal = topN[0]?.per1k ?? 1;
  renderCommuneChart(topN, maxVal);

  renderDeptTable(stats.topDepts.slice(0, 8), 'table-top-depts', false);
  renderDeptTable(stats.bottomDepts.slice(-8).reverse(), 'table-bottom-depts', true);
}
