/* charts.js for top-apl story */

const ACCENT = '#b32020';

export function drawHistogram(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const { histData } = stats;
  // Filter to labels with interesting data (skip empty bins at top)
  const rows = histData.filter(d => d.count > 0 || d.lo <= 6);

  const chart = Plot.plot({
    width: Math.min(el.offsetWidth || 680, 680),
    height: 260,
    marginLeft: 56,
    marginBottom: 40,
    x: {
      label: 'APL score range',
      tickRotate: -30,
    },
    y: {
      label: '↑ Communes',
      grid: true,
    },
    color: {
      domain: ['desert', 'adequate', 'well-served', 'extreme'],
      range: ['#b32020', '#d97706', '#16803a', '#2563eb'],
    },
    marks: [
      Plot.barY(rows, {
        x: d => d.label,
        y: 'count',
        fill: d => {
          if (d.lo < 1)    return '#b32020';
          if (d.lo < 2.5)  return '#e06020';
          if (d.lo < 4)    return '#d97706';
          if (d.lo < 6)    return '#16803a';
          return '#2563eb';
        },
        title: d => `${d.label}: ${d.count.toLocaleString('en')} communes`,
        rx: 2,
      }),
      Plot.ruleY([0], { stroke: '#ccc' }),
      Plot.text(
        [{ label: '↑ 2.5: desert\nthreshold', lo: 2 }],
        {
          x: '2–2.5',
          y: rows.find(d => d.lo === 2)?.count * 0.5 || 5000,
          text: () => '← desert threshold',
          textAnchor: 'end',
          dx: -6,
          fontSize: 10,
          fill: '#888',
        }
      ),
    ],
  });
  el.appendChild(chart);
}

export function drawZeroChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const { bottomMetroCommunes } = stats;
  const rows = [...bottomMetroCommunes]
    .sort((a, b) => b.pop - a.pop)
    .slice(0, 12);

  const chart = Plot.plot({
    width: Math.min(el.offsetWidth || 680, 680),
    height: rows.length * 28 + 60,
    marginLeft: 200,
    marginRight: 80,
    x: {
      label: 'Population →',
      grid: true,
    },
    y: {
      label: null,
      domain: rows.map(d => d.name),
    },
    marks: [
      Plot.barX(rows, {
        y: 'name',
        x: 'pop',
        fill: ACCENT,
        fillOpacity: 0.8,
        rx: 2,
        title: d => `${d.name} (${d.dept}): pop ${d.pop.toLocaleString('en')}, APL = 0`,
      }),
      Plot.text(rows, {
        y: 'name',
        x: 'pop',
        text: d => ` ${d.pop.toLocaleString('en')}`,
        textAnchor: 'start',
        dx: 3,
        fontSize: 11,
        fill: '#444',
      }),
      Plot.text(rows, {
        y: 'name',
        x: 0,
        text: d => `  (${d.dept})`,
        textAnchor: 'start',
        dx: 2,
        fontSize: 10,
        fill: '#aaa',
      }),
      Plot.ruleX([0], { stroke: '#ccc' }),
    ],
  });
  el.appendChild(chart);
}
