/* bistrot-gap/charts.js — horizontal bar chart for city bar density */

const AMBER  = '#c67c00';
const AMBER_LIGHT = '#e8a800';
const GRAY   = '#d0c8bc';
const GRAY_DARK = '#999';
const INK    = '#1a1a1a';
const PAPER  = '#faf7f2';
const RULE   = '#e0d8cc';
const NATIONAL_AVG_COLOR = '#b32020';

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

/** Return the slice of cities to render based on mode. */
function getSlice(data, mode) {
  if (mode === 'top') {
    return data.allCities.slice(0, 30);
  }
  if (mode === 'bottom') {
    // reverse: show driest first (lowest per100k at top)
    return [...data.allCities].reverse().slice(0, 30);
  }
  // all: descending order (highest first)
  return data.allCities;
}

/**
 * Draw the horizontal bar chart onto `canvas`.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} data - parsed data.json
 * @param {'top'|'bottom'|'all'} mode
 */
export function drawChart(canvas, data, mode) {
  const cities = getSlice(data, mode);
  const N = cities.length;

  const dpr = window.devicePixelRatio || 1;
  const barH    = mode === 'all' ? 8  : 22;
  const gap     = mode === 'all' ? 2  : 5;
  const padLeft = mode === 'all' ? 100 : 160;
  const padRight = 80;
  const padTop  = 48;
  const padBot  = 40;

  const totalH = padTop + N * (barH + gap) + padBot;
  const W = Math.max(canvas.parentElement ? canvas.parentElement.clientWidth : 680, 320);
  const H = totalH;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = `${W}px`;
  canvas.style.height = `${H}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Determine scale
  const maxVal = mode === 'bottom'
    ? Math.max(...cities.map(c => c.per100k), data.nationalPer100k) * 1.1
    : Math.max(...cities.map(c => c.per100k)) * 1.05;

  const chartW = W - padLeft - padRight;

  function xScale(val) {
    return padLeft + (val / maxVal) * chartW;
  }

  // Axis line
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padLeft, padTop - 4);
  ctx.lineTo(padLeft, padTop + N * (barH + gap));
  ctx.stroke();

  // Grid lines + x-axis labels
  ctx.font = `11px ${SANS}`;
  ctx.fillStyle = GRAY_DARK;
  ctx.textAlign = 'center';
  const tickCount = 5;
  const tickStep = Math.ceil(maxVal / tickCount / 50) * 50;
  for (let t = 0; t <= maxVal; t += tickStep) {
    const x = xScale(t);
    if (x > W - padRight + 5) continue;
    ctx.strokeStyle = RULE;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, padTop - 4);
    ctx.lineTo(x, padTop + N * (barH + gap));
    ctx.stroke();
    ctx.fillStyle = GRAY_DARK;
    ctx.fillText(t, x, padTop - 8);
  }

  // National average reference line
  const avgX = xScale(data.nationalPer100k);
  ctx.strokeStyle = NATIONAL_AVG_COLOR;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(avgX, padTop - 4);
  ctx.lineTo(avgX, padTop + N * (barH + gap) + 4);
  ctx.stroke();
  ctx.setLineDash([]);

  // "National avg" label
  ctx.font = `bold 10px ${SANS}`;
  ctx.fillStyle = NATIONAL_AVG_COLOR;
  ctx.textAlign = 'center';
  const avgLabelY = padTop - 14;
  ctx.fillText(`avg ${data.nationalPer100k}`, avgX, avgLabelY < 10 ? 10 : avgLabelY);

  // Draw bars
  cities.forEach((city, i) => {
    const y = padTop + i * (barH + gap);
    const barW = Math.max(2, (city.per100k / maxVal) * chartW);

    // Highlight top/bottom relative to national avg
    const aboveAvg = city.per100k >= data.nationalPer100k;
    const barColor = aboveAvg ? AMBER : GRAY;

    ctx.fillStyle = barColor;
    ctx.fillRect(padLeft, y, barW, barH);

    // City name label
    if (mode !== 'all') {
      ctx.font = `13px ${SERIF}`;
      ctx.fillStyle = INK;
      ctx.textAlign = 'right';
      ctx.fillText(city.name, padLeft - 6, y + barH - (barH === 22 ? 5 : 2));

      // Per 100K value after bar
      ctx.font = `11px ${SANS}`;
      ctx.fillStyle = GRAY_DARK;
      ctx.textAlign = 'left';
      ctx.fillText(city.per100k.toFixed(1), padLeft + barW + 5, y + barH - (barH === 22 ? 5 : 2));
    } else {
      // Tiny labels in 'all' mode: only for wide enough bars
      if (barW > 40) {
        ctx.font = `9px ${SANS}`;
        ctx.fillStyle = aboveAvg ? '#7a4900' : '#555';
        ctx.textAlign = 'left';
        ctx.fillText(city.name, padLeft + 3, y + barH - 1);
      }
    }
  });

  // X-axis title
  ctx.font = `11px ${SANS}`;
  ctx.fillStyle = GRAY_DARK;
  ctx.textAlign = 'center';
  ctx.fillText('bars per 100,000 residents', padLeft + chartW / 2, H - 10);
}

/** Populate the top/bottom ranking tables in the HTML. */
export function populateTables(data) {
  const topRows = data.top.map((c, i) =>
    `<tr>
      <td class="rk">${i + 1}</td>
      <td class="place">${c.name}<span class="dept-badge">${c.dept}</span></td>
      <td>${c.per100k.toFixed(1)}</td>
    </tr>`
  ).join('');

  const bottomRows = [...data.bottom].reverse().map((c, i) =>
    `<tr>
      <td class="rk">${data.totalCities - i}</td>
      <td class="place">${c.name}<span class="dept-badge">${c.dept}</span></td>
      <td>${c.per100k.toFixed(1)}</td>
    </tr>`
  ).join('');

  const topEl = document.getElementById('table-top');
  if (topEl) topEl.innerHTML = topRows;

  const botEl = document.getElementById('table-bottom');
  if (botEl) botEl.innerHTML = bottomRows;
}
