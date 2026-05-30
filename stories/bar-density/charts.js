// stories/bar-density/charts.js
// Horizontal bar chart: all 96 metropolitan départements ranked by bars per 10k residents.
// Export: drawDeptChart(selector, data)

import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

const ACCENT    = '#b32020';
const AMBER     = '#c67c00';
const MUTED_TOP = '#8b1a1a';
const MUTED_BOT = '#aaa';
const BASELINE  = '#666';

function colorFor(d, national) {
  if (d.dept === '75') return AMBER;
  if (d.per10k >= 15)  return MUTED_TOP;
  if (d.per10k <= 4)   return MUTED_BOT;
  return BASELINE;
}

export function drawDeptChart(selector, data) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!container) return;

  const { departments, national } = data;

  const sorted = [...departments].sort((a, b) => a.per10k - b.per10k);

  const chart = Plot.plot({
    marginLeft: 140,
    marginRight: 60,
    marginTop: 10,
    marginBottom: 36,
    width: Math.min(container.clientWidth || 720, 760),
    height: sorted.length * 11 + 50,
    style: {
      background: 'transparent',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '11px',
      color: '#1a1a1a',
    },
    x: {
      label: 'bars per 10,000 residents →',
      labelAnchor: 'right',
      grid: true,
      tickFormat: d => d,
    },
    y: {
      label: null,
      tickSize: 0,
    },
    marks: [
      // National average rule
      Plot.ruleX([national], {
        stroke: '#c67c00',
        strokeWidth: 1,
        strokeDasharray: '4,3',
      }),
      // Bars
      Plot.barX(sorted, {
        x: 'per10k',
        y: 'name',
        sort: { y: 'x' },
        fill: d => colorFor(d, national),
        tip: false,
      }),
      // Value labels for top 5 and bottom 5
      Plot.text(sorted.filter(d => d.per10k >= 15 || d.per10k <= 4 || d.dept === '75'), {
        x: 'per10k',
        y: 'name',
        text: d => d.per10k.toFixed(1),
        textAnchor: 'start',
        dx: 3,
        fontSize: 10,
        fill: d => d.per10k >= 15 ? MUTED_TOP : (d.dept === '75' ? AMBER : '#888'),
      }),
    ],
  });

  container.appendChild(chart);
  return chart;
}
