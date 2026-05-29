/* name-game/charts.js — commune name analysis charts */

const DEPT_NAMES = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
  '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
  '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud',
  '2B': 'Haute-Corse', '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor', '23': 'Creuse',
  '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure',
  '28': 'Eure-et-Loir', '29': 'Finistère', '30': 'Gard', '31': 'Haute-Garonne',
  '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
  '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
  '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
  '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
  '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
  '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
  '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
  '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
  '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
  '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne',
  '78': 'Yvelines', '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn',
  '82': 'Tarn-et-Garonne', '83': 'Var', '84': 'Vaucluse', '85': 'Vendée',
  '86': 'Vienne', '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne',
  '90': 'Territoire de Belfort', '91': 'Essonne', '92': 'Hauts-de-Seine',
  '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne', '95': 'Val-d\'Oise',
  '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
  '974': 'La Réunion', '976': 'Mayotte',
};

const CHART_COLORS = {
  bar: '#8b6f47',
  barLight: 'rgba(139,111,71,0.15)',
  accent: '#c67c00',
  grid: '#e8e0d4',
  text: '#555',
};

Chart.defaults.font.family = "'Helvetica Neue', Helvetica, Arial, sans-serif";
Chart.defaults.color = CHART_COLORS.text;

async function main() {
  const res = await fetch('./name-data.json');
  if (!res.ok) throw new Error('Failed to load name-data.json');
  const d = await res.json();

  buildShortNamesGrid(d.shortCommunes);
  buildLengthChart(d.lengthDist);
  buildTopNamesChart(d.topNames);
  buildSaintDeptsTable(d.topSaintDepts);
  buildTopNamesTable(d.topNames);

  const saintPctEl = document.getElementById('saint-pct');
  if (saintPctEl) saintPctEl.textContent = d.saintPct + '%';
}

function buildShortNamesGrid(shortCommunes) {
  const container = document.getElementById('short-names-container');
  if (!container) return;
  const grid = document.createElement('div');
  grid.className = 'short-names-grid';
  for (const c of shortCommunes) {
    const row = document.createElement('div');
    row.className = 'short-name-row';
    const deptName = DEPT_NAMES[c.dept] || `dept ${c.dept}`;
    row.innerHTML = `
      <span class="sn-name">${c.name}</span>
      <span>${c.pop.toLocaleString('fr-FR')} residents</span>
      <span class="sn-dept">${deptName}</span>
    `;
    grid.appendChild(row);
  }
  container.appendChild(grid);
}

function buildLengthChart(lengthDist) {
  const ctx = document.getElementById('chart-lengths');
  if (!ctx) return;

  // Only show lengths 1..35 (long tail is tiny after 35)
  const filtered = lengthDist.filter(d => d.len <= 35 && d.count > 0);
  const labels = filtered.map(d => d.len);
  const counts = filtered.map(d => d.count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Communes',
        data: counts,
        backgroundColor: filtered.map(d =>
          (d.len >= 7 && d.len <= 9) ? CHART_COLORS.accent : CHART_COLORS.bar
        ),
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ([item]) => `${item.label} characters`,
            label: (item) => `${item.raw.toLocaleString('fr-FR')} communes`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Characters in commune name',
            font: { size: 11 },
            color: '#888',
          },
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
        y: {
          title: {
            display: true,
            text: 'Number of communes',
            font: { size: 11 },
            color: '#888',
          },
          grid: { color: CHART_COLORS.grid },
          ticks: {
            font: { size: 11 },
            callback: v => v.toLocaleString('fr-FR'),
          },
        },
      },
    },
  });
}

function buildTopNamesChart(topNames) {
  const ctx = document.getElementById('chart-names');
  if (!ctx) return;

  const top15 = topNames.slice(0, 15).reverse();
  const labels = top15.map(d => d.name);
  const counts = top15.map(d => d.count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Communes',
        data: counts,
        backgroundColor: top15.map(d =>
          d.name === 'Sainte-Colombe' ? CHART_COLORS.accent : CHART_COLORS.bar
        ),
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => `${item.raw} communes share this name`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Number of communes with this name',
            font: { size: 11 },
            color: '#888',
          },
          grid: { color: CHART_COLORS.grid },
          ticks: {
            stepSize: 1,
            font: { size: 11 },
          },
          min: 0,
          max: 14,
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { size: 12, family: 'Georgia, serif' },
          },
        },
      },
    },
  });
}

function buildSaintDeptsTable(topSaintDepts) {
  const tbody = document.querySelector('#table-saint-depts tbody');
  if (!tbody) return;
  tbody.innerHTML = topSaintDepts.slice(0, 8).map((d, i) => {
    const name = DEPT_NAMES[d.dept] || `dept ${d.dept}`;
    return `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${name}</td>
      <td>${d.ratio}%</td>
    </tr>`;
  }).join('');
}

function buildTopNamesTable(topNames) {
  const tbody = document.querySelector('#table-top-names tbody');
  if (!tbody) return;
  tbody.innerHTML = topNames.slice(0, 8).map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${d.name}</td>
      <td>${d.count} communes</td>
    </tr>`
  ).join('');
}

main().catch(err => console.error('name-game charts error:', err));
