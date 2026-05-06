// charts.js — desert-ring story
// Two canvas charts: top-20 departments by desert population, IDF gradient.

export function drawTop20Chart(canvasId, depts) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const dpr    = window.devicePixelRatio || 1;
  const W      = canvas.parentElement.clientWidth || 720;
  const ROW_H  = 30;
  const LABEL_W = 200;
  const PAD_R   = 80;
  const PAD_T   = 36;
  const PAD_B   = 16;
  const H       = PAD_T + depts.length * ROW_H + PAD_B;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const maxVal = Math.max(...depts.map(d => d.desert_pop));
  const BAR_W  = W - LABEL_W - PAD_R;

  ctx.fillStyle = '#faf7f2';
  ctx.fillRect(0, 0, W, H);

  ctx.font = `600 10px 'Helvetica Neue', sans-serif`;
  ctx.fillStyle = '#888';
  ctx.textAlign = 'left';
  ctx.fillText('RESIDENTS LIVING IN MEDICAL DESERTS — TOP 20 DÉPARTEMENTS', 0, 20);

  depts.forEach((d, i) => {
    const y    = PAD_T + i * ROW_H;
    const barH = ROW_H - 6;
    const bw   = (d.desert_pop / maxVal) * BAR_W;

    // Label
    ctx.font = `${d.is_idf ? '700' : '400'} 13px Georgia, serif`;
    ctx.fillStyle = d.is_idf ? '#b32020' : '#1a1a1a';
    ctx.textAlign = 'right';
    ctx.fillText(d.name, LABEL_W - 8, y + barH / 2 + 4);

    // Bar
    ctx.fillStyle = d.is_idf ? '#b32020' : '#c8b99a';
    ctx.globalAlpha = d.is_idf ? 0.9 : 0.55;
    ctx.fillRect(LABEL_W, y + 3, bw, barH);
    ctx.globalAlpha = 1;

    // Value + pct
    ctx.font = `11px 'Helvetica Neue', sans-serif`;
    ctx.fillStyle = d.is_idf ? '#8a1010' : '#555';
    ctx.textAlign = 'left';
    const label = formatPop(d.desert_pop) + ' (' + d.desert_pct + '%)';
    ctx.fillText(label, LABEL_W + bw + 5, y + barH / 2 + 4);
  });
}

export function drawIdfGradient(canvasId, idfDepts) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const dpr    = window.devicePixelRatio || 1;
  const W      = canvas.parentElement.clientWidth || 720;
  const ROW_H  = 32;
  const LABEL_W = 180;
  const PAD_R   = 70;
  const PAD_T   = 36;
  const PAD_B   = 16;
  const H       = PAD_T + idfDepts.length * ROW_H + PAD_B;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const maxPct = 70;
  const BAR_W  = W - LABEL_W - PAD_R;

  ctx.fillStyle = '#faf7f2';
  ctx.fillRect(0, 0, W, H);

  ctx.font = `600 10px 'Helvetica Neue', sans-serif`;
  ctx.fillStyle = '#888';
  ctx.textAlign = 'left';
  ctx.fillText('% OF RESIDENTS IN MEDICAL DESERTS — ÎLE-DE-FRANCE DÉPARTEMENTS', 0, 20);

  idfDepts.forEach((d, i) => {
    const y    = PAD_T + i * ROW_H;
    const barH = ROW_H - 7;
    const bw   = (d.desert_pct / maxPct) * BAR_W;

    const isOuter = d.is_outer;
    const isParis = d.dept === '75';

    ctx.font = `${isOuter ? '700' : '400'} 13px Georgia, serif`;
    ctx.fillStyle = isOuter ? '#b32020' : (isParis ? '#1a8a1a' : '#1a1a1a');
    ctx.textAlign = 'right';
    ctx.fillText(d.name, LABEL_W - 8, y + barH / 2 + 4);

    if (bw > 0) {
      ctx.fillStyle = isOuter ? '#b32020' : (isParis ? '#1a8a1a' : '#888');
      ctx.globalAlpha = isOuter ? 0.85 : (isParis ? 0.7 : 0.45);
      ctx.fillRect(LABEL_W, y + 3, bw, barH);
      ctx.globalAlpha = 1;
    }

    // 0% for Paris — draw a tick mark
    if (isParis) {
      ctx.strokeStyle = '#1a8a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(LABEL_W, y + 3);
      ctx.lineTo(LABEL_W, y + 3 + barH);
      ctx.stroke();
    }

    ctx.font = `11px 'Helvetica Neue', sans-serif`;
    ctx.fillStyle = isOuter ? '#8a1010' : (isParis ? '#1a8a1a' : '#555');
    ctx.textAlign = 'left';
    const x = isParis ? LABEL_W + 6 : LABEL_W + bw + 5;
    ctx.fillText(d.desert_pct + '%', x, y + barH / 2 + 4);
  });

  // Threshold line at APL 2.5 → 0% axis marker
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(LABEL_W, PAD_T - 8);
  ctx.lineTo(LABEL_W, PAD_T + idfDepts.length * ROW_H);
  ctx.stroke();
  ctx.setLineDash([]);
}

function formatPop(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 1000)    return Math.round(n / 1000) + 'k';
  return String(n);
}
