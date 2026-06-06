// charts.js — commune-names story

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTED = '#888';
const ACCENT = '#b32020';
const BAR_COLOR = '#5a3e2b';
const BAR_HOVER = '#8b5e3c';

// ── Utility ────────────────────────────────────────────────────────────────

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w: rect.width, h: rect.height };
}

// ── Length-distribution histogram ──────────────────────────────────────────

export function drawLengthChart(canvas, lengthDist) {
  const { ctx, w, h } = setupCanvas(canvas);

  // Bucket into bins 1–30, then "31+"
  const binMax = 30;
  const bins = [];
  for (let i = 1; i <= binMax; i++) {
    const entry = lengthDist.find(d => d.len === i);
    bins.push({ label: String(i), count: entry ? entry.count : 0, len: i });
  }
  const overflowCount = lengthDist.filter(d => d.len > binMax).reduce((s, d) => s + d.count, 0);
  bins.push({ label: '31+', count: overflowCount, len: 99 });

  const maxCount = Math.max(...bins.map(b => b.count));
  const pad = { top: 24, right: 16, bottom: 52, left: 52 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const barW   = chartW / bins.length;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  // Grid lines
  const gridCount = 4;
  ctx.strokeStyle = '#e0d8cc';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  for (let i = 0; i <= gridCount; i++) {
    const y = pad.top + chartH - (i / gridCount) * chartH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    const label = Math.round((i / gridCount) * maxCount).toLocaleString('fr-FR');
    ctx.setLineDash([]);
    ctx.fillStyle = MUTED;
    ctx.font = '10px Helvetica Neue, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(label, pad.left - 6, y + 3.5);
    ctx.setLineDash([4, 3]);
  }
  ctx.setLineDash([]);

  // Bars
  bins.forEach((bin, i) => {
    const barH = (bin.count / maxCount) * chartH;
    const x = pad.left + i * barW;
    const y = pad.top + chartH - barH;

    // Highlight interesting lengths
    const isY = bin.len === 1;
    const isModal = bin.len === 7 || bin.len === 8;

    ctx.fillStyle = isY ? ACCENT : isModal ? BAR_HOVER : BAR_COLOR;
    ctx.fillRect(x + 1, y, barW - 2, barH);

    // X-axis labels (every 5 + the first + 31+)
    ctx.fillStyle = MUTED;
    ctx.font = '10px Helvetica Neue, sans-serif';
    ctx.textAlign = 'center';
    if (bin.len === 1 || bin.len % 5 === 0 || bin.label === '31+') {
      ctx.fillText(bin.label, x + barW / 2, pad.top + chartH + 16);
    }

    // Annotation for bin len=1 (Y)
    if (isY && bin.count > 0) {
      ctx.fillStyle = ACCENT;
      ctx.font = 'bold 11px Helvetica Neue, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Y', x + barW / 2, y - 6);
    }
  });

  // Axis labels
  ctx.fillStyle = MUTED;
  ctx.font = '11px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Name length (characters)', pad.left + chartW / 2, h - 4);

  // Y-axis label
  ctx.save();
  ctx.translate(12, pad.top + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('Communes', 0, 0);
  ctx.restore();
}

// ── Horizontal bar chart (generic) ─────────────────────────────────────────

export function drawHBarChart(canvas, rows, { labelKey, countKey, maxLabelW = 200, color = BAR_COLOR } = {}) {
  const { ctx, w, h } = setupCanvas(canvas);

  const n = rows.length;
  const rowH = h / n;
  const maxCount = Math.max(...rows.map(r => r[countKey]));
  const pad = { top: 8, right: 60, bottom: 8, left: maxLabelW };
  const chartW = w - pad.left - pad.right;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  rows.forEach((row, i) => {
    const y = pad.top + i * rowH;
    const barW = (row[countKey] / maxCount) * chartW;
    const barH = rowH - 6;
    const barY = y + (rowH - barH) / 2;

    ctx.fillStyle = i === 0 ? ACCENT : color;
    ctx.fillRect(pad.left, barY, barW, barH);

    // Label (left)
    ctx.fillStyle = INK;
    ctx.font = `${Math.min(13, rowH * 0.55)}px Georgia, serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(row[labelKey], pad.left - 8, y + rowH / 2);

    // Count (right of bar)
    ctx.fillStyle = MUTED;
    ctx.font = `${Math.min(11, rowH * 0.48)}px Helvetica Neue, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(row[countKey].toLocaleString('fr-FR'), pad.left + barW + 5, y + rowH / 2);
  });
}

// ── Waffle/tile chart for saint proportion ─────────────────────────────────

export function drawSaintWaffle(canvas, saintCount, total) {
  const { ctx, w, h } = setupCanvas(canvas);

  const cols = 40;
  const rows = Math.ceil(total / 1000 / cols);  // each tile = 1000 communes
  const tilesTotal = cols * rows;
  const saintTiles = Math.round(saintCount / total * tilesTotal);

  const tileSz = Math.min(Math.floor((w - 16) / cols), Math.floor((h - 16) / rows));
  const gap = 2;
  const startX = Math.floor((w - cols * (tileSz + gap)) / 2);
  const startY = Math.floor((h - rows * (tileSz + gap)) / 2);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  for (let idx = 0; idx < tilesTotal; idx++) {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = startX + col * (tileSz + gap);
    const y = startY + row * (tileSz + gap);
    ctx.fillStyle = idx < saintTiles ? ACCENT : '#d8d0c0';
    ctx.fillRect(x, y, tileSz, tileSz);
  }
}
