import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/dist/plot.esm.min.js';

const ACCENT = '#c0392b';
const PALE   = '#e0d8d0';

export function drawLorenzCurve(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const pts = stats.lorenz;

  // Key annotation points
  const annotPts = pts.filter(p => p.x === 50 || p.x === 97);

  const chart = Plot.plot({
    width: Math.min(680, el.clientWidth || 680),
    height: 360,
    marginLeft: 52,
    marginBottom: 48,
    marginRight: 16,
    x: {
      label: '% of communes (smallest → largest) →',
      domain: [0, 100],
      ticks: [0, 20, 40, 60, 80, 100],
    },
    y: {
      label: '↑ % of population',
      domain: [0, 100],
      ticks: [0, 20, 40, 60, 80, 100],
    },
    marks: [
      // Equality reference line
      Plot.line([{x: 0, y: 0}, {x: 100, y: 100}], {
        x: 'x', y: 'y',
        stroke: PALE,
        strokeWidth: 1.5,
        strokeDasharray: '5,4',
      }),
      // Area fill under Lorenz curve
      Plot.areaY(pts, {
        x: 'x', y: 'y',
        fill: ACCENT,
        fillOpacity: 0.08,
        curve: 'monotone-x',
      }),
      // Lorenz curve
      Plot.line(pts, {
        x: 'x', y: 'y',
        stroke: ACCENT,
        strokeWidth: 2.5,
        curve: 'monotone-x',
      }),
      // Annotation dots
      Plot.dot(annotPts, {
        x: 'x', y: 'y',
        fill: ACCENT,
        r: 5,
        stroke: 'white',
        strokeWidth: 1.5,
      }),
      // Rule lines for annotations
      Plot.ruleX([50], {stroke: PALE, strokeDasharray: '3,3'}),
      Plot.ruleX([97], {stroke: PALE, strokeDasharray: '3,3'}),
    ],
    style: {
      fontFamily: 'var(--sans, system-ui)',
      background: 'transparent',
      fontSize: '12px',
      color: '#666',
    },
  });

  el.replaceChildren(chart);

  // Add annotation labels below the chart
  const notes = document.createElement('div');
  notes.style.cssText = 'display:flex; gap:32px; margin-top:8px; font-family:var(--sans,system-ui); font-size:11px; color:#888;';
  notes.innerHTML = `
    <span>▲ At the midpoint (50% of communes, the smallest half) → only <strong style="color:${ACCENT}">5.5%</strong> of population</span>
    <span>▲ At 97% of communes → <strong style="color:${ACCENT}">49.6%</strong> of population (top 3% hold the other half)</span>
  `;
  el.appendChild(notes);
}

export function drawBracketChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const brackets = stats.brackets;
  const maxPct = Math.max(...brackets.map(b => b.pct));

  const table = document.createElement('div');
  table.className = 'bracket-table';

  for (const b of brackets) {
    const barWidth = (b.pct / maxPct * 100).toFixed(1);
    const row = document.createElement('div');
    row.className = 'bracket-row';
    row.innerHTML = `
      <div class="bracket-label">${b.label}</div>
      <div class="bracket-bars">
        <div class="bracket-bar-wrap">
          <div class="bracket-bar" style="width:calc(${barWidth}% * 0.7); max-width:420px"></div>
          <span class="bracket-bar-pct">${b.pct}% of France</span>
        </div>
        <div class="bracket-subtext">${b.communes.toLocaleString()} communes · ${(b.population / 1e6).toFixed(1)}M people</div>
      </div>
    `;
    table.appendChild(row);
  }

  el.replaceChildren(table);
}
