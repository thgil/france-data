// stories/commune-names/charts.js
// Observable Plot bar charts for commune name analysis.

import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK   = '#1a1a1a';
const MUTE  = '#888';
const ACCENT = '#b32020';

function plotOptions(width) {
  return { style: { fontFamily: SANS, fontSize: '13px', background: 'transparent' }, width };
}

export function drawSaintChart(selector, saintBases) {
  const el = document.querySelector(selector);
  if (!el) return;
  const w = el.offsetWidth || 640;

  const chart = Plot.plot({
    ...plotOptions(w),
    marginLeft: 130,
    marginRight: 40,
    marginBottom: 30,
    x: { label: 'Number of communes →', grid: true },
    y: { label: null },
    marks: [
      Plot.barX(saintBases, {
        x: 'count',
        y: 'name',
        sort: { y: '-x' },
        fill: ACCENT,
        tip: true,
      }),
      Plot.text(saintBases, {
        x: 'count',
        y: 'name',
        text: d => d.count.toString(),
        sort: { y: '-x' },
        dx: 5,
        textAnchor: 'start',
        fill: INK,
        fontSize: 12,
      }),
    ],
  });

  el.replaceChildren(chart);
}

export function drawTopNamesChart(selector, topNames) {
  const el = document.querySelector(selector);
  if (!el) return;
  const w = el.offsetWidth || 640;

  const chart = Plot.plot({
    ...plotOptions(w),
    marginLeft: 140,
    marginRight: 40,
    marginBottom: 30,
    x: { label: 'Number of communes sharing this name →', grid: true },
    y: { label: null },
    marks: [
      Plot.barX(topNames, {
        x: 'count',
        y: 'name',
        sort: { y: '-x' },
        fill: '#5a7a5a',
        tip: true,
      }),
      Plot.text(topNames, {
        x: 'count',
        y: 'name',
        text: d => d.count.toString(),
        sort: { y: '-x' },
        dx: 5,
        textAnchor: 'start',
        fill: INK,
        fontSize: 12,
      }),
    ],
  });

  el.replaceChildren(chart);
}
