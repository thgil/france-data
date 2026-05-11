/* charts.js — bar-names story */

export function drawTopNamesChart(selector, top20) {
  const el = document.querySelector(selector);
  if (!el) return;

  // Proper-case the names for display
  const data = top20.map(d => ({
    name: d.name
      .replace(/^Cafe /, 'Café ')
      .replace(/ De La /g, ' de la ')
      .replace(/ Du /g, ' du ')
      .replace(/ Des /g, ' des '),
    count: d.count,
  }));

  // Sort ascending so largest is at top when rendered bottom-up
  const sorted = [...data].sort((a, b) => a.count - b.count);

  const width = Math.min(el.offsetWidth || 680, 680);
  const rowH = 26;
  const height = sorted.length * rowH + 60;
  const marginLeft = 180;

  const chart = Plot.plot({
    width,
    height,
    marginLeft,
    marginRight: 40,
    marginTop: 16,
    marginBottom: 32,
    x: {
      label: 'Number of bars →',
      labelOffset: 28,
      tickSize: 3,
    },
    y: {
      domain: sorted.map(d => d.name),
      label: null,
      tickSize: 0,
    },
    style: {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      background: 'transparent',
    },
    marks: [
      Plot.barX(sorted, {
        x: 'count',
        y: 'name',
        fill: d => d.name.includes('Sports') ? '#b34a00' : '#c0a060',
        rx: 2,
      }),
      Plot.text(sorted, {
        x: 'count',
        y: 'name',
        text: d => d.count.toString(),
        dx: 5,
        textAnchor: 'start',
        fill: '#444',
        fontSize: 11,
        fontFamily: "'Helvetica Neue', sans-serif",
      }),
      Plot.ruleX([0], { stroke: '#ccc' }),
    ],
  });

  el.appendChild(chart);
}
