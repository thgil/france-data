export function drawTopNamesChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const top20 = data.topNames.slice(0, 20);
  const width = Math.min(container.clientWidth || 680, 680);

  const chart = Plot.plot({
    width,
    height: 520,
    marginLeft: 180,
    marginRight: 60,
    marginTop: 16,
    marginBottom: 32,
    style: {
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '12px',
      background: 'transparent',
    },
    x: {
      label: 'Number of bars with this name',
      labelOffset: 28,
      grid: true,
    },
    y: {
      label: null,
      domain: top20.map(d => d.name).reverse(),
    },
    marks: [
      Plot.barX(top20, {
        x: 'count',
        y: 'name',
        sort: { y: '-x' },
        fill: d => d.name === 'Cafe des Sports' ? '#b32020' : '#c8a882',
        tip: true,
        title: d => `${d.name}: ${d.count} locations`,
      }),
      Plot.text(top20, {
        x: 'count',
        y: 'name',
        text: d => ` ${d.count}`,
        dx: 2,
        textAnchor: 'start',
        fill: '#666',
        fontSize: 11,
      }),
      Plot.ruleX([0]),
    ],
  });

  container.appendChild(chart);
}
