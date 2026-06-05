// charts.js — village-names story
// Renders two charts from stats.json:
//   1. Name-length distribution (column chart)
//   2. Most common names (horizontal bar chart)

export function drawLengthChart(canvasId, stats) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const dist = stats.lengthDist;
  const dpr = window.devicePixelRatio || 1;

  function render() {
    const W = canvas.parentElement.clientWidth || 680;
    const H = Math.min(220, W * 0.32);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const pad = { top: 16, right: 12, bottom: 32, left: 44 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const maxLen = dist[dist.length - 1].len;
    const maxCount = Math.max(...dist.map(d => d.count));
    const barW = chartW / (maxLen + 1);

    // Axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + chartH);
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.stroke();

    // Y-axis gridlines + labels
    const yTicks = [1000, 2000, 3000, 4000];
    ctx.font = `${10 * dpr / dpr}px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
    ctx.fillStyle = '#888';
    ctx.textAlign = 'right';
    for (const tick of yTicks) {
      if (tick > maxCount) break;
      const y = pad.top + chartH - (tick / maxCount) * chartH;
      ctx.strokeStyle = '#e8e4dc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = '#888';
      ctx.fillText(tick.toLocaleString('fr-FR'), pad.left - 6, y + 3.5);
    }

    // Bars
    const accent = '#b32020';
    const muted = '#d8cfc2';
    const peak = dist.reduce((best, d) => d.count > best.count ? d : best, dist[0]);

    for (const d of dist) {
      const x = pad.left + d.len * barW;
      const barH = (d.count / maxCount) * chartH;
      const y = pad.top + chartH - barH;
      ctx.fillStyle = d.len === peak.len ? accent : muted;
      ctx.fillRect(x, y, Math.max(1, barW - 1), barH);
    }

    // X-axis labels (every 5)
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    for (let l = 5; l <= maxLen; l += 5) {
      const x = pad.left + l * barW + barW / 2;
      const y = pad.top + chartH + 14;
      ctx.fillText(l, x, y);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#555';
    ctx.fillText('characters', pad.left + chartW * 0.5, pad.top + chartH + 28);

    // Peak label
    const peakX = pad.left + peak.len * barW + barW / 2;
    const peakY = pad.top + chartH - (peak.count / maxCount) * chartH - 6;
    ctx.fillStyle = accent;
    ctx.font = `bold ${11 * dpr / dpr}px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${peak.len} chars`, peakX, peakY);
  }

  render();
  const ro = new ResizeObserver(render);
  ro.observe(canvas.parentElement);
}

export function drawTopNamesChart(canvasId, stats) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const names = stats.topNames.slice(0, 10);
  const dpr = window.devicePixelRatio || 1;

  function render() {
    const W = canvas.parentElement.clientWidth || 680;
    const rowH = 28;
    const H = names.length * rowH + 40;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const labelW = Math.min(220, W * 0.38);
    const pad = { left: labelW + 12, right: 60, top: 8 };
    const barArea = W - pad.left - pad.right;
    const maxCount = names[0].count;

    const accent = '#b32020';
    const barColor = '#d8cfc2';
    const highlightColor = accent;

    ctx.font = `${12 * dpr / dpr}px Georgia, serif`;

    names.forEach((d, i) => {
      const y = pad.top + i * rowH;
      const mid = y + rowH / 2;

      // Label
      ctx.fillStyle = '#1a1a1a';
      ctx.textAlign = 'right';
      ctx.fillText(d.name, labelW, mid + 4);

      // Bar
      const bw = (d.count / maxCount) * barArea;
      ctx.fillStyle = i === 0 ? highlightColor : barColor;
      ctx.fillRect(pad.left, mid - 7, bw, 14);

      // Count label
      ctx.fillStyle = i === 0 ? accent : '#555';
      ctx.font = `${11 * dpr / dpr}px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(`${d.count}×`, pad.left + bw + 6, mid + 4);

      ctx.font = `${12 * dpr / dpr}px Georgia, serif`;
    });

    // X-axis baseline
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + names.length * rowH);
    ctx.stroke();
  }

  render();
  const ro = new ResizeObserver(render);
  ro.observe(canvas.parentElement);
}
