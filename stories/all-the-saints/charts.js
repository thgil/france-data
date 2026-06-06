/* charts.js — commune name analysis charts */

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#e0d8cc';
const ACCENT = '#b32020';
const SAINT_BLUE = '#3a6ea5';

function devicePixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 2);
}

/* ── Length histogram ─────────────────────────────────────────────────────── */
export function drawLengthHistogram(canvas, data) {
  const dpr = devicePixelRatio();
  const container = canvas.parentElement;
  const W = container.clientWidth || 680;
  const H = 280;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const PAD = { top: 16, right: 16, bottom: 48, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top  - PAD.bottom;

  const bars = data.lengthDistribution;
  const maxCount = Math.max(...bars.map(b => b.count));
  const barW = chartW / bars.length;

  // Background
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = RULE;
  ctx.lineWidth = 1;
  const gridVals = [1000, 2000, 3000];
  gridVals.forEach(v => {
    if (v > maxCount) return;
    const y = PAD.top + chartH - (v / maxCount) * chartH;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + chartW, y);
    ctx.stroke();
    ctx.fillStyle = MUTE;
    ctx.font = `10px 'Helvetica Neue', sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(v.toLocaleString('fr-FR'), PAD.left - 4, y + 3);
  });

  // Bars
  bars.forEach((b, i) => {
    const x = PAD.left + i * barW;
    const bh = (b.count / maxCount) * chartH;
    const y = PAD.top + chartH - bh;

    // Highlight mode (7 & 8 chars)
    const isModes = b.length === '7' || b.length === '8';
    ctx.fillStyle = isModes ? ACCENT : '#c8b89a';
    ctx.fillRect(x + 1, y, barW - 2, bh);
  });

  // X-axis labels — every 5 bars
  ctx.fillStyle = INK;
  ctx.font = `10px 'Helvetica Neue', sans-serif`;
  ctx.textAlign = 'center';
  bars.forEach((b, i) => {
    if (i === 0 || (parseInt(b.length) % 5 === 0 && b.length !== '26+') || b.length === '26+') {
      const x = PAD.left + i * barW + barW / 2;
      ctx.fillText(b.length, x, H - PAD.bottom + 14);
    }
  });

  // X-axis label
  ctx.fillStyle = MUTE;
  ctx.font = `11px 'Helvetica Neue', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('name length (characters)', PAD.left + chartW / 2, H - 6);

  // Annotation: mode label
  const modeIdx = bars.findIndex(b => b.length === '7');
  if (modeIdx >= 0) {
    const x = PAD.left + modeIdx * barW + barW / 2;
    const bh = (bars[modeIdx].count / maxCount) * chartH;
    const y = PAD.top + chartH - bh - 6;
    ctx.fillStyle = ACCENT;
    ctx.font = `bold 10px 'Helvetica Neue', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('mode', x, y - 2);
  }
}

/* ── Shared-names horizontal bar chart ────────────────────────────────────── */
export function drawSharedNamesChart(canvas, data) {
  const dpr = devicePixelRatio();
  const names = data.topSharedNames;
  const H = names.length * 28 + 32;
  const container = canvas.parentElement;
  const W = Math.min(container.clientWidth || 680, 680);

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const PAD = { top: 8, right: 60, bottom: 24, left: 160 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top  - PAD.bottom;

  const maxCount = names[0].count;
  const rowH = chartH / names.length;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  names.forEach((d, i) => {
    const y = PAD.top + i * rowH;
    const bw = (d.count / maxCount) * chartW;

    // Background stripe (alternating)
    if (i % 2 === 0) {
      ctx.fillStyle = '#f3ede3';
      ctx.fillRect(0, y, W, rowH);
    }

    // Bar
    const isSaint = d.name.startsWith('Saint') || d.name.startsWith('Sainte');
    ctx.fillStyle = isSaint ? SAINT_BLUE : '#c8b89a';
    ctx.fillRect(PAD.left, y + 5, bw, rowH - 10);

    // Name label
    ctx.fillStyle = INK;
    ctx.font = `12px Georgia, serif`;
    ctx.textAlign = 'right';
    ctx.fillText(d.name, PAD.left - 8, y + rowH / 2 + 4);

    // Count label
    ctx.fillStyle = MUTE;
    ctx.font = `11px 'Helvetica Neue', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`×${d.count}`, PAD.left + bw + 6, y + rowH / 2 + 4);
  });

  // Legend
  ctx.fillStyle = SAINT_BLUE;
  ctx.fillRect(PAD.left, H - 18, 10, 10);
  ctx.fillStyle = '#c8b89a';
  ctx.fillRect(PAD.left + 90, H - 18, 10, 10);
  ctx.fillStyle = MUTE;
  ctx.font = `10px 'Helvetica Neue', sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('Saint/Sainte', PAD.left + 14, H - 9);
  ctx.fillText('other', PAD.left + 104, H - 9);
}
