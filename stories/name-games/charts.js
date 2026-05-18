// stories/name-games/charts.js
// Pure SVG charts for the commune-names story. No external dependencies.
// Exports: drawLengthHistogram(selector, stats), drawTopRepeated(selector, stats)

export function drawLengthHistogram(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const hist = stats.lengthHistogram;
  const W = 680, H = 220;
  const padL = 36, padR = 12, padT = 12, padB = 32;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const maxCount = Math.max(...hist.map(d => d.count));
  const barW = Math.floor(plotW / hist.length) - 1;

  const xScale = (i) => padL + i * (plotW / hist.length) + (plotW / hist.length) * 0.1;
  const yScale = (v) => padT + plotH - (v / maxCount) * plotH;

  const ACCENT = '#b32020';
  const MUTED  = '#d8d0c0';

  let bars = '';
  let xLabels = '';
  let yLabels = '';

  hist.forEach((d, i) => {
    const x = xScale(i);
    const y = yScale(d.count);
    const h = padT + plotH - y;
    const len = d.length;
    // highlight special lengths
    const isShortest = len === 1;
    const isPeak     = d.count === maxCount;
    const fill = isShortest ? ACCENT : isPeak ? '#8a6000' : '#c8aa60';
    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="${fill}" opacity="0.9"/>`;

    // x-axis labels: show 1, 5, 10, 15, 20, 25, 30, 33+
    if ([1, 5, 10, 15, 20, 25, 30].includes(len) || len === '33+') {
      const lx = x + barW / 2;
      xLabels += `<text x="${lx}" y="${padT + plotH + 18}" text-anchor="middle" font-size="10" fill="#888">${len}</text>`;
    }
  });

  // y-axis gridlines + labels
  const yTicks = [0, 1000, 2000, 3000];
  yTicks.forEach(v => {
    const y = yScale(v);
    yLabels += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="${MUTED}" stroke-width="1"/>`;
    if (v > 0) {
      yLabels += `<text x="${padL - 4}" y="${y + 4}" text-anchor="end" font-size="10" fill="#888">${v.toLocaleString('fr-FR')}</text>`;
    }
  });

  // annotation for Y
  const yBar = hist[0];
  const yBarX = xScale(0) + barW / 2;
  const yBarY = yScale(yBar.count);
  const annotation = `
    <text x="${yBarX + 24}" y="${yBarY - 6}" font-size="10" fill="${ACCENT}" font-style="italic">Y (1 char)</text>
    <line x1="${yBarX + 2}" y1="${yBarY}" x2="${yBarX + 22}" y2="${yBarY - 4}" stroke="${ACCENT}" stroke-width="1"/>
  `;

  // x-axis line
  const xAxis = `<line x1="${padL}" y1="${padT + plotH}" x2="${W - padR}" y2="${padT + plotH}" stroke="#1a1a1a" stroke-width="1.5"/>`;

  el.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;display:block;overflow:visible" role="img" aria-label="Histogram of commune name lengths">
      ${yLabels}
      ${xAxis}
      ${bars}
      ${xLabels}
      ${annotation}
      <text x="${W/2}" y="${H - 2}" text-anchor="middle" font-size="11" fill="#888">Name length (characters)</text>
    </svg>`;
}

export function drawTopRepeated(selector, stats) {
  const el = document.querySelector(selector);
  if (!el) return;

  const items = stats.topRepeated.slice(0, 12);
  const maxCount = items[0].count;

  const W = 560, rowH = 28, padL = 150, padR = 60, padT = 8;
  const H = padT + rowH * items.length;
  const plotW = W - padL - padR;

  const GOLD  = '#8a6000';
  const LIGHT = '#e8d8a0';

  let rows = '';
  items.forEach((d, i) => {
    const y = padT + i * rowH;
    const barLen = (d.count / maxCount) * plotW;
    const textY = y + rowH * 0.65;
    rows += `
      <rect x="${padL}" y="${y + 3}" width="${barLen}" height="${rowH - 6}" fill="${i === 0 ? GOLD : LIGHT}" rx="2"/>
      <text x="${padL - 6}" y="${textY}" text-anchor="end" font-size="12" fill="#1a1a1a" font-family="Georgia,serif">${d.name}</text>
      <text x="${padL + barLen + 6}" y="${textY}" font-size="11" fill="#666">${d.count}×</text>
    `;
  });

  el.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;display:block" role="img" aria-label="Bar chart of most repeated commune names">
      ${rows}
    </svg>`;
}
