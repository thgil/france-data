// charts.js — commune-names story
// Two simple canvas bar charts: name length distribution and first-word frequency.

const COLORS = {
  bar: '#8b5c2a',
  barHighlight: '#b32020',
  axis: '#888',
  text: '#1a1a1a',
  grid: '#e8e0d4',
};

function resolveCanvas(selector) {
  const el = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!el || el.tagName !== 'CANVAS') return null;
  return el;
}

function setupHiDPI(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || canvas.offsetWidth || 600;
  const h = rect.height || canvas.offsetHeight || 220;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w, h };
}

/**
 * Draw name-length distribution chart.
 * Buckets: 1-5, 6-10, 11-15, 16-20, 21-25, 26-30, 31+
 */
export function drawLengthChart(selector, stats) {
  const canvas = resolveCanvas(selector);
  if (!canvas) return;

  // Build buckets
  const buckets = [
    { label: '1–5', min: 1, max: 5, count: 0 },
    { label: '6–10', min: 6, max: 10, count: 0 },
    { label: '11–15', min: 11, max: 15, count: 0 },
    { label: '16–20', min: 16, max: 20, count: 0 },
    { label: '21–25', min: 21, max: 25, count: 0 },
    { label: '26–30', min: 26, max: 30, count: 0 },
    { label: '31+', min: 31, max: Infinity, count: 0 },
  ];
  for (const { chars, count } of stats.lenDist) {
    const bucket = buckets.find(b => chars >= b.min && chars <= b.max);
    if (bucket) bucket.count += count;
  }

  const { ctx, w, h } = setupHiDPI(canvas);
  const padL = 56, padR = 16, padT = 16, padB = 40;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const maxCount = Math.max(...buckets.map(b => b.count));
  const barW = chartW / buckets.length;
  const gap = barW * 0.18;

  ctx.clearRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + chartH - (chartH * i / 4);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();

    const label = Math.round(maxCount * i / 4).toLocaleString('fr-FR');
    ctx.fillStyle = COLORS.axis;
    ctx.font = '10px Helvetica Neue, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(label, padL - 6, y + 3.5);
  }

  // Bars
  buckets.forEach((b, i) => {
    const barH = (b.count / maxCount) * chartH;
    const x = padL + i * barW + gap;
    const y = padT + chartH - barH;
    const bw = barW - gap * 2;

    ctx.fillStyle = b.label === '11–15' ? COLORS.barHighlight : COLORS.bar;
    ctx.fillRect(x, y, bw, barH);

    // Count label above bar
    ctx.fillStyle = COLORS.text;
    ctx.font = '10px Helvetica Neue, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.count.toLocaleString('fr-FR'), x + bw / 2, y - 4);

    // X-axis label
    ctx.fillStyle = COLORS.axis;
    ctx.fillText(b.label, x + bw / 2, padT + chartH + 18);
  });

  // X-axis label
  ctx.fillStyle = COLORS.axis;
  ctx.font = '10px Helvetica Neue, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Characters', padL + chartW / 2, h - 2);
}

/**
 * Draw first-word frequency horizontal bar chart.
 * Shows top N first words by count.
 */
export function drawFirstWordsChart(selector, stats) {
  const canvas = resolveCanvas(selector);
  if (!canvas) return;

  const items = stats.topFirstWords.slice(0, 12);
  const { ctx, w, h } = setupHiDPI(canvas);

  const padL = 80, padR = 60, padT = 16, padB = 16;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const maxCount = items[0].count;
  const rowH = chartH / items.length;

  ctx.clearRect(0, 0, w, h);

  items.forEach((item, i) => {
    const barW = (item.count / maxCount) * chartW;
    const y = padT + i * rowH;
    const bH = rowH * 0.62;
    const bY = y + (rowH - bH) / 2;

    ctx.fillStyle = item.word === 'Saint' ? COLORS.barHighlight : COLORS.bar;
    ctx.fillRect(padL, bY, barW, bH);

    // Word label (left)
    ctx.fillStyle = COLORS.text;
    ctx.font = '12px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText(item.word, padL - 8, bY + bH * 0.72);

    // Count label (right of bar)
    ctx.fillStyle = COLORS.axis;
    ctx.font = '11px Helvetica Neue, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item.count.toLocaleString('fr-FR'), padL + barW + 6, bY + bH * 0.72);
  });
}
