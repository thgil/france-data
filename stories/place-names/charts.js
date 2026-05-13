// charts.js — place-names story visualisations

const DEPT_NAMES = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhône',
  '14': 'Calvados', '15': 'Cantal', '16': 'Charente', '17': 'Charente-Maritime',
  '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud', '2B': 'Haute-Corse',
  '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor', '23': 'Creuse', '24': 'Dordogne',
  '25': 'Doubs', '26': 'Drôme', '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère',
  '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde', '34': 'Hérault',
  '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère',
  '39': 'Jura', '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire',
  '43': 'Haute-Loire', '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot',
  '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche',
  '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle',
  '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
  '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
  '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
  '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne', '87': 'Haute-Vienne',
  '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort', '91': 'Essonne',
  '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne',
  '95': 'Val-d\'Oise', '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
  '974': 'La Réunion', '976': 'Mayotte',
};

function deptName(code) {
  return DEPT_NAMES[code] || `Dept. ${code}`;
}

/** Render the short-names grid (1–2 letter communes) */
export function renderShortNames(selector, shortNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Show only 1 and 2 letter names in the grid
  const tiny = shortNames.filter(r => r.name.length <= 2);

  container.innerHTML = tiny.map(r => {
    const isY = r.name === 'Y';
    const dept = deptName(r.dept);
    const pop = r.pop ? r.pop.toLocaleString('fr-FR') : '—';
    return `
      <div class="short-name-card${isY ? ' highlight-y' : ''}">
        <span class="sn-name">${r.name}</span>
        <span class="sn-dept">${dept}</span>
        <span class="sn-pop">pop. ${pop}</span>
      </div>`;
  }).join('');
}

/** Render the name-length histogram */
export function renderLengthHistogram(selector, histogram) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  // Only keep lengths up to 45 (no data beyond)
  const data = histogram.filter(d => d.len <= 46);
  const maxCount = Math.max(...data.map(d => d.count));

  // Set canvas size
  const W = canvas.parentElement ? canvas.parentElement.clientWidth : 700;
  const H = parseInt(canvas.getAttribute('height') || 200);
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  const PAD = { top: 16, right: 16, bottom: 36, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  ctx.clearRect(0, 0, W, H);

  const minLen = Math.min(...data.map(d => d.len));
  const maxLen = Math.max(...data.map(d => d.len));
  const numBars = maxLen - minLen + 1;
  const barW = chartW / numBars;

  // Draw bars
  data.forEach(d => {
    const x = PAD.left + (d.len - minLen) * barW;
    const barH = (d.count / maxCount) * chartH;
    const y = PAD.top + chartH - barH;

    ctx.fillStyle = d.len <= 2 ? '#b32020' : '#c8bfb0';
    ctx.fillRect(x + 0.5, y, Math.max(barW - 1, 0.5), barH);
  });

  // X axis
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD.left, PAD.top + chartH);
  ctx.lineTo(PAD.left + chartW, PAD.top + chartH);
  ctx.stroke();

  // X labels (every 5 chars)
  ctx.fillStyle = '#888';
  ctx.font = '11px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  for (let len = minLen; len <= maxLen; len += 5) {
    const x = PAD.left + (len - minLen + 0.5) * barW;
    ctx.fillText(len, x, PAD.top + chartH + 16);
  }

  // Y axis labels
  ctx.textAlign = 'right';
  ctx.fillStyle = '#888';
  [0, Math.round(maxCount / 2), maxCount].forEach(v => {
    const y = PAD.top + chartH - (v / maxCount) * chartH;
    ctx.fillText(v.toLocaleString('fr-FR'), PAD.left - 6, y + 4);
    // gridline
    ctx.strokeStyle = '#e0d8cc';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + chartW, y);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Axis label
  ctx.fillStyle = '#666';
  ctx.font = '11px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Name length (characters)', PAD.left + chartW / 2, H - 4);

  ctx.save();
  ctx.translate(14, PAD.top + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('Communes', 0, 0);
  ctx.restore();

  // Annotation for Y
  const yBar = data.find(d => d.len === 1);
  if (yBar) {
    const x = PAD.left + (1 - minLen + 0.5) * barW;
    const barH = (yBar.count / maxCount) * chartH;
    const y = PAD.top + chartH - barH;
    ctx.fillStyle = '#b32020';
    ctx.font = 'bold 11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Y', x, y - 6);
  }
}

/** Render the top-names horizontal bar chart */
export function renderTopNames(selector, topNames) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  const W = canvas.parentElement ? canvas.parentElement.clientWidth : 700;
  const rowH = 28;
  const PAD = { top: 16, right: 60, bottom: 24, left: 200 };
  const H = PAD.top + topNames.length * rowH + PAD.bottom;

  canvas.width = W;
  canvas.height = H;
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  const chartW = W - PAD.left - PAD.right;
  const maxCount = Math.max(...topNames.map(d => d.count));

  ctx.clearRect(0, 0, W, H);

  topNames.forEach((d, i) => {
    const y = PAD.top + i * rowH;
    const barLen = (d.count / maxCount) * chartW;
    const isSaint = d.name.startsWith('Saint') || d.name.startsWith('Sainte');

    // Bar
    ctx.fillStyle = isSaint ? '#8a1818' : '#c8bfb0';
    ctx.fillRect(PAD.left, y + 6, barLen, rowH - 10);

    // Name label
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `${i === 0 ? 'bold' : 'normal'} 13px Georgia, serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.name, PAD.left - 8, y + rowH / 2);

    // Count label
    ctx.fillStyle = '#444';
    ctx.font = '12px Helvetica Neue, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${d.count}×`, PAD.left + barLen + 6, y + rowH / 2);
  });

  // Legend
  ctx.font = '11px Helvetica Neue, sans-serif';
  ctx.textAlign = 'left';

  ctx.fillStyle = '#8a1818';
  ctx.fillRect(PAD.left, H - PAD.bottom + 6, 12, 10);
  ctx.fillStyle = '#666';
  ctx.fillText('Saint / Sainte name', PAD.left + 16, H - PAD.bottom + 12);

  ctx.fillStyle = '#c8bfb0';
  ctx.fillRect(PAD.left + 160, H - PAD.bottom + 6, 12, 10);
  ctx.fillStyle = '#666';
  ctx.fillText('Other name', PAD.left + 176, H - PAD.bottom + 12);
}
