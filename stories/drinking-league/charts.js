import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/dist/plot.esm.min.js';

const AMBER      = '#c67c00';
const AMBER_PALE = '#e8c88a';
const STEEL      = '#8090a8';
const CORSE_RED  = '#b03030';
const PARIS_BLUE = '#2255aa';
const NAT_AVG    = 7.46;

function deptColor(d) {
  if (d.dept === '2A' || d.dept === '2B') return CORSE_RED;
  if (d.dept === '75') return PARIS_BLUE;
  return d.per10k >= NAT_AVG ? AMBER : STEEL;
}

export function drawLeagueChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const depts = data.depts;
  const width = Math.min(720, (el.clientWidth || 720));
  const rowH  = 14;
  const marginLeft = 168;

  const chart = Plot.plot({
    width,
    height: depts.length * rowH + 60,
    marginLeft,
    marginRight: 70,
    marginTop: 24,
    marginBottom: 32,
    x: {
      label: 'Bars per 10,000 residents →',
      domain: [0, Math.ceil(Math.max(...depts.map(d => d.per10k)) / 5) * 5],
      ticks: 6,
    },
    y: {
      label: null,
      domain: [...depts].reverse().map(d => d.name),
      tickSize: 0,
    },
    marks: [
      // National average rule
      Plot.ruleX([NAT_AVG], {
        stroke: '#c0a888',
        strokeWidth: 1.5,
        strokeDasharray: '5,3',
      }),

      // Bars
      Plot.barX(depts, {
        x: 'per10k',
        y: 'name',
        sort: { y: 'x', reverse: true },
        fill: deptColor,
        rx: 2,
        title: d => `${d.name}\n${d.per10k.toFixed(1)} bars/10k\n${d.bars.toLocaleString()} bars · ${(d.pop / 1000).toFixed(0)}k residents\n${d.region}`,
      }),

      // Value labels on the right
      Plot.text(depts, {
        x: 'per10k',
        y: 'name',
        text: d => d.per10k.toFixed(1),
        sort: { y: 'x', reverse: true },
        textAnchor: 'start',
        dx: 4,
        fontSize: 9,
        fill: '#888',
      }),
    ],
    style: {
      fontFamily: 'var(--sans, system-ui)',
      background: 'transparent',
      fontSize: '11px',
      color: '#555',
      overflow: 'visible',
    },
  });

  el.replaceChildren(chart);

  // Legend
  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex; flex-wrap:wrap; gap:16px 24px; margin-top:10px; font-family:var(--sans,system-ui); font-size:11px; color:#777; max-width:680px;';
  legend.innerHTML = `
    <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:2px;background:${CORSE_RED};display:inline-block"></span> Corse</span>
    <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:2px;background:${PARIS_BLUE};display:inline-block"></span> Paris</span>
    <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:2px;background:${AMBER};display:inline-block"></span> Above national avg (${NAT_AVG}/10k)</span>
    <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:2px;background:${STEEL};display:inline-block"></span> Below national avg</span>
  `;
  el.appendChild(legend);
}

export function drawRegionChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  // Aggregate by region
  const regionMap = new Map();
  for (const d of data.depts) {
    if (!regionMap.has(d.region)) {
      regionMap.set(d.region, { region: d.region, bars: 0, pop: 0 });
    }
    const r = regionMap.get(d.region);
    r.bars += d.bars;
    r.pop  += d.pop;
  }
  const regions = [...regionMap.values()]
    .map(r => ({ ...r, per10k: r.bars / r.pop * 10000 }))
    .sort((a, b) => b.per10k - a.per10k);

  const width = Math.min(640, (el.clientWidth || 640));

  const chart = Plot.plot({
    width,
    height: regions.length * 24 + 60,
    marginLeft: 190,
    marginRight: 60,
    marginTop: 16,
    marginBottom: 32,
    x: {
      label: 'Bars per 10,000 residents →',
      domain: [0, Math.ceil(Math.max(...regions.map(r => r.per10k)) / 2) * 2],
      ticks: 5,
    },
    y: {
      label: null,
      domain: [...regions].reverse().map(r => r.region),
      tickSize: 0,
    },
    marks: [
      Plot.ruleX([NAT_AVG], {
        stroke: '#c0a888',
        strokeWidth: 1.5,
        strokeDasharray: '5,3',
      }),
      Plot.barX(regions, {
        x: 'per10k',
        y: 'region',
        sort: { y: 'x', reverse: true },
        fill: r => r.per10k >= NAT_AVG ? AMBER : STEEL,
        rx: 2,
        title: r => `${r.region}\n${r.per10k.toFixed(1)} bars/10k\n${r.bars.toLocaleString()} bars · ${(r.pop / 1e6).toFixed(2)}M residents`,
      }),
      Plot.text(regions, {
        x: 'per10k',
        y: 'region',
        text: r => r.per10k.toFixed(1),
        sort: { y: 'x', reverse: true },
        textAnchor: 'start',
        dx: 4,
        fontSize: 10,
        fill: '#888',
      }),
    ],
    style: {
      fontFamily: 'var(--sans, system-ui)',
      background: 'transparent',
      fontSize: '11px',
      color: '#555',
    },
  });

  el.replaceChildren(chart);
}
