/* charts.js — commune-names story */

export function drawLengthHistogram(canvasId, lenDistribution) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const PAD = { top: 16, right: 16, bottom: 40, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxCount = Math.max(...lenDistribution.map(d => d.count));
  const barCount = lenDistribution.length;
  const barW = Math.floor(chartW / barCount) - 1;

  // Grid lines
  ctx.strokeStyle = '#ede8e0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = PAD.top + chartH - (chartH * i / 4);
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + chartW, y);
    ctx.stroke();

    // Y-axis labels
    const val = Math.round(maxCount * i / 4);
    ctx.fillStyle = '#888';
    ctx.font = `10px 'Helvetica Neue', sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(val >= 1000 ? `${(val/1000).toFixed(1)}k` : val, PAD.left - 4, y + 3);
  }

  // Bars
  lenDistribution.forEach((d, i) => {
    const x = PAD.left + i * (chartW / barCount);
    const barH = (d.count / maxCount) * chartH;
    const y = PAD.top + chartH - barH;

    // Highlight the peak range (7–12)
    const lenVal = typeof d.len === 'number' ? d.len : 26;
    const isPeak = lenVal >= 7 && lenVal <= 12;
    ctx.fillStyle = isPeak ? '#c67c00' : '#b8a890';
    ctx.fillRect(x + 1, y, barW, barH);

    // X-axis label (every 5 + the "26+" label)
    if (i === 0 || (typeof d.len === 'number' && d.len % 5 === 0) || d.len === '26+') {
      ctx.fillStyle = '#888';
      ctx.font = `10px 'Helvetica Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(String(d.len), x + barW / 2, PAD.top + chartH + 14);
    }
  });

  // Axis lines
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD.left, PAD.top);
  ctx.lineTo(PAD.left, PAD.top + chartH);
  ctx.lineTo(PAD.left + chartW, PAD.top + chartH);
  ctx.stroke();

  // X-axis title
  ctx.fillStyle = '#888';
  ctx.font = `10px 'Helvetica Neue', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('characters in name', PAD.left + chartW / 2, PAD.top + chartH + 32);
}

export function drawTopNamesChart(canvasId, topNames) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const ROW_H = 22;
  const H = ROW_H * topNames.length + 32;
  canvas.style.height = H + 'px';
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const LABEL_W = 175;
  const PAD_RIGHT = 40;
  const barAreaW = W - LABEL_W - PAD_RIGHT;
  const maxCount = topNames[0].count;

  topNames.forEach((d, i) => {
    const y = 8 + i * ROW_H;
    const barW = (d.count / maxCount) * barAreaW;

    // Highlight Saint* entries
    const isSaint = /^Saint[e]?[-\s]/.test(d.name);
    ctx.fillStyle = isSaint ? '#c67c00' : '#b8a890';
    ctx.fillRect(LABEL_W, y + 2, barW, ROW_H - 6);

    // Name label
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `12px Georgia, serif`;
    ctx.textAlign = 'right';
    ctx.fillText(d.name, LABEL_W - 8, y + ROW_H / 2 + 4);

    // Count label
    ctx.fillStyle = '#555';
    ctx.font = `11px 'Helvetica Neue', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(d.count, LABEL_W + barW + 6, y + ROW_H / 2 + 4);
  });
}
