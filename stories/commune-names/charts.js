// stories/commune-names/charts.js
// Bar chart for top duplicated commune names.
// Export: drawDupesChart(selector, data)

export function drawDupesChart(selector, dupes) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = dupes.slice(0, 15);
  const maxCount = items[0].count;

  const rows = items.map((d, i) => {
    const pct = (d.count / maxCount) * 100;
    return `
      <div class="dupe-row">
        <div class="dupe-label">${esc(d.name)}</div>
        <div class="dupe-bar-wrap">
          <div class="dupe-bar" style="width:${pct.toFixed(1)}%"></div>
          <span class="dupe-count">${d.count}</span>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = rows;
}

export function drawSaintChart(selector, depts) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = depts.slice(0, 10);
  const maxCount = items[0].count;

  const rows = items.map((d) => {
    const pct = (d.count / maxCount) * 100;
    return `
      <div class="dupe-row">
        <div class="dupe-label">${esc(d.name)}</div>
        <div class="dupe-bar-wrap">
          <div class="dupe-bar dupe-bar--blue" style="width:${pct.toFixed(1)}%"></div>
          <span class="dupe-count">${d.count}</span>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = rows;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
