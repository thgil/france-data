/* commune-names story — data + chart rendering */

const DATA = {
  topNames: [{"name":"Sainte-Colombe","count":12},{"name":"Saint-Sauveur","count":11},{"name":"Saint-Aubin","count":10},{"name":"Beaulieu","count":10},{"name":"Saint-Marcel","count":9},{"name":"Saint-Michel","count":9},{"name":"Le Pin","count":9},{"name":"Saint-Pierre","count":9},{"name":"Sainte-Marie","count":9},{"name":"Saint-Rémy","count":8},{"name":"Saint-Clément","count":8},{"name":"Saint-Hilaire","count":8},{"name":"Saint-Loup","count":8},{"name":"Beaumont","count":8},{"name":"Verrières","count":8}],

  lengthDist: [{"length":1,"count":1},{"length":2,"count":13},{"length":3,"count":154},{"length":4,"count":720},{"length":5,"count":1969},{"length":6,"count":3223},{"length":7,"count":3695},{"length":8,"count":3695},{"length":9,"count":3000},{"length":10,"count":2522},{"length":11,"count":1884},{"length":12,"count":1435},{"length":13,"count":1167},{"length":14,"count":1018},{"length":15,"count":1095},{"length":16,"count":1177},{"length":17,"count":1186},{"length":18,"count":1202},{"length":19,"count":1117},{"length":20,"count":1028},{"length":21,"count":923},{"length":22,"count":819},{"length":23,"count":649},{"length":24,"count":501},{"length":25,"count":329},{"length":26,"count":200},{"length":27,"count":105},{"length":28,"count":55},{"length":29,"count":53},{"length":30,"count":29},{"length":31,"count":12},{"length":32,"count":8},{"length":33,"count":2},{"length":34,"count":6},{"length":35,"count":7},{"length":"36+","count":15}],

  topWords: [{"word":"saint","count":4090},{"word":"sainte","count":360},{"word":"martin","count":255},{"word":"bois","count":217},{"word":"pierre","count":180},{"word":"chapelle","count":178},{"word":"jean","count":170},{"word":"val","count":130},{"word":"germain","count":120},{"word":"mer","count":109},{"word":"villers","count":108},{"word":"mont","count":102},{"word":"château","count":95},{"word":"ville","count":93},{"word":"grand","count":88}],

  topSaintDepts: [{"dept":"07","name":"Ardèche","saints":97,"total":335,"ratio":29.0},{"dept":"23","name":"Creuse","saints":72,"total":255,"ratio":28.2},{"dept":"42","name":"Loire","saints":89,"total":320,"ratio":27.8},{"dept":"87","name":"Haute-Vienne","saints":53,"total":195,"ratio":27.2},{"dept":"24","name":"Dordogne","saints":130,"total":503,"ratio":25.8},{"dept":"85","name":"Vendée","saints":62,"total":253,"ratio":24.5},{"dept":"48","name":"Lozère","saints":37,"total":152,"ratio":24.3},{"dept":"43","name":"Haute-Loire","saints":62,"total":257,"ratio":24.1},{"dept":"19","name":"Corrèze","saints":63,"total":277,"ratio":22.7},{"dept":"33","name":"Gironde","saints":121,"total":534,"ratio":22.7},{"dept":"30","name":"Gard","saints":79,"total":350,"ratio":22.6},{"dept":"17","name":"Charente-Maritime","saints":101,"total":462,"ratio":21.9}],

  twoLetterCommunes: [{"name":"Eu","pop":6591,"dept":"76","code":"76255"},{"name":"Bû","pop":2022,"dept":"28","code":"28064"},{"name":"Us","pop":1338,"dept":"95","code":"95625"},{"name":"Gy","pop":1001,"dept":"70","code":"70282"},{"name":"Ry","pop":775,"dept":"76","code":"76548"},{"name":"Ur","pop":348,"dept":"66","code":"66218"},{"name":"Oz","pop":213,"dept":"38","code":"38289"},{"name":"Ri","pop":156,"dept":"61","code":"61349"},{"name":"Oô","pop":103,"dept":"31","code":"31404"},{"name":"By","pop":86,"dept":"25","code":"25104"},{"name":"Py","pop":79,"dept":"66","code":"66155"},{"name":"Sy","pop":54,"dept":"08","code":"08434"},{"name":"Uz","pop":36,"dept":"65","code":"65458"}],

  topDupes: [{"name":"Sainte-Colombe","count":12},{"name":"Saint-Sauveur","count":11},{"name":"Saint-Aubin","count":10},{"name":"Beaulieu","count":10},{"name":"Saint-Marcel","count":9},{"name":"Saint-Michel","count":9},{"name":"Le Pin","count":9},{"name":"Saint-Pierre","count":9},{"name":"Sainte-Marie","count":9},{"name":"Saint-Rémy","count":8},{"name":"Saint-Clément","count":8},{"name":"Saint-Hilaire","count":8}]
};

const PAPER = '#faf7f2';
const INK = '#1a1a1a';
const ACCENT = '#b32020';
const MUTE = '#888';

const chartDefaults = {
  plugins: { legend: { display: false }, tooltip: { callbacks: {} } },
  scales: {
    x: { grid: { color: '#ebe7df' }, ticks: { color: MUTE, font: { family: 'Helvetica Neue, sans-serif', size: 11 } } },
    y: { grid: { color: '#ebe7df' }, ticks: { color: MUTE, font: { family: 'Helvetica Neue, sans-serif', size: 11 } } }
  }
};

/* ── Two-letter grid ─────────────────────────────────────────── */
(function buildTwoLetterGrid() {
  const grid = document.getElementById('twoLetterGrid');
  if (!grid) return;
  DATA.twoLetterCommunes.forEach(c => {
    const div = document.createElement('div');
    div.className = 'two-letter-chip';
    div.innerHTML = `<span class="chip-name">${c.name}</span><span class="chip-meta">dept ${c.dept} · pop ${c.pop.toLocaleString('fr-FR')}</span>`;
    grid.appendChild(div);
  });
})();

/* ── Duplicate table ─────────────────────────────────────────── */
(function buildDupeTable() {
  const tbody = document.getElementById('dupeTableBody');
  if (!tbody) return;
  DATA.topDupes.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="name-cell">${d.name}</td><td style="color:#666;font-size:13px;">${d.count} communes in ${d.count > 1 ? 'multiple' : '1'} département${d.count > 1 ? 's' : ''}</td><td class="count-cell">${d.count}×</td>`;
    tbody.appendChild(tr);
  });
})();

/* ── Length distribution chart ───────────────────────────────── */
(function buildLengthChart() {
  const ctx = document.getElementById('lengthChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.lengthDist.map(d => d.length),
      datasets: [{
        data: DATA.lengthDist.map(d => d.count),
        backgroundColor: DATA.lengthDist.map((d, i) => {
          const len = typeof d.length === 'number' ? d.length : 37;
          return len <= 2 ? ACCENT : (len === 7 || len === 8 ? '#6b3020' : '#c8b89a');
        }),
        borderWidth: 0,
        barPercentage: 0.9,
        categoryPercentage: 1.0
      }]
    },
    options: {
      ...chartDefaults,
      plugins: {
        ...chartDefaults.plugins,
        tooltip: {
          callbacks: {
            title: items => `${items[0].label} characters`,
            label: items => `${items[0].raw.toLocaleString('fr-FR')} communes`
          }
        }
      },
      scales: {
        x: {
          ...chartDefaults.scales.x,
          title: { display: true, text: 'Name length (characters)', color: MUTE, font: { size: 11 } }
        },
        y: {
          ...chartDefaults.scales.y,
          title: { display: true, text: 'Communes', color: MUTE, font: { size: 11 } }
        }
      }
    }
  });
})();

/* ── Top words chart ─────────────────────────────────────────── */
(function buildWordsChart() {
  const ctx = document.getElementById('wordsChart');
  if (!ctx) return;
  const words = DATA.topWords.slice().reverse();
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: words.map(d => d.word),
      datasets: [{
        data: words.map(d => d.count),
        backgroundColor: words.map(d => d.word === 'saint' || d.word === 'sainte' ? ACCENT : '#c8b89a'),
        borderWidth: 0,
        barPercentage: 0.7,
        categoryPercentage: 0.9
      }]
    },
    options: {
      ...chartDefaults,
      indexAxis: 'y',
      plugins: {
        ...chartDefaults.plugins,
        tooltip: {
          callbacks: {
            title: items => `"${items[0].label}"`,
            label: items => `appears in ${items[0].raw.toLocaleString('fr-FR')} commune names`
          }
        }
      },
      scales: {
        x: { ...chartDefaults.scales.x, title: { display: true, text: 'Occurrences in commune names', color: MUTE, font: { size: 11 } } },
        y: { ...chartDefaults.scales.y, ticks: { ...chartDefaults.scales.y.ticks, font: { family: 'Georgia, serif', size: 13 } } }
      }
    }
  });
})();

/* ── Saint département chart ─────────────────────────────────── */
(function buildSaintDeptChart() {
  const ctx = document.getElementById('saintDeptChart');
  if (!ctx) return;
  const depts = DATA.topSaintDepts.slice().reverse();
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: depts.map(d => d.name),
      datasets: [{
        data: depts.map(d => d.ratio),
        backgroundColor: '#c8b89a',
        borderWidth: 0,
        barPercentage: 0.7,
        categoryPercentage: 0.9
      }]
    },
    options: {
      ...chartDefaults,
      indexAxis: 'y',
      plugins: {
        ...chartDefaults.plugins,
        tooltip: {
          callbacks: {
            title: items => items[0].label,
            label: items => {
              const d = DATA.topSaintDepts.find(x => x.name === items[0].label);
              return `${items[0].raw}% — ${d.saints} of ${d.total} communes`;
            }
          }
        }
      },
      scales: {
        x: { ...chartDefaults.scales.x, title: { display: true, text: '% of communes starting with Saint/Sainte', color: MUTE, font: { size: 11 } } },
        y: { ...chartDefaults.scales.y, ticks: { ...chartDefaults.scales.y.ticks, font: { size: 12 } } }
      }
    }
  });
})();

/* ── Top names chart ─────────────────────────────────────────── */
(function buildTopNamesChart() {
  const ctx = document.getElementById('topNamesChart');
  if (!ctx) return;
  const names = DATA.topNames.slice().reverse();
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: names.map(d => d.name),
      datasets: [{
        data: names.map(d => d.count),
        backgroundColor: names.map(d => d.name === 'Sainte-Colombe' ? ACCENT : '#c8b89a'),
        borderWidth: 0,
        barPercentage: 0.7,
        categoryPercentage: 0.9
      }]
    },
    options: {
      ...chartDefaults,
      indexAxis: 'y',
      plugins: {
        ...chartDefaults.plugins,
        tooltip: {
          callbacks: {
            title: items => items[0].label,
            label: items => `${items[0].raw} communes share this name`
          }
        }
      },
      scales: {
        x: {
          ...chartDefaults.scales.x,
          ticks: { ...chartDefaults.scales.x.ticks, stepSize: 1 },
          title: { display: true, text: 'Number of communes with this exact name', color: MUTE, font: { size: 11 } }
        },
        y: { ...chartDefaults.scales.y, ticks: { ...chartDefaults.scales.y.ticks, font: { family: 'Georgia, serif', size: 12 } } }
      }
    }
  });
})();
