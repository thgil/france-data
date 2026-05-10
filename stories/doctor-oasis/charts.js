/* charts.js — doctor-oasis story */

const CATEGORY_COLOR = {
  ski:      '#4a90d9',
  island:   '#3aab7b',
  mountain: '#8b6fc0',
  suburb:   '#e07b39',
  other:    '#999',
};

const CATEGORY_LABEL = {
  ski:      'Ski resort',
  island:   'Island',
  mountain: 'Mountain valley',
  suburb:   'Lille suburb',
  other:    'Other',
};

export function drawTopCommunesChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container || typeof Plot === 'undefined') return;

  const top = data.top25.slice(0, 20).reverse(); // reverse so highest is at top
  const nationalAvg = data.stats.nationalAvgApl;
  const parisAvg = data.stats.parisAvgApl;

  const chart = Plot.plot({
    width: Math.min(container.clientWidth || 680, 780),
    height: 520,
    marginLeft: 210,
    marginRight: 60,
    marginTop: 20,
    marginBottom: 40,
    x: {
      label: 'APL score (standardised GP consultations per resident per year)',
      grid: true,
    },
    y: {
      label: null,
    },
    marks: [
      Plot.ruleX([nationalAvg], {
        stroke: '#999',
        strokeDasharray: '4,3',
        strokeWidth: 1,
      }),
      Plot.ruleX([parisAvg], {
        stroke: '#c67c00',
        strokeDasharray: '4,3',
        strokeWidth: 1,
      }),
      Plot.barX(top, {
        x: 'apl',
        y: 'name',
        fill: d => CATEGORY_COLOR[d.category] || '#999',
        rx: 2,
        title: d =>
          `${d.name} (${d.dept})\nAPL: ${d.apl}\nPop: ${d.pop.toLocaleString('fr-FR')}\n${CATEGORY_LABEL[d.category] || d.category}`,
      }),
      Plot.text(top, {
        x: 'apl',
        y: 'name',
        text: d => d.apl.toFixed(1),
        dx: 5,
        fontSize: 10,
        fill: '#555',
        textAnchor: 'start',
      }),
      Plot.text(
        [{ x: nationalAvg, label: `National avg ${nationalAvg}` }],
        { x: 'x', y: top[0]?.name, text: 'label', dy: -14, fontSize: 10, fill: '#999' }
      ),
      Plot.text(
        [{ x: parisAvg, label: `Paris ${parisAvg}` }],
        { x: 'x', y: top[0]?.name, text: 'label', dy: -28, fontSize: 10, fill: '#c67c00' }
      ),
    ],
  });

  container.appendChild(chart);
}

export function drawBucketChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container || typeof Plot === 'undefined') return;

  const buckets = data.buckets;

  const chart = Plot.plot({
    width: Math.min(container.clientWidth || 680, 600),
    height: 220,
    marginLeft: 60,
    marginRight: 20,
    marginTop: 20,
    marginBottom: 40,
    x: { label: 'APL range', domain: buckets.map(b => b.label) },
    y: { label: 'Communes', grid: true },
    color: {
      domain: ['< 1', '1–2.5', '2.5–5', '5–10', '> 10'],
      range: ['#d44', '#e8884a', '#b8b', '#4a90d9', '#3aab7b'],
    },
    marks: [
      Plot.barY(buckets, {
        x: 'label',
        y: 'count',
        fill: 'label',
        rx: 2,
        title: d =>
          `${d.label}: ${d.count.toLocaleString('fr-FR')} communes\n${(d.pop / 1e6).toFixed(1)}M residents`,
      }),
      Plot.ruleY([0]),
      Plot.text(buckets, {
        x: 'label',
        y: 'count',
        text: d => d.count.toLocaleString('fr-FR'),
        dy: -7,
        fontSize: 11,
        fill: '#333',
      }),
    ],
  });

  container.appendChild(chart);
}
