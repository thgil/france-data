// stories/baguette-capital/charts.js
// Bar chart: bakeries per 10,000 residents by IDF commune (top 20, pop ≥ 2,000)
// Scatter: population vs density, all IDF communes with bakeries

import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

const GOLD = '#c67c00';
const GOLD_LIGHT = '#f0c060';
const PARIS_BLUE = '#1a3a6b';
const MUTED = '#888';

function isParisArr(d) {
  return d.dept === '75';
}

export function drawRankingChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const top = stats.topCommunesByDensity.slice(0, 20);

  const chart = Plot.plot({
    marginLeft: 220,
    marginRight: 60,
    marginTop: 16,
    marginBottom: 24,
    width: Math.min(el.clientWidth || 700, 900),
    height: top.length * 34 + 40,
    style: {
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '12px',
      background: 'transparent',
    },
    x: {
      label: 'Bakeries per 10,000 residents →',
      labelOffset: 36,
      tickFormat: d => d.toFixed(0),
      grid: true,
    },
    y: {
      label: null,
      domain: top.map(d => d.name).reverse(),
    },
    marks: [
      Plot.barX(top, {
        x: 'per_10k',
        y: 'name',
        sort: { y: '-x' },
        fill: d => isParisArr(d) ? PARIS_BLUE : GOLD,
        title: d =>
          `${d.name} (${d.dept})\n${d.per_10k.toFixed(1)} per 10k\n${d.bakeries} bakeries · pop ${d.pop.toLocaleString('fr-FR')}`,
        rx: 2,
      }),
      Plot.text(top, {
        x: 'per_10k',
        y: 'name',
        text: d => ` ${d.per_10k.toFixed(1)}`,
        textAnchor: 'start',
        fill: '#444',
        fontSize: 11,
        dx: 3,
      }),
    ],
  });

  el.innerHTML = '';
  el.appendChild(chart);
}

export function drawScatterChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const data = stats.allCommunes.filter(d =>
    d.per_10k !== null && d.bakeries > 0 && d.pop >= 500
  );

  const chart = Plot.plot({
    marginLeft: 48,
    marginRight: 24,
    marginTop: 16,
    marginBottom: 48,
    width: Math.min(el.clientWidth || 700, 900),
    height: 340,
    style: {
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '12px',
      background: 'transparent',
    },
    x: {
      label: 'Population (log scale) →',
      type: 'log',
      tickFormat: d => d >= 1000 ? `${(d/1000).toFixed(0)}k` : d,
      grid: true,
    },
    y: {
      label: '↑ Bakeries per 10k residents',
      grid: true,
    },
    marks: [
      Plot.dot(data.filter(d => !isParisArr(d)), {
        x: 'pop',
        y: 'per_10k',
        fill: GOLD,
        fillOpacity: 0.55,
        r: 3,
        title: d => `${d.name} (${d.dept})\n${d.per_10k.toFixed(1)}/10k · ${d.bakeries} bakeries · pop ${d.pop.toLocaleString('fr-FR')}`,
      }),
      Plot.dot(data.filter(d => isParisArr(d)), {
        x: 'pop',
        y: 'per_10k',
        fill: PARIS_BLUE,
        r: 5,
        title: d => `${d.name}\n${d.per_10k.toFixed(1)}/10k · ${d.bakeries} bakeries · pop ${d.pop.toLocaleString('fr-FR')}`,
      }),
      Plot.text(
        data.filter(d => isParisArr(d) && d.per_10k > 13),
        {
          x: 'pop',
          y: 'per_10k',
          text: d => d.name.replace(' Arrondissement', ''),
          textAnchor: 'start',
          dx: 7,
          fontSize: 10,
          fill: PARIS_BLUE,
        }
      ),
      Plot.ruleY([stats.idfAvgPer10k], {
        stroke: '#aaa',
        strokeDasharray: '4,3',
      }),
      Plot.text([{ y: stats.idfAvgPer10k }], {
        y: 'y',
        x: 500,
        text: () => `IDF avg: ${stats.idfAvgPer10k} / 10k`,
        textAnchor: 'start',
        fill: MUTED,
        fontSize: 11,
        dy: -6,
      }),
    ],
  });

  el.innerHTML = '';
  el.appendChild(chart);
}
