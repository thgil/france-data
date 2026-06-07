export function drawSaintsChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const saints = data.topSaints.slice(0, 15);
  const max = saints[0].count;
  const BAR_H = 28;
  const LABEL_W = 130;
  const CHART_W = 340;
  const PAD = { top: 8, right: 48, bottom: 8, left: 8 };
  const totalW = LABEL_W + CHART_W + PAD.right;
  const totalH = PAD.top + saints.length * BAR_H + PAD.bottom;

  const rows = saints.map((s, i) => {
    const barW = Math.round((s.count / max) * CHART_W);
    const y = PAD.top + i * BAR_H;
    const midY = y + BAR_H / 2;
    return `
      <text x="${LABEL_W - 8}" y="${midY}" text-anchor="end" dominant-baseline="middle"
        font-family="Georgia, serif" font-size="13" fill="#1a1a1a">${s.name}</text>
      <rect x="${LABEL_W}" y="${y + 4}" width="${barW}" height="${BAR_H - 8}"
        fill="#8b1a1a" rx="2"/>
      <text x="${LABEL_W + barW + 5}" y="${midY}" dominant-baseline="middle"
        font-family="'Helvetica Neue', sans-serif" font-size="11" fill="#555">${s.count}</text>
    `;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${totalW} ${totalH}" width="100%" style="display:block;max-width:520px">
      ${rows}
    </svg>`;
}

export function drawLengthChart(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  const dist = data.lengthDist;
  const maxCount = Math.max(...dist.map(d => d.count));
  const W = 560, H = 160;
  const PAD = { top: 12, right: 16, bottom: 32, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = dist.length;
  const barW = Math.floor(chartW / n) - 1;

  const bars = dist.map((d, i) => {
    const bh = d.count === 0 ? 0 : Math.max(1, Math.round((d.count / maxCount) * chartH));
    const x = PAD.left + i * (chartW / n);
    const y = PAD.top + chartH - bh;
    const highlight = d.len === 1 || d.len === 45;
    return `<rect x="${x}" y="${y}" width="${Math.max(barW,1)}" height="${bh}"
      fill="${highlight ? '#8b1a1a' : '#c4a882'}" rx="1"
      title="${d.len} letters: ${d.count} communes"/>`;
  }).join('');

  // X-axis ticks: 1, 5, 10, 15, 20, 25, 30, 35, 40, 45
  const ticks = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
  const tickMarks = ticks.map(t => {
    const x = PAD.left + (t - 1) * (chartW / n) + barW / 2;
    return `
      <line x1="${x}" y1="${PAD.top + chartH}" x2="${x}" y2="${PAD.top + chartH + 4}" stroke="#bbb"/>
      <text x="${x}" y="${PAD.top + chartH + 14}" text-anchor="middle"
        font-family="'Helvetica Neue', sans-serif" font-size="10" fill="#888">${t}</text>`;
  }).join('');

  // Y-axis label
  const yLabel = `<text x="10" y="${PAD.top + chartH / 2}" text-anchor="middle"
    transform="rotate(-90, 10, ${PAD.top + chartH / 2})"
    font-family="'Helvetica Neue', sans-serif" font-size="10" fill="#888">communes</text>`;

  // Annotations for Y and longest
  const yAnn = (() => {
    const x = PAD.left + 0 * (chartW / n) + barW / 2;
    return `<text x="${x}" y="${PAD.top - 2}" text-anchor="middle"
      font-family="'Helvetica Neue', sans-serif" font-size="9" fill="#8b1a1a">Y</text>`;
  })();
  const longAnn = (() => {
    const x = PAD.left + 44 * (chartW / n) + barW / 2;
    return `<text x="${x + 10}" y="${PAD.top + chartH - 6}" text-anchor="end"
      font-family="'Helvetica Neue', sans-serif" font-size="9" fill="#8b1a1a">45 chars</text>`;
  })();

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">
      <line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${PAD.top + chartH}" stroke="#ddd"/>
      <line x1="${PAD.left}" y1="${PAD.top + chartH}" x2="${W - PAD.right}" y2="${PAD.top + chartH}" stroke="#ddd"/>
      ${bars}
      ${tickMarks}
      ${yLabel}
      ${yAnn}
      ${longAnn}
      <text x="${PAD.left + chartW / 2}" y="${H - 4}" text-anchor="middle"
        font-family="'Helvetica Neue', sans-serif" font-size="10" fill="#888">name length (characters)</text>
    </svg>`;
}
