// stories/commune-names/charts.js
// Two canvas charts: name-length distribution + most-common names.

const ACCENT = '#b32020';
const BAR_BG = '#e8e2d8';
const LABEL_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function drawLengthChart(canvas, lengthDist) {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const PAD = { top: 16, right: 16, bottom: 36, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Filter to lengths 1–30 (30 = 30+)
  const data = lengthDist.filter(d => d.len >= 1 && d.len <= 30);
  const maxCount = Math.max(...data.map(d => d.count));

  const barW = chartW / data.length;

  // Draw bars
  data.forEach((d, i) => {
    const barH = (d.count / maxCount) * chartH;
    const x = PAD.left + i * barW;
    const y = PAD.top + chartH - barH;

    ctx.fillStyle = d.len === 1 ? ACCENT : BAR_BG;
    ctx.fillRect(x + 1, y, barW - 2, barH);

    // x-axis label every 5
    if (d.len % 5 === 0 || d.len === 1) {
      ctx.fillStyle = '#888';
      ctx.font = `10px ${LABEL_FONT}`;
      ctx.textAlign = 'center';
      const label = d.len === 30 ? '30+' : String(d.len);
      ctx.fillText(label, x + barW / 2, PAD.top + chartH + 14);
    }
  });

  // Y axis labels
  ctx.fillStyle = '#888';
  ctx.font = `10px ${LABEL_FONT}`;
  ctx.textAlign = 'right';
  [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
    const v = Math.round(maxCount * frac);
    const y = PAD.top + chartH - frac * chartH;
    ctx.fillText(v.toLocaleString('fr-FR'), PAD.left - 6, y + 3);
    ctx.strokeStyle = '#e0d8cc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + chartW, y);
    ctx.stroke();
  });

  // Axis labels
  ctx.fillStyle = '#666';
  ctx.font = `10px ${LABEL_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('Character count', PAD.left + chartW / 2, H - 2);

  // "Y" annotation
  const yX = PAD.left + 0 * barW + barW / 2;
  const yY = PAD.top + chartH - (data[0].count / maxCount) * chartH;
  ctx.fillStyle = ACCENT;
  ctx.font = `bold 10px ${LABEL_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('"Y"', yX, yY - 6);
}

function drawTopNamesChart(canvas, topNames) {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const items = topNames.slice(0, 12);
  const PAD = { top: 8, right: 80, bottom: 8, left: 180 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxCount = items[0].count;
  const rowH = chartH / items.length;

  items.forEach((d, i) => {
    const barW = (d.count / maxCount) * chartW;
    const y = PAD.top + i * rowH;
    const barY = y + rowH * 0.2;
    const barHt = rowH * 0.6;

    ctx.fillStyle = i === 0 ? ACCENT : BAR_BG;
    ctx.fillRect(PAD.left, barY, barW, barHt);

    // Name label
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `12px Georgia, serif`;
    ctx.textAlign = 'right';
    ctx.fillText(d.name, PAD.left - 8, barY + barHt * 0.72);

    // Count label
    ctx.fillStyle = '#444';
    ctx.font = `11px ${LABEL_FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(`×${d.count}`, PAD.left + barW + 6, barY + barHt * 0.72);
  });
}

export function initCharts(stats) {
  const lengthCanvas = document.getElementById('chart-lengths');
  const namesCanvas = document.getElementById('chart-top-names');

  if (lengthCanvas && stats.lengthDist) {
    drawLengthChart(lengthCanvas, stats.lengthDist);
  }
  if (namesCanvas && stats.topNames) {
    drawTopNamesChart(namesCanvas, stats.topNames);
  }

  window.addEventListener('resize', () => {
    if (lengthCanvas && stats.lengthDist) drawLengthChart(lengthCanvas, stats.lengthDist);
    if (namesCanvas && stats.topNames) drawTopNamesChart(namesCanvas, stats.topNames);
  });
}
