// stories/name-patterns/charts.js
// Charts for "The name game" story.
// Two charts: (1) name-length distribution, (2) top names horizontal bar.

const ACCENT = '#b32020';
const INK    = '#1a1a1a';
const MUTE   = '#888';
const RULE   = '#e0d8cc';
const PAPER  = '#faf7f2';

function dpr() { return window.devicePixelRatio || 1; }

// ── Chart 1: Length distribution ───────────────────────────────────────────

export function drawLengthChart(canvas, lengthDist) {
  const W = canvas.offsetWidth || 640;
  const H = 260;
  const ratio = dpr();
  canvas.width  = W * ratio;
  canvas.height = H * ratio;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);

  const PAD = { top: 16, right: 16, bottom: 36, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top  - PAD.bottom;

  // Only show up to length 35 (captures >99% of communes cleanly)
  const visible = lengthDist.filter(d => d.len <= 35);
  const maxLen  = 35;
  const maxCount = Math.max(...visible.map(d => d.count));

  const xScale = (len) => PAD.left + ((len - 1) / (maxLen - 1)) * chartW;
  const yScale = (v)   => PAD.top  + chartH - (v / maxCount) * chartH;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = RULE;
  ctx.lineWidth = 1;
  [1000, 2000, 3000].forEach(v => {
    if (v <= maxCount) {
      const y = yScale(v);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.stroke();

      ctx.fillStyle = MUTE;
      ctx.font = `10px 'Helvetica Neue', sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText((v / 1000).toFixed(0) + 'k', PAD.left - 6, y + 3);
    }
  });

  // Bar width
  const barW = Math.max(2, chartW / maxLen - 1.5);

  // Bars
  visible.forEach(({ len, count }) => {
    const x = xScale(len) - barW / 2;
    const y = yScale(count);
    const h = yScale(0) - y;

    // Highlight the 1-char bar (Y) and the modal bars
    const isSpecial = len === 1;
    ctx.fillStyle = isSpecial ? ACCENT : '#c0aa88';
    ctx.fillRect(x, y, barW, h);
  });

  // Axis labels
  ctx.fillStyle = MUTE;
  ctx.font = `10px 'Helvetica Neue', sans-serif`;
  ctx.textAlign = 'center';
  [1, 5, 10, 15, 20, 25, 30, 35].forEach(l => {
    const x = xScale(l);
    ctx.fillText(l, x, H - PAD.bottom + 14);
  });

  // Axis line
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD.left, H - PAD.bottom);
  ctx.lineTo(W - PAD.right, H - PAD.bottom);
  ctx.stroke();

  // Annotation: "Y" (1 char)
  const yX = xScale(1);
  const yY = yScale(1) - 8;
  ctx.fillStyle = ACCENT;
  ctx.font = `bold 11px 'Helvetica Neue', sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('← Y (1 char)', yX + 4, yY);

  // X axis label
  ctx.fillStyle = MUTE;
  ctx.font = `10px 'Helvetica Neue', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('name length (characters)', PAD.left + chartW / 2, H - 2);
}

// ── Chart 2: Top names horizontal bar ──────────────────────────────────────

export function drawTopNamesChart(canvas, topNames) {
  const ROWS = topNames.length;
  const ROW_H = 28;
  const BAR_AREA = 180;
  const LABEL_W = 160;
  const COUNT_W = 40;
  const PAD = { top: 12, right: COUNT_W + 8, bottom: 8, left: LABEL_W };

  const W = canvas.offsetWidth || 640;
  const H = PAD.top + ROWS * ROW_H + PAD.bottom;

  const ratio = dpr();
  canvas.width  = W * ratio;
  canvas.height = H * ratio;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const maxCount = topNames[0].count;
  const barAreaW = W - PAD.left - PAD.right;

  topNames.forEach(({ name, count }, i) => {
    const y = PAD.top + i * ROW_H;
    const barW = (count / maxCount) * barAreaW;

    // Alternating row tint
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.025)';
      ctx.fillRect(0, y, W, ROW_H);
    }

    // Bar
    ctx.fillStyle = i === 0 ? ACCENT : '#c0aa88';
    ctx.fillRect(PAD.left, y + 6, barW, ROW_H - 12);

    // Label (name)
    ctx.fillStyle = INK;
    ctx.font = `13px Georgia, serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, PAD.left - 8, y + ROW_H / 2);

    // Count
    ctx.fillStyle = MUTE;
    ctx.font = `11px 'Helvetica Neue', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`×${count}`, PAD.left + barW + 6, y + ROW_H / 2);
  });

  ctx.textBaseline = 'alphabetic';
}
