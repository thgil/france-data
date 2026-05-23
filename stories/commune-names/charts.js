// charts.js — commune-names story charts

const PAPER = '#faf7f2';
const INK = '#1a1a1a';
const INK_MUTE = '#999';
const ACCENT = '#b32020';
const BAR_COLOR = '#c67c00';
const BAR_SAINT = '#b32020';
const FONT_SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_SERIF = "Georgia, 'Times New Roman', serif";

function dpr() {
  return window.devicePixelRatio || 1;
}

function setupCanvas(canvas, w, h) {
  const ratio = dpr();
  canvas.width = w * ratio;
  canvas.height = h * ratio;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  return ctx;
}

export function drawLengthHistogram(canvas, stats) {
  const series = stats.length_distribution;
  const maxLen = 45;
  const filtered = series.filter(d => d.len <= maxLen);
  const maxCount = Math.max(...filtered.map(d => d.count));

  const W = canvas.parentElement ? canvas.parentElement.clientWidth : 680;
  const H = 220;
  const PAD = { top: 16, right: 16, bottom: 40, left: 52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const ctx = setupCanvas(canvas, W, H);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const barW = plotW / filtered.length;

  filtered.forEach((d, i) => {
    const barH = (d.count / maxCount) * plotH;
    const x = PAD.left + i * barW;
    const y = PAD.top + plotH - barH;
    ctx.fillStyle = (d.len === 1) ? ACCENT : BAR_COLOR;
    ctx.fillRect(x + 0.5, y, barW - 1, barH);
  });

  // X axis ticks: every 5 chars
  ctx.fillStyle = INK_MUTE;
  ctx.font = `10px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  for (let l = 0; l <= maxLen; l += 5) {
    const idx = filtered.findIndex(d => d.len === l);
    if (idx < 0) continue;
    const x = PAD.left + idx * barW + barW / 2;
    ctx.fillText(String(l), x, H - PAD.bottom + 14);
    ctx.fillStyle = '#ddd';
    ctx.fillRect(x, PAD.top, 0.5, plotH);
    ctx.fillStyle = INK_MUTE;
  }

  // Y axis label ticks
  ctx.textAlign = 'right';
  for (let pct of [0, 0.5, 1]) {
    const count = Math.round(pct * maxCount);
    const y = PAD.top + plotH - pct * plotH;
    ctx.fillStyle = '#ddd';
    ctx.fillRect(PAD.left, y, plotW, 0.5);
    ctx.fillStyle = INK_MUTE;
    ctx.fillText(count.toLocaleString('fr-FR'), PAD.left - 6, y + 4);
  }

  // Axis labels
  ctx.fillStyle = INK_MUTE;
  ctx.font = `10px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('Characters in commune name', PAD.left + plotW / 2, H - 4);

  // Callout for Y (1 char)
  const yItem = filtered.find(d => d.len === 1);
  if (yItem) {
    const x = PAD.left + barW / 2;
    const barH = (yItem.count / maxCount) * plotH;
    const y = PAD.top + plotH - barH - 8;
    ctx.fillStyle = ACCENT;
    ctx.font = `bold 10px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('Y', x, y);
  }
}

export function drawPrefixChart(canvas, stats) {
  const items = stats.top_prefixes.slice(0, 10);
  const maxCount = items[0].count;

  const W = canvas.parentElement ? canvas.parentElement.clientWidth : 680;
  const rowH = 28;
  const H = items.length * rowH + 32;
  const PAD = { top: 8, right: 48, bottom: 24, left: 72 };
  const plotW = W - PAD.left - PAD.right;

  const ctx = setupCanvas(canvas, W, H);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  items.forEach((d, i) => {
    const barW = (d.count / maxCount) * plotW;
    const y = PAD.top + i * rowH;
    const barY = y + rowH * 0.15;
    const barH = rowH * 0.6;

    const isSaint = d.prefix === 'Saint' || d.prefix === 'Sainte';
    ctx.fillStyle = isSaint ? BAR_SAINT : BAR_COLOR;
    ctx.fillRect(PAD.left, barY, barW, barH);

    ctx.fillStyle = INK;
    ctx.font = `12px ${FONT_SANS}`;
    ctx.textAlign = 'right';
    ctx.fillText(d.prefix, PAD.left - 6, barY + barH * 0.72);

    ctx.fillStyle = INK_MUTE;
    ctx.font = `11px ${FONT_SANS}`;
    ctx.textAlign = 'left';
    ctx.fillText(d.count.toLocaleString('fr-FR'), PAD.left + barW + 5, barY + barH * 0.72);
  });
}

export function drawDuplicatesChart(canvas, stats) {
  const items = stats.top_duplicated.slice(0, 12);
  const maxCount = items[0].count;

  const W = canvas.parentElement ? canvas.parentElement.clientWidth : 680;
  const rowH = 26;
  const H = items.length * rowH + 32;
  const PAD = { top: 8, right: 48, bottom: 8, left: 148 };
  const plotW = W - PAD.left - PAD.right;

  const ctx = setupCanvas(canvas, W, H);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  items.forEach((d, i) => {
    const barW = (d.count / maxCount) * plotW;
    const y = PAD.top + i * rowH;
    const barY = y + rowH * 0.15;
    const barH = rowH * 0.6;

    const isSaint = d.name.startsWith('Saint');
    ctx.fillStyle = isSaint ? BAR_SAINT : BAR_COLOR;
    ctx.fillRect(PAD.left, barY, barW, barH);

    ctx.fillStyle = INK;
    ctx.font = `11px ${FONT_SERIF}`;
    ctx.textAlign = 'right';
    ctx.fillText(d.name, PAD.left - 6, barY + barH * 0.75);

    ctx.fillStyle = INK_MUTE;
    ctx.font = `11px ${FONT_SANS}`;
    ctx.textAlign = 'left';
    ctx.fillText(`×${d.count}`, PAD.left + barW + 5, barY + barH * 0.75);
  });
}
