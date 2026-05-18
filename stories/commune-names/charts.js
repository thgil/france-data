// stories/commune-names/charts.js
// Canvas-based horizontal bar charts and length histogram

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const ACCENT = '#b32020';
const BAR_GOLD = '#c67c00';
const BAR_RED  = '#b32020';
const RULE  = '#e0d8cc';

function dpr() {
  return window.devicePixelRatio || 1;
}

function setupCanvas(canvas, w, h) {
  const r = dpr();
  canvas.width  = w * r;
  canvas.height = h * r;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(r, r);
  return ctx;
}

export function drawTopNamesChart(canvas, data) {
  const items = data.topNames.slice(0, 15);
  const maxVal = items[0].count;
  const rowH = 28;
  const labelW = 160;
  const barAreaW = canvas.parentElement.clientWidth - labelW - 60;
  const w = labelW + barAreaW + 60;
  const h = items.length * rowH + 24;

  const ctx = setupCanvas(canvas, w, h);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  items.forEach((item, i) => {
    const y = i * rowH + 20;
    const barW = Math.round((item.count / maxVal) * barAreaW);

    // label
    ctx.fillStyle = INK;
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.name, labelW - 8, y + rowH / 2 - 4);

    // bar
    ctx.fillStyle = BAR_RED;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(labelW, y + 4, barW, rowH - 10);
    ctx.globalAlpha = 1;

    // count
    ctx.fillStyle = MUTE;
    ctx.font = '11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('×' + item.count, labelW + barW + 6, y + rowH / 2 - 4);
  });
}

export function drawSaintsChart(canvas, data) {
  const items = data.topSaints.slice(0, 12);
  const maxVal = items[0].count;
  const rowH = 28;
  const labelW = 140;
  const barAreaW = canvas.parentElement.clientWidth - labelW - 60;
  const w = labelW + barAreaW + 60;
  const h = items.length * rowH + 24;

  const ctx = setupCanvas(canvas, w, h);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  items.forEach((item, i) => {
    const y = i * rowH + 20;
    const barW = Math.round((item.count / maxVal) * barAreaW);

    ctx.fillStyle = INK;
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.name, labelW - 8, y + rowH / 2 - 4);

    ctx.fillStyle = BAR_GOLD;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(labelW, y + 4, barW, rowH - 10);
    ctx.globalAlpha = 1;

    ctx.fillStyle = MUTE;
    ctx.font = '11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item.count, labelW + barW + 6, y + rowH / 2 - 4);
  });
}

export function drawLengthHistogram(canvas, data) {
  const dist = data.lengthDist.filter(d => d.count > 0 && d.length <= 40);
  const maxVal = Math.max(...dist.map(d => d.count));
  const barAreaH = 120;
  const labelH = 20;
  const barW = Math.max(8, Math.floor((canvas.parentElement.clientWidth - 40) / dist.length));
  const w = dist.length * barW + 40;
  const h = barAreaH + labelH + 16;

  const ctx = setupCanvas(canvas, w, h);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  dist.forEach((item, i) => {
    const bh = Math.round((item.count / maxVal) * barAreaH);
    const x = 20 + i * barW;
    const y = barAreaH - bh + 8;

    ctx.fillStyle = BAR_RED;
    ctx.globalAlpha = 0.75;
    ctx.fillRect(x + 1, y, barW - 2, bh);
    ctx.globalAlpha = 1;

    if (item.length % 5 === 0) {
      ctx.fillStyle = MUTE;
      ctx.font = '10px Helvetica Neue, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(item.length, x + barW / 2, barAreaH + 10);
    }
  });

  // axis label
  ctx.fillStyle = MUTE;
  ctx.font = '10px Helvetica Neue, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('characters in name →', 20, barAreaH + 10);
}
