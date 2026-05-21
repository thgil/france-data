/**
 * Charts for commune-names story.
 * Pure canvas — no external chart library.
 */

const PAPER = '#faf7f2';
const INK = '#1a1a1a';
const INK_MUTE = '#888';
const ACCENT = '#b32020';
const BAR_COLOR = '#c67c00';
const BAR_LIGHT = '#e8c87a';

function getCanvas(selector) {
  const el = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!el) throw new Error(`Canvas not found: ${selector}`);
  return el;
}

function dpr() {
  return window.devicePixelRatio || 1;
}

function setupCanvas(canvas, cssWidth, cssHeight) {
  const ratio = dpr();
  canvas.width = cssWidth * ratio;
  canvas.height = cssHeight * ratio;
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  return ctx;
}

/**
 * Horizontal bar chart: top saint suffixes.
 * @param {string} selector
 * @param {Array<{suffix: string, count: number}>} data
 */
export function drawSaintsChart(selector, data) {
  const canvas = getCanvas(selector);
  const cssW = canvas.parentElement
    ? canvas.parentElement.clientWidth || 640
    : 640;
  const rows = data.slice(0, 15);
  const rowH = 22;
  const paddingTop = 20;
  const paddingBottom = 32;
  const paddingLeft = 148;
  const paddingRight = 64;
  const cssH = paddingTop + rows.length * rowH + paddingBottom;

  canvas.height = cssH;
  const ctx = setupCanvas(canvas, cssW, cssH);

  const maxVal = rows[0].count;
  const chartW = cssW - paddingLeft - paddingRight;

  ctx.font = `11px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, cssW, cssH);

  rows.forEach((d, i) => {
    const y = paddingTop + i * rowH;
    const barW = (d.count / maxVal) * chartW;
    const barH = rowH - 4;
    const barY = y + 2;

    // Bar
    ctx.fillStyle = i === 0 ? ACCENT : BAR_COLOR;
    ctx.fillRect(paddingLeft, barY, barW, barH);

    // Label (left of bar)
    ctx.fillStyle = INK;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = `12px Georgia, serif`;
    ctx.fillText(`Saint-${d.suffix}`, paddingLeft - 8, y + rowH / 2);

    // Count (right of bar)
    ctx.fillStyle = INK_MUTE;
    ctx.textAlign = 'left';
    ctx.font = `11px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
    ctx.fillText(d.count, paddingLeft + barW + 6, y + rowH / 2);
  });

  // Axis label
  ctx.fillStyle = INK_MUTE;
  ctx.textAlign = 'center';
  ctx.font = `10px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  ctx.fillText('number of communes', paddingLeft + chartW / 2, cssH - 6);
}

/**
 * Name-length histogram.
 * @param {string} selector
 * @param {Object} lengthDist  { "1": count, "2": count, ... }
 */
export function drawLengthChart(selector, lengthDist) {
  const canvas = getCanvas(selector);
  const cssW = canvas.parentElement
    ? canvas.parentElement.clientWidth || 400
    : 400;
  const cssH = parseInt(canvas.getAttribute('height') || '220', 10);

  const ctx = setupCanvas(canvas, cssW, cssH);

  const paddingTop = 12;
  const paddingBottom = 36;
  const paddingLeft = 36;
  const paddingRight = 12;

  // Bin lengths: group by single chars 1–30, then 30+
  const bins = [];
  let max30plus = 0;
  for (let l = 1; l <= 30; l++) {
    bins.push({ label: String(l), count: lengthDist[String(l)] || 0 });
  }
  // 30+
  let plus30 = 0;
  for (const [k, v] of Object.entries(lengthDist)) {
    if (parseInt(k) > 30) plus30 += v;
  }
  bins.push({ label: '30+', count: plus30 });

  const maxCount = Math.max(...bins.map(b => b.count));
  const chartW = cssW - paddingLeft - paddingRight;
  const chartH = cssH - paddingTop - paddingBottom;
  const barW = chartW / bins.length;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, cssW, cssH);

  bins.forEach((b, i) => {
    const barH = (b.count / maxCount) * chartH;
    const x = paddingLeft + i * barW;
    const y = paddingTop + chartH - barH;

    ctx.fillStyle = (b.label === '7' || b.label === '8') ? ACCENT : BAR_COLOR;
    ctx.fillRect(x + 1, y, barW - 2, barH);
  });

  // X axis ticks: every 5 chars
  ctx.fillStyle = INK_MUTE;
  ctx.font = `9px 'Helvetica Neue', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  [1, 5, 10, 15, 20, 25, 30].forEach(l => {
    const i = bins.findIndex(b => b.label === String(l));
    if (i < 0) return;
    const x = paddingLeft + (i + 0.5) * barW;
    ctx.fillText(l, x, paddingTop + chartH + 4);
  });

  // Axis labels
  ctx.fillStyle = INK_MUTE;
  ctx.textAlign = 'center';
  ctx.font = `10px 'Helvetica Neue', sans-serif`;
  ctx.fillText('name length (characters)', paddingLeft + chartW / 2, cssH - 10);

  // Peak annotation
  const peakBin = bins.reduce((a, b) => b.count > a.count ? b : a);
  const pi = bins.findIndex(b => b === peakBin);
  const px = paddingLeft + (pi + 0.5) * barW;
  const py = paddingTop + chartH - (peakBin.count / maxCount) * chartH - 4;
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.font = `bold 9px 'Helvetica Neue', sans-serif`;
  ctx.fillText('peak', px, py);
}
