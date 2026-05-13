/* charts.js — name-quirks story */

export function drawTopNamesChart(selector, top10) {
  const root = document.querySelector(selector);
  if (!root) return;

  const max = top10[0].count;
  const SAINT_COLOR = '#b32020';
  const OTHER_COLOR = '#c8bca8';

  const isSaint = name => name.toLowerCase().startsWith('saint');

  root.innerHTML = top10.map((d, i) => {
    const pct = (d.count / max * 100).toFixed(1);
    const color = isSaint(d.name) ? SAINT_COLOR : OTHER_COLOR;
    return `
      <div class="bar-row">
        <div class="bar-label">${d.name}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:${color}"></div>
          <span class="bar-value">${d.count}</span>
        </div>
      </div>`;
  }).join('');
}

export function drawLengthChart(selector, lengthDist) {
  const root = document.querySelector(selector);
  if (!root) return;

  // Bucket into groups: 1, 2, 3–5, 6–8, 9–12, 13–16, 17–20, 21–30, 31+
  const buckets = [
    { label: '1', min: 1, max: 1 },
    { label: '2', min: 2, max: 2 },
    { label: '3–5', min: 3, max: 5 },
    { label: '6–8', min: 6, max: 8 },
    { label: '9–12', min: 9, max: 12 },
    { label: '13–16', min: 13, max: 16 },
    { label: '17–20', min: 17, max: 20 },
    { label: '21–30', min: 21, max: 30 },
    { label: '31+', min: 31, max: 999 },
  ];

  const counts = buckets.map(b => ({
    label: b.label,
    count: lengthDist
      .filter(d => d.length >= b.min && d.length <= b.max)
      .reduce((s, d) => s + d.count, 0),
  }));

  const maxCount = Math.max(...counts.map(c => c.count));

  root.innerHTML = counts.map(c => {
    const pct = (c.count / maxCount * 100).toFixed(1);
    return `
      <div class="bar-row">
        <div class="bar-label mono">${c.label}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:#c8bca8"></div>
          <span class="bar-value">${c.count.toLocaleString('fr-FR')}</span>
        </div>
      </div>`;
  }).join('');
}
