'use strict';

function renderStatBoxes(summary) {
  const el = document.getElementById('stat-boxes');
  if (!el) return;
  const items = [
    { num: summary.totalBars.toLocaleString('en'), label: 'Active bars in France' },
    { num: summary.nationalPer10k.toFixed(1), label: 'National avg per 10,000 residents' },
    { num: summary.topDept.per10k.toFixed(1), label: `Highest dept (${summary.topDept.name})` },
    { num: summary.communesWithZeroBars.toLocaleString('en'), label: 'Communes with zero bars' }
  ];
  el.innerHTML = items.map(i =>
    `<div class="stat-box">
      <span class="stat-num">${i.num}</span>
      <span class="stat-label">${i.label}</span>
    </div>`
  ).join('');
}

function renderDeptChart(depts) {
  const el = document.getElementById('dept-chart');
  if (!el || typeof Plot === 'undefined') return;

  const width = Math.min(el.clientWidth || 700, 900);

  const chart = Plot.plot({
    width,
    height: 1400,
    marginLeft: 180,
    marginRight: 60,
    marginTop: 20,
    marginBottom: 30,
    style: {
      fontFamily: 'var(--sans, Helvetica Neue, sans-serif)',
      fontSize: '11px',
      background: 'transparent'
    },
    x: {
      label: 'Bars per 10,000 residents →',
      labelOffset: 40,
      grid: true,
      tickFormat: d => d.toFixed(0)
    },
    y: {
      label: null,
      domain: depts.map(d => d.name)
    },
    color: {
      domain: ['top', 'mid', 'bottom', 'highlight'],
      range: ['#b5451b', '#8b7355', '#c8bfae', '#1a5276']
    },
    marks: [
      Plot.barX(depts, {
        x: 'per10k',
        y: 'name',
        fill: d => {
          if (d.rank <= 3) return 'top';
          if (d.rank >= depts.length - 4) return 'bottom';
          if (d.dept === '75') return 'highlight';
          return 'mid';
        },
        sort: { y: '-x' },
        tip: {
          format: {
            x: d => `${d.toFixed(1)}/10k`,
            fill: false
          }
        }
      }),
      Plot.ruleX([7.45], { stroke: '#888', strokeDasharray: '4,3', strokeWidth: 1 }),
      Plot.text([{ x: 7.45, label: 'National avg 7.45' }], {
        x: 'x',
        y: depts[Math.floor(depts.length * 0.55)].name,
        text: 'label',
        dx: 6,
        dy: -10,
        fontSize: 10,
        fill: '#888'
      })
    ]
  });

  el.appendChild(chart);
}

function renderCommunePills(communes) {
  const el = document.getElementById('commune-pills');
  if (!el) return;

  const featured = [
    communes.find(c => c.name === 'Gavarnie-Gèdre'),
    communes.find(c => c.name === "Île-d'Houat"),
    communes.find(c => c.name === 'Les Deux Alpes'),
    communes.find(c => c.name === 'Morzine'),
    communes.find(c => c.name === "Val-d'Isère"),
    communes.find(c => c.name === 'Courchevel')
  ].filter(Boolean);

  el.innerHTML = featured.map((c, i) => `
    <div class="commune-pill ${i === 0 ? 'commune-pill-hero' : ''}">
      <span class="pill-dept">${c.deptName} (${c.dept})</span>
      <strong>${c.name}</strong>
      <span class="pill-stat">${c.bars} bars · ${c.pop.toLocaleString('en')} residents · <strong>${c.per10k}/10k</strong></span>
    </div>
  `).join('');
}

function renderCommuneTable(communes, selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  const maxPer10k = Math.max(...communes.map(c => c.per10k));

  const rows = communes.map((c, i) => `
    <tr>
      <td class="rank-num">${i + 1}</td>
      <td><strong>${c.name}</strong></td>
      <td>${c.deptName} (${c.dept})</td>
      <td>${c.pop.toLocaleString('en')}</td>
      <td>${c.bars}</td>
      <td class="bar-cell">
        <span class="bar-fill" style="width:${Math.round(c.per10k / maxPer10k * 100)}px"></span>
      </td>
      <td><span class="per10k-val">${c.per10k}</span></td>
    </tr>
  `).join('');

  el.innerHTML = `
    <table class="ranking-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Commune</th>
          <th>Department</th>
          <th>Population</th>
          <th>Bars</th>
          <th colspan="2">Bars per 10,000</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-family:var(--sans);font-size:11px;color:var(--ink-mute);margin-top:8px;">Communes with at least 200 permanent residents.</p>
  `;
}

function renderFullDeptTable(depts, selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  const maxPer10k = Math.max(...depts.map(d => d.per10k));

  const rows = depts.map((d, i) => `
    <tr>
      <td class="rank-num">${i + 1}</td>
      <td><strong>${d.name}</strong></td>
      <td style="color:var(--ink-mute);font-size:11px;">${d.dept}</td>
      <td>${d.bars.toLocaleString('en')}</td>
      <td>${(d.pop / 1000).toFixed(0)}k</td>
      <td class="bar-cell">
        <span class="bar-fill" style="width:${Math.round(d.per10k / maxPer10k * 90)}px"></span>
      </td>
      <td><span class="per10k-val">${d.per10k.toFixed(1)}</span></td>
    </tr>
  `).join('');

  el.innerHTML = `
    <table class="ranking-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Department</th>
          <th>Code</th>
          <th>Bars</th>
          <th>Population</th>
          <th colspan="2">Per 10,000</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-family:var(--sans);font-size:11px;color:var(--ink-mute);margin-top:8px;">96 departments. Population from DREES commune-level data (INSEE 2021 base). Bars: INSEE SIRENE NAF 56.30Z, active establishments, March 2026.</p>
  `;
}
