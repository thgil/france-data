/* commune-names/charts.js — pure-SVG charts, no library deps */

export function renderLengthChart(mountId, lengthDist) {
  const el = document.querySelector(mountId);
  if (!el) return;

  const W = el.clientWidth || 680;
  const H = 220;
  const PAD = { top: 16, right: 16, bottom: 36, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const data = lengthDist;
  const maxCount = Math.max(...data.map(d => d.count));
  const barW = innerW / data.length;

  const xScale = (i) => PAD.left + i * barW;
  const yScale = (v) => PAD.top + innerH - (v / maxCount) * innerH;

  // Y axis ticks
  const yTicks = [0, 1000, 2000, 3000].filter(t => t <= maxCount);

  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible" aria-label="Commune name length distribution">`;

  // Grid lines
  for (const t of yTicks) {
    const y = yScale(t);
    svg += `<line x1="${PAD.left}" y1="${y}" x2="${PAD.left + innerW}" y2="${y}" stroke="#e0d8cc" stroke-width="1"/>`;
    svg += `<text x="${PAD.left - 6}" y="${y + 4}" text-anchor="end" fill="#888" font-size="11" font-family="'Helvetica Neue',sans-serif">${t >= 1000 ? (t/1000)+'k' : t}</text>`;
  }

  // Bars
  data.forEach((d, i) => {
    const x = xScale(i);
    const y = yScale(d.count);
    const bh = innerH - (y - PAD.top);
    // Highlight the very short and very long
    const isShort = d.length <= 4;
    const isLabel30 = d.length === '30+';
    const fill = isShort ? '#b32020' : isLabel30 ? '#888' : '#c8bfb0';
    svg += `<rect x="${x + 1}" y="${y}" width="${barW - 2}" height="${bh}" fill="${fill}" opacity="0.85"/>`;
  });

  // X axis labels (every 5 chars, plus first and last)
  const labelSet = new Set([1, 5, 10, 15, 20, 25]);
  data.forEach((d, i) => {
    const showLabel = labelSet.has(d.length) || d.length === '30+';
    if (showLabel) {
      const x = xScale(i) + barW / 2;
      svg += `<text x="${x}" y="${H - 8}" text-anchor="middle" fill="#666" font-size="11" font-family="'Helvetica Neue',sans-serif">${d.length}</text>`;
    }
  });

  // Axis line
  svg += `<line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${PAD.top + innerH}" stroke="#bbb" stroke-width="1"/>`;
  svg += `<line x1="${PAD.left}" y1="${PAD.top + innerH}" x2="${PAD.left + innerW}" y2="${PAD.top + innerH}" stroke="#bbb" stroke-width="1"/>`;

  // Annotation: peak
  const peakIdx = data.findIndex(d => d.count === maxCount);
  const peakX = xScale(peakIdx) + barW / 2;
  const peakY = yScale(maxCount);
  svg += `<text x="${peakX}" y="${peakY - 6}" text-anchor="middle" fill="#1a1a1a" font-size="11" font-family="'Helvetica Neue',sans-serif" font-weight="600">${maxCount.toLocaleString('fr-FR')}</text>`;

  svg += `</svg>`;
  el.innerHTML = svg;
}

export function renderTopNamesChart(mountId, topNames) {
  const el = document.querySelector(mountId);
  if (!el) return;

  const W = el.clientWidth || 680;
  const ROW_H = 28;
  const PAD = { top: 8, right: 80, bottom: 8, left: 180 };
  const H = PAD.top + topNames.length * ROW_H + PAD.bottom;
  const innerW = W - PAD.left - PAD.right;
  const maxCount = topNames[0].count;

  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block" aria-label="Most common commune names">`;

  topNames.forEach((d, i) => {
    const y = PAD.top + i * ROW_H;
    const barLen = (d.count / maxCount) * innerW;
    const isTop = i === 0;
    const fill = isTop ? '#b32020' : '#c8bfb0';

    // Name label
    svg += `<text x="${PAD.left - 8}" y="${y + ROW_H / 2 + 4}" text-anchor="end" fill="${isTop ? '#1a1a1a' : '#3a3a3a'}" font-size="13" font-family="Georgia,serif" font-weight="${isTop ? '700' : '400'}">${d.name}</text>`;

    // Bar
    svg += `<rect x="${PAD.left}" y="${y + 5}" width="${barLen}" height="${ROW_H - 10}" fill="${fill}" opacity="0.85" rx="2"/>`;

    // Count label
    svg += `<text x="${PAD.left + barLen + 6}" y="${y + ROW_H / 2 + 4}" fill="#444" font-size="12" font-family="'Helvetica Neue',sans-serif">${d.count}×</text>`;

    // Separator
    if (i < topNames.length - 1) {
      svg += `<line x1="${PAD.left}" y1="${y + ROW_H}" x2="${PAD.left + innerW}" y2="${y + ROW_H}" stroke="#ede8e0" stroke-width="1"/>`;
    }
  });

  svg += `</svg>`;
  el.innerHTML = svg;
}

export function renderShortNameTiles(mountId, shortNames) {
  const el = document.querySelector(mountId);
  if (!el) return;

  const html = shortNames.map(d => {
    const isY = d.name === 'Y';
    return `<div class="name-tile${isY ? ' name-tile--star' : ''}">
      <span class="tile-name">${d.name}</span>
      <span class="tile-dept">Dept. ${d.dept}</span>
      <span class="tile-pop">${d.pop.toLocaleString('fr-FR')} res.</span>
    </div>`;
  }).join('');

  el.innerHTML = html;
}
