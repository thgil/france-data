// stories/commune-names/charts.js
// Pure-SVG chart helpers for the commune-names story.
// No external dependencies.

const DEPT_NAMES = {
  '01':'Ain','02':'Aisne','03':'Allier','04':'Alpes-de-Haute-Provence',
  '05':'Hautes-Alpes','06':'Alpes-Maritimes','07':'Ardèche','08':'Ardennes',
  '09':'Ariège','10':'Aube','11':'Aude','12':'Aveyron',
  '13':'Bouches-du-Rhône','14':'Calvados','15':'Cantal','16':'Charente',
  '17':'Charente-Maritime','18':'Cher','19':'Corrèze','2A':'Corse-du-Sud',
  '2B':'Haute-Corse','21':"Côte-d'Or",'22':"Côtes-d'Armor",'23':'Creuse',
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
  '94':'Val-de-Marne','95':"Val-d'Oise",
};

function deptName(code) {
  return DEPT_NAMES[code] || `Dept ${code}`;
}

function svgEl(tag, attrs = {}, text = '') {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text) el.textContent = text;
  return el;
}

function makeSVG(w, h) {
  const svg = svgEl('svg', {
    viewBox: `0 0 ${w} ${h}`,
    width: '100%',
    style: 'display:block;overflow:visible',
  });
  return svg;
}

// Column chart: name length distribution
export function drawLengthChart(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Show lengths 1–30, group 31+ into a final bin
  const bins = [];
  const MAX_SHOWN = 30;
  let overflow = 0;
  for (const b of lengthDist) {
    if (b.len <= MAX_SHOWN) bins.push({ label: String(b.len), count: b.count });
    else overflow += b.count;
  }
  if (overflow > 0) bins.push({ label: '31+', count: overflow });

  const W = 680, H = 200;
  const padL = 36, padR = 8, padT = 8, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxCount = Math.max(...bins.map(b => b.count));
  const barW = chartW / bins.length;

  const svg = makeSVG(W, H);

  // Y-axis grid lines
  const yTicks = [0, 1000, 2000, 3000];
  for (const t of yTicks) {
    const y = padT + chartH - (t / maxCount) * chartH;
    svg.appendChild(svgEl('line', {
      x1: padL, y1: y, x2: padL + chartW, y2: y,
      stroke: t === 0 ? '#888' : '#e0d8cc',
      'stroke-width': t === 0 ? 1 : 0.5,
    }));
    if (t > 0) {
      svg.appendChild(svgEl('text', {
        x: padL - 4, y: y + 4,
        'text-anchor': 'end',
        'font-size': 10,
        fill: '#888',
        'font-family': 'Helvetica Neue, sans-serif',
      }, t.toLocaleString('fr-FR')));
    }
  }

  // Bars
  const ACCENT = '#b32020';
  const BASE   = '#d8cfc0';
  const peak = bins.reduce((max, b) => b.count > max.count ? b : max, bins[0]);

  for (let i = 0; i < bins.length; i++) {
    const b = bins[i];
    const barH = (b.count / maxCount) * chartH;
    const x = padL + i * barW + 1;
    const y = padT + chartH - barH;
    svg.appendChild(svgEl('rect', {
      x, y, width: Math.max(barW - 2, 1), height: barH,
      fill: b.label === peak.label ? ACCENT : BASE,
    }));

    // X labels: show every 5 + first + last
    const lNum = parseInt(b.label);
    const showLabel = b.label === '1' || b.label === '31+' || (lNum > 1 && lNum % 5 === 0);
    if (showLabel) {
      svg.appendChild(svgEl('text', {
        x: x + (barW - 2) / 2, y: padT + chartH + 14,
        'text-anchor': 'middle',
        'font-size': 9,
        fill: '#555',
        'font-family': 'Helvetica Neue, sans-serif',
      }, b.label));
    }
  }

  container.appendChild(svg);
}

// Horizontal bar chart: top commune names by frequency
export function drawTopNamesChart(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = topNames.slice(0, 15);
  const W = 520, rowH = 26, padL = 170, padR = 60, padT = 4, padB = 4;
  const H = padT + items.length * rowH + padB;
  const chartW = W - padL - padR;
  const maxCount = items[0].count;

  const svg = makeSVG(W, H);
  const ACCENT = '#b32020';
  const BASE   = '#d8cfc0';

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const y = padT + i * rowH;
    const barW = (it.count / maxCount) * chartW;

    // Name label
    svg.appendChild(svgEl('text', {
      x: padL - 6, y: y + rowH / 2 + 4,
      'text-anchor': 'end',
      'font-size': 12,
      fill: '#1a1a1a',
      'font-family': 'Georgia, serif',
    }, it.name));

    // Bar
    svg.appendChild(svgEl('rect', {
      x: padL, y: y + 4, width: Math.max(barW, 2), height: rowH - 8,
      fill: i === 0 ? ACCENT : BASE,
    }));

    // Count label
    svg.appendChild(svgEl('text', {
      x: padL + barW + 6, y: y + rowH / 2 + 4,
      'font-size': 11,
      fill: '#555',
      'font-family': 'Helvetica Neue, sans-serif',
    }, `× ${it.count}`));
  }

  container.appendChild(svg);
}

// Horizontal bar chart: saint-heavy departments (by %)
export function drawSaintDeptChart(selector, sainteDeptTop) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = sainteDeptTop.slice(0, 10);
  const W = 520, rowH = 28, padL = 160, padR = 80, padT = 4, padB = 4;
  const H = padT + items.length * rowH + padB;
  const chartW = W - padL - padR;
  const maxPct = items[0].pct;

  const svg = makeSVG(W, H);
  const ACCENT = '#b32020';
  const BASE   = '#d8cfc0';

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const y = padT + i * rowH;
    const barW = (it.pct / maxPct) * chartW;
    const name = deptName(it.dept);

    svg.appendChild(svgEl('text', {
      x: padL - 6, y: y + rowH / 2 + 4,
      'text-anchor': 'end',
      'font-size': 12,
      fill: '#1a1a1a',
      'font-family': 'Georgia, serif',
    }, name));

    svg.appendChild(svgEl('rect', {
      x: padL, y: y + 4, width: Math.max(barW, 2), height: rowH - 8,
      fill: i === 0 ? ACCENT : BASE,
    }));

    svg.appendChild(svgEl('text', {
      x: padL + barW + 6, y: y + rowH / 2 + 4,
      'font-size': 11,
      fill: '#555',
      'font-family': 'Helvetica Neue, sans-serif',
    }, `${it.pct}% (${it.saint}/${it.total})`));
  }

  container.appendChild(svg);
}
