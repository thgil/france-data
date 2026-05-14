// charts.js — commune-names story
// Requires Chart.js loaded globally via CDN script tag.

const FONT_SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_SERIF = "Georgia, 'Times New Roman', serif";

const PALETTE = {
  primary: '#8b6914',
  primaryLight: 'rgba(139, 105, 20, 0.75)',
  grid: '#e8e0d4',
  text: '#1a1a1a',
  muted: '#888888',
};

function deptName(deptCode) {
  const map = {
    '01':'Ain','02':'Aisne','03':'Allier','04':'Alpes-de-Haute-Provence','05':'Hautes-Alpes',
    '06':'Alpes-Maritimes','07':'Ardèche','08':'Ardennes','09':'Ariège','10':'Aube',
    '11':'Aude','12':'Aveyron','13':'Bouches-du-Rhône','14':'Calvados','15':'Cantal',
    '16':'Charente','17':'Charente-Maritime','18':'Cher','19':'Corrèze','2A':'Corse-du-Sud',
    '2B':'Haute-Corse','21':'Côte-d\'Or','22':'Côtes-d\'Armor','23':'Creuse','24':'Dordogne',
    '25':'Doubs','26':'Drôme','27':'Eure','28':'Eure-et-Loir','29':'Finistère',
    '30':'Gard','31':'Haute-Garonne','32':'Gers','33':'Gironde','34':'Hérault',
    '35':'Ille-et-Vilaine','36':'Indre','37':'Indre-et-Loire','38':'Isère','39':'Jura',
    '40':'Landes','41':'Loir-et-Cher','42':'Loire','43':'Haute-Loire','44':'Loire-Atlantique',
    '45':'Loiret','46':'Lot','47':'Lot-et-Garonne','48':'Lozère','49':'Maine-et-Loire',
    '50':'Manche','51':'Marne','52':'Haute-Marne','53':'Mayenne','54':'Meurthe-et-Moselle',
    '55':'Meuse','56':'Morbihan','57':'Moselle','58':'Nièvre','59':'Nord',
    '60':'Oise','61':'Orne','62':'Pas-de-Calais','63':'Puy-de-Dôme','64':'Pyrénées-Atlantiques',
    '65':'Hautes-Pyrénées','66':'Pyrénées-Orientales','67':'Bas-Rhin','68':'Haut-Rhin',
    '69':'Rhône','70':'Haute-Saône','71':'Saône-et-Loire','72':'Sarthe','73':'Savoie',
    '74':'Haute-Savoie','75':'Paris','76':'Seine-Maritime','77':'Seine-et-Marne',
    '78':'Yvelines','79':'Deux-Sèvres','80':'Somme','81':'Tarn','82':'Tarn-et-Garonne',
    '83':'Var','84':'Vaucluse','85':'Vendée','86':'Vienne','87':'Haute-Vienne',
    '88':'Vosges','89':'Yonne','90':'Territoire de Belfort','91':'Essonne',
    '92':'Hauts-de-Seine','93':'Seine-Saint-Denis','94':'Val-de-Marne','95':'Val-d\'Oise',
    '971':'Guadeloupe','972':'Martinique','973':'Guyane','974':'La Réunion','976':'Mayotte',
    '987':'Polynésie française','988':'Nouvelle-Calédonie'
  };
  return map[deptCode] || `Dept. ${deptCode}`;
}

export function drawDuplicatesChart(canvasId, topDuplicates) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;

  // Sort ascending for horizontal bar (so top appears at top)
  const sorted = [...topDuplicates].reverse();

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: sorted.map(d => d.name),
      datasets: [{
        data: sorted.map(d => d.count),
        backgroundColor: sorted.map((d, i) =>
          i >= sorted.length - 3 ? PALETTE.primary : PALETTE.primaryLight
        ),
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.x} communes share this name`,
          },
          titleFont: { family: FONT_SERIF, size: 13 },
          bodyFont: { family: FONT_SANS, size: 12 },
          backgroundColor: '#faf7f2',
          titleColor: PALETTE.text,
          bodyColor: '#444',
          borderColor: '#b8b0a0',
          borderWidth: 1,
          padding: 10,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 14,
          ticks: {
            stepSize: 2,
            font: { family: FONT_SANS, size: 11 },
            color: PALETTE.muted,
          },
          grid: { color: PALETTE.grid },
          title: {
            display: true,
            text: 'Number of communes with this name',
            font: { family: FONT_SANS, size: 11 },
            color: PALETTE.muted,
          },
        },
        y: {
          ticks: {
            font: { family: FONT_SERIF, size: 12 },
            color: PALETTE.text,
          },
          grid: { display: false },
        },
      },
    },
  });
}

export function drawLetterChart(canvasId, letterDist) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;

  // Show all 26 letters sorted alphabetically
  const sorted = [...letterDist].sort((a, b) => a.letter.localeCompare(b.letter));

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: sorted.map(d => d.letter),
      datasets: [{
        data: sorted.map(d => d.count),
        backgroundColor: sorted.map(d =>
          d.letter === 'S' ? PALETTE.primary : PALETTE.primaryLight
        ),
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y.toLocaleString('fr-FR')} communes`,
          },
          titleFont: { family: FONT_SERIF, size: 13 },
          bodyFont: { family: FONT_SANS, size: 12 },
          backgroundColor: '#faf7f2',
          titleColor: PALETTE.text,
          bodyColor: '#444',
          borderColor: '#b8b0a0',
          borderWidth: 1,
          padding: 10,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: { family: FONT_SANS, size: 11 },
            color: PALETTE.muted,
            callback: v => v.toLocaleString('fr-FR'),
          },
          grid: { color: PALETTE.grid },
        },
        x: {
          ticks: {
            font: { family: FONT_SANS, size: 12 },
            color: PALETTE.text,
          },
          grid: { display: false },
        },
      },
    },
  });
}

export function renderShortNames(shortNames) {
  const grid12 = document.getElementById('short-1-2');
  const grid34 = document.getElementById('short-3-4');
  if (!grid12 || !grid34) return;

  const names1 = shortNames.filter(n => n.length <= 2);
  const names34 = shortNames.filter(n => n.length >= 3 && n.length <= 4);

  grid12.innerHTML = names1.map(n =>
    `<div class="short-name-item">
      <span class="short-name-label">${escHtml(n.name)}</span>
      <span class="short-name-meta">${escHtml(deptName(n.dept))}${n.pop ? ` · ${n.pop.toLocaleString('fr-FR')} res.` : ''}</span>
    </div>`
  ).join('');

  grid34.innerHTML = names34.map(n =>
    `<div class="short-name-item">
      <span class="short-name-label">${escHtml(n.name)}</span>
      <span class="short-name-meta">${escHtml(deptName(n.dept))}</span>
    </div>`
  ).join('');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
