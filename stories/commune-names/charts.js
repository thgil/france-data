// charts.js — commune-names story charts

export function drawTopNamesChart(containerSelector, topNames) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const slice = topNames.slice(0, 15);
  const maxCount = slice[0].count;

  const rows = slice.map((d, i) => {
    const pct = (d.count / maxCount) * 100;
    return `
      <div class="cn-row" style="--bar-w:${pct.toFixed(1)}%">
        <span class="cn-rank">${i + 1}</span>
        <span class="cn-name">${d.name}</span>
        <div class="cn-bar-wrap">
          <div class="cn-bar"></div>
          <span class="cn-count">${d.count}</span>
        </div>
      </div>`;
  });

  container.innerHTML = rows.join('');
}

export function drawLengthHistogram(containerSelector, lengthHist) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  // Show lengths 1–35 (the extreme tail is visually unhelpful)
  const slice = lengthHist.filter(d => d.length <= 35);
  const maxCount = Math.max(...slice.map(d => d.count));

  const bars = slice.map(d => {
    const pct = (d.count / maxCount) * 100;
    const isMedian = d.length === 10; // median falls around 10
    return `
      <div class="lh-col${isMedian ? ' lh-col--median' : ''}" title="${d.length} chars: ${d.count.toLocaleString('fr-FR')} communes">
        <div class="lh-bar" style="height:${pct.toFixed(1)}%"></div>
        <span class="lh-label">${d.length % 5 === 0 ? d.length : ''}</span>
      </div>`;
  });

  container.innerHTML = `
    <div class="lh-wrap">
      <div class="lh-bars">${bars.join('')}</div>
      <div class="lh-axis-label">Characters in commune name</div>
    </div>`;
}
