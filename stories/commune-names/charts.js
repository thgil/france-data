import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

export function drawTopNamesChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const data = stats.top_names.slice(0, 15).reverse();

  const chart = Plot.plot({
    marginLeft: 160,
    marginRight: 40,
    marginTop: 10,
    marginBottom: 30,
    width: Math.min(el.offsetWidth || 680, 680),
    height: 340,
    style: {
      background: 'transparent',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '12px',
      color: '#1a1a1a',
    },
    x: {
      label: 'Communes sharing this name',
      tickFormat: d => d,
      grid: true,
    },
    y: {
      label: null,
    },
    marks: [
      Plot.barX(data, {
        x: 'count',
        y: 'name',
        fill: '#b32020',
        fillOpacity: 0.85,
        tip: true,
        title: d => `${d.name}\n${d.count} communes`,
      }),
      Plot.ruleX([0]),
    ],
  });

  el.appendChild(chart);
}

export function drawLengthChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const raw = stats.length_distribution;

  const buckets = [
    { label: '1–5', min: 1, max: 5 },
    { label: '6–10', min: 6, max: 10 },
    { label: '11–15', min: 11, max: 15 },
    { label: '16–20', min: 16, max: 20 },
    { label: '21–25', min: 21, max: 25 },
    { label: '26–30', min: 26, max: 30 },
    { label: '31+', min: 31, max: Infinity },
  ].map(b => ({
    label: b.label,
    count: raw.filter(d => d.length >= b.min && d.length <= b.max)
              .reduce((sum, d) => sum + d.count, 0),
  }));

  const chart = Plot.plot({
    marginLeft: 60,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 40,
    width: Math.min(el.offsetWidth || 560, 560),
    height: 220,
    style: {
      background: 'transparent',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '12px',
      color: '#1a1a1a',
    },
    x: {
      label: 'Name length (characters)',
    },
    y: {
      label: 'Communes',
      grid: true,
      tickFormat: d => d.toLocaleString('fr-FR'),
    },
    marks: [
      Plot.barY(buckets, {
        x: 'label',
        y: 'count',
        fill: '#555',
        fillOpacity: 0.75,
        tip: true,
        title: d => `${d.label} chars\n${d.count.toLocaleString('fr-FR')} communes`,
      }),
      Plot.ruleY([0]),
    ],
  });

  el.appendChild(chart);
}
