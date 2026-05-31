import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

export function drawTopNames(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;
  const data = stats.topNames.slice(0, 15);
  const chart = Plot.plot({
    width: Math.min(680, el.offsetWidth || 680),
    height: 320,
    marginLeft: 180,
    marginRight: 40,
    style: { background: 'transparent', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: '12px' },
    x: { label: 'Number of communes', grid: true },
    y: { label: null },
    marks: [
      Plot.barX(data, {
        x: 'count',
        y: 'name',
        sort: { y: '-x' },
        fill: '#b32020',
        tip: true,
      }),
      Plot.ruleX([0])
    ]
  });
  el.appendChild(chart);
}

export function drawSaintNames(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;
  const data = stats.topSaints.slice(0, 12);
  const chart = Plot.plot({
    width: Math.min(680, el.offsetWidth || 680),
    height: 280,
    marginLeft: 80,
    marginRight: 40,
    style: { background: 'transparent', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: '12px' },
    x: { label: 'Communes named Saint-[name]', grid: true },
    y: { label: null },
    marks: [
      Plot.barX(data, {
        x: 'count',
        y: 'name',
        sort: { y: '-x' },
        fill: '#4a7c9a',
        tip: true,
      }),
      Plot.ruleX([0])
    ]
  });
  el.appendChild(chart);
}

export function drawLengthDist(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;
  // Filter to reasonable lengths (1–45), group longer tails
  const data = stats.lenDist.filter(d => d.len <= 45);
  const chart = Plot.plot({
    width: Math.min(680, el.offsetWidth || 680),
    height: 220,
    marginLeft: 48,
    marginRight: 16,
    style: { background: 'transparent', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: '12px' },
    x: { label: 'Name length (characters)', tickSpacing: 40 },
    y: { label: 'Communes', grid: true },
    marks: [
      Plot.barY(data, {
        x: 'len',
        y: 'count',
        fill: '#888',
        tip: true,
      }),
      Plot.ruleY([0])
    ]
  });
  el.appendChild(chart);
}
