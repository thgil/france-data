/* commune-names/charts.js — horizontal bar chart of most-common commune names */

export function drawNameChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const TOP_N = 15;
  const items = data.mostCommon.slice(0, TOP_N);
  const maxCount = items[0].count;

  const BAR_H = 28;
  const BAR_GAP = 6;
  const LABEL_W = 220;
  const COUNT_W = 40;
  const BAR_W = 320;
  const MARGIN = { top: 12, right: 16, bottom: 12, left: 8 };

  const totalH = MARGIN.top + items.length * (BAR_H + BAR_GAP) - BAR_GAP + MARGIN.bottom;
  const totalW = MARGIN.left + LABEL_W + BAR_W + COUNT_W + MARGIN.right;

  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = totalW * dpr;
  canvas.height = totalH * dpr;
  canvas.style.width = totalW + 'px';
  canvas.style.height = totalH + 'px';
  canvas.style.display = 'block';
  canvas.style.maxWidth = '100%';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const ACCENT = '#b32020';
  const MUTED = '#e0d8cc';
  const INK = '#1a1a1a';
  const INK_MUTE = '#888';
  const SERIF = "Georgia, 'Times New Roman', serif";
  const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  items.forEach((item, i) => {
    const y = MARGIN.top + i * (BAR_H + BAR_GAP);
    const x0 = MARGIN.left + LABEL_W;
    const barLen = (item.count / maxCount) * BAR_W;
    const isTop = i === 0;

    // Background track
    ctx.fillStyle = MUTED;
    ctx.fillRect(x0, y + 4, BAR_W, BAR_H - 8);

    // Filled bar
    ctx.fillStyle = isTop ? ACCENT : '#8a1515';
    ctx.globalAlpha = isTop ? 1 : 0.55 + (0.45 * (TOP_N - i) / TOP_N);
    ctx.fillRect(x0, y + 4, barLen, BAR_H - 8);
    ctx.globalAlpha = 1;

    // Label (name)
    ctx.font = `${isTop ? 'bold ' : ''}14px ${SERIF}`;
    ctx.fillStyle = INK;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.name, MARGIN.left + LABEL_W - 8, y + BAR_H / 2);

    // Rank
    ctx.font = `11px ${SANS}`;
    ctx.fillStyle = INK_MUTE;
    ctx.textAlign = 'right';
    ctx.fillText(`${i + 1}`, MARGIN.left + 22, y + BAR_H / 2);

    // Count label
    ctx.font = `${isTop ? 'bold ' : ''}12px ${SANS}`;
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.fillText(`×${item.count}`, x0 + barLen + 6, y + BAR_H / 2);
  });
}
