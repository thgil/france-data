import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

export function drawLengthHistogram(container, lengthDist) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  const chart = Plot.plot({
    width: Math.min(el.clientWidth || 700, 800),
    height: 220,
    marginLeft: 40,
    marginBottom: 36,
    x: {
      label: 'Characters in commune name →',
      tickSpacing: 40,
    },
    y: {
      label: '↑ Communes',
      grid: true,
    },
    marks: [
      Plot.rectY(lengthDist, {
        x1: d => d.len - 0.5,
        x2: d => d.len + 0.5,
        y: 'count',
        fill: '#8b6914',
        title: d => `${d.len} chars: ${d.count.toLocaleString('fr-FR')} communes`,
      }),
      Plot.ruleY([0]),
    ],
    style: {
      fontFamily: 'var(--sans, "Helvetica Neue", sans-serif)',
      fontSize: '12px',
      background: 'transparent',
    },
  });

  el.innerHTML = '';
  el.appendChild(chart);
}

export function drawMostCommon(container, mostCommon) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  const top = mostCommon.slice(0, 15);

  const chart = Plot.plot({
    width: Math.min(el.clientWidth || 700, 700),
    height: 280,
    marginLeft: 160,
    marginBottom: 36,
    x: {
      label: '→ Communes sharing this name',
      grid: true,
    },
    y: {
      label: null,
    },
    marks: [
      Plot.barX(top, {
        x: 'count',
        y: 'name',
        sort: { y: '-x' },
        fill: '#8b6914',
        title: d => `${d.name}: ${d.count} communes`,
      }),
      Plot.ruleX([0]),
    ],
    style: {
      fontFamily: 'var(--sans, "Helvetica Neue", sans-serif)',
      fontSize: '12px',
      background: 'transparent',
    },
  });

  el.innerHTML = '';
  el.appendChild(chart);
}
