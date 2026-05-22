// charts.js — commune-names story

export function drawDuplicatesChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const maxCount = data[0].count;
  const rows = data.map((d, i) => {
    const pct = (d.count / maxCount) * 100;
    const isSaint = d.name.toLowerCase().startsWith('saint');
    return `
      <div class="bar-row" style="--i:${i}">
        <div class="bar-label">${escHtml(d.name)}</div>
        <div class="bar-track">
          <div class="bar-fill${isSaint ? ' bar-saint' : ''}" style="width:${pct.toFixed(1)}%"></div>
          <span class="bar-value">${d.count}</span>
        </div>
      </div>`;
  });

  container.innerHTML = rows.join('');
}

export function drawLocativesChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxVal = entries[0][1];

  const rows = entries.map(([suffix, count], i) => {
    const pct = (count / maxVal) * 100;
    return `
      <div class="bar-row" style="--i:${i}">
        <div class="bar-label bar-label-mono">${escHtml(suffix)}</div>
        <div class="bar-track">
          <div class="bar-fill bar-locative"></div>
          <span class="bar-value">${count.toLocaleString('fr-FR')}</span>
        </div>
      </div>`;
  });

  // Animate widths after paint
  container.innerHTML = rows.join('');
  requestAnimationFrame(() => {
    container.querySelectorAll('.bar-fill').forEach((el, i) => {
      const pct = (entries[i][1] / maxVal) * 100;
      el.style.width = pct.toFixed(1) + '%';
    });
  });
}

export function drawLengthHistogram(containerId, distribution) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Group into buckets: 1-5, 6-10, 11-15, 16-20, 21-25, 26+
  const buckets = [
    { label: '1–5', min: 1, max: 5 },
    { label: '6–10', min: 6, max: 10 },
    { label: '11–15', min: 11, max: 15 },
    { label: '16–20', min: 16, max: 20 },
    { label: '21–25', min: 21, max: 25 },
    { label: '26–30', min: 26, max: 30 },
    { label: '31+', min: 31, max: Infinity },
  ];

  const dist = Object.fromEntries(distribution);
  const bucketed = buckets.map(b => ({
    label: b.label,
    count: distribution.filter(([l]) => l >= b.min && l <= b.max).reduce((s, [, c]) => s + c, 0)
  }));

  const maxCount = Math.max(...bucketed.map(b => b.count));

  const bars = bucketed.map((b, i) => {
    const pct = (b.count / maxCount) * 100;
    const height = Math.max(4, Math.round(pct * 1.4));
    return `
      <div class="hist-bar-wrap">
        <div class="hist-bar" style="height:${height}px" title="${b.count.toLocaleString('fr-FR')} communes"></div>
        <div class="hist-label">${b.label}</div>
        <div class="hist-count">${(b.count / 1000).toFixed(1)}k</div>
      </div>`;
  });

  container.innerHTML = `<div class="histogram">${bars.join('')}</div>`;
}

export function populateShortestTable(containerId, shortest) {
  const tbody = document.querySelector(`#${containerId} tbody`);
  if (!tbody) return;
  tbody.innerHTML = shortest.slice(0, 10).map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${escHtml(d.name)}</td>
      <td>${d.len}</td>
      <td class="muted">${escHtml(deptName(d.dept))}</td>
      <td class="num">${d.pop.toLocaleString('fr-FR')}</td>
    </tr>`
  ).join('');
}

export function populateLongestTable(containerId, longest) {
  const tbody = document.querySelector(`#${containerId} tbody`);
  if (!tbody) return;
  tbody.innerHTML = longest.slice(0, 8).map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place long-name">${escHtml(d.name)}</td>
      <td>${d.len}</td>
      <td class="num">${d.pop.toLocaleString('fr-FR')}</td>
    </tr>`
  ).join('');
}

export function drawTerminalChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const maxVal = data[0].count;
  const rows = data.map((d, i) => {
    const pct = (d.count / maxVal) * 100;
    return `
      <div class="bar-row" style="--i:${i}">
        <div class="bar-label bar-label-mono">-${escHtml(d.word)}</div>
        <div class="bar-track">
          <div class="bar-fill bar-terminal" style="width:${pct.toFixed(1)}%"></div>
          <span class="bar-value">${d.count}</span>
        </div>
      </div>`;
  });
  container.innerHTML = rows.join('');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function deptName(code) {
  const map = {
    '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
    '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
    '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
    '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
    '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '21': 'Côte-d\'Or',
    '22': 'Côtes-d\'Armor', '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs',
    '26': 'Drôme', '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère',
    '2A': 'Corse-du-Sud', '2B': 'Haute-Corse', '30': 'Gard', '31': 'Haute-Garonne',
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
    '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne', '87': 'Haute-Vienne',
    '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
    '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
    '94': 'Val-de-Marne', '95': 'Val-d\'Oise',
    '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
    '974': 'La Réunion', '976': 'Mayotte',
  };
  return map[code] || `Dept ${code}`;
}
