/* charts.js — commune-names story */

export function drawLengthHistogram(canvasId, distribution) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const padL = 36, padR = 16, padT = 12, padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const n = distribution.length;
  const maxVal = Math.max(...distribution);
  const barW = Math.floor(chartW / n) - 1;

  ctx.clearRect(0, 0, W, H);

  // Axis
  ctx.strokeStyle = '#d8d0c0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, padT + chartH);
  ctx.lineTo(padL + chartW, padT + chartH);
  ctx.stroke();

  // Bars
  distribution.forEach((val, i) => {
    const x = padL + i * (barW + 1);
    const barH = Math.round((val / maxVal) * chartH);
    const y = padT + chartH - barH;

    // Highlight length=1 (Y), length=11-12 (median), and long names
    const len = i + 1;
    if (len === 1) {
      ctx.fillStyle = '#b32020';
    } else if (len >= 30) {
      ctx.fillStyle = '#c67c00';
    } else {
      ctx.fillStyle = '#c4b8a8';
    }
    ctx.fillRect(x, y, barW, barH);
  });

  // X-axis labels
  ctx.fillStyle = '#888';
  ctx.font = `10px var(--sans, 'Helvetica Neue', sans-serif)`;
  ctx.textAlign = 'center';

  const labelPositions = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
  labelPositions.forEach(len => {
    const i = len - 1;
    if (i >= distribution.length) return;
    const x = padL + i * (barW + 1) + barW / 2;
    ctx.fillText(len, x, padT + chartH + 16);
  });

  // Y-axis tick + label
  ctx.textAlign = 'right';
  ctx.fillText(maxVal.toLocaleString('fr-FR'), padL - 4, padT + 8);
  ctx.fillText('0', padL - 4, padT + chartH);

  // Annotation: Y commune
  ctx.fillStyle = '#b32020';
  ctx.font = `bold 11px var(--sans, 'Helvetica Neue', sans-serif)`;
  ctx.textAlign = 'left';
  const x1 = padL + 0 * (barW + 1) + barW + 4;
  const y1 = padT + chartH - Math.round((distribution[0] / maxVal) * chartH) - 4;
  ctx.fillText('Y', x1, y1);
}

export function drawDuplicatesChart(containerId, topNames) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const data = topNames.slice(0, 15);
  const maxCount = data[0].count;

  container.innerHTML = data.map((d, i) => {
    const pct = (d.count / maxCount * 100).toFixed(1);
    return `
      <div class="dup-row" style="display:flex;align-items:center;gap:10px;margin-bottom:8px;font-family:var(--sans,'Helvetica Neue',sans-serif);">
        <span style="font-size:11px;color:#aaa;min-width:1.6ch;text-align:right;">${i + 1}</span>
        <span style="font-family:Georgia,serif;font-size:13px;min-width:190px;">${d.name}</span>
        <div style="flex:1;height:16px;background:#e8e0d4;border-radius:2px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:#7a3c00;border-radius:2px;"></div>
        </div>
        <span style="font-size:13px;color:#333;min-width:2ch;text-align:right;font-variant-numeric:tabular-nums;">${d.count}</span>
      </div>`;
  }).join('');
}
