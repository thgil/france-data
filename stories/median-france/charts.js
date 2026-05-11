// charts.js — median-france story
// Uses Observable Plot via CDN (loaded before this module runs).

const accent   = '#b32020';
const accentLight = '#e8b4b4';
const inkMute  = '#666';
const inkSoft  = '#3a3a3a';
const paper    = '#faf7f2';
const sand     = '#c8b4a8';

function isMobile() {
  return window.innerWidth < 600;
}

// ---------------------------------------------------------------------------
// Chart A — double bar: communes count vs population share by size bucket
// ---------------------------------------------------------------------------
export function drawBucketChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const mobile = isMobile();
  const w = el.clientWidth || 680;

  // Build a flat dataset for two series
  const series = [];
  for (const b of data.buckets) {
    series.push({ label: b.label, series: 'communes', value: b.communesPct });
    series.push({ label: b.label, series: 'people', value: b.populationPct });
  }

  const labels = data.buckets.map(b => b.label);

  const chart = Plot.plot({
    width: w,
    height: mobile ? 320 : 380,
    marginLeft: mobile ? 110 : 130,
    marginRight: 20,
    marginTop: 12,
    marginBottom: 40,
    style: {
      background: paper,
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '12px',
      color: inkSoft
    },
    x: {
      label: '% share →',
      labelOffset: 32,
      grid: true,
      domain: [0, 32],
    },
    y: {
      domain: labels,
      label: null,
      tickSize: 0,
    },
    color: {
      domain: ['communes', 'people'],
      range: [sand, accent],
      legend: true,
    },
    marks: [
      Plot.barX(series, {
        x: 'value',
        y: 'label',
        fill: 'series',
        offset: 'dodge',
        title: d => `${d.series === 'communes' ? 'Communes' : 'Population'}: ${d.value}%`,
      }),
      Plot.text(series.filter(d => d.value >= 1.5), {
        x: 'value',
        y: 'label',
        text: d => `${d.value}%`,
        dx: 5,
        textAnchor: 'start',
        fontSize: 10,
        fill: inkMute,
      }),
      Plot.ruleX([0]),
    ],
  });

  el.appendChild(chart);
}

// ---------------------------------------------------------------------------
// Chart B — Lorenz-style curve: cumulative communes % vs cumulative pop %
// ---------------------------------------------------------------------------
export function drawLorenzChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const w = el.clientWidth || 680;
  const mobile = isMobile();

  // Add the origin point
  const points = [{ communePct: 0, popPct: 0 }, ...data.lorenz];

  const chart = Plot.plot({
    width: w,
    height: mobile ? 280 : 340,
    marginLeft: 52,
    marginRight: 20,
    marginTop: 16,
    marginBottom: 44,
    style: {
      background: paper,
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '12px',
      color: inkSoft
    },
    x: {
      label: '% of communes (smallest first) →',
      labelOffset: 36,
      domain: [0, 100],
      grid: true,
      ticks: 5,
    },
    y: {
      label: '↑ % of population',
      domain: [0, 100],
      grid: true,
      ticks: 5,
    },
    marks: [
      // Equality diagonal
      Plot.line([{ x: 0, y: 0 }, { x: 100, y: 100 }], {
        x: 'x', y: 'y',
        stroke: '#ccc',
        strokeWidth: 1,
        strokeDasharray: '4 4',
      }),
      // The actual curve
      Plot.line(points, {
        x: 'communePct',
        y: 'popPct',
        stroke: accent,
        strokeWidth: 2.5,
        curve: 'monotone-x',
      }),
      // Area under curve
      Plot.areaY(points, {
        x: 'communePct',
        y: 'popPct',
        fill: accentLight,
        fillOpacity: 0.25,
        curve: 'monotone-x',
      }),
      // Annotation dot: 52% of communes = 6% of pop
      Plot.dot(
        [{ x: 52.4, y: 6.1 }],
        { x: 'x', y: 'y', r: 5, fill: accent, stroke: paper, strokeWidth: 2 }
      ),
      Plot.text(
        [{ x: 52.4, y: 6.1, label: '52% of communes\nhave 6% of the people' }],
        { x: 'x', y: 'y', text: 'label', dy: -18, dx: 8, textAnchor: 'start', fontSize: 11, fill: accent }
      ),
    ],
  });

  el.appendChild(chart);
}
