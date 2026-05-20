// commune-names/charts.js
// All chart drawing for the commune-names story.

const PAPER = '#faf7f2';
const INK   = '#1a1a1a';
const MUTE  = '#888';
const ACCENT = '#b32020';
const BAR_COLOR = '#8b5e3c';
const BAR_HOVER = '#b32020';

// ── Utility ──────────────────────────────────────────────────────────────────

function serif() { return "Georgia, 'Times New Roman', serif"; }
function sans()  { return "'Helvetica Neue', Helvetica, Arial, sans-serif"; }

// ── Length distribution histogram ─────────────────────────────────────────────

export function drawLengthHistogram(canvasId, lengthDist) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const dpr   = window.devicePixelRatio || 1;
  const W     = canvas.offsetWidth;
  const H     = canvas.offsetHeight;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Filter to a readable range (1–35 chars covers 99%+)
  const data = lengthDist.filter(d => d.length <= 35);
  const maxCount = Math.max(...data.map(d => d.count));

  const padL = 52, padR = 16, padT = 16, padB = 48;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const barW = chartW / data.length;

  // Grid lines
  ctx.strokeStyle = '#e0d8cc';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const y = padT + chartH - (i / gridSteps) * chartH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = MUTE;
    ctx.font = `10px ${sans()}`;
    ctx.textAlign = 'right';
    const label = Math.round((i / gridSteps) * maxCount);
    ctx.fillText(label.toLocaleString('fr-FR'), padL - 6, y + 3.5);
    ctx.setLineDash([3, 3]);
  }
  ctx.setLineDash([]);

  // Bars
  data.forEach((d, i) => {
    const x = padL + i * barW;
    const barH = (d.count / maxCount) * chartH;
    const y = padT + chartH - barH;

    ctx.fillStyle = (d.length >= 6 && d.length <= 9) ? ACCENT : BAR_COLOR;
    ctx.fillRect(x + 1, y, barW - 2, barH);
  });

  // X axis ticks — every 5 chars
  ctx.fillStyle = MUTE;
  ctx.font = `10px ${sans()}`;
  ctx.textAlign = 'center';
  data.forEach((d, i) => {
    if (d.length % 5 === 0) {
      const x = padL + i * barW + barW / 2;
      ctx.fillText(d.length, x, padT + chartH + 16);
    }
  });

  // Axis label
  ctx.fillStyle = MUTE;
  ctx.font = `10px ${sans()}`;
  ctx.textAlign = 'center';
  ctx.fillText('characters in commune name', padL + chartW / 2, H - 4);

  // Annotation for peak (7–8 chars)
  const peakEntry = data.reduce((best, d) => d.count > best.count ? d : best, data[0]);
  const peakX = padL + data.indexOf(peakEntry) * barW + barW / 2;
  const peakY = padT + chartH - (peakEntry.count / maxCount) * chartH;
  ctx.fillStyle = ACCENT;
  ctx.font = `italic 11px ${serif()}`;
  ctx.textAlign = 'left';
  ctx.fillText(`peak: ${peakEntry.length} chars`, peakX + 6, peakY + 4);
}

// ── Top words bar chart ───────────────────────────────────────────────────────

export function drawTopWords(canvasId, topWords) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const dpr   = window.devicePixelRatio || 1;
  const W     = canvas.offsetWidth;
  const H     = canvas.offsetHeight;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const data = topWords.slice(0, 15);
  const maxCount = data[0].count;

  const padL = 100, padR = 64, padT = 16, padB = 16;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const rowH   = chartH / data.length;

  data.forEach((d, i) => {
    const y      = padT + i * rowH;
    const barLen = (d.count / maxCount) * chartW;

    // Bar
    ctx.fillStyle = i === 0 ? ACCENT : BAR_COLOR;
    ctx.fillRect(padL, y + rowH * 0.2, barLen, rowH * 0.6);

    // Label (word)
    ctx.fillStyle = INK;
    ctx.font = `13px ${serif()}`;
    ctx.textAlign = 'right';
    ctx.fillText(d.word, padL - 8, y + rowH * 0.67);

    // Count
    ctx.fillStyle = MUTE;
    ctx.font = `11px ${sans()}`;
    ctx.textAlign = 'left';
    ctx.fillText(d.count.toLocaleString('fr-FR'), padL + barLen + 6, y + rowH * 0.67);
  });
}

// ── Duplicate names table (rendered via DOM, not canvas) ──────────────────────

export function renderDuplicatesTable(tbodyId, mostCommonNames) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const top = mostCommonNames.slice(0, 12);
  tbody.innerHTML = top.map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${d.name}</td>
      <td>${d.count}</td>
    </tr>`
  ).join('');
}
