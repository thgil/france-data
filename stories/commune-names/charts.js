/* charts.js — commune-names story */

/* ── Horizontal bar chart: most common commune names ───────────────────── */
export function drawNameFreqChart(selector, items) {
  const el = document.querySelector(selector);
  if (!el) return;

  const W = el.clientWidth || 680;
  const ROW_H = 26;
  const LABEL_W = 190;
  const BAR_W = W - LABEL_W - 56;
  const H = items.length * ROW_H + 24;

  const max = items[0].count;

  const rows = items.map((d, i) => {
    const y = i * ROW_H + 16;
    const barLen = Math.round((d.count / max) * BAR_W);
    const isSaint = d.name.startsWith('Saint') || d.name.startsWith('Sainte');
    const fill = isSaint ? '#8b5c2a' : '#3a5c3a';
    return `
      <text x="${LABEL_W - 6}" y="${y + 10}" text-anchor="end"
            font-family="Georgia, serif" font-size="13" fill="#1a1a1a">${d.name}</text>
      <rect x="${LABEL_W}" y="${y}" width="${barLen}" height="${ROW_H - 6}"
            fill="${fill}" opacity="0.82" rx="2"/>
      <text x="${LABEL_W + barLen + 5}" y="${y + 10}"
            font-family="var(--sans,'Helvetica Neue',sans-serif)" font-size="12" fill="#555">${d.count}</text>
    `;
  }).join('');

  el.innerHTML = `<svg width="${W}" height="${H}" role="img"
    aria-label="Bar chart: most common French commune names">
    ${rows}
  </svg>`;
}

/* ── Length distribution histogram ─────────────────────────────────────── */
export function drawLengthDistChart(selector, lenDist) {
  const el = document.querySelector(selector);
  if (!el) return;

  const W = el.clientWidth || 680;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 36, left: 48 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  // Only show lengths 1–35 (negligible after that)
  const data = lenDist.filter(([l]) => l <= 35);
  const maxCount = Math.max(...data.map(([, c]) => c));
  const minLen = data[0][0];
  const maxLen = data[data.length - 1][0];
  const span = maxLen - minLen + 1;
  const barW = Math.floor(plotW / span) - 1;

  const bars = data.map(([len, count]) => {
    const x = PAD.left + ((len - minLen) / span) * plotW;
    const barH = (count / maxCount) * plotH;
    const y = PAD.top + plotH - barH;
    const isSaint = (len >= 6 && len <= 12);
    return `<rect x="${x}" y="${y}" width="${Math.max(barW, 1)}" height="${barH}"
              fill="#8b5c2a" opacity="0.75" rx="1"/>`;
  }).join('');

  // Axis ticks: every 5 chars on x
  const xTicks = [];
  for (let l = 5; l <= 35; l += 5) {
    const x = PAD.left + ((l - minLen) / span) * plotW;
    xTicks.push(`
      <line x1="${x}" y1="${PAD.top + plotH}" x2="${x}" y2="${PAD.top + plotH + 4}" stroke="#999"/>
      <text x="${x}" y="${PAD.top + plotH + 16}" text-anchor="middle"
            font-family="var(--sans,'Helvetica Neue',sans-serif)" font-size="11" fill="#888">${l}</text>
    `);
  }

  // Y axis label
  const yLabel = `<text x="10" y="${PAD.top + plotH / 2}" text-anchor="middle"
    font-family="var(--sans,'Helvetica Neue',sans-serif)" font-size="10" fill="#aaa"
    transform="rotate(-90,10,${PAD.top + plotH / 2})">communes</text>`;

  el.innerHTML = `<svg width="${W}" height="${H}" role="img"
    aria-label="Histogram: distribution of French commune name lengths">
    ${yLabel}
    ${bars}
    <line x1="${PAD.left}" y1="${PAD.top + plotH}" x2="${PAD.left + plotW}"
          y2="${PAD.top + plotH}" stroke="#ccc"/>
    ${xTicks.join('')}
    <text x="${PAD.left + plotW / 2}" y="${H - 2}" text-anchor="middle"
          font-family="var(--sans,'Helvetica Neue',sans-serif)" font-size="11" fill="#888">
      characters in name
    </text>
  </svg>`;
}
