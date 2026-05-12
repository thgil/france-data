// charts.js — commune-names story
// Vanilla SVG charts; no external charting library.

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

function svg(tag, attrs = {}, ...children) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child) {
      el.appendChild(child);
    }
  }
  return el;
}

export function drawLengthHistogram(containerId, stats) {
  const container = document.querySelector(containerId);
  if (!container) return;

  const dist = stats.lengthDist;

  // Bucket lengths 1–29 individually, 30+ combined
  const buckets = [];
  for (let l = 1; l <= 29; l++) {
    buckets.push({ label: String(l), x: l, count: dist[String(l)] || 0 });
  }
  let over29 = 0;
  for (const [k, v] of Object.entries(dist)) {
    if (parseInt(k, 10) >= 30) over29 += v;
  }
  buckets.push({ label: '≥30', x: 30, count: over29 });

  const W = 680, H = 220;
  const marginLeft = 44, marginRight = 12, marginTop = 16, marginBottom = 36;
  const innerW = W - marginLeft - marginRight;
  const innerH = H - marginTop - marginBottom;

  const maxCount = Math.max(...buckets.map(b => b.count));
  const barW = innerW / buckets.length;
  const scaleY = v => innerH - (v / maxCount) * innerH;

  // Y axis ticks
  const yTicks = [0, 1000, 2000, 3000];

  const chart = svg('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;height:auto;display:block;',
    role: 'img',
    'aria-label': 'Bar chart of French commune name lengths',
  });

  const g = svg('g', { transform: `translate(${marginLeft},${marginTop})` });
  chart.appendChild(g);

  // Gridlines + Y axis labels
  for (const tick of yTicks) {
    const y = scaleY(tick);
    g.appendChild(svg('line', {
      x1: 0, y1: y, x2: innerW, y2: y,
      stroke: tick === 0 ? '#ccc' : '#ece8e0',
      'stroke-width': tick === 0 ? 1.5 : 1,
    }));
    if (tick > 0) {
      g.appendChild(svg('text', {
        x: -6, y: y + 4,
        'text-anchor': 'end',
        'font-family': "'Helvetica Neue', sans-serif",
        'font-size': '10',
        fill: '#999',
      }, `${(tick / 1000).toFixed(0)}k`));
    }
  }

  // Bars
  buckets.forEach((b, i) => {
    const x = i * barW;
    const barHeight = (b.count / maxCount) * innerH;
    const y = innerH - barHeight;
    const isHighlight = (b.x >= 7 && b.x <= 8) || b.label === '≥30';
    g.appendChild(svg('rect', {
      x: x + 1, y,
      width: barW - 2,
      height: barHeight,
      fill: isHighlight ? '#b32020' : '#d4c9bb',
      rx: 1,
    }));
  });

  // X axis labels — every 5 ticks
  buckets.forEach((b, i) => {
    const showLabel = b.x === 1 || b.x % 5 === 0 || b.label === '≥30';
    if (!showLabel) return;
    const x = i * barW + barW / 2;
    g.appendChild(svg('text', {
      x, y: innerH + 16,
      'text-anchor': 'middle',
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '10',
      fill: '#777',
    }, b.label));
  });

  // X axis title
  g.appendChild(svg('text', {
    x: innerW / 2, y: innerH + 32,
    'text-anchor': 'middle',
    'font-family': "'Helvetica Neue', sans-serif",
    'font-size': '10',
    'font-weight': '600',
    'letter-spacing': '0.8',
    fill: '#999',
  }, 'NAME LENGTH (CHARACTERS)'));

  container.appendChild(chart);
}

export function drawTopNames(containerId, stats) {
  const container = document.querySelector(containerId);
  if (!container) return;

  const names = stats.topNames.slice(0, 10);
  const maxCount = names[0].count;

  const W = 520, rowH = 28, marginLeft = 140, marginRight = 48;
  const H = names.length * rowH + 16;
  const innerW = W - marginLeft - marginRight;

  const chart = svg('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:520px;height:auto;display:block;',
    role: 'img',
    'aria-label': 'Horizontal bar chart of most common French commune names',
  });

  names.forEach((d, i) => {
    const y = i * rowH + 8;
    const barLen = (d.count / maxCount) * innerW;

    // Name label
    chart.appendChild(svg('text', {
      x: marginLeft - 8, y: y + rowH / 2 + 4,
      'text-anchor': 'end',
      'font-family': 'Georgia, serif',
      'font-size': '12',
      fill: '#1a1a1a',
    }, d.name));

    // Bar
    chart.appendChild(svg('rect', {
      x: marginLeft, y: y + 4,
      width: barLen,
      height: rowH - 10,
      fill: i === 0 ? '#b32020' : '#c8bfb3',
      rx: 2,
    }));

    // Count label
    chart.appendChild(svg('text', {
      x: marginLeft + barLen + 5, y: y + rowH / 2 + 4,
      'text-anchor': 'start',
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '11',
      fill: '#555',
    }, String(d.count)));
  });

  container.appendChild(chart);
}

export function drawSaintDepts(containerId, stats) {
  const container = document.querySelector(containerId);
  if (!container) return;

  const depts = stats.topSaintDepts.slice(0, 8);
  const maxCount = depts[0].count;

  const W = 520, rowH = 28, marginLeft = 160, marginRight = 48;
  const H = depts.length * rowH + 16;
  const innerW = W - marginLeft - marginRight;

  const chart = svg('svg', {
    viewBox: `0 0 ${W} ${H}`,
    style: 'width:100%;max-width:520px;height:auto;display:block;',
    role: 'img',
    'aria-label': 'Horizontal bar chart of French départements by saint-named communes',
  });

  depts.forEach((d, i) => {
    const y = i * rowH + 8;
    const barLen = (d.count / maxCount) * innerW;
    const deptName = DEPT_NAMES[d.dept] || `Dept ${d.dept}`;

    chart.appendChild(svg('text', {
      x: marginLeft - 8, y: y + rowH / 2 + 4,
      'text-anchor': 'end',
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '12',
      fill: '#1a1a1a',
    }, deptName));

    chart.appendChild(svg('rect', {
      x: marginLeft, y: y + 4,
      width: barLen,
      height: rowH - 10,
      fill: i === 0 ? '#b32020' : '#c8bfb3',
      rx: 2,
    }));

    chart.appendChild(svg('text', {
      x: marginLeft + barLen + 5, y: y + rowH / 2 + 4,
      'text-anchor': 'start',
      'font-family': "'Helvetica Neue', sans-serif",
      'font-size': '11',
      fill: '#555',
    }, `${d.count} Saint-communes`));
  });

  container.appendChild(chart);
}
