/* charts.js — outre-mer story */

const DESERT_RED   = '#b32020';
const SEVERE_RED   = '#7a0000';
const ADEQUATE_AMB = '#d97706';
const GOOD_GREEN   = '#16803a';
const METRO_GREY   = '#888';

export function drawTerritoryChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const { territories, metro } = data;

  const rows = [
    ...territories.map(t => ({ label: t.name, pct: t.pctDesert, pop: t.population, type: 'territory' })),
    { label: 'Metro France', pct: metro.pctDesert, pop: metro.population, type: 'reference' },
  ].sort((a, b) => b.pct - a.pct);

  const chart = Plot.plot({
    width: Math.min(el.offsetWidth || 680, 680),
    height: rows.length * 52 + 70,
    marginLeft: 130,
    marginRight: 80,
    marginBottom: 40,
    x: {
      label: '→ % population in medical desert (APL < 2.5)',
      domain: [0, 75],
      grid: true,
    },
    y: {
      domain: rows.map(d => d.label),
    },
    marks: [
      Plot.barX(rows, {
        y: 'label',
        x: 'pct',
        fill: d => {
          if (d.type === 'reference') return '#c8c0b0';
          if (d.pct === 0)   return GOOD_GREEN;
          if (d.pct < 10)    return '#5aa85c';
          if (d.pct < 20)    return ADEQUATE_AMB;
          return DESERT_RED;
        },
        rx: 2,
        title: d => `${d.label}: ${d.pct}% of ${d.pop.toLocaleString('en')} people`,
      }),
      Plot.ruleX([metro.pctDesert], {
        stroke: METRO_GREY,
        strokeDasharray: '4 3',
        strokeWidth: 1.5,
      }),
      Plot.text(rows, {
        y: 'label',
        x: 'pct',
        text: d => `${d.pct}%`,
        textAnchor: 'start',
        dx: 6,
        fontSize: 13,
        fontWeight: 600,
        fill: d => {
          if (d.type === 'reference') return '#888';
          if (d.pct === 0) return GOOD_GREEN;
          if (d.pct > 40)  return DESERT_RED;
          return '#333';
        },
      }),
      Plot.ruleX([0]),
    ],
  });
  el.appendChild(chart);
}

export function drawGuyaneTable(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const { guyaneCommunes } = data;

  const maxPop = Math.max(...guyaneCommunes.map(c => c.pop));
  const aplMax = 3.0;

  const table = document.createElement('table');
  table.className = 'commune-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Commune</th>
        <th>Population</th>
        <th>APL score</th>
        <th>Status</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');
  for (const c of guyaneCommunes) {
    const { name, pop, apl, category } = c;
    const aplBarWidth = Math.round((Math.min(apl, aplMax) / aplMax) * 100);
    const aplColor = category === 'apl0'   ? SEVERE_RED
                   : category === 'severe' ? '#b32020'
                   : category === 'desert' ? ADEQUATE_AMB
                   : GOOD_GREEN;
    const statusLabel = category === 'apl0'   ? 'No access'
                      : category === 'severe' ? 'Severe desert'
                      : category === 'desert' ? 'Medical desert'
                      : 'Adequate';
    const statusColor = category === 'apl0'   ? SEVERE_RED
                      : category === 'severe' ? '#b32020'
                      : category === 'desert' ? '#a05000'
                      : GOOD_GREEN;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600">${name}</td>
      <td style="text-align:right;font-variant-numeric:tabular-nums">${pop.toLocaleString('en')}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">
          <div style="width:80px;height:8px;background:#ede8e0;border-radius:2px;overflow:hidden">
            <div style="width:${aplBarWidth}%;height:100%;background:${aplColor};border-radius:2px"></div>
          </div>
          <span style="font-variant-numeric:tabular-nums;min-width:3.5ch;font-size:13px">${apl === 0 ? '0.00' : apl.toFixed(2)}</span>
        </div>
      </td>
      <td style="text-align:right;color:${statusColor};font-size:12px;font-weight:600">${statusLabel}</td>
    `;
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  el.appendChild(table);
}
