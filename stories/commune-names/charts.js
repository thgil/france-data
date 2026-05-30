// charts.js — commune-names story
// Draws SVG charts inline into the DOM.

export function drawTopRepeatedChart(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;

  const W = el.clientWidth || 600;
  const BAR_H = 22;
  const GAP = 4;
  const LEFT = 200;
  const RIGHT = 60;
  const TOP = 8;
  const n = data.length;
  const H = TOP + n * (BAR_H + GAP) + 8;

  const max = data[0].count;

  const barW = (count) => Math.round(((count / max) * (W - LEFT - RIGHT)));

  const rows = data.map((d, i) => {
    const y = TOP + i * (BAR_H + GAP);
    const bw = barW(d.count);
    const isTop = i === 0;
    const fill = isTop ? '#8b6914' : '#c49a2a';
    return `
      <text x="${LEFT - 8}" y="${y + BAR_H / 2 + 4}" text-anchor="end"
        font-family="Georgia,serif" font-size="12" fill="#1a1a1a"
        ${isTop ? 'font-weight="600"' : ''}>${d.name}</text>
      <rect x="${LEFT}" y="${y}" width="${bw}" height="${BAR_H}" fill="${fill}" rx="1"/>
      <text x="${LEFT + bw + 5}" y="${y + BAR_H / 2 + 4}"
        font-family="'Helvetica Neue',sans-serif" font-size="11" fill="#555">${d.count}×</text>`;
  }).join('');

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible">
    ${rows}
  </svg>`;
}

export function drawLengthHistogram(selector, histogram) {
  const el = document.querySelector(selector);
  if (!el) return;

  // Convert to array, filter reasonable lengths
  const entries = Object.entries(histogram)
    .map(([l, c]) => ({ len: +l, count: c }))
    .filter(e => e.len <= 45)
    .sort((a, b) => a.len - b.len);

  const W = el.clientWidth || 600;
  const H = 160;
  const PAD_L = 36;
  const PAD_B = 28;
  const PAD_R = 10;
  const PAD_T = 8;

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const maxCount = Math.max(...entries.map(e => e.count));
  const lenMin = entries[0].len;
  const lenMax = entries[entries.length - 1].len;
  const barW = innerW / (lenMax - lenMin + 1);

  const barColor = '#c49a2a';
  const axisColor = '#aaa';

  const bars = entries.map(e => {
    const bh = Math.round((e.count / maxCount) * innerH);
    const x = PAD_L + (e.len - lenMin) * barW;
    const y = PAD_T + (innerH - bh);
    return `<rect x="${x.toFixed(1)}" y="${y}" width="${Math.max(1, barW - 1).toFixed(1)}" height="${bh}" fill="${barColor}"/>`;
  }).join('');

  // X axis ticks every 5 chars
  const xTicks = [];
  for (let l = Math.ceil(lenMin / 5) * 5; l <= lenMax; l += 5) {
    const x = PAD_L + (l - lenMin) * barW + barW / 2;
    xTicks.push(`<text x="${x.toFixed(1)}" y="${H - 4}" text-anchor="middle" font-family="'Helvetica Neue',sans-serif" font-size="10" fill="#777">${l}</text>`);
  }

  // Y axis label
  const yLabel = `<text x="10" y="${PAD_T + innerH / 2}" text-anchor="middle" font-family="'Helvetica Neue',sans-serif" font-size="9" fill="#aaa" transform="rotate(-90,10,${PAD_T + innerH / 2})">communes</text>`;

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">
    <line x1="${PAD_L}" y1="${PAD_T + innerH}" x2="${W - PAD_R}" y2="${PAD_T + innerH}" stroke="${axisColor}" stroke-width="1"/>
    ${bars}
    ${xTicks.join('')}
    ${yLabel}
  </svg>`;
}
