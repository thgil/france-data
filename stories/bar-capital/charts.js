// stories/bar-capital/charts.js
// Bar charts for the per-capita bar ranking story.

const ACCENT   = '#b32020';
const BAR_FILL = '#c67c00';
const AVG_LINE = '#888';

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
  '65':'Hautes-Pyrénées','66':'Pyrénées-Orientales','67':'Bas-Rhin','68':'Haut-Rhin',
  '69':'Rhône','70':'Haute-Saône','71':'Saône-et-Loire','72':'Sarthe','73':'Savoie',
  '74':'Haute-Savoie','75':'Paris','76':'Seine-Maritime','77':'Seine-et-Marne',
  '78':'Yvelines','79':'Deux-Sèvres','80':'Somme','81':'Tarn','82':'Tarn-et-Garonne',
  '83':'Var','84':'Vaucluse','85':'Vendée','86':'Vienne','87':'Haute-Vienne',
  '88':'Vosges','89':'Yonne','90':'Territoire de Belfort','91':'Essonne',
  '92':'Hauts-de-Seine','93':'Seine-Saint-Denis','94':'Val-de-Marne','95':'Val-d\'Oise',
};

function dpr() {
  return window.devicePixelRatio || 1;
}

function getCanvas(selector) {
  const el = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  return el;
}

/**
 * Draw a horizontal bar chart of top communes by bars/10k.
 * @param {string} selector  — CSS selector for <canvas>
 * @param {Array}  communes  — array of { name, dept, per_10k, bars, pop }
 * @param {number} avg       — national average (draws a reference line)
 */
export function drawCommunesChart(selector, communes, avg) {
  const canvas = getCanvas(selector);
  if (!canvas) return;

  const ratio  = dpr();
  const W      = canvas.offsetWidth  || parseInt(canvas.getAttribute('width'), 10);
  const H      = canvas.offsetHeight || parseInt(canvas.getAttribute('height'), 10);

  canvas.width  = W * ratio;
  canvas.height = H * ratio;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);

  const paddingLeft   = 180; // space for labels
  const paddingRight  = 80;
  const paddingTop    = 16;
  const paddingBottom = 32;

  const chartW = W - paddingLeft - paddingRight;
  const chartH = H - paddingTop - paddingBottom;
  const rowH   = chartH / communes.length;

  const maxVal = communes[0].per_10k * 1.05;
  const scaleX = v => (v / maxVal) * chartW;

  ctx.clearRect(0, 0, W, H);

  // Gridlines
  const gridVals = [50, 100, 150, 200];
  ctx.strokeStyle = '#e8e2d8';
  ctx.lineWidth   = 1;
  gridVals.forEach(v => {
    if (v > maxVal) return;
    const x = paddingLeft + scaleX(v);
    ctx.beginPath();
    ctx.moveTo(x, paddingTop);
    ctx.lineTo(x, paddingTop + chartH);
    ctx.stroke();
    ctx.fillStyle = '#aaa';
    ctx.font = '10px Helvetica Neue, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(v, x, paddingTop + chartH + 18);
  });

  // X-axis label
  ctx.fillStyle = '#888';
  ctx.font = '10px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('bars per 10,000 residents', paddingLeft + chartW / 2, H - 6);

  // Bars
  communes.forEach((c, i) => {
    const y    = paddingTop + i * rowH;
    const barH = Math.max(rowH * 0.55, 12);
    const barY = y + (rowH - barH) / 2;
    const barW = scaleX(c.per_10k);

    // Bar fill
    ctx.fillStyle = BAR_FILL;
    ctx.fillRect(paddingLeft, barY, barW, barH);

    // Commune name label (left)
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `13px Georgia, serif`;
    ctx.textAlign = 'right';
    const label = c.name.length > 22 ? c.name.slice(0, 21) + '…' : c.name;
    ctx.fillText(label, paddingLeft - 8, barY + barH * 0.65);

    // Département badge
    ctx.fillStyle = '#999';
    ctx.font = '10px Helvetica Neue, sans-serif';
    ctx.fillText(DEPT_NAMES[c.dept] || c.dept, paddingLeft - 8, barY + barH * 0.65 + 13);

    // Value label (right of bar)
    ctx.fillStyle = '#444';
    ctx.font = '11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(c.per_10k.toFixed(1), paddingLeft + barW + 4, barY + barH * 0.65);
  });

  // National average reference line
  const avgX = paddingLeft + scaleX(avg);
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(avgX, paddingTop);
  ctx.lineTo(avgX, paddingTop + chartH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Average label
  ctx.fillStyle = ACCENT;
  ctx.font = 'bold 10px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('national avg ' + avg.toFixed(1), avgX, paddingTop - 4);
}

/**
 * Populate the top/bottom département tables.
 * @param {Array} topDepts    — top N depts sorted desc by per_10k
 * @param {Array} bottomDepts — bottom N depts sorted asc by per_10k
 */
export function populateDeptTables(topDepts, bottomDepts) {
  const topBody = document.querySelector('#table-top-dept tbody');
  if (topBody) {
    topBody.innerHTML = topDepts.slice(0, 10).map((d, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${d.name}</td>
        <td>${d.per_10k.toFixed(1)}</td>
      </tr>`).join('');
  }

  const bottomBody = document.querySelector('#table-bottom-dept tbody');
  if (bottomBody) {
    // Show bottom 8, ascending (worst first)
    const worst = [...bottomDepts].reverse().slice(0, 8);
    bottomBody.innerHTML = worst.map((d, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${d.name}</td>
        <td>${d.per_10k.toFixed(1)}</td>
      </tr>`).join('');
  }
}
