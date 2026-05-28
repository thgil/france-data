/* commune-names/charts.js — canvas charts for the name-analysis story */

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const RULE  = '#ddd8ce';
const RED   = '#b32020';
const BLUE  = '#2a5c8f';

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

/* ── Top-names horizontal bar chart ──────────────────────────────────── */
export function drawTopNamesChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = stats.top_names.slice(0, 15);
  const maxCount = items[0].count;

  const ROW   = 28;
  const LABEL = 170;
  const BAR   = 220;
  const RIGHT = 40;
  const TOP   = 16;
  const BOTTOM = 12;

  const W = LABEL + BAR + RIGHT;
  const H = TOP + items.length * ROW + BOTTOM;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = setupCanvas(canvas, W, H);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  items.forEach((d, i) => {
    const y = TOP + i * ROW;
    const barW = (d.count / maxCount) * BAR;
    const barH = ROW - 8;
    const barY = y + 4;

    // alternating row tint
    if (i % 2 === 0) {
      ctx.fillStyle = '#f4f0e8';
      ctx.fillRect(0, y, W, ROW);
    }

    // bar
    ctx.fillStyle = i === 0 ? RED : '#c8bfae';
    ctx.fillRect(LABEL, barY, barW, barH);

    // name label
    ctx.fillStyle = INK;
    ctx.font = i === 0 ? 'bold 13px Georgia, serif' : '13px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.name, LABEL - 8, y + ROW / 2);

    // count label
    ctx.fillStyle = i === 0 ? RED : MUTE;
    ctx.font = '11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(d.count + '×', LABEL + barW + 6, y + ROW / 2);
  });
}

/* ── Name-length histogram ────────────────────────────────────────────── */
export function drawLengthHistogram(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const bins = stats.length_hist; // [{len, count}]
  const maxBin = Math.max(...bins.map(b => b.count));

  const LEFT   = 44;
  const RIGHT  = 12;
  const TOP    = 12;
  const BOTTOM = 32;
  const W      = 680;
  const H      = 180;
  const plotW  = W - LEFT - RIGHT;
  const plotH  = H - TOP - BOTTOM;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = setupCanvas(canvas, W, H);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const n = bins.length; // 45
  const barW = plotW / n;

  // y-axis grid lines
  const yTicks = [0, 1000, 2000, 3000];
  ctx.strokeStyle = RULE;
  ctx.lineWidth = 0.5;
  yTicks.forEach(v => {
    const y = TOP + plotH - (v / maxBin) * plotH;
    ctx.beginPath();
    ctx.moveTo(LEFT, y);
    ctx.lineTo(LEFT + plotW, y);
    ctx.stroke();
    ctx.fillStyle = MUTE;
    ctx.font = '10px Helvetica Neue, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(v === 0 ? '0' : (v / 1000) + 'k', LEFT - 4, y);
  });

  // bars
  bins.forEach((b, i) => {
    const x = LEFT + i * barW;
    const barH = (b.count / maxBin) * plotH;
    const y = TOP + plotH - barH;

    // colour: highlight 1-char and the modal bucket (8 chars)
    if (b.len === 1) {
      ctx.fillStyle = RED;
    } else if (b.len === 7 || b.len === 8) {
      ctx.fillStyle = '#8aaa7a';
    } else {
      ctx.fillStyle = '#b8b0a0';
    }
    ctx.fillRect(x + 1, y, barW - 2, barH);
  });

  // x-axis labels every 5 chars
  ctx.fillStyle = MUTE;
  ctx.font = '10px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let l = 5; l <= 45; l += 5) {
    const x = LEFT + (l - 1) * barW + barW / 2;
    ctx.fillText(l, x, TOP + plotH + 4);
  }
  // label the "1" bucket
  ctx.fillStyle = RED;
  ctx.fillText('1', LEFT + barW / 2, TOP + plotH + 4);

  // x-axis label
  ctx.fillStyle = MUTE;
  ctx.font = '11px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('characters in name', LEFT + plotW / 2, TOP + plotH + 20);
}

/* ── Prefix-type horizontal bar chart ────────────────────────────────── */
export function drawPrefixChart(selector, stats) {
  const container = document.querySelector(selector);
  if (!container) return;

  const items = stats.prefix_breakdown; // [{label, count}]
  const total  = stats.total;

  const ROW    = 36;
  const LABEL  = 130;
  const BAR    = 280;
  const PCT    = 60;
  const TOP    = 8;
  const BOTTOM = 8;
  const W      = LABEL + BAR + PCT;
  const H      = TOP + items.length * ROW + BOTTOM;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = setupCanvas(canvas, W, H);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const colours = ['#b8b0a0', '#8aaa7a', RED, BLUE, '#c8a060'];

  items.forEach((d, i) => {
    const y = TOP + i * ROW;
    const frac = d.count / total;
    const barW = frac * BAR;
    const barH = ROW - 10;
    const barY = y + 5;

    ctx.fillStyle = colours[i] || '#aaa';
    ctx.fillRect(LABEL, barY, barW, barH);

    ctx.fillStyle = INK;
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.label, LABEL - 8, y + ROW / 2);

    ctx.fillStyle = MUTE;
    ctx.font = '11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'left';
    const pct = (frac * 100).toFixed(1);
    ctx.fillText(`${d.count.toLocaleString('fr-FR')} (${pct}%)`, LABEL + barW + 6, y + ROW / 2);
  });
}
