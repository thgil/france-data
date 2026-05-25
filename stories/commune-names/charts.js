// stories/commune-names/charts.js
// Text-and-charts story: French commune names — lengths, repetitions, saints.
// Exports: drawTopNames, drawLengthHisto

export function drawTopNames(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const max = topNames[0].count;

  const rows = topNames.map((d, i) => {
    const pct = ((d.count / max) * 100).toFixed(1);
    const isTop = i === 0;
    return `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${d.name}</td>
      <td class="bar-cell">
        <div class="bar-wrap"><div class="bar-fill${isTop ? ' bar-top' : ''}" style="width:${pct}%"></div></div>
      </td>
      <td class="count">${d.count}</td>
    </tr>`;
  }).join('');

  container.innerHTML = `<table class="names-table"><tbody>${rows}</tbody></table>`;
}

export function drawLengthHisto(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = Math.min(680, container.offsetWidth || 680);
  const H = 220;
  const mL = 48, mR = 16, mT = 16, mB = 36;
  const cW = W - mL - mR;
  const cH = H - mT - mB;

  const counts = lengthDist.map(([, c]) => c);
  const maxC = Math.max(...counts);
  const minLen = lengthDist[0][0];
  const nBars = lengthDist.length;
  const bW = cW / nBars;

  const xPos = (len) => mL + (len - minLen) * bW;
  const yPos = (c) => mT + cH - (c / maxC) * cH;
  const barH = (c) => (c / maxC) * cH;

  const bars = lengthDist.map(([len, c]) => {
    if (c === 0) return '';
    const x = xPos(len);
    const y = yPos(c);
    const h = barH(c);
    const col = len <= 2 ? '#b32020' : len >= 40 ? '#b32020' : '#8b7355';
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(bW - 0.8, 1).toFixed(1)}" height="${h.toFixed(1)}" fill="${col}" opacity="0.85"/>`;
  }).join('');

  const tickLens = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
  const xTicks = tickLens.map(len => {
    if (len > lengthDist[lengthDist.length - 1][0]) return '';
    const x = xPos(len) + bW / 2;
    return `<text x="${x.toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="#888">${len}</text>`;
  }).join('');

  const yTickVals = [0, Math.round(maxC / 4), Math.round(maxC / 2), Math.round(maxC * 3 / 4), maxC];
  const yTicks = yTickVals.map(v => {
    const y = yPos(v);
    return `
      <line x1="${mL}" y1="${y.toFixed(1)}" x2="${W - mR}" y2="${y.toFixed(1)}" stroke="#e0d8cc" stroke-width="1"/>
      <text x="${mL - 4}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="#888">${(v / 1000).toFixed(v === 0 ? 0 : 1)}k</text>`;
  }).join('');

  const modeLen = lengthDist.reduce((best, d) => d[1] > best[1] ? d : best, [0, 0])[0];
  const modeX = (xPos(modeLen) + bW / 2).toFixed(1);
  const modeY = (yPos(lengthDist.find(d => d[0] === modeLen)[1]) - 6).toFixed(1);
  const modeAnnotation = `
    <line x1="${modeX}" y1="${modeY}" x2="${modeX}" y2="${(mT + cH).toFixed(1)}" stroke="#b32020" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>
    <text x="${modeX}" y="${(+modeY - 4).toFixed(1)}" text-anchor="middle" font-size="10" fill="#b32020">mode: ${modeLen}</text>`;

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;max-width:100%;overflow:visible;font-family:'Helvetica Neue',sans-serif">
      ${yTicks}
      ${bars}
      ${xTicks}
      ${modeAnnotation}
      <line x1="${mL}" y1="${mT}" x2="${mL}" y2="${mT + cH}" stroke="#bbb" stroke-width="1"/>
      <line x1="${mL}" y1="${mT + cH}" x2="${W - mR}" y2="${mT + cH}" stroke="#bbb" stroke-width="1"/>
      <text x="${W / 2}" y="${H}" text-anchor="middle" font-size="11" fill="#888">characters in commune name</text>
    </svg>`;
}
