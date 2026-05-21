// stories/village-called-y/charts.js
// Two charts using Observable Plot:
//   drawLengthHistogram(selector, stats)   — name-length distribution
//   drawMostCommonChart(selector, stats)   — most-shared commune names

import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

export function drawLengthHistogram(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  // Build flat array from distribution, capping at length 29 + a "30+" bucket
  const data = stats.lengthDistribution.map(d => ({
    length: d.length === '30+' ? 30 : +d.length,
    count: d.count,
    label: d.length === '30+' ? '30+' : String(d.length),
  }));

  const chart = Plot.plot({
    width: el.offsetWidth || 680,
    height: 220,
    marginLeft: 48,
    marginBottom: 36,
    marginTop: 16,
    style: { fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: '12px', background: 'transparent' },
    x: {
      label: 'Name length (characters)',
      tickFormat: (d) => {
        const found = data.find(r => r.length === d);
        return found ? found.label : String(d);
      },
    },
    y: {
      label: 'Communes',
      grid: true,
      tickFormat: d => d >= 1000 ? (d / 1000).toFixed(0) + 'k' : d,
    },
    marks: [
      Plot.barY(data, {
        x: 'length',
        y: 'count',
        fill: '#b32020',
        fillOpacity: 0.85,
        title: d => `${d.label} chars: ${d.count.toLocaleString('fr-FR')} communes`,
      }),
      Plot.ruleY([0], { stroke: '#1a1a1a', strokeWidth: 0.5 }),
    ],
  });

  el.innerHTML = '';
  el.appendChild(chart);
}

export function drawMostCommonChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const data = stats.mostCommon.slice(0, 15);

  const chart = Plot.plot({
    width: el.offsetWidth || 680,
    height: 340,
    marginLeft: 160,
    marginRight: 48,
    marginTop: 12,
    marginBottom: 24,
    style: { fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: '12px', background: 'transparent' },
    x: {
      label: 'Communes sharing this name',
      domain: [0, 14],
    },
    y: {
      label: null,
      domain: data.map(d => d.name),
    },
    marks: [
      Plot.barX(data, {
        x: 'count',
        y: 'name',
        fill: '#b32020',
        fillOpacity: 0.85,
        sort: { y: '-x' },
        title: d => `${d.name}: ${d.count} communes`,
      }),
      Plot.text(data, {
        x: 'count',
        y: 'name',
        text: d => String(d.count),
        dx: 6,
        dy: 0,
        fill: '#1a1a1a',
        fontSize: 11,
        textAnchor: 'start',
      }),
      Plot.ruleX([0], { stroke: '#1a1a1a', strokeWidth: 0.5 }),
    ],
  });

  el.innerHTML = '';
  el.appendChild(chart);
}
