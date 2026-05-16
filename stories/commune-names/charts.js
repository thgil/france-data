/* commune-names story — chart renderers */

export function drawLengthHistogram(containerId, lengthHist) {
  const container = document.querySelector(containerId);
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 220;
  const marginLeft = 40;
  const marginRight = 16;
  const marginTop = 16;
  const marginBottom = 36;

  const innerW = W - marginLeft - marginRight;
  const innerH = H - marginTop - marginBottom;

  // Filter to length 1–36 (covers 99.9% of communes)
  const data = lengthHist.filter(d => d.l <= 36);
  const maxCount = Math.max(...data.map(d => d.n));
  const barW = innerW / data.length;

  const scaleY = v => innerH - (v / maxCount) * innerH;
  const scaleX = i => i * barW;

  const yTicks = [0, 1000, 2000, 3000, 4000].filter(v => v <= maxCount + 500);

  const bars = data.map((d, i) => {
    const h = (d.n / maxCount) * innerH;
    const x = scaleX(i);
    const isShort = d.l <= 2;
    const isPeak = d.l === 7 || d.l === 8;
    const fill = isShort ? '#b32020' : isPeak ? '#6b5c40' : '#c8b89a';
    return `<rect x="${x + 1}" y="${innerH - h}" width="${Math.max(barW - 2, 1)}" height="${h}" fill="${fill}" />`;
  }).join('');

  const xLabels = data.filter(d => d.l % 5 === 0 || d.l === 1).map((d, _, arr) => {
    const i = data.indexOf(d);
    const x = scaleX(i) + barW / 2;
    return `<text x="${x}" y="${innerH + 20}" text-anchor="middle" font-size="10" fill="#666">${d.l}</text>`;
  }).join('');

  const yLines = yTicks.map(v => {
    const y = scaleY(v);
    return `<line x1="0" y1="${y}" x2="${innerW}" y2="${y}" stroke="#e0d8cc" stroke-width="1"/>
            <text x="-6" y="${y + 4}" text-anchor="end" font-size="10" fill="#888">${v === 0 ? '' : (v / 1000).toFixed(0) + 'k'}</text>`;
  }).join('');

  // Annotation for "Y"
  const yBar = data.find(d => d.l === 1);
  const yBarX = scaleX(0) + barW / 2;
  const annotY = innerH - (yBar.n / maxCount) * innerH - 8;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;overflow:visible">
    <g transform="translate(${marginLeft},${marginTop})">
      ${yLines}
      ${bars}
      ${xLabels}
      <text x="${yBarX}" y="${annotY}" text-anchor="middle" font-size="9" fill="#b32020" font-weight="600">Y</text>
      <text x="${innerW / 2}" y="${innerH + 34}" text-anchor="middle" font-size="11" fill="#888">Name length (characters)</text>
    </g>
  </svg>`;

  container.innerHTML = svg;
}

export function drawDuplicatesChart(containerId, topNames) {
  const container = document.querySelector(containerId);
  if (!container) return;

  const W = container.clientWidth || 680;
  const data = topNames.slice(0, 12);
  const maxCount = data[0].count;
  const rowH = 28;
  const labelW = 160;
  const barMaxW = W - labelW - 60;
  const H = data.length * rowH + 20;

  const rows = data.map((d, i) => {
    const y = i * rowH + 14;
    const bw = (d.count / maxCount) * barMaxW;
    return `
      <text x="${labelW - 8}" y="${y + 5}" text-anchor="end" font-size="12" fill="#1a1a1a" font-family="Georgia,serif">${d.name}</text>
      <rect x="${labelW}" y="${y - 7}" width="${bw}" height="14" fill="#c8b89a" rx="1"/>
      <text x="${labelW + bw + 6}" y="${y + 5}" font-size="11" fill="#666">${d.count}</text>
    `;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">
    ${rows}
  </svg>`;

  container.innerHTML = svg;
}
