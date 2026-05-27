// charts.js — name-extremes story
// Renders three charts + the short-names table from data.json

const PAPER   = '#faf7f2';
const INK     = '#1a1a1a';
const MUTE    = '#888';
const RULE    = '#d8d0c0';
const ACCENT  = '#b32020';
const SAINT_COLOR = '#b32020';
const BAR_COLOR   = '#4a7bb5';

// ── Tiny canvas chart helpers ────────────────────────────────────────────────

function dpr() { return window.devicePixelRatio || 1; }

function setupCanvas(canvas, cssWidth, cssHeight) {
  const ratio = dpr();
  canvas.style.width  = cssWidth  + 'px';
  canvas.style.height = cssHeight + 'px';
  canvas.width  = cssWidth  * ratio;
  canvas.height = cssHeight * ratio;
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  return ctx;
}

// ── Chart 1: Length distribution histogram ───────────────────────────────────

function drawLengthChart(canvas, lengthData) {
  const W = canvas.parentElement.offsetWidth - 48; // account for chart-wrap padding
  const H = 220;
  const ctx = setupCanvas(canvas, W, H);

  const PAD = { top: 16, right: 16, bottom: 36, left: 48 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top  - PAD.bottom;

  // Filter to lengths 1–35 (covers 99%+ of data)
  const filtered = lengthData.filter(d => d.length >= 1 && d.length <= 35);
  const maxCount = Math.max(...filtered.map(d => d.count));
  const xMin = 1;
  const xMax = 35;
  const nBars = xMax - xMin + 1;
  const barW = cW / nBars;

  function xPos(len) { return PAD.left + (len - xMin) * barW; }
  function yPos(v)   { return PAD.top  + cH - (v / maxCount) * cH; }

  // Background
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = RULE;
  ctx.lineWidth = 0.5;
  const gridLevels = [0.25, 0.5, 0.75, 1.0].map(f => Math.round(f * maxCount));
  for (const v of gridLevels) {
    const y = yPos(v);
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + cW, y);
    ctx.stroke();
    ctx.fillStyle = MUTE;
    ctx.font = '10px Helvetica Neue, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(v.toLocaleString('fr-FR'), PAD.left - 6, y + 3.5);
  }

  // Bars
  for (const d of filtered) {
    const x = xPos(d.length);
    const y = yPos(d.count);
    const h = cH - (y - PAD.top);
    // Highlight median range (8–14)
    if (d.length >= 8 && d.length <= 14) {
      ctx.fillStyle = '#4a7bb5';
    } else {
      ctx.fillStyle = '#a0b8d8';
    }
    ctx.fillRect(x + 0.5, y, barW - 1, h);
  }

  // X-axis labels
  ctx.fillStyle = MUTE;
  ctx.font = '10px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  for (let len = 5; len <= 35; len += 5) {
    const x = xPos(len) + barW / 2;
    ctx.fillText(len, x, H - PAD.bottom + 14);
  }
  // Label length=1 (Y)
  ctx.fillStyle = ACCENT;
  ctx.font = 'bold 9px Helvetica Neue, sans-serif';
  ctx.fillText('1', xPos(1) + barW / 2, H - PAD.bottom + 14);

  // X-axis label
  ctx.fillStyle = MUTE;
  ctx.font = '11px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Name length (characters)', PAD.left + cW / 2, H - 2);

  // Annotations
  // Median arrow at 10
  const medX = xPos(10) + barW / 2;
  const medY = yPos(filtered.find(d => d.length === 10)?.count || 0) - 8;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.moveTo(medX, medY);
  ctx.lineTo(medX, PAD.top + 4);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = INK;
  ctx.font = 'bold 9px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('median = 10', medX, PAD.top + 1);
}

// ── Chart 2: Top 20 repeated names (horizontal bar) ─────────────────────────

function drawRepeatedChart(canvas, topRepeated) {
  const W = canvas.parentElement.offsetWidth - 48;
  const H = 300;
  const ctx = setupCanvas(canvas, W, H);

  const data = topRepeated.slice(0, 20);
  const PAD  = { top: 12, right: 80, bottom: 24, left: 180 };
  const cW   = W - PAD.left - PAD.right;
  const cH   = H - PAD.top  - PAD.bottom;
  const nBars = data.length;
  const barH  = cH / nBars;
  const maxVal = data[0].count;

  function xPos(v) { return PAD.left + (v / maxVal) * cW; }
  function yPos(i) { return PAD.top  + i * barH; }

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Bars
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const isSaint = d.name.includes('Saint') || d.name.includes('Sainte');
    const x = PAD.left;
    const y = yPos(i) + 2;
    const w = xPos(d.count) - PAD.left;
    const h = barH - 4;

    ctx.fillStyle = isSaint ? SAINT_COLOR : '#4a7bb5';
    ctx.fillRect(x, y, w, h);

    // Name label (left)
    ctx.fillStyle = INK;
    ctx.font = (isSaint ? 'bold ' : '') + '11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(d.name, PAD.left - 6, y + h / 2 + 4);

    // Count label (right)
    ctx.fillStyle = '#555';
    ctx.font = '11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('×' + d.count, xPos(d.count) + 5, y + h / 2 + 4);
  }

  // Legend
  ctx.fillStyle = SAINT_COLOR;
  ctx.fillRect(W - 75, PAD.top, 10, 10);
  ctx.fillStyle = MUTE;
  ctx.font = '10px Helvetica Neue, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Saint/Sainte', W - 61, PAD.top + 9);

  ctx.fillStyle = '#4a7bb5';
  ctx.fillRect(W - 75, PAD.top + 16, 10, 10);
  ctx.fillStyle = MUTE;
  ctx.fillText('other', W - 61, PAD.top + 25);
}

// ── Chart 3: Saint % by département (horizontal bar) ────────────────────────

function drawSaintsChart(canvas, topSaintDepts) {
  const W = canvas.parentElement.offsetWidth - 48;
  const H = 280;
  const ctx = setupCanvas(canvas, W, H);

  const data = topSaintDepts.slice(0, 15);
  const PAD  = { top: 12, right: 56, bottom: 24, left: 160 };
  const cW   = W - PAD.left - PAD.right;
  const cH   = H - PAD.top  - PAD.bottom;
  const nBars = data.length;
  const barH  = cH / nBars;
  const maxVal = data[0].pct;

  function xPos(v) { return PAD.left + (v / maxVal) * cW; }
  function yPos(i) { return PAD.top  + i * barH; }

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Reference line at ~11% (national avg)
  const natAvg = 12.7;
  const natX = xPos(natAvg);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(natX, PAD.top);
  ctx.lineTo(natX, PAD.top + cH);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#aaa';
  ctx.font = '9px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('national avg', natX, PAD.top - 1);

  // Bars
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const x = PAD.left;
    const y = yPos(i) + 2;
    const w = xPos(d.pct) - PAD.left;
    const h = barH - 4;

    ctx.fillStyle = SAINT_COLOR;
    ctx.fillRect(x, y, w, h);

    // Dept label (left)
    ctx.fillStyle = INK;
    ctx.font = '11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(d.deptName, PAD.left - 6, y + h / 2 + 4);

    // Pct label (right)
    ctx.fillStyle = '#555';
    ctx.font = '11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(d.pct.toFixed(1) + '%', xPos(d.pct) + 5, y + h / 2 + 4);
  }
}

// ── Short names table ────────────────────────────────────────────────────────

function populateShortTable(tbody, shortNames) {
  tbody.innerHTML = shortNames
    .filter(d => d.length <= 3)
    .map(d => `
      <tr>
        <td class="name-cell">${d.name}<span class="len-badge">${d.length}</span></td>
        <td>${d.deptName} <span style="color:#aaa;font-size:11px">(${d.dept})</span></td>
        <td>${d.pop ? d.pop.toLocaleString('fr-FR') : '—'}</td>
      </tr>
    `).join('');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  let data;
  try {
    const res = await fetch('./data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error('name-extremes: failed to load data.json', err);
    return;
  }

  const { stats, lengthDistribution, topRepeated, shortestNames, topSaintDepts } = data;

  // Update stat band numbers
  const distinctEl = document.getElementById('stat-distinct');
  if (distinctEl) distinctEl.textContent = stats.distinctNames.toLocaleString('fr-FR');
  const uniqueEl = document.getElementById('stat-unique');
  if (uniqueEl) {
    const pct = Math.round(stats.uniqueNames / stats.totalCommunes * 100);
    uniqueEl.textContent = pct + '%';
  }

  // Short names table
  const tbody = document.getElementById('short-table-body');
  if (tbody) populateShortTable(tbody, shortestNames);

  // Charts — wait for layout so canvas parents have correct offsetWidth
  requestAnimationFrame(() => {
    const c1 = document.getElementById('chart-lengths');
    if (c1) drawLengthChart(c1, lengthDistribution);

    const c2 = document.getElementById('chart-repeated');
    if (c2) drawRepeatedChart(c2, topRepeated);

    const c3 = document.getElementById('chart-saints');
    if (c3) drawSaintsChart(c3, topSaintDepts);
  });
}

main();
