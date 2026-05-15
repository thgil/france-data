import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

export function drawLengthHistogram(selector, lengthDist) {
  const el = document.querySelector(selector);
  if (!el) return;

  const chart = Plot.plot({
    width: el.clientWidth || 680,
    height: 220,
    marginLeft: 36,
    marginRight: 12,
    marginTop: 16,
    marginBottom: 36,
    x: {
      label: 'Name length (characters)',
      domain: [1, 46],
      tickFormat: d => d,
    },
    y: {
      label: 'Communes',
      grid: true,
      tickFormat: d => d >= 1000 ? `${d/1000}k` : d,
    },
    marks: [
      Plot.rectY(lengthDist, {
        x1: d => d.length - 0.4,
        x2: d => d.length + 0.4,
        y: d => d.count,
        fill: '#8b4513',
        fillOpacity: 0.75,
        title: d => `${d.length} chars: ${d.count.toLocaleString('fr-FR')} communes`,
      }),
      Plot.ruleY([0]),
    ],
    style: {
      fontFamily: "'Helvetica Neue', sans-serif",
      fontSize: 12,
    },
  });

  el.append(chart);
}

export function drawTopNamesChart(selector, mostCommon) {
  const el = document.querySelector(selector);
  if (!el) return;

  const top20 = mostCommon.slice(0, 20);

  const chart = Plot.plot({
    width: el.clientWidth || 680,
    height: 360,
    marginLeft: 160,
    marginRight: 40,
    marginTop: 12,
    marginBottom: 36,
    x: {
      label: 'Communes sharing this name',
      grid: true,
    },
    y: {
      label: null,
      domain: top20.map(d => d.name).reverse(),
    },
    marks: [
      Plot.barX(top20, {
        y: d => d.name,
        x: d => d.count,
        fill: '#8b4513',
        fillOpacity: 0.75,
        sort: { y: '-x' },
        title: d => `${d.name}: ${d.count} communes`,
      }),
      Plot.text(top20, {
        y: d => d.name,
        x: d => d.count,
        text: d => ` ${d.count}`,
        textAnchor: 'start',
        fontSize: 11,
        fill: '#555',
      }),
      Plot.ruleX([0]),
    ],
    style: {
      fontFamily: "'Helvetica Neue', sans-serif",
      fontSize: 12,
    },
  });

  el.append(chart);
}
