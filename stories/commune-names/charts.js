// stories/commune-names/charts.js
// Canvas-based charts for the commune names story.
// Exports: drawNameFreqChart, drawLengthHistogram, drawWordFreqChart

const PALETTE = {
  accent: '#b32020',
  bar:    '#8b1a1a',
  barMid: '#c44',
  bg:     '#faf7f2',
  rule:   '#d8d0c0',
  ink:    '#1a1a1a',
  mute:   '#888',
};

function dpr() { return window.devicePixelRatio || 1; }

function setupCanvas(canvas, w, h) {
  const r = dpr();
  canvas.width  = Math.round(w * r);
  canvas.height = Math.round(h * r);
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(r, r);
  return ctx;
}

// Horizontal bar chart — top commune names
export function drawNameFreqChart(selector, stats) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  const items = stats.topNames.slice(0, 15);
  const maxCount = items[0].count;

  const marginL = 220;
  const marginR = 60;
  const marginT = 16;
  const barH    = 22;
  const gap     = 8;
  const h       = marginT + items.length * (barH + gap) + 24;
  const w       = canvas.parentElement?.offsetWidth || 700;

  const ctx = setupCanvas(canvas, w, h);
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, w, h);

  const plotW = w - marginL - marginR;

  items.forEach((item, i) => {
    const y = marginT + i * (barH + gap);
    const barW = (item.count / maxCount) * plotW;

    // Bar
    ctx.fillStyle = i === 0 ? PALETTE.accent : PALETTE.barMid;
    ctx.fillRect(marginL, y, barW, barH);

    // Name label
    ctx.fillStyle = PALETTE.ink;
    ctx.font = `${i < 3 ? 600 : 400} 13px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.name, marginL - 8, y + barH / 2);

    // Count label
    ctx.fillStyle = PALETTE.mute;
    ctx.font = '12px "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('×' + item.count, marginL + barW + 6, y + barH / 2);
  });
}

// Length histogram
export function drawLengthHistogram(selector, stats) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  // Bucket into groups of 3 chars for readability, up to length 45
  const buckets = [];
  for (let b = 1; b <= 45; b += 3) {
    const lo = b, hi = b + 2;
    const count = stats.lenArr
      .filter(d => d.len >= lo && d.len <= hi)
      .reduce((s, d) => s + d.count, 0);
    buckets.push({ label: lo === hi ? `${lo}` : `${lo}–${hi}`, count });
  }
  // Trim trailing zeros
  while (buckets.length > 0 && buckets[buckets.length - 1].count === 0) buckets.pop();

  const w = canvas.parentElement?.offsetWidth || 700;
  const h = 220;
  const marginL = 48;
  const marginR = 16;
  const marginT = 16;
  const marginB = 48;
  const plotW = w - marginL - marginR;
  const plotH = h - marginT - marginB;

  const maxCount = Math.max(...buckets.map(b => b.count));
  const bw = plotW / buckets.length;

  const ctx = setupCanvas(canvas, w, h);
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, w, h);

  // Y-axis grid lines
  ctx.strokeStyle = PALETTE.rule;
  ctx.lineWidth = 0.5;
  [0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = marginT + plotH * (1 - frac);
    ctx.beginPath();
    ctx.moveTo(marginL, y);
    ctx.lineTo(marginL + plotW, y);
    ctx.stroke();
  });

  // Bars
  buckets.forEach((b, i) => {
    const bh = (b.count / maxCount) * plotH;
    const x  = marginL + i * bw + 1;
    const y  = marginT + plotH - bh;
    // Highlight the median bucket (length 8–10 range)
    const lo = 1 + i * 3;
    ctx.fillStyle = (lo >= 7 && lo <= 9) ? PALETTE.accent : PALETTE.barMid;
    ctx.fillRect(x, y, bw - 2, bh);
  });

  // X-axis labels (every 3rd bucket)
  ctx.fillStyle = PALETTE.mute;
  ctx.font = '10px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  buckets.forEach((b, i) => {
    if (i % 3 === 0) {
      const x = marginL + i * bw + bw / 2;
      ctx.fillText(b.label, x, marginT + plotH + 6);
    }
  });

  // Y-axis label
  ctx.save();
  ctx.fillStyle = PALETTE.mute;
  ctx.font = '11px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.translate(14, marginT + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('communes', 0, 0);
  ctx.restore();

  // X-axis label
  ctx.fillStyle = PALETTE.mute;
  ctx.font = '11px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('name length (characters)', marginL + plotW / 2, h - 4);
}

// Top words horizontal bar chart
export function drawWordFreqChart(selector, stats) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;

  const items = stats.topWords.slice(0, 12);
  const maxCount = items[0].count;

  const marginL = 110;
  const marginR = 70;
  const marginT = 16;
  const barH    = 22;
  const gap     = 8;
  const h       = marginT + items.length * (barH + gap) + 16;
  const w       = canvas.parentElement?.offsetWidth || 700;
  const plotW   = w - marginL - marginR;

  const ctx = setupCanvas(canvas, w, h);
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, w, h);

  items.forEach((item, i) => {
    const y = marginT + i * (barH + gap);
    const barW = (item.count / maxCount) * plotW;

    // Bar
    ctx.fillStyle = i === 0 ? PALETTE.accent : PALETTE.barMid;
    ctx.fillRect(marginL, y, barW, barH);

    // Word label (capitalize)
    const label = item.word.charAt(0).toUpperCase() + item.word.slice(1);
    ctx.fillStyle = PALETTE.ink;
    ctx.font = `${i < 2 ? 600 : 400} 13px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, marginL - 8, y + barH / 2);

    // Count label
    ctx.fillStyle = PALETTE.mute;
    ctx.font = '11px "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item.count.toLocaleString('fr-FR'), marginL + barW + 6, y + barH / 2);
  });
}
