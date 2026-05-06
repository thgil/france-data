// charts.js — café déserts story
// Draws a horizontal bar chart of bar density by département
// and populates the commune tables.

export function drawDeptChart(canvasId, depts) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const top = depts.slice(0, 20);
  const labels = top.map(d => d.name);
  const values = top.map(d => d.per10k);

  // Colour: warm amber gradient — deepest for highest
  const maxVal = Math.max(...values);
  const colors = values.map(v => {
    const t = v / maxVal;
    // interpolate from pale straw to deep amber
    const r = Math.round(200 + (185 - 200) * t);
    const g = Math.round(180 + (98  - 180) * t);
    const b = Math.round(130 + (0   - 130) * t);
    return `rgb(${r},${g},${b})`;
  });

  // National average line value
  const national = 8.8;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.parentElement.clientWidth || 720;
  const ROW_H = 28;
  const LABEL_W = 180;
  const PAD_R = 60;
  const PAD_T = 32;
  const PAD_B = 48;
  const H = PAD_T + top.length * ROW_H + PAD_B;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const BAR_W = W - LABEL_W - PAD_R;
  const scale = v => (v / (maxVal * 1.05)) * BAR_W;

  // Background
  ctx.fillStyle = '#faf7f2';
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.font = `600 11px 'Helvetica Neue', sans-serif`;
  ctx.fillStyle = '#888';
  ctx.letterSpacing = '1px';
  ctx.fillText('BARS PER 10,000 RESIDENTS — TOP 20 DÉPARTEMENTS', 0, 18);
  ctx.letterSpacing = '0px';

  top.forEach((d, i) => {
    const y = PAD_T + i * ROW_H;
    const barH = ROW_H - 6;

    // Label
    ctx.font = `13px Georgia, serif`;
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'right';
    ctx.fillText(d.name, LABEL_W - 8, y + barH / 2 + 4);

    // Bar
    const bw = scale(d.per10k);
    ctx.fillStyle = colors[i];
    ctx.fillRect(LABEL_W, y + 3, bw, barH);

    // Value label
    ctx.font = `11px 'Helvetica Neue', sans-serif`;
    ctx.fillStyle = '#444';
    ctx.textAlign = 'left';
    ctx.fillText(d.per10k.toFixed(1), LABEL_W + bw + 4, y + barH / 2 + 4);
  });

  // National average line
  const avgX = LABEL_W + scale(national);
  ctx.strokeStyle = '#b32020';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(avgX, PAD_T - 6);
  ctx.lineTo(avgX, PAD_T + top.length * ROW_H + 4);
  ctx.stroke();
  ctx.setLineDash([]);

  // Average label
  ctx.font = `10px 'Helvetica Neue', sans-serif`;
  ctx.fillStyle = '#b32020';
  ctx.textAlign = 'center';
  ctx.fillText('national avg', avgX, PAD_T + top.length * ROW_H + 16);
  ctx.fillText('8.8', avgX, PAD_T + top.length * ROW_H + 28);
}

export function fillCommuneTable(tbodyId, communes) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = communes.map((c, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${c.name}</td>
      <td class="dept-col">${c.deptName}</td>
      <td class="num">${c.per10k.toFixed(1)}</td>
      <td class="num muted">${c.bars}</td>
      <td class="num muted">${c.pop.toLocaleString('fr-FR')}</td>
    </tr>`).join('');
}
