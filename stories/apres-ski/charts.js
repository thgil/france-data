// stories/apres-ski/charts.js
// Horizontal bar chart: top communes by bars per 10k residents.
// Export: drawRankingChart(selector, stats)

import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm';

const CAT_COLORS = {
  alpine:  '#3a7ec8',
  coastal: '#2a9d8f',
  urban:   '#b32020',
  other:   '#888',
};

const CAT_LABELS = {
  alpine:  'Alpine resort',
  coastal: 'Coastal resort',
  urban:   'Paris arrondissement',
  other:   'Other',
};

export function drawRankingChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const top20 = stats.topCommunes.slice(0, 20);

  // Short display names
  const display = top20.map(d => ({
    ...d,
    label: d.name.replace(' Arrondissement', '').replace('er ', '1er '),
  }));

  const chart = Plot.plot({
    marginLeft: 180,
    marginRight: 60,
    marginBottom: 40,
    width: Math.min(el.offsetWidth || 740, 740),
    height: 520,
    x: {
      label: 'Bars per 10,000 registered residents',
      tickFormat: d => d.toFixed(0),
      grid: true,
    },
    y: {
      label: null,
      domain: display.map(d => d.label).reverse(),
    },
    marks: [
      Plot.barX(display, {
        x: 'per10k',
        y: 'label',
        fill: d => CAT_COLORS[d.category] || CAT_COLORS.other,
        title: d =>
          `${d.name} (dept ${d.dept})\n${d.bars} bars · pop ${d.pop.toLocaleString('fr-FR')} · ${d.per10k}/10k`,
        sort: { y: '-x' },
      }),
      Plot.ruleX([0]),
    ],
    style: {
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '12px',
      background: '#faf7f2',
    },
  });

  el.appendChild(chart);

  // Legend
  const legendEl = document.querySelector(selector + '-legend');
  if (legendEl) {
    const categories = ['alpine', 'coastal', 'urban'];
    legendEl.innerHTML = categories.map(c =>
      `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:16px;">
        <span style="width:12px;height:12px;border-radius:2px;background:${CAT_COLORS[c]};display:inline-block;flex-shrink:0;"></span>
        <span>${CAT_LABELS[c]}</span>
      </span>`
    ).join('');
  }
}

export function drawDeptChart(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const depts = stats.topDepts.slice(0, 12);

  const chart = Plot.plot({
    marginLeft: 160,
    marginRight: 60,
    marginBottom: 40,
    width: Math.min(el.offsetWidth || 740, 740),
    height: 360,
    x: {
      label: 'Bars per 10,000 residents',
      grid: true,
    },
    y: {
      label: null,
      domain: depts.map(d => d.name).reverse(),
    },
    marks: [
      Plot.barX(depts, {
        x: 'per10k',
        y: 'name',
        fill: d => d.dept === '75' ? CAT_COLORS.urban : '#b8956a',
        title: d =>
          `${d.name}\n${d.bars.toLocaleString('fr-FR')} bars · pop ${d.pop.toLocaleString('fr-FR')} · ${d.per10k}/10k`,
        sort: { y: '-x' },
      }),
      Plot.ruleX([0]),
    ],
    style: {
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '12px',
      background: '#faf7f2',
    },
  });

  el.appendChild(chart);
}
