import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

export function drawSaintsChart(container, saints) {
  const width = Math.min(container.clientWidth || 680, 680);
  const el = Plot.plot({
    marginLeft: 72,
    marginRight: 48,
    width,
    height: 340,
    style: { fontFamily: "var(--sans, 'Helvetica Neue', sans-serif)", fontSize: '13px', background: 'transparent' },
    x: {
      label: 'Communes beginning with this saint →',
      labelAnchor: 'right',
      labelOffset: 40,
    },
    y: { label: null },
    color: { range: ['#b32020'] },
    marks: [
      Plot.barX(saints, {
        x: 'count',
        y: 'name',
        sort: { y: '-x' },
        fill: '#b32020',
        rx: 2,
        tip: { format: { x: d => `${d} communes`, fill: false } },
      }),
      Plot.text(saints, {
        x: 'count',
        y: 'name',
        sort: { y: '-x' },
        text: d => d.count.toString(),
        dx: 5,
        textAnchor: 'start',
        fontSize: 11,
        fill: '#666',
      }),
      Plot.ruleX([0]),
    ],
  });
  container.replaceChildren(el);
}

export function drawLengthChart(container, bins) {
  const width = Math.min(container.clientWidth || 680, 680);
  // Convert range strings to numeric midpoints for tooltip clarity
  const binsWithMid = bins.map(b => ({
    ...b,
    label: b.range.replace('–', '–'),
  }));
  const el = Plot.plot({
    marginBottom: 48,
    width,
    height: 240,
    style: { fontFamily: "var(--sans, 'Helvetica Neue', sans-serif)", fontSize: '13px', background: 'transparent' },
    x: {
      label: 'Name length (characters) →',
      labelAnchor: 'right',
      labelOffset: 40,
      tickRotate: -30,
    },
    y: {
      label: '↑ Communes',
      grid: true,
    },
    marks: [
      Plot.barY(binsWithMid, {
        x: 'label',
        y: 'count',
        fill: '#1a1a1a',
        rx: 2,
        tip: { format: { x: d => `${d} chars`, fill: false } },
      }),
      Plot.ruleY([0]),
    ],
  });
  container.replaceChildren(el);
}
