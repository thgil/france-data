// charts.js — commune-names story
// Uses Observable Plot via CDN (loaded by the parent HTML before this module runs).

const accent   = '#b32020';
const inkMute  = '#666';
const inkSoft  = '#3a3a3a';
const paper    = '#faf7f2';

function isMobile() {
  return window.innerWidth < 600;
}

// ---------------------------------------------------------------------------
// Chart A — horizontal bar: top 25 most-common commune names
// ---------------------------------------------------------------------------
export function drawTopNamesChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const names = [...data.topNames].reverse(); // Plot renders bottom-to-top
  const mobile = isMobile();
  const marginLeft = mobile ? 140 : 190;

  const chart = Plot.plot({
    width: el.clientWidth || 680,
    marginLeft,
    marginRight: 40,
    marginTop: 12,
    marginBottom: 36,
    style: { background: paper, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '13px', color: inkSoft },
    x: {
      label: 'Number of communes sharing this exact name →',
      labelOffset: 32,
      grid: true,
      tickFormat: d => d,
    },
    y: {
      label: null,
      tickSize: 0,
    },
    marks: [
      Plot.barX(names, {
        x: 'count',
        y: 'name',
        fill: d => d.name === data.topNames[0].name ? accent : '#c8b4a8',
        title: d => `${d.name}: ${d.count} communes`,
      }),
      Plot.text(names, {
        x: 'count',
        y: 'name',
        text: d => d.count,
        dx: 6,
        textAnchor: 'start',
        fontSize: 11,
        fill: inkMute,
      }),
      Plot.ruleX([0]),
    ],
  });

  el.appendChild(chart);
}

// ---------------------------------------------------------------------------
// Chart B — histogram: name length distribution
// ---------------------------------------------------------------------------
export function drawLengthHistogram(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const dist = data.lengthDistribution;
  const mobile = isMobile();

  // Annotate a few notable lengths
  const annotations = [
    { length: 1,  label: '"Y"' },
    { length: 7,  label: 'peak' },
    { length: 45, label: '45 chars' },
  ];

  const chart = Plot.plot({
    width: el.clientWidth || 680,
    height: 280,
    marginLeft: 52,
    marginRight: 20,
    marginTop: 24,
    marginBottom: 44,
    style: { background: paper, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '13px', color: inkSoft },
    x: {
      label: 'Name length (characters) →',
      labelOffset: 36,
      tickSpacing: mobile ? 60 : 40,
    },
    y: {
      label: '↑ Communes',
      grid: true,
      tickFormat: d => d >= 1000 ? `${d/1000}k` : d,
    },
    marks: [
      Plot.rectY(dist, {
        x1: d => d.length - 0.5,
        x2: d => d.length + 0.5,
        y: 'count',
        fill: d => d.length === 7 ? accent : '#c8b4a8',
        title: d => `${d.length} chars: ${d.count.toLocaleString()} communes`,
      }),
      Plot.ruleY([0]),
    ],
  });

  el.appendChild(chart);
}
