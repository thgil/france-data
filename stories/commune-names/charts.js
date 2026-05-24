(function () {
  fetch('data.json')
    .then(r => r.json())
    .then(build);

  function build(d) {
    buildTinyTable(d.tinyCommununes);
    buildStatRow(d.stats);
    buildLenChart(d.lengthDist);
    buildSaintChart(d.topSaints);
    buildDupGrid(d.topDuplicates);
  }

  // ── Dept name lookup (abbrev only) ─────────────────────────────────
  const DEPT = {
    '01':'Ain','02':'Aisne','03':'Allier','04':'Alpes-de-Haute-Provence','05':'Hautes-Alpes',
    '06':'Alpes-Maritimes','07':'Ardèche','08':'Ardennes','09':'Ariège','10':'Aube',
    '11':'Aude','12':'Aveyron','13':'Bouches-du-Rhône','14':'Calvados','15':'Cantal',
    '16':'Charente','17':'Charente-Maritime','18':'Cher','19':'Corrèze','21':'Côte-d\'Or',
    '22':'Côtes-d\'Armor','23':'Creuse','24':'Dordogne','25':'Doubs','26':'Drôme',
    '27':'Eure','28':'Eure-et-Loir','29':'Finistère','30':'Gard','31':'Haute-Garonne',
    '32':'Gers','33':'Gironde','34':'Hérault','35':'Ille-et-Vilaine','36':'Indre',
    '37':'Indre-et-Loire','38':'Isère','39':'Jura','40':'Landes','41':'Loir-et-Cher',
    '42':'Loire','43':'Haute-Loire','44':'Loire-Atlantique','45':'Loiret','46':'Lot',
    '47':'Lot-et-Garonne','48':'Lozère','49':'Maine-et-Loire','50':'Manche','51':'Marne',
    '52':'Haute-Marne','53':'Mayenne','54':'Meurthe-et-Moselle','55':'Meuse','56':'Morbihan',
    '57':'Moselle','58':'Nièvre','59':'Nord','60':'Oise','61':'Orne','62':'Pas-de-Calais',
    '63':'Puy-de-Dôme','64':'Pyrénées-Atlantiques','65':'Hautes-Pyrénées','66':'Pyrénées-Orientales',
    '67':'Bas-Rhin','68':'Haut-Rhin','69':'Rhône','70':'Haute-Saône','71':'Saône-et-Loire',
    '72':'Sarthe','73':'Savoie','74':'Haute-Savoie','75':'Paris','76':'Seine-Maritime',
    '77':'Seine-et-Marne','78':'Yvelines','79':'Deux-Sèvres','80':'Somme','81':'Tarn',
    '82':'Tarn-et-Garonne','83':'Var','84':'Vaucluse','85':'Vendée','86':'Vienne',
    '87':'Haute-Vienne','88':'Vosges','89':'Yonne','90':'Territoire de Belfort',
    '91':'Essonne','92':'Hauts-de-Seine','93':'Seine-Saint-Denis','94':'Val-de-Marne',
    '95':'Val-d\'Oise','97':'Outre-mer',
  };

  function deptName(code) { return DEPT[code] || 'Dept. ' + code; }

  // ── Tiny communes table ────────────────────────────────────────────
  function buildTinyTable(tiny) {
    const el = document.getElementById('tiny-table');
    if (!el) return;
    let html = '<thead><tr><th>Name</th><th>Département</th><th>Population</th></tr></thead><tbody>';
    for (const c of tiny) {
      html += `<tr>
        <td>${esc(c.name)}</td>
        <td>${esc(deptName(c.dept))} (${esc(c.dept)})</td>
        <td>${c.pop ? c.pop.toLocaleString('fr-FR') : '—'}</td>
      </tr>`;
    }
    html += '</tbody>';
    el.innerHTML = html;
  }

  // ── Stat row ────────────────────────────────────────────────────────
  function buildStatRow(s) {
    const el = document.getElementById('stat-row');
    if (!el) return;
    const items = [
      { num: s.total.toLocaleString('fr-FR'), label: 'communes in France' },
      { num: s.saint.toLocaleString('fr-FR'), label: 'named after a saint' },
      { num: s.hyphenated.toLocaleString('fr-FR'), label: 'contain a hyphen' },
      { num: s.sur.toLocaleString('fr-FR'), label: 'named "-sur-" a river' },
    ];
    el.innerHTML = items.map(i =>
      `<div class="stat-box"><span class="stat-num">${i.num}</span><span class="stat-label">${i.label}</span></div>`
    ).join('');
  }

  // ── Length distribution chart ───────────────────────────────────────
  function buildLenChart(data) {
    const canvas = document.getElementById('len-chart');
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth || 640;
    const H = 240;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const pad = { top: 20, right: 16, bottom: 40, left: 52 };
    const w = W - pad.left - pad.right;
    const h = H - pad.top - pad.bottom;

    const vals = data.map(d => d.n);
    const maxVal = Math.max(...vals);

    const barW = w / data.length;

    ctx.fillStyle = '#1a1a1a';
    ctx.font = '11px Helvetica Neue, Helvetica, Arial, sans-serif';

    // Y gridlines
    const ticks = [0, 1000, 2000, 3000];
    ctx.textAlign = 'right';
    ctx.fillStyle = '#aaa';
    ctx.strokeStyle = '#e8e4dc';
    ctx.lineWidth = 1;
    for (const t of ticks) {
      const y = pad.top + h - (t / maxVal) * h;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + w, y);
      ctx.stroke();
      ctx.fillText(t === 0 ? '0' : (t / 1000) + 'k', pad.left - 6, y + 4);
    }

    // Bars
    data.forEach((d, i) => {
      const x = pad.left + i * barW;
      const bh = (d.n / maxVal) * h;
      const y = pad.top + h - bh;
      // Colour the bimodal humps
      const len = typeof d.l === 'number' ? d.l : 26;
      ctx.fillStyle = len <= 12 ? '#b32020' : (len <= 22 ? '#c8602c' : '#888');
      ctx.fillRect(x + 1, y, barW - 2, bh);
    });

    // X axis labels
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.font = '10px Helvetica Neue, Helvetica, Arial, sans-serif';
    data.forEach((d, i) => {
      const show = (typeof d.l === 'number' && (d.l % 5 === 0 || d.l === 1)) || d.l === '26+';
      if (!show) return;
      const x = pad.left + i * barW + barW / 2;
      ctx.fillText(String(d.l), x, pad.top + h + 16);
    });

    // Axis label
    ctx.fillStyle = '#999';
    ctx.font = '11px Helvetica Neue, Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('characters', pad.left + w / 2 - 20, pad.top + h + 34);
  }

  // ── Saint name bar chart ───────────────────────────────────────────
  function buildSaintChart(data) {
    const canvas = document.getElementById('saint-chart');
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth || 640;
    const H = 320;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const pad = { top: 12, right: 60, bottom: 20, left: 160 };
    const w = W - pad.left - pad.right;
    const h = H - pad.top - pad.bottom;

    const maxVal = data[0].count;
    const rowH = h / data.length;

    ctx.font = '12px Helvetica Neue, Helvetica, Arial, sans-serif';

    data.forEach((d, i) => {
      const y = pad.top + i * rowH;
      const bw = (d.count / maxVal) * w;

      // Bar
      ctx.fillStyle = '#b32020';
      ctx.fillRect(pad.left, y + 3, bw, rowH - 6);

      // Label
      ctx.fillStyle = '#1a1a1a';
      ctx.textAlign = 'right';
      ctx.fillText(d.name, pad.left - 8, y + rowH / 2 + 4);

      // Value
      ctx.fillStyle = '#666';
      ctx.textAlign = 'left';
      ctx.fillText(d.count, pad.left + bw + 6, y + rowH / 2 + 4);
    });
  }

  // ── Duplicate names tag cloud ──────────────────────────────────────
  function buildDupGrid(data) {
    const el = document.getElementById('dup-grid');
    if (!el) return;

    const maxCount = data[0].count;
    el.innerHTML = data.map(d => {
      const size = 14 + Math.round((d.count / maxCount) * 10);
      return `<span class="dup-tag" style="font-size:${size}px">${esc(d.name)}<span class="dup-count">×${d.count}</span></span>`;
    }).join('');
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
