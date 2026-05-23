// commune-names/charts.js — length-distribution histogram

export function drawLengthChart(selector, lenDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  // lenDist is array indexed by char length; skip 0
  const buckets = [];
  for (let i = 1; i < lenDist.length; i++) {
    if (lenDist[i] > 0) buckets.push({ len: i, count: lenDist[i] });
  }

  const W = container.clientWidth || 700;
  const H = 200;
  const marginL = 48;
  const marginR = 12;
  const marginT = 12;
  const marginB = 32;
  const innerW = W - marginL - marginR;
  const innerH = H - marginT - marginB;

  const maxCount = Math.max(...buckets.map(b => b.count));
  const minLen = buckets[0].len;
  const maxLen = buckets[buckets.length - 1].len;

  const xScale = (len) => ((len - minLen) / (maxLen - minLen)) * innerW;
  const barW = Math.max(1, (innerW / (maxLen - minLen + 1)) - 1);
  const yScale = (count) => (count / maxCount) * innerH;

  // Build tick positions: every 5 chars
  const xTicks = [];
  for (let l = Math.ceil(minLen / 5) * 5; l <= maxLen; l += 5) {
    xTicks.push(l);
  }

  const yTicks = [0, 1000, 2000, 3000];

  const bars = buckets.map(b => {
    const x = marginL + xScale(b.len);
    const barHeight = yScale(b.count);
    const y = marginT + innerH - barHeight;
    const isShort = b.len <= 8;
    const fill = isShort ? '#b35c00' : '#c67c00';
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barHeight.toFixed(1)}" fill="${fill}" opacity="0.85"/>`;
  }).join('');

  const xTickLines = xTicks.map(l => {
    const x = marginL + xScale(l);
    return `<line x1="${x.toFixed(1)}" y1="${marginT + innerH}" x2="${x.toFixed(1)}" y2="${marginT + innerH + 5}" stroke="#999" stroke-width="1"/>
            <text x="${x.toFixed(1)}" y="${marginT + innerH + 18}" text-anchor="middle" font-size="11" fill="#666">${l}</text>`;
  }).join('');

  const yTickLines = yTicks.map(v => {
    const y = marginT + innerH - yScale(v);
    return `<line x1="${marginL - 4}" y1="${y.toFixed(1)}" x2="${marginL + innerW}" y2="${y.toFixed(1)}" stroke="#e8e0d4" stroke-width="1"/>
            <text x="${(marginL - 8).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#888">${v >= 1000 ? (v/1000)+'k' : v}</text>`;
  }).join('');

  const svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;overflow:visible">
    <g>${yTickLines}</g>
    <g>${bars}</g>
    <line x1="${marginL}" y1="${marginT}" x2="${marginL}" y2="${marginT + innerH}" stroke="#999" stroke-width="1"/>
    <line x1="${marginL}" y1="${marginT + innerH}" x2="${marginL + innerW}" y2="${marginT + innerH}" stroke="#999" stroke-width="1"/>
    <g>${xTickLines}</g>
    <text x="${marginL + innerW / 2}" y="${H - 2}" text-anchor="middle" font-size="11" fill="#888">name length (characters)</text>
    <text x="${marginL + xScale(3.5)}" y="${marginT + innerH - yScale(3695) - 8}" text-anchor="middle" font-size="10" fill="#b35c00">short names</text>
    <text x="${marginL + xScale(17)}" y="${marginT + innerH - yScale(1186) - 8}" text-anchor="middle" font-size="10" fill="#b35c00">saint-hyphenated</text>
  </svg>`;

  container.innerHTML = svg;
}

export function populateTables(stats) {
  // Shortest names table
  const shortTbody = document.querySelector('#table-shortest tbody');
  if (shortTbody) {
    const show = stats.shortest.filter(r => r.name.length <= 3);
    shortTbody.innerHTML = show.map(r =>
      `<tr>
        <td class="name-cell"><span class="commune-name">${escHtml(r.name)}</span></td>
        <td class="chars-cell">${r.name.length}</td>
        <td class="pop-cell">${r.pop ? r.pop.toLocaleString('fr-FR') : '—'}</td>
        <td class="dept-cell">${escHtml(deptName(r.dept))}</td>
      </tr>`
    ).join('');
  }

  // Longest names table
  const longTbody = document.querySelector('#table-longest tbody');
  if (longTbody) {
    longTbody.innerHTML = stats.longest.slice(0, 8).map((r, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="name-cell long-name"><span class="commune-name">${escHtml(r.name)}</span></td>
        <td class="chars-cell">${r.name.length}</td>
      </tr>`
    ).join('');
  }

  // Most common names table
  const commonTbody = document.querySelector('#table-common tbody');
  if (commonTbody) {
    commonTbody.innerHTML = stats.topNames.slice(0, 10).map((r, i) =>
      `<tr>
        <td class="rank">${i + 1}</td>
        <td class="name-cell"><span class="commune-name">${escHtml(r.name)}</span></td>
        <td class="count-cell">${r.count} communes</td>
      </tr>`
    ).join('');
  }
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const DEPT_NAMES = {
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
  '65':'Hautes-Pyrénées','66':'Pyrénées-Orientales','67':'Bas-Rhin','68':'Haut-Rhin','69':'Rhône',
  '70':'Haute-Saône','71':'Saône-et-Loire','72':'Sarthe','73':'Savoie','74':'Haute-Savoie',
  '75':'Paris','76':'Seine-Maritime','77':'Seine-et-Marne','78':'Yvelines','79':'Deux-Sèvres',
  '80':'Somme','81':'Tarn','82':'Tarn-et-Garonne','83':'Var','84':'Vaucluse',
  '85':'Vendée','86':'Vienne','87':'Haute-Vienne','88':'Vosges','89':'Yonne',
  '90':'Territoire de Belfort','91':'Essonne','92':'Hauts-de-Seine','93':'Seine-Saint-Denis',
  '94':'Val-de-Marne','95':'Val-d\'Oise','971':'Guadeloupe','972':'Martinique',
  '973':'Guyane','974':'La Réunion','976':'Mayotte'
};

function deptName(code) {
  return DEPT_NAMES[code] || `Dept. ${code}`;
}
