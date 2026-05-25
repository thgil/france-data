/* commune-names/charts.js — canvas charts for the name-length story */

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#999';
const ACCENT = '#b32020';
const BAR   = '#8c3a2e';
const BAR2  = '#c07050';

function deviceRatio() {
  return window.devicePixelRatio || 1;
}

function setupCanvas(canvas, w, h) {
  const r = deviceRatio();
  canvas.width  = w * r;
  canvas.height = h * r;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(r, r);
  return ctx;
}

/* ── Horizontal bar chart ─────────────────────────────────────── */
export function drawHBar(canvas, rows, { maxVal, labelWidth = 180, color = BAR, unit = '' } = {}) {
  const W = canvas.offsetWidth || 680;
  const ROW_H = 28;
  const PAD_TOP = 8, PAD_BOT = 24, PAD_RIGHT = 80;
  const H = PAD_TOP + rows.length * ROW_H + PAD_BOT;
  const ctx = setupCanvas(canvas, W, H);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const barMax = maxVal || Math.max(...rows.map(r => r.count));
  const barW   = W - labelWidth - PAD_RIGHT;

  rows.forEach((row, i) => {
    const y   = PAD_TOP + i * ROW_H;
    const bw  = (row.count / barMax) * barW;

    // bar
    ctx.fillStyle = color;
    ctx.fillRect(labelWidth, y + 4, bw, ROW_H - 8);

    // label
    ctx.fillStyle = INK;
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(row.label || row.name || row.prefix, labelWidth - 8, y + ROW_H / 2);

    // value
    ctx.fillStyle = MUTE;
    ctx.font = '11px "Helvetica Neue", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      row.count.toLocaleString('fr-FR') + (unit ? ' ' + unit : ''),
      labelWidth + bw + 6,
      y + ROW_H / 2
    );
  });
}

/* ── Name-length histogram ────────────────────────────────────── */
export function drawLengthHist(canvas, dist) {
  const W = canvas.offsetWidth || 680;
  const H = 200;
  const PAD = { top: 16, right: 20, bottom: 36, left: 44 };
  const ctx = setupCanvas(canvas, W, H);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const maxLen = Math.max(...dist.map(d => d.l));
  const maxN   = Math.max(...dist.map(d => d.n));
  const plotW  = W - PAD.left - PAD.right;
  const plotH  = H - PAD.top  - PAD.bottom;
  const binW   = plotW / (maxLen + 1);

  // Y-axis gridlines
  ctx.strokeStyle = '#e0d8cc';
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = PAD.top + plotH * (1 - frac);
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + plotW, y);
    ctx.stroke();
    const val = Math.round(frac * maxN);
    ctx.fillStyle = MUTE;
    ctx.font = '10px "Helvetica Neue", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(val >= 1000 ? (val/1000).toFixed(1)+'k' : val, PAD.left - 4, y);
  });

  // Bars
  dist.forEach(d => {
    const x  = PAD.left + d.l * binW;
    const bh = (d.n / maxN) * plotH;
    const y  = PAD.top + plotH - bh;
    ctx.fillStyle = d.l <= 3 ? ACCENT : BAR2;
    ctx.fillRect(x + 1, y, Math.max(binW - 2, 1), bh);
  });

  // X-axis labels
  ctx.fillStyle = MUTE;
  ctx.font = '10px "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  [1, 5, 10, 15, 20, 25, 30, 35, 40, 45].forEach(l => {
    if (l > maxLen) return;
    const x = PAD.left + l * binW + binW / 2;
    ctx.fillText(l, x, H - PAD.bottom + 6);
  });

  // Axis labels
  ctx.fillStyle = MUTE;
  ctx.font = '11px "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('name length (characters)', PAD.left + plotW / 2, H - 6);
}
