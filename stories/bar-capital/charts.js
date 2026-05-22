// stories/bar-capital/charts.js
// Horizontal bar chart: top 25 French communes by bars per 1,000 residents
// Export: drawRankChart(selector, stats)

const COLORS = {
  ski:     '#2563a8',
  corsica: '#c67c00',
  coast:   '#2a8a6e',
  other:   '#888',
};

const LABELS = {
  ski:     'Ski resort',
  corsica: 'Corsica',
  coast:   'Coastal / island',
  other:   'Other',
};

export function drawRankChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const communes = stats.topCommunes;
  const maxVal = communes[0].per1000;
  const national = stats.nationalPer1000;
  const paris = stats.parisPer1000;

  // Build chart as pure HTML/CSS — no external dependency needed
  const refLineNat = (national / maxVal * 100).toFixed(2);
  const refLineParis = (paris / maxVal * 100).toFixed(2);

  let html = `
    <div class="rank-chart" aria-label="Top 25 communes by bars per 1,000 residents">
      <div class="rank-header">
        <span class="rank-col-name">Commune</span>
        <span class="rank-col-bar"></span>
        <span class="rank-col-val">bars / 1,000</span>
      </div>`;

  communes.forEach((c, i) => {
    const pct = (c.per1000 / maxVal * 100).toFixed(2);
    const color = COLORS[c.type] || COLORS.other;
    const label = LABELS[c.type] || '';
    html += `
      <div class="rank-row" title="${c.name} (${c.deptName}): ${c.bars} bars, pop ${c.pop.toLocaleString('fr-FR')}">
        <span class="rank-num">${i + 1}</span>
        <span class="rank-name">${c.name}<span class="rank-dept"> · ${c.deptName}</span></span>
        <span class="rank-bar-wrap">
          <span class="rank-bar-fill" style="width:${pct}%;background:${color}"></span>
          <span class="rank-ref-nat" style="left:${refLineNat}%" title="National average: ${national}/1,000"></span>
          <span class="rank-ref-paris" style="left:${refLineParis}%" title="Paris: ${paris}/1,000"></span>
        </span>
        <span class="rank-val">${c.per1000.toFixed(1)}</span>
        <span class="rank-type-dot" style="background:${color}" title="${label}"></span>
      </div>`;
  });

  html += `
      <div class="rank-legend">
        <span class="legend-note">Reference lines: <strong>Paris avg</strong> (${paris}/1,000) and <strong>France avg</strong> (${national.toFixed(2)}/1,000)</span>
        <span class="legend-swatches">`;
  Object.entries(LABELS).forEach(([key, label]) => {
    html += `<span class="swatch"><span style="background:${COLORS[key]}"></span>${label}</span>`;
  });
  html += `</span></div>
    </div>`;

  container.innerHTML = html;
}
