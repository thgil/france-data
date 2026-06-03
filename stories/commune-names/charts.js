// charts.js — commune-names story

export function drawTopNames(selector, topNames) {
  const el = document.querySelector(selector);
  if (!el) return;

  const Plot = window.Plot;
  if (!Plot) { el.textContent = 'Plot not loaded'; return; }

  const data = topNames.slice(0, 20);

  const chart = Plot.plot({
    marginLeft: 160,
    marginRight: 40,
    marginTop: 16,
    marginBottom: 32,
    height: 380,
    width: el.clientWidth || 640,
    x: {
      label: 'Communes with this name →',
      grid: true,
      tickFormat: d => d,
    },
    y: {
      label: null,
    },
    marks: [
      Plot.barX(data, {
        x: 'count',
        y: 'name',
        sort: { y: '-x' },
        fill: '#7a5c3a',
        title: d => `${d.name}: ${d.count} communes`,
      }),
      Plot.text(data, {
        x: 'count',
        y: 'name',
        text: d => d.count,
        dx: 6,
        fontSize: 11,
        fill: '#555',
        sort: { y: '-x' },
      }),
    ],
  });

  el.innerHTML = '';
  el.appendChild(chart);
}

export function drawLengthHistogram(selector, lenDist) {
  const el = document.querySelector(selector);
  if (!el) return;

  const Plot = window.Plot;
  if (!Plot) { el.textContent = 'Plot not loaded'; return; }

  const chart = Plot.plot({
    marginLeft: 48,
    marginRight: 24,
    marginTop: 16,
    marginBottom: 40,
    height: 240,
    width: el.clientWidth || 640,
    x: {
      label: 'Name length (characters) →',
      tickSpacing: 40,
    },
    y: {
      label: '↑ Communes',
      grid: true,
    },
    marks: [
      Plot.rectY(lenDist, {
        x1: d => d.length - 0.5,
        x2: d => d.length + 0.5,
        y: 'count',
        fill: '#7a5c3a',
        title: d => `${d.length} chars: ${d.count.toLocaleString('fr-FR')} communes`,
      }),
      Plot.ruleY([0]),
    ],
  });

  el.innerHTML = '';
  el.appendChild(chart);
}
