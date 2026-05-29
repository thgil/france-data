export function drawLengthChart(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 180;
  const marginLeft = 36;
  const marginRight = 12;
  const marginTop = 12;
  const marginBottom = 32;
  const innerW = W - marginLeft - marginRight;
  const innerH = H - marginTop - marginBottom;

  // Filter to sensible range (1–35 chars) for display
  const filtered = lengthDist.filter(d => d.len <= 35);
  const maxCount = Math.max(...filtered.map(d => d.count));
  const minLen = filtered[0].len;
  const maxLen = filtered[filtered.length - 1].len;
  const barCount = maxLen - minLen + 1;
  const barW = Math.max(1, innerW / barCount - 1);

  const scaleX = (len) => marginLeft + (len - minLen) / (maxLen - minLen) * innerW;
  const scaleY = (count) => marginTop + innerH - (count / maxCount) * innerH;

  const bars = filtered.map(d => {
    const x = scaleX(d.len);
    const barH = (d.count / maxCount) * innerH;
    const highlight = (d.len === 7 || d.len === 8);
    return `<rect
      x="${x.toFixed(1)}"
      y="${(marginTop + innerH - barH).toFixed(1)}"
      width="${barW.toFixed(1)}"
      height="${barH.toFixed(1)}"
      fill="${highlight ? '#b32020' : '#c8b99a'}"
      opacity="${highlight ? '1' : '0.75'}"
    />`;
  }).join('\n');

  // X axis ticks at 5, 10, 15, 20, 25, 30, 35
  const xTicks = [1, 5, 10, 15, 20, 25, 30, 35].map(len => {
    if (len > maxLen) return '';
    const x = scaleX(len);
    return `<line x1="${x.toFixed(1)}" y1="${marginTop + innerH}" x2="${x.toFixed(1)}" y2="${marginTop + innerH + 4}" stroke="#aaa" stroke-width="1"/>
    <text x="${x.toFixed(1)}" y="${marginTop + innerH + 16}" text-anchor="middle" font-size="10" fill="#888">${len}</text>`;
  }).join('\n');

  // Y axis ticks
  const yTicks = [0, 1000, 2000, 3000].map(val => {
    if (val > maxCount) return '';
    const y = scaleY(val);
    return `<line x1="${marginLeft - 4}" y1="${y.toFixed(1)}" x2="${marginLeft}" y2="${y.toFixed(1)}" stroke="#aaa" stroke-width="1"/>
    <text x="${(marginLeft - 6).toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="10" fill="#888">${val === 0 ? '0' : (val / 1000) + 'k'}</text>`;
  }).join('\n');

  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
    ${bars}
    <line x1="${marginLeft}" y1="${marginTop}" x2="${marginLeft}" y2="${marginTop + innerH}" stroke="#ccc" stroke-width="1"/>
    <line x1="${marginLeft}" y1="${marginTop + innerH}" x2="${marginLeft + innerW}" y2="${marginTop + innerH}" stroke="#ccc" stroke-width="1"/>
    ${yTicks}
    ${xTicks}
    <text x="${marginLeft + innerW / 2}" y="${H - 2}" text-anchor="middle" font-size="10" fill="#888">name length (characters)</text>
    <text x="${W - marginRight}" y="${marginTop + 6}" text-anchor="end" font-size="9" fill="#b32020">peak: 7–8 chars</text>
  </svg>`;

  container.innerHTML = svg;
}

export function populateShortClub(selector, shortClub) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;
  tbody.innerHTML = shortClub.map(c =>
    `<tr>
      <td class="place">${c.name}</td>
      <td>${c.dept}</td>
      <td>${c.pop.toLocaleString('fr-FR')}</td>
    </tr>`
  ).join('');
}

export function populateTopNames(selector, topNames) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;
  const maxCount = topNames[0].count;
  tbody.innerHTML = topNames.map((d, i) =>
    `<tr>
      <td class="rank">${i + 1}</td>
      <td class="place">${d.name}</td>
      <td>${d.count}</td>
    </tr>`
  ).join('');
}
