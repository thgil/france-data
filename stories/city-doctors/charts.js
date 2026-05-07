/* city-doctors/charts.js — two horizontal bar charts via Canvas 2D */

const SERIF   = 'Georgia, "Times New Roman", serif';
const SANS    = '"Helvetica Neue", Arial, sans-serif';
const INK     = '#1a1a1a';
const MUTE    = '#888';
const GREEN   = '#2e7d32';
const RED_IDF = '#b71c1c';
const AMBER   = '#e65100';

function devicePR() { return window.devicePixelRatio || 1; }

function setupCanvas(canvas, w, h) {
  const pr = devicePR();
  canvas.width  = w * pr;
  canvas.height = h * pr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(pr, pr);
  return ctx;
}

/* ── Chart A: best provincial cities ───────────────────────────────── */
export function drawBestCities(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const cities = data.bestProvincial;
  const rows   = cities.length;
  const rowH   = 32;
  const padL   = 160;  // label width
  const padR   = 60;   // right space for value
  const padT   = 36;
  const padB   = 24;
  const W      = Math.min(canvas.parentElement.clientWidth, 700);
  const H      = padT + rows * rowH + padB;

  const ctx = setupCanvas(canvas, W, H);
  const barW = W - padL - padR;
  const maxAPL = 8;   // upper bound

  // Title
  ctx.font = `600 11px ${SANS}`;
  ctx.fillStyle = MUTE;
  ctx.textAlign = 'left';
  ctx.fillText('BEST GP ACCESS — PROVINCIAL CITIES (POP. ≥ 50 000)', 0, 16);

  // Threshold line (APL 2.5 desert threshold) — mark 2.5 for reference
  const thresholdX = padL + (2.5 / maxAPL) * barW;

  for (let i = 0; i < rows; i++) {
    const city = cities[i];
    const y = padT + i * rowH;
    const barLen = (city.apl / maxAPL) * barW;

    // Bar background
    ctx.fillStyle = '#f4f0e8';
    ctx.fillRect(padL, y + 4, barW, rowH - 8);

    // Bar fill — gradient from teal to green
    const shade = Math.min(1, city.apl / maxAPL);
    const r = Math.round(46 + (46 - 46) * shade);
    const g = Math.round(125 + (125 - 125) * shade);
    const b = Math.round(50 + (50 - 50) * shade);
    ctx.fillStyle = GREEN;
    ctx.globalAlpha = 0.3 + 0.7 * shade;
    ctx.fillRect(padL, y + 4, barLen, rowH - 8);
    ctx.globalAlpha = 1;

    // City name
    ctx.font = `14px ${SERIF}`;
    ctx.fillStyle = INK;
    ctx.textAlign = 'right';
    ctx.fillText(city.name, padL - 8, y + rowH / 2 + 5);

    // APL value
    ctx.font = `600 13px ${SANS}`;
    ctx.fillStyle = '#1b5e20';
    ctx.textAlign = 'left';
    ctx.fillText(city.apl.toFixed(2), padL + barLen + 6, y + rowH / 2 + 5);
  }

  // Vertical reference: national average ~2.96
  const avgX = padL + (2.96 / maxAPL) * barW;
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(avgX, padT);
  ctx.lineTo(avgX, H - padB);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `10px ${SANS}`;
  ctx.fillStyle = MUTE;
  ctx.textAlign = 'center';
  ctx.fillText('nat. avg 2.96', avgX, padT - 6);
}

/* ── Chart B: IDF desert cities ─────────────────────────────────────── */
export function drawIdfDeserts(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const cities = data.worstIDF.slice(0, 15);
  const rows   = cities.length;
  const rowH   = 32;
  const padL   = 200;
  const padR   = 70;
  const padT   = 36;
  const padB   = 24;
  const W      = Math.min(canvas.parentElement.clientWidth, 700);
  const H      = padT + rows * rowH + padB;

  const ctx = setupCanvas(canvas, W, H);
  const barW = W - padL - padR;
  const maxAPL = 2.5;

  // Title
  ctx.font = `600 11px ${SANS}`;
  ctx.fillStyle = MUTE;
  ctx.textAlign = 'left';
  ctx.fillText('WORST GP ACCESS — ÎLE-DE-FRANCE CITIES (POP. ≥ 30 000)', 0, 16);

  for (let i = 0; i < rows; i++) {
    const city = cities[i];
    const y = padT + i * rowH;
    const barLen = (city.apl / maxAPL) * barW;

    // Bar background
    ctx.fillStyle = '#f4f0e8';
    ctx.fillRect(padL, y + 4, barW, rowH - 8);

    // Bar — red, intensity by severity
    const frac = city.apl / maxAPL;
    ctx.fillStyle = RED_IDF;
    ctx.globalAlpha = 0.25 + 0.65 * frac;
    ctx.fillRect(padL, y + 4, barLen, rowH - 8);
    ctx.globalAlpha = 1;

    // City name (with population hint for Argenteuil)
    let label = city.name;
    if (city.pop >= 50000) label += ` (${(city.pop / 1000).toFixed(0)}k)`;
    ctx.font = `14px ${SERIF}`;
    ctx.fillStyle = INK;
    ctx.textAlign = 'right';
    ctx.fillText(label, padL - 8, y + rowH / 2 + 5);

    // APL value
    ctx.font = `600 13px ${SANS}`;
    ctx.fillStyle = '#b71c1c';
    ctx.textAlign = 'left';
    ctx.fillText(city.apl.toFixed(2), padL + barLen + 6, y + rowH / 2 + 5);
  }

  // Desert threshold line at 2.5 (far right since max is 2.5)
  const threshX = padL + barW;
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = '#e53935';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(threshX, padT);
  ctx.lineTo(threshX, H - padB);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `10px ${SANS}`;
  ctx.fillStyle = '#e53935';
  ctx.textAlign = 'center';
  ctx.fillText('2.5 threshold', threshX, padT - 6);
}
