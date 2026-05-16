/* commune-names/charts.js — SVG chart renderers */

/* ── Horizontal bar chart: top commune names ─────────────────────── */
export function drawTopNames(containerId, data) {
  const el = document.querySelector(containerId);
  if (!el) return;

  const items = data.slice(0, 15);
  const maxCount = items[0].count;
  const rowH = 32;
  const labelW = 180;
  const barMaxW = 340;
  const numW = 32;
  const padLeft = 8;
  const padRight = 16;
  const totalW = padLeft + labelW + barMaxW + numW + padRight;
  const totalH = items.length * rowH + 8;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = 'Georgia, serif';
  svg.style.overflow = 'visible';

  items.forEach((item, i) => {
    const y = i * rowH + 4;
    const barW = (item.count / maxCount) * barMaxW;
    const cx = padLeft + labelW;

    // Alternating row background
    if (i % 2 === 0) {
      const bg = document.createElementNS(svgNS, 'rect');
      bg.setAttribute('x', 0);
      bg.setAttribute('y', y - 2);
      bg.setAttribute('width', totalW);
      bg.setAttribute('height', rowH);
      bg.setAttribute('fill', '#f5f2ec');
      svg.appendChild(bg);
    }

    // Label
    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', padLeft + labelW - 8);
    label.setAttribute('y', y + 20);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '13');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = item.name;
    svg.appendChild(label);

    // Bar
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', cx);
    rect.setAttribute('y', y + 6);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', rowH - 14);
    rect.setAttribute('fill', '#b32020');
    rect.setAttribute('rx', 2);
    svg.appendChild(rect);

    // Count label
    const num = document.createElementNS(svgNS, 'text');
    num.setAttribute('x', cx + barW + 6);
    num.setAttribute('y', y + 20);
    num.setAttribute('font-size', '12');
    num.setAttribute('fill', '#666');
    num.setAttribute('font-family', "'Helvetica Neue', sans-serif");
    num.textContent = `×${item.count}`;
    svg.appendChild(num);
  });

  el.appendChild(svg);
}

/* ── Histogram: name length distribution ─────────────────────────── */
export function drawLengthHistogram(containerId, data) {
  const el = document.querySelector(containerId);
  if (!el) return;

  // Group lengths 1-29 individually, 30+ as last bucket
  const buckets = data.filter(d => typeof d.length === 'number' && d.length <= 29);
  const last = data.find(d => d.length === '30+') || { length: '30+', count: 0 };
  const allBuckets = [...buckets, last];

  const maxCount = Math.max(...allBuckets.map(b => b.count));
  const bW = 22;
  const gap = 2;
  const chartH = 160;
  const padTop = 8;
  const padBottom = 28;
  const padLeft = 8;
  const padRight = 8;
  const n = allBuckets.length;
  const totalW = padLeft + n * (bW + gap) - gap + padRight;
  const totalH = padTop + chartH + padBottom;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = "'Helvetica Neue', sans-serif";
  svg.style.overflow = 'visible';

  allBuckets.forEach((bucket, i) => {
    const x = padLeft + i * (bW + gap);
    const barH = (bucket.count / maxCount) * chartH;
    const y = padTop + chartH - barH;

    const isLong = bucket.length === '30+';
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', bW);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', isLong ? '#c67c00' : '#b32020');
    rect.setAttribute('rx', 1);

    const title = document.createElementNS(svgNS, 'title');
    title.textContent = `${bucket.length} chars: ${bucket.count.toLocaleString('fr-FR')} communes`;
    rect.appendChild(title);
    svg.appendChild(rect);

    // X-axis labels: show every 5 chars + the last
    const showLabel = (typeof bucket.length === 'number' && (bucket.length === 1 || bucket.length % 5 === 0)) || bucket.length === '30+';
    if (showLabel) {
      const lbl = document.createElementNS(svgNS, 'text');
      lbl.setAttribute('x', x + bW / 2);
      lbl.setAttribute('y', padTop + chartH + 18);
      lbl.setAttribute('text-anchor', 'middle');
      lbl.setAttribute('font-size', '10');
      lbl.setAttribute('fill', '#888');
      lbl.textContent = bucket.length;
      svg.appendChild(lbl);
    }
  });

  // X-axis line
  const axis = document.createElementNS(svgNS, 'line');
  axis.setAttribute('x1', padLeft);
  axis.setAttribute('y1', padTop + chartH);
  axis.setAttribute('x2', totalW - padRight);
  axis.setAttribute('y2', padTop + chartH);
  axis.setAttribute('stroke', '#ccc');
  axis.setAttribute('stroke-width', 1);
  svg.appendChild(axis);

  el.appendChild(svg);
}

/* ── Commune search ───────────────────────────────────────────────── */
export function initSearch(inputId, resultId, communes) {
  const input = document.getElementById(inputId);
  const result = document.getElementById(resultId);
  if (!input || !result) return;

  const DEPT_NAMES = {
    '01':'Ain','02':'Aisne','03':'Allier','04':'Alpes-de-Haute-Provence',
    '05':'Hautes-Alpes','06':'Alpes-Maritimes','07':'Ardèche','08':'Ardennes',
    '09':'Ariège','10':'Aube','11':'Aude','12':'Aveyron','13':'Bouches-du-Rhône',
    '14':'Calvados','15':'Cantal','16':'Charente','17':'Charente-Maritime',
    '18':'Cher','19':'Corrèze','2A':'Corse-du-Sud','2B':'Haute-Corse',
    '21':'Côte-d\'Or','22':'Côtes-d\'Armor','23':'Creuse','24':'Dordogne',
    '25':'Doubs','26':'Drôme','27':'Eure','28':'Eure-et-Loir','29':'Finistère',
    '30':'Gard','31':'Haute-Garonne','32':'Gers','33':'Gironde','34':'Hérault',
    '35':'Ille-et-Vilaine','36':'Indre','37':'Indre-et-Loire','38':'Isère',
    '39':'Jura','40':'Landes','41':'Loir-et-Cher','42':'Loire','43':'Haute-Loire',
    '44':'Loire-Atlantique','45':'Loiret','46':'Lot','47':'Lot-et-Garonne',
    '48':'Lozère','49':'Maine-et-Loire','50':'Manche','51':'Marne',
    '52':'Haute-Marne','53':'Mayenne','54':'Meurthe-et-Moselle','55':'Meuse',
    '56':'Morbihan','57':'Moselle','58':'Nièvre','59':'Nord','60':'Oise',
    '61':'Orne','62':'Pas-de-Calais','63':'Puy-de-Dôme','64':'Pyrénées-Atlantiques',
    '65':'Hautes-Pyrénées','66':'Pyrénées-Orientales','67':'Bas-Rhin',
    '68':'Haut-Rhin','69':'Rhône','70':'Haute-Saône','71':'Saône-et-Loire',
    '72':'Sarthe','73':'Savoie','74':'Haute-Savoie','75':'Paris',
    '76':'Seine-Maritime','77':'Seine-et-Marne','78':'Yvelines',
    '79':'Deux-Sèvres','80':'Somme','81':'Tarn','82':'Tarn-et-Garonne',
    '83':'Var','84':'Vaucluse','85':'Vendée','86':'Vienne','87':'Haute-Vienne',
    '88':'Vosges','89':'Yonne','90':'Territoire de Belfort','91':'Essonne',
    '92':'Hauts-de-Seine','93':'Seine-Saint-Denis','94':'Val-de-Marne',
    '95':'Val-d\'Oise','97':'DOM-TOM','98':'Polynésie française'
  };

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (q.length < 2) { result.innerHTML = ''; return; }

    const ql = q.toLowerCase();
    const matches = communes
      .filter(c => c.name.toLowerCase().startsWith(ql))
      .slice(0, 8);

    if (matches.length === 0) {
      result.innerHTML = '<div class="search-none">No match found.</div>';
      return;
    }

    result.innerHTML = matches.map(c => {
      const deptName = DEPT_NAMES[c.dept] || `Dept ${c.dept}`;
      const nameLen = c.name.length;
      return `<div class="search-row">
        <span class="search-name">${c.name}</span>
        <span class="search-meta">${deptName} · ${nameLen} chars · code ${c.code}</span>
      </div>`;
    }).join('');
  });
}
