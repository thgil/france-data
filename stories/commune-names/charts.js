// stories/commune-names/charts.js
// Renders all charts and tables for the commune-names story.
// Export: renderCharts(data)

const DEPT_NAMES = {
  '01':'Ain','02':'Aisne','03':'Allier','04':'Alpes-de-Haute-Provence',
  '05':'Hautes-Alpes','06':'Alpes-Maritimes','07':'Ardèche','08':'Ardennes',
  '09':'Ariège','10':'Aube','11':'Aude','12':'Aveyron',
  '13':'Bouches-du-Rhône','14':'Calvados','15':'Cantal','16':'Charente',
  '17':'Charente-Maritime','18':'Cher','19':'Corrèze','2A':'Corse-du-Sud',
  '2B':'Haute-Corse','21':'Côte-d\'Or','22':'Côtes-d\'Armor','23':'Creuse',
  '24':'Dordogne','25':'Doubs','26':'Drôme','27':'Eure',
  '28':'Eure-et-Loir','29':'Finistère','30':'Gard','31':'Haute-Garonne',
  '32':'Gers','33':'Gironde','34':'Hérault','35':'Ille-et-Vilaine',
  '36':'Indre','37':'Indre-et-Loire','38':'Isère','39':'Jura',
  '40':'Landes','41':'Loir-et-Cher','42':'Loire','43':'Haute-Loire',
  '44':'Loire-Atlantique','45':'Loiret','46':'Lot','47':'Lot-et-Garonne',
  '48':'Lozère','49':'Maine-et-Loire','50':'Manche','51':'Marne',
  '52':'Haute-Marne','53':'Mayenne','54':'Meurthe-et-Moselle','55':'Meuse',
  '56':'Morbihan','57':'Moselle','58':'Nièvre','59':'Nord',
  '60':'Oise','61':'Orne','62':'Pas-de-Calais','63':'Puy-de-Dôme',
  '64':'Pyrénées-Atlantiques','65':'Hautes-Pyrénées','66':'Pyrénées-Orientales',
  '67':'Bas-Rhin','68':'Haut-Rhin','69':'Rhône','70':'Haute-Saône',
  '71':'Saône-et-Loire','72':'Sarthe','73':'Savoie','74':'Haute-Savoie',
  '75':'Paris','76':'Seine-Maritime','77':'Seine-et-Marne','78':'Yvelines',
  '79':'Deux-Sèvres','80':'Somme','81':'Tarn','82':'Tarn-et-Garonne',
  '83':'Var','84':'Vaucluse','85':'Vendée','86':'Vienne',
  '87':'Haute-Vienne','88':'Vosges','89':'Yonne','90':'Territoire de Belfort',
  '91':'Essonne','92':'Hauts-de-Seine','93':'Seine-Saint-Denis',
  '94':'Val-de-Marne','95':'Val-d\'Oise',
  '971':'Guadeloupe','972':'Martinique','973':'Guyane','974':'La Réunion','976':'Mayotte',
};

function deptName(code) {
  return DEPT_NAMES[code] || `Dept ${code}`;
}

function makeBarChart(containerEl, rows, maxVal) {
  rows.forEach(({ label, value }) => {
    const pct = Math.round((value / maxVal) * 100);
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <span class="bar-label" title="${label}">${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <span class="bar-value">${value.toLocaleString('fr-FR')}</span>
    `;
    containerEl.appendChild(row);
  });
}

function populateShortestTable(tbodyEl, rows) {
  tbodyEl.innerHTML = rows.map(r => `
    <tr>
      <td>
        <span class="nm">${r.name}</span><br>
        <span class="sub">${deptName(r.dept)} · pop. ${r.pop.toLocaleString('fr-FR')}</span>
      </td>
      <td>${r.len} char${r.len === 1 ? '' : 's'}</td>
    </tr>
  `).join('');
}

function populateLongestTable(tbodyEl, rows) {
  tbodyEl.innerHTML = rows.map(r => `
    <tr>
      <td>
        <span class="nm" style="font-size:12px">${r.name}</span><br>
        <span class="sub">${deptName(r.dept)} · pop. ${r.pop.toLocaleString('fr-FR')}</span>
      </td>
      <td>${r.len}</td>
    </tr>
  `).join('');
}

export function renderCharts(data) {
  // ── Shortest/longest tables ────────────────────────────────────────
  const shortTbody = document.querySelector('#table-shortest tbody');
  const longTbody  = document.querySelector('#table-longest tbody');
  if (shortTbody) populateShortestTable(shortTbody, data.shortest.slice(0, 10));
  if (longTbody)  populateLongestTable(longTbody,  data.longest.slice(0, 8));

  // ── Saint sub-names chart ──────────────────────────────────────────
  const saintsEl = document.getElementById('chart-saints');
  if (saintsEl) {
    const top = data.top_saints.slice(0, 15);
    const max = top[0].count;
    makeBarChart(saintsEl, top.map(d => ({ label: d.name, value: d.count })), max);
  }

  // ── First words chart ──────────────────────────────────────────────
  const firstWordsEl = document.getElementById('chart-first-words');
  if (firstWordsEl) {
    const top = data.top_first_words.slice(0, 15);
    const max = top[0].count;
    makeBarChart(firstWordsEl, top.map(d => ({ label: d.word, value: d.count })), max);
  }

  // ── Duplicate names chart ──────────────────────────────────────────
  const dupEl = document.getElementById('chart-duplicates');
  if (dupEl) {
    const top = data.top_duplicates.slice(0, 20);
    const max = top[0].count;
    makeBarChart(dupEl, top.map(d => ({ label: d.name, value: d.count })), max);
  }
}
