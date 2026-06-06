/* charts.js — commune-names story */

const PAPER  = '#faf7f2';
const INK    = '#1a1a1a';
const MUTE   = '#888';
const ACCENT = '#b32020';
const RULE   = '#e0d8cc';
const BAR_C  = '#c67c00';

function isMobile() { return window.innerWidth < 640; }

/* ── Shared canvas helper ─────────────────────────────────────────────── */
function makeCanvas(container) {
  const wrap = typeof container === 'string'
    ? document.querySelector(container)
    : container;
  if (!wrap) return null;
  const canvas = document.createElement('canvas');
  wrap.appendChild(canvas);
  return canvas;
}

/* ── Saint-X bar chart ────────────────────────────────────────────────── */
export function drawSaintChart(selector, stats) {
  const canvas = makeCanvas(selector);
  if (!canvas) return;

  const saints = stats.topSaints.slice(0, 15);
  const labels = saints.map(d => d.name);
  const values = saints.map(d => d.count);
  const maxVal = Math.max(...values);

  const dpr = window.devicePixelRatio || 1;
  const mobile = isMobile();
  const barH = mobile ? 20 : 24;
  const labelW = mobile ? 120 : 150;
  const rightPad = 60;
  const topPad = 32;
  const bottomPad = 16;
  const totalH = topPad + labels.length * (barH + 6) + bottomPad;
  const W = canvas.parentElement.clientWidth || 680;

  canvas.width  = W * dpr;
  canvas.height = totalH * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = totalH + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const plotW = W - labelW - rightPad - 12;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, totalH);

  ctx.font = `600 10px var(--sans, 'Helvetica Neue', sans-serif)`;
  ctx.fillStyle = MUTE;
  ctx.letterSpacing = '1px';
  ctx.fillText('SAINT-X VARIANTS — top 15 by count', 0, 18);
  ctx.letterSpacing = '0px';

  saints.forEach((d, i) => {
    const y = topPad + i * (barH + 6);
    const bw = (d.count / maxVal) * plotW;

    ctx.fillStyle = INK;
    ctx.font = `13px Georgia, serif`;
    ctx.textAlign = 'right';
    ctx.fillText(d.name, labelW - 8, y + barH * 0.7);

    ctx.fillStyle = BAR_C;
    ctx.fillRect(labelW, y, bw, barH);

    ctx.fillStyle = INK;
    ctx.font = `600 11px var(--sans, 'Helvetica Neue', sans-serif)`;
    ctx.textAlign = 'left';
    ctx.fillText(d.count, labelW + bw + 6, y + barH * 0.72);
  });

  ctx.strokeStyle = RULE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(labelW, topPad);
  ctx.lineTo(labelW, topPad + labels.length * (barH + 6) - 6);
  ctx.stroke();
}

/* ── Name length histogram ────────────────────────────────────────────── */
export function drawLengthChart(selector, stats) {
  const canvas = makeCanvas(selector);
  if (!canvas) return;

  const dist = stats.lengthDist.filter(d => d.length >= 1 && d.length <= 35);
  const maxCount = Math.max(...dist.map(d => d.count));

  const dpr = window.devicePixelRatio || 1;
  const mobile = isMobile();
  const padL = 48;
  const padR = 20;
  const padT = 32;
  const padB = 36;
  const H = mobile ? 160 : 200;
  const W = canvas.parentElement.clientWidth || 680;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  ctx.font = `600 10px var(--sans, 'Helvetica Neue', sans-serif)`;
  ctx.fillStyle = MUTE;
  ctx.textAlign = 'left';
  ctx.letterSpacing = '1px';
  ctx.fillText('NAME LENGTH — number of communes', 0, 18);
  ctx.letterSpacing = '0px';

  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const barW = plotW / dist.length;

  dist.forEach((d, i) => {
    const bh = (d.count / maxCount) * plotH;
    const x = padL + i * barW;
    const y = padT + plotH - bh;
    ctx.fillStyle = d.length === 1 ? ACCENT : BAR_C;
    ctx.fillRect(x + 1, y, barW - 2, bh);
  });

  ctx.strokeStyle = RULE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT + plotH);
  ctx.lineTo(W - padR, padT + plotH);
  ctx.stroke();

  ctx.fillStyle = MUTE;
  ctx.font = `11px var(--sans, 'Helvetica Neue', sans-serif)`;
  ctx.textAlign = 'center';
  [1, 5, 10, 15, 20, 25, 30, 35].forEach(l => {
    const idx = dist.findIndex(d => d.length === l);
    if (idx < 0) return;
    const x = padL + idx * barW + barW / 2;
    ctx.fillText(l, x, H - padB + 14);
  });

  ctx.fillStyle = MUTE;
  ctx.font = `10px var(--sans, 'Helvetica Neue', sans-serif)`;
  ctx.textAlign = 'right';
  [1000, 2000, 3000].forEach(v => {
    if (v > maxCount) return;
    const y = padT + plotH - (v / maxCount) * plotH;
    ctx.fillText(v.toLocaleString('fr-FR'), padL - 6, y + 4);
    ctx.strokeStyle = RULE;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
  });

  ctx.fillStyle = MUTE;
  ctx.font = `11px var(--sans, 'Helvetica Neue', sans-serif)`;
  ctx.textAlign = 'center';
  ctx.fillText('characters', padL + plotW / 2, H - 4);
}
