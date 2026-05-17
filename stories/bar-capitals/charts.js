/* charts.js — bar-capitals story */

const COLORS = {
  ski: '#4a7ab5',       // mountain blue
  coastal: '#3a9688',   // teal
  city: '#c67c00',      // amber
  default: '#888'
};

const CAT_LABELS = {
  ski: 'Ski resort',
  coastal: 'Coastal / tourism',
  city: 'City / other'
};

export function drawRankChart(containerSelector, rows, { maxVal, title } = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const max = maxVal ?? Math.ceil(rows[0].per10k / 10) * 10;

  const html = `
    <div class="rank-chart">
      ${rows.map((r, i) => {
        const pct = (r.per10k / max * 100).toFixed(1);
        const color = COLORS[r.category] ?? COLORS.default;
        return `
          <div class="rank-row" data-i="${i}">
            <div class="rank-num">${i + 1}</div>
            <div class="rank-label">
              <span class="rank-place">${r.name}</span>
              <span class="rank-dept">${r.deptName}</span>
            </div>
            <div class="rank-bar-wrap">
              <div class="rank-bar" style="width:${pct}%;background:${color}"></div>
            </div>
            <div class="rank-val">${r.per10k.toFixed(1)}</div>
          </div>`;
      }).join('')}
    </div>`;

  container.innerHTML = html;
}

export function drawLegend(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = Object.entries(CAT_LABELS).map(([key, label]) =>
    `<span class="legend-item"><span class="legend-swatch" style="background:${COLORS[key]}"></span>${label}</span>`
  ).join('');
}
