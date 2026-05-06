// stories/village-republic/charts.js
// Two Observable Plot charts: commune size distribution + dept "tiny commune" ranking
// Called from index.html after stats.json is loaded.

import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

const RED  = '#b32020';
const GREY = '#d8d0c0';
const INK  = '#1a1a1a';
const MUTE = '#888';

// ── Chart 1: size-bucket histogram ───────────────────────────────────────────
// Horizontal bar chart: y = bucket label, x = number of communes.
// A secondary annotation shows % of population for each bucket.
export function drawSizeChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const data = stats.buckets;

  const plot = Plot.plot({
    width: Math.min(el.offsetWidth || 680, 760),
    marginLeft: 90,
    marginRight: 80,
    height: 300,
    style: { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '13px', background: 'transparent' },
    x: {
      label: 'Number of communes',
      tickFormat: d => d >= 1000 ? `${d / 1000}K` : d,
    },
    y: {
      label: null,
      domain: data.map(d => d.label),
    },
    marks: [
      Plot.barX(data, {
        y: 'label',
        x: 'communes',
        fill: d => d.label === '100–499' || d.label === '<100' ? RED : GREY,
        tip: false,
      }),
      // Population % annotation at bar end
      Plot.text(data, {
        y: 'label',
        x: 'communes',
        text: d => `${d.pctPop}% of people`,
        textAnchor: 'start',
        dx: 6,
        fill: MUTE,
        fontSize: 11,
      }),
    ],
  });

  el.appendChild(plot);
}

// ── Chart 2: dept ranking by % tiny communes (<200 people) ───────────────────
export function drawDeptChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const data = stats.deptRanked.slice(0, 10);

  const plot = Plot.plot({
    width: Math.min(el.offsetWidth || 680, 760),
    marginLeft: 130,
    marginRight: 60,
    height: 300,
    style: { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '13px', background: 'transparent' },
    x: {
      label: '% communes with fewer than 200 residents',
      domain: [0, 75],
      tickFormat: d => `${d}%`,
    },
    y: {
      label: null,
      domain: [...data].reverse().map(d => d.name),
    },
    marks: [
      Plot.barX(data, {
        y: 'name',
        x: 'pctTiny',
        fill: (d, i) => i === 0 ? RED : GREY,
        tip: false,
      }),
      Plot.text(data, {
        y: 'name',
        x: 'pctTiny',
        text: d => `${d.pctTiny}%  (${d.tinyCommunes}/${d.communes})`,
        textAnchor: 'start',
        dx: 6,
        fill: MUTE,
        fontSize: 11,
      }),
      Plot.ruleX([0]),
    ],
  });

  el.appendChild(plot);
}
