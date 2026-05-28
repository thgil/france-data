export function drawLengthHistogram(canvasId, histogram) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const PAD = { top: 24, right: 24, bottom: 48, left: 56 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxLen = Math.max(...histogram.map(d => d.length));
  const maxCount = Math.max(...histogram.map(d => d.count));

  const barWidth = plotW / (maxLen + 1);

  ctx.font = '11px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.fillStyle = '#888';
  ctx.textAlign = 'right';

  const yTicks = [0, 1000, 2000, 3000];
  yTicks.forEach(v => {
    const y = PAD.top + plotH - (v / maxCount) * plotH;
    ctx.fillText(v === 0 ? '0' : (v / 1000) + 'k', PAD.left - 8, y + 4);
    ctx.strokeStyle = '#e8e2d8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + plotW, y);
    ctx.stroke();
  });

  histogram.forEach(({ length, count }) => {
    const x = PAD.left + length * barWidth;
    const barH = (count / maxCount) * plotH;
    const y = PAD.top + plotH - barH;

    const isExtreme = length === 1 || length === 45;
    ctx.fillStyle = isExtreme ? '#b32020' : '#c8a060';
    ctx.fillRect(x, y, barWidth - 1, barH);
  });

  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';
  const xLabels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
  xLabels.forEach(l => {
    const x = PAD.left + l * barWidth + barWidth / 2;
    ctx.fillText(l, x, PAD.top + plotH + 18);
  });

  ctx.fillStyle = '#888';
  ctx.font = '11px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Characters in commune name', PAD.left + plotW / 2, H - 4);

  ctx.save();
  ctx.translate(14, PAD.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Number of communes', 0, 0);
  ctx.restore();

  ctx.fillStyle = '#b32020';
  ctx.font = '10px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  const xY = PAD.left + 1 * barWidth + barWidth / 2;
  ctx.fillText('Y', xY, PAD.top + plotH + 32);
  const x45 = PAD.left + 45 * barWidth + barWidth / 2;
  ctx.fillText('45', x45, PAD.top + plotH + 32);
}

export function drawDuplicatesChart(canvasId, topDuplicates) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const rows = topDuplicates.slice(0, 12);
  const PAD = { top: 16, right: 64, bottom: 16, left: 180 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const rowH = plotH / rows.length;
  const maxCount = rows[0].count;

  rows.forEach(({ name, count }, i) => {
    const y = PAD.top + i * rowH;
    const barW = (count / maxCount) * plotW;

    ctx.fillStyle = i === 0 ? '#b32020' : '#c8a060';
    ctx.fillRect(PAD.left, y + rowH * 0.2, barW, rowH * 0.6);

    ctx.fillStyle = '#1a1a1a';
    ctx.font = `${i === 0 ? 'bold ' : ''}13px Georgia, serif`;
    ctx.textAlign = 'right';
    ctx.fillBaseline = 'middle';
    ctx.fillText(name, PAD.left - 10, y + rowH / 2 + 4);

    ctx.fillStyle = '#333';
    ctx.font = '12px "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`×${count}`, PAD.left + barW + 8, y + rowH / 2 + 4);
  });
}
