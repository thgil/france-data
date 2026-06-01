/**
 * Commune Names — chart renderers
 */

export function drawRepeatedNamesChart(containerId, data) {
  const container = document.querySelector(containerId);
  if (!container) return;

  const items = data.mostRepeated.slice(0, 12);
  const maxCount = items[0].count;

  const barColor = '#b32020';
  const rowH = 32;
  const labelW = 170;
  const barMaxW = 200;
  const countW = 28;
  const padV = 8;
  const totalH = items.length * rowH + padV * 2;
  const totalW = labelW + barMaxW + countW + 16;

  const rows = items.map((item, i) => {
    const y = padV + i * rowH;
    const barW = Math.round((item.count / maxCount) * barMaxW);
    const cx = labelW + barW + 6;
    return `
      <g class="chart-row" transform="translate(0,${y})">
        <text x="${labelW - 8}" y="${rowH / 2}" dy="0.35em"
              text-anchor="end" class="chart-label">${item.name}</text>
        <rect x="${labelW}" y="6" width="${barW}" height="${rowH - 14}"
              fill="${barColor}" rx="1"/>
        <text x="${cx}" y="${rowH / 2}" dy="0.35em"
              class="chart-count">${item.count}</text>
      </g>`;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${totalW} ${totalH}" width="100%" style="max-width:${totalW}px;display:block;overflow:visible">
      <style>
        .chart-label {
          font-family: Georgia, serif;
          font-size: 13px;
          fill: #1a1a1a;
        }
        .chart-count {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          fill: #666;
          font-variant-numeric: tabular-nums;
        }
      </style>
      ${rows}
    </svg>`;
}

export function drawFirstWordsChart(containerId, data) {
  const container = document.querySelector(containerId);
  if (!container) return;

  const items = data.firstWords;
  const maxCount = items[0].count;

  const barColor = '#4a7ab5';
  const rowH = 30;
  const labelW = 90;
  const barMaxW = 220;
  const countW = 36;
  const padV = 8;
  const totalH = items.length * rowH + padV * 2;
  const totalW = labelW + barMaxW + countW + 16;

  const rows = items.map((item, i) => {
    const y = padV + i * rowH;
    const barW = Math.round((item.count / maxCount) * barMaxW);
    const cx = labelW + barW + 6;
    return `
      <g class="chart-row" transform="translate(0,${y})">
        <text x="${labelW - 8}" y="${rowH / 2}" dy="0.35em"
              text-anchor="end" class="chart-label">${item.word}</text>
        <rect x="${labelW}" y="6" width="${barW}" height="${rowH - 14}"
              fill="${barColor}" rx="1"/>
        <text x="${cx}" y="${rowH / 2}" dy="0.35em"
              class="chart-count">${item.count.toLocaleString('fr-FR')}</text>
      </g>`;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${totalW} ${totalH}" width="100%" style="max-width:${totalW}px;display:block;overflow:visible">
      <style>
        .chart-label {
          font-family: Georgia, serif;
          font-size: 13px;
          fill: #1a1a1a;
        }
        .chart-count {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          fill: #666;
          font-variant-numeric: tabular-nums;
        }
      </style>
      ${rows}
    </svg>`;
}
