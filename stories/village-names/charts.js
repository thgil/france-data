// stories/village-names/charts.js
// Canvas-based charts for the village-names story.
// Exports: drawHistogram, drawTopNames

const PAPER  = '#faf7f2';
const INK    = '#1a1a1a';
const MUTE   = '#888';
const ACCENT = '#b32020';
const RULE   = '#e0d8cc';

function dpr() {
  return window.devicePixelRatio || 1;
}

function setupCanvas(el, w, h) {
  const r = dpr();
  el.width  = w * r;
  el.height = h * r;
  el.style.width  = w + 'px';
  el.style.height = h + 'px';
  const ctx = el.getContext('2d');
  ctx.scale(r, r);
  return ctx;
}

// ── Histogram: name length distribution ──────────────────────────────────────
export function drawHistogram(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 220;
  const PAD = { top: 16, right: 16, bottom: 36, left: 44 };

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = setupCanvas(canvas, W, H);

  const maxLen   = Math.max(...lengthDist.map(d => d.len));
  const maxCount = Math.max(...lengthDist.map(d => d.count));

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top  - PAD.bottom;

  // Bar width: fit all lengths from 1 to maxLen
  const barW = plotW / maxLen;

  // Y axis: nice round max
  const yMax = Math.ceil(maxCount / 500) * 500;

  // Background
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Grid lines at 0, 1000, 2000, 3000
  ctx.strokeStyle = RULE;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  for (let v = 0; v <= yMax; v += 1000) {
    const y = PAD.top + plotH - (v / yMax) * plotH;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + plotW, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Bars
  for (const d of lengthDist) {
    const x = PAD.left + (d.len - 1) * barW;
    const barH = (d.count / yMax) * plotH;
    const y = PAD.top + plotH - barH;

    // Colour: accent for 1-char bar, muted for the rest
    ctx.fillStyle = d.len === 1 ? ACCENT : (d.len <= 3 ? '#c67c00' : '#c8bfb0');
    ctx.fillRect(x + 1, y, Math.max(barW - 1, 1), barH);
  }

  // Y axis labels
  ctx.fillStyle = MUTE;
  ctx.font = `11px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let v = 0; v <= yMax; v += 1000) {
    const y = PAD.top + plotH - (v / yMax) * plotH;
    ctx.fillText(v === 0 ? '0' : (v / 1000) + 'k', PAD.left - 6, y);
  }

  // X axis labels: every 5 chars
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let l = 5; l <= maxLen; l += 5) {
    const x = PAD.left + (l - 0.5) * barW;
    ctx.fillText(l, x, PAD.top + plotH + 6);
  }
  // Label "1" explicitly
  ctx.fillText('1', PAD.left + 0.5 * barW, PAD.top + plotH + 6);

  // Axis line
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD.left, PAD.top);
  ctx.lineTo(PAD.left, PAD.top + plotH);
  ctx.lineTo(PAD.left + plotW, PAD.top + plotH);
  ctx.stroke();

  // Annotation for "Y"
  const xY = PAD.left + 0.5 * barW;
  const yY = PAD.top + plotH - (1 / yMax) * plotH - 4;
  ctx.fillStyle = ACCENT;
  ctx.font = `bold 11px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('"Y"', xY + 4, yY);
}

// ── Horizontal bar chart: most duplicated names ───────────────────────────────
export function drawTopNames(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = topNames.slice(0, 12);
  const ROW_H = 28;
  const PAD   = { top: 8, right: 60, bottom: 8, left: 160 };
  const W     = container.clientWidth || 680;
  const H     = PAD.top + items.length * ROW_H + PAD.bottom;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = setupCanvas(canvas, W, H);

  const maxCount = items[0].count;
  const plotW = W - PAD.left - PAD.right;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  items.forEach((d, i) => {
    const y   = PAD.top + i * ROW_H;
    const barW = (d.count / maxCount) * plotW;
    const cy   = y + ROW_H / 2;

    // Alternating row background
    if (i % 2 === 0) {
      ctx.fillStyle = '#f4f0e8';
      ctx.fillRect(0, y, W, ROW_H);
    }

    // Bar
    ctx.fillStyle = i === 0 ? ACCENT : '#c8bfb0';
    ctx.fillRect(PAD.left, y + 4, barW, ROW_H - 8);

    // Name label
    ctx.fillStyle = INK;
    ctx.font = `13px Georgia, serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.name, PAD.left - 8, cy);

    // Count label
    ctx.fillStyle = MUTE;
    ctx.font = `11px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`×${d.count}`, PAD.left + barW + 6, cy);
  });
}
