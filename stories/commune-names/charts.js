// stories/commune-names/charts.js
// Text-and-charts story: commune name analysis.
// Renders two Chart.js charts and populates extremes tables.

const DEPT_NAMES = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
  '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
  '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud',
  '2B': 'Haute-Corse', '21': "Côte-d'Or", '22': "Côtes-d'Armor", '23': 'Creuse',
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
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
  '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
  '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne', '95': "Val-d'Oise",
  '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane', '974': 'La Réunion',
  '976': 'Mayotte',
};

const ACCENT = '#b32020';
const MUTED  = '#c8a090';

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

function deptLabel(code) {
  return DEPT_NAMES[code] ? `${DEPT_NAMES[code]} (${code})` : code;
}

function drawTopNames(topNames) {
  const top20 = topNames.slice(0, 20);
  const ctx = document.getElementById('chart-top-names');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top20.map(d => d.name),
      datasets: [{
        data: top20.map(d => d.count),
        backgroundColor: top20.map((_, i) => i === 0 ? ACCENT : MUTED),
        borderWidth: 0,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.x} commune${ctx.parsed.x !== 1 ? 's' : ''}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#ece8e0' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#666',
            stepSize: 1,
          },
          title: {
            display: true,
            text: 'Number of communes with this name',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: 'Georgia, serif', size: 12 },
            color: '#1a1a1a',
          },
        },
      },
    },
  });
}

function drawLengthDist(lengthDist) {
  const ctx = document.getElementById('chart-length-dist');
  if (!ctx) return;

  // Group 40+ into one bucket
  const buckets = {};
  lengthDist.forEach(({ len, count }) => {
    const key = len >= 40 ? '40+' : String(len);
    buckets[key] = (buckets[key] || 0) + count;
  });

  const entries = Object.entries(buckets).sort((a, b) => {
    if (a[0] === '40+') return 1;
    if (b[0] === '40+') return -1;
    return +a[0] - +b[0];
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: entries.map(([k]) => k),
      datasets: [{
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(([k]) => k === '1' ? ACCENT : MUTED),
        borderWidth: 0,
        barPercentage: 0.95,
        categoryPercentage: 1.0,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => `${ctx[0].label} character${ctx[0].label === '1' ? '' : 's'}`,
            label: ctx => `${ctx.parsed.y.toLocaleString('fr-FR')} communes`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 10 },
            color: '#888',
            maxRotation: 0,
            callback: (val, i, ticks) => {
              const label = entries[i]?.[0];
              if (!label) return '';
              const n = +label;
              if (label === '40+') return '40+';
              if (n === 1 || n % 5 === 0) return label;
              return '';
            },
          },
          title: {
            display: true,
            text: 'Name length (characters)',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
        y: {
          grid: { color: '#ece8e0' },
          ticks: {
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#666',
          },
          title: {
            display: true,
            text: 'Number of communes',
            font: { family: "'Helvetica Neue', sans-serif", size: 11 },
            color: '#888',
          },
        },
      },
    },
  });
}

function populateExtremes(stats) {
  const shortTbody = document.querySelector('#table-shortest tbody');
  if (shortTbody) {
    shortTbody.innerHTML = stats.shortest.slice(0, 10).map(c =>
      `<tr>
        <td class="place">${c.name} <span class="dept">${deptLabel(c.dept)}</span></td>
        <td>${c.len} chr</td>
      </tr>`
    ).join('');
  }

  const longTbody = document.querySelector('#table-longest tbody');
  if (longTbody) {
    longTbody.innerHTML = stats.longest.slice(0, 8).map(c =>
      `<tr>
        <td class="place" style="font-size:11px">${c.name} <span class="dept">${deptLabel(c.dept)}</span></td>
        <td>${c.len} chr</td>
      </tr>`
    ).join('');
  }
}

async function main() {
  try {
    const stats = await loadJSON('./name-stats.json');
    drawTopNames(stats.topNames);
    drawLengthDist(stats.lengthDist);
    populateExtremes(stats);
  } catch (err) {
    console.error('commune-names charts error:', err);
  }
}

main();
