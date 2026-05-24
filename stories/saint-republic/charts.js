export function drawBarChart(selector, rows, { labelKey, valueKey }) {
  const container = document.querySelector(selector);
  if (!container || !rows || rows.length === 0) return;

  const maxVal = Math.max(...rows.map(r => r[valueKey]));

  container.innerHTML = rows.map(r => {
    const pct = (r[valueKey] / maxVal) * 100;
    return `
      <div class="bar-row">
        <div class="bar-label" title="${r[labelKey]}">${r[labelKey]}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct.toFixed(1)}%"></div>
        </div>
        <div class="bar-value">${r[valueKey]}</div>
      </div>`;
  }).join('');
}

export function drawShortNames(selector, names) {
  const container = document.querySelector(selector);
  if (!container) return;

  container.innerHTML = names.map(n => {
    const cls = n === 'Y' ? 'name-chip chip-y' : 'name-chip';
    return `<span class="${cls}">${n}</span>`;
  }).join('');
}
