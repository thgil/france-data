// charts.js — commune-names story
// Renders two charts: duplicate-names bar chart, name-length distribution

import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

export function drawDuplicatesChart(selector, mostDuplicated) {
  const el = document.querySelector(selector);
  if (!el) return;

  const chart = Plot.plot({
    marginLeft: 200,
    marginRight: 48,
    width: Math.min(680, el.offsetWidth || 680),
    height: 380,
    style: {
      background: 'transparent',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '13px',
      color: '#1a1a1a',
    },
    x: {
      label: 'communes sharing this name',
      labelOffset: 36,
      tickSize: 0,
      grid: true,
      nice: true,
    },
    y: {
      label: null,
      tickSize: 0,
    },
    marks: [
      Plot.barX(mostDuplicated, {
        x: 'count',
        y: 'name',
        sort: { y: '-x' },
        fill: '#b32020',
        tip: true,
        title: d => `${d.name}: ${d.count} communes`,
      }),
      Plot.ruleX([0], { stroke: '#1a1a1a', strokeWidth: 0.5 }),
      Plot.text(mostDuplicated, {
        x: 'count',
        y: 'name',
        sort: { y: '-x' },
        text: d => String(d.count),
        dx: 6,
        dy: 0,
        textAnchor: 'start',
        fill: '#555',
        fontSize: 12,
      }),
    ],
  });

  el.appendChild(chart);
}

export function drawLengthChart(selector, lengthDist) {
  const el = document.querySelector(selector);
  if (!el) return;

  // Build array from dist object, limit to 1-20 chars for readability
  const data = Object.entries(lengthDist)
    .map(([l, c]) => ({ chars: +l, count: c }))
    .filter(d => d.chars <= 25)
    .sort((a, b) => a.chars - b.chars);

  const chart = Plot.plot({
    marginLeft: 40,
    marginRight: 16,
    marginBottom: 48,
    width: Math.min(680, el.offsetWidth || 680),
    height: 200,
    style: {
      background: 'transparent',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '12px',
      color: '#1a1a1a',
    },
    x: {
      label: 'characters in name',
      labelOffset: 36,
      tickSize: 0,
    },
    y: {
      label: 'communes',
      tickSize: 0,
      grid: true,
    },
    marks: [
      Plot.barY(data, {
        x: 'chars',
        y: 'count',
        fill: '#c67c00',
        tip: true,
        title: d => `${d.chars} chars: ${d.count.toLocaleString('fr-FR')} communes`,
      }),
      Plot.ruleY([0], { stroke: '#1a1a1a', strokeWidth: 0.5 }),
    ],
  });

  el.appendChild(chart);
}
