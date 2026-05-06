export function renderChart(data) {
  renderHBar(data);
  renderDistBar(data);
  renderDeptTables(data);
  renderStats(data);
}

function renderHBar(data) {
  const container = document.getElementById('hbar-chart');
  if (!container) return;

  const max = data.top25[0].per10k;

  const html = data.top25.map(c => {
    const pct = (c.per10k / max * 100).toFixed(1);
    const skiClass = c.isSki ? ' is-ski' : '';
    const labelClass = c.isSki ? ' is-ski' : '';
    // Format dept label
    const label = c.name.length > 22 ? c.name.slice(0, 21) + '…' : c.name;
    return `
      <div class="hbar-row">
        <div class="hbar-label${labelClass}" title="${c.name} (${c.dept})">${label}</div>
        <div class="hbar-track">
          <div class="hbar-fill${skiClass}" style="width:${pct}%"></div>
        </div>
        <div class="hbar-val">${c.per10k}</div>
      </div>`;
  }).join('');

  container.innerHTML = html;
}

function renderDistBar(data) {
  const container = document.getElementById('dist-bar');
  const legend = document.getElementById('dist-legend');
  if (!container) return;

  const total = data.totalCommunes;
  const d = data.distribution;

  const segments = [
    { label: 'No bars', count: data.communesNoBars, cls: 'seg-none' },
    { label: 'Exactly 1', count: d.onlyOne, cls: 'seg-one' },
    { label: '2–5', count: d.twoFive, cls: 'seg-few' },
    { label: '6–20', count: d.sixTwenty, cls: 'seg-more' },
    { label: '21+', count: d.twentyPlus, cls: 'seg-many' },
  ];

  container.innerHTML = segments.map(s => {
    const pct = (s.count / total * 100).toFixed(1);
    return `<div class="dist-seg ${s.cls}" style="flex:${pct}">
      <span>${pct}%</span>
    </div>`;
  }).join('');

  if (legend) {
    legend.innerHTML = segments.map(s => {
      const pct = (s.count / total * 100).toFixed(1);
      return `<div class="dl-item">
        <div class="dist-swatch ${s.cls}"></div>
        <span>${s.label}: ${s.count.toLocaleString('fr-FR')} communes (${pct}%)</span>
      </div>`;
    }).join('');
  }

  // Fill stat elements in prose
  const pctEl = document.getElementById('pct-no-bars');
  const nEl = document.getElementById('n-no-bars');
  if (pctEl) pctEl.textContent = data.pctNoBars.toFixed(1) + '%';
  if (nEl) nEl.textContent = data.communesNoBars.toLocaleString('fr-FR');
}

function renderDeptTables(data) {
  const topBody = document.querySelector('#table-top-depts tbody');
  if (topBody) {
    topBody.innerHTML = data.topDepts.slice(0, 10).map((d, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="place">${d.name}<span class="sub">${d.bars.toLocaleString('fr-FR')} bars / ${(d.pop / 1000).toFixed(0)}k residents</span></td>
        <td>${d.per10k}</td>
      </tr>`).join('');
  }

  const compareBody = document.querySelector('#table-compare tbody');
  if (compareBody) {
    const comparisons = [
      { name: 'Les Deux Alpes', note: '#1 commune', val: '201.8' },
      { name: 'Morzine', note: '#2 commune', val: '191.7' },
      { name: 'Saint-Tropez', note: 'coastal tourism', val: '95.0' },
      { name: 'Deauville', note: 'Normandy resort', val: '89.8' },
      { name: 'Paris', note: '75 — all 20 arr.', val: '14.6' },
      { name: 'Finistère', note: '29 — Bretagne', val: '11.5' },
      { name: 'National avg', note: 'all of France', val: '8.8' },
      { name: 'Nord', note: '59 — most bars abs.', val: '8.1' },
    ];
    compareBody.innerHTML = comparisons.map(c => `
      <tr>
        <td class="place">${c.name}<span class="sub">${c.note}</span></td>
        <td>${c.val}/10k</td>
      </tr>`).join('');
  }
}

function renderStats(data) {
  const topVal = document.getElementById('stat-top-val');
  const topPlace = document.getElementById('stat-top-place');
  const skiF = document.getElementById('stat-ski-frac');
  if (topVal && data.top25.length) {
    topVal.textContent = data.top25[0].per10k;
  }
  if (topPlace && data.top25.length) {
    const c = data.top25[0];
    topPlace.textContent = `${c.name} (${c.dept === '38' ? 'Isère' : c.dept}) — #1 commune`;
  }
  if (skiF) {
    skiF.textContent = `${data.skiInTop25}/25`;
  }
}
