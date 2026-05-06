export function renderCharts(stats) {
  renderStatBoxes(stats);
  renderPerCapitaChart(stats);
  renderDeptsChart(stats);
  renderTables(stats);
}

function renderStatBoxes(stats) {
  const container = document.getElementById('stat-row');
  if (!container) return;

  const boxes = [
    { num: stats.totals.totalBakeries.toLocaleString('fr-FR'), label: 'Bakeries in IDF' },
    { num: stats.totals.communesWithBakeries.toLocaleString('fr-FR'), label: 'Communes with ≥1 bakery' },
    { num: stats.totals.communesZeroBakeries.toLocaleString('fr-FR'), label: 'Communes with none' },
    { num: stats.totals.overallPer10k.toFixed(1), label: 'Per 10,000 residents (IDF avg)' },
  ];

  container.innerHTML = boxes.map(b => `
    <div class="stat-box">
      <span class="stat-num">${b.num}</span>
      <span class="stat-label">${b.label}</span>
    </div>
  `).join('');
}

function renderPerCapitaChart(stats) {
  const el = document.getElementById('chart-percapita');
  if (!el || typeof Plot === 'undefined') return;

  const data = stats.top15PerCapita;

  const chart = Plot.plot({
    marginLeft: 210,
    marginRight: 60,
    width: Math.min(el.offsetWidth || 720, 760),
    height: 400,
    x: {
      label: 'Bakeries per 10,000 residents →',
      domain: [0, Math.ceil(Math.max(...data.map(d => d.per10k)) / 5) * 5],
    },
    y: {
      label: null,
      domain: [...data].reverse().map(d => d.name),
    },
    marks: [
      Plot.barX(data, {
        x: 'per10k',
        y: 'name',
        fill: d => d.dept === '75' ? '#b32020' : '#8c6d3f',
        title: d => `${d.name}\n${d.bakeries} bakeries · ${d.population.toLocaleString('fr-FR')} residents\n${d.per10k}/10k`,
      }),
      Plot.text(data, {
        x: 'per10k',
        y: 'name',
        text: d => ` ${d.per10k.toFixed(1)}`,
        dx: 3,
        textAnchor: 'start',
        fontSize: 11,
        fill: '#555',
      }),
      Plot.ruleX([0]),
    ],
    style: {
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '12px',
      background: '#faf7f2',
    },
  });

  const legend = document.createElement('div');
  legend.style.cssText = 'font-size:11px;color:#666;margin-bottom:6px;font-family:var(--sans);display:flex;gap:16px;';
  legend.innerHTML = `
    <span style="display:inline-flex;align-items:center;gap:5px;">
      <span style="display:inline-block;width:12px;height:12px;background:#b32020;border-radius:2px;"></span>
      Paris arrondissement
    </span>
    <span style="display:inline-flex;align-items:center;gap:5px;">
      <span style="display:inline-block;width:12px;height:12px;background:#8c6d3f;border-radius:2px;"></span>
      Outer IDF commune
    </span>
  `;

  el.appendChild(legend);
  el.appendChild(chart);
}

function renderDeptsChart(stats) {
  const el = document.getElementById('chart-depts');
  if (!el || typeof Plot === 'undefined') return;

  const data = [...stats.depts].sort((a, b) => b.per10k - a.per10k);

  const chart = Plot.plot({
    marginLeft: 150,
    marginRight: 60,
    width: Math.min(el.offsetWidth || 720, 680),
    height: 240,
    x: {
      label: 'Bakeries per 10,000 residents →',
      domain: [0, 10],
    },
    y: {
      label: null,
      domain: [...data].reverse().map(d => d.name),
    },
    marks: [
      Plot.barX(data, {
        x: 'per10k',
        y: 'name',
        fill: d => d.dept === '75' ? '#b32020' : '#8c6d3f',
        title: d => `${d.name} (${d.dept})\n${d.bakeries} bakeries · ${d.population.toLocaleString('fr-FR')} residents\n${d.per10k}/10k`,
      }),
      Plot.text(data, {
        x: 'per10k',
        y: 'name',
        text: d => ` ${d.per10k.toFixed(1)}`,
        dx: 3,
        textAnchor: 'start',
        fontSize: 11,
        fill: '#555',
      }),
      Plot.ruleX([0]),
    ],
    style: {
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '12px',
      background: '#faf7f2',
    },
  });

  el.appendChild(chart);
}

function renderTables(stats) {
  const countTbody = document.querySelector('#table-count tbody');
  if (countTbody) {
    countTbody.innerHTML = stats.top15Count.slice(0, 10).map((d, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="place">
          ${d.name}
          <span class="sub">Dept ${d.dept} · ${d.population.toLocaleString('fr-FR')} residents</span>
        </td>
        <td>${d.bakeries}</td>
      </tr>
    `).join('');
  }

  const perCapitaTbody = document.querySelector('#table-percapita tbody');
  if (perCapitaTbody) {
    perCapitaTbody.innerHTML = stats.top15PerCapita.slice(0, 10).map((d, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="place">
          ${d.name}
          <span class="sub">${d.bakeries} bakeries · ${d.population.toLocaleString('fr-FR')} residents</span>
        </td>
        <td>${d.per10k}/10k</td>
      </tr>
    `).join('');
  }
}
