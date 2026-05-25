/* charts.js — commune-names story */

export function drawNameFrequencyChart(selector, topNames) {
  const container = document.querySelector(selector);
  if (!container) return;

  const names = topNames.map(d => d.name);
  const counts = topNames.map(d => d.count);

  const barHeight = 28;
  const marginLeft = 190;
  const marginRight = 40;
  const marginTop = 8;
  const marginBottom = 8;
  const width = container.clientWidth || 640;
  const height = barHeight * names.length + marginTop + marginBottom;

  const maxCount = Math.max(...counts);
  const scaleX = (v) => (v / maxCount) * (width - marginLeft - marginRight);

  const rows = names.map((name, i) => {
    const count = counts[i];
    const barW = scaleX(count);
    const y = marginTop + i * barHeight;
    const barY = y + barHeight * 0.18;
    const barH = barHeight * 0.64;
    return `
      <g>
        <text x="${marginLeft - 8}" y="${y + barHeight / 2 + 4.5}"
          text-anchor="end"
          font-family="Georgia, serif"
          font-size="13"
          fill="#1a1a1a">${name}</text>
        <rect x="${marginLeft}" y="${barY}" width="${barW}" height="${barH}"
          fill="#8a1a1a" rx="2"/>
        <text x="${marginLeft + barW + 5}" y="${y + barHeight / 2 + 4.5}"
          font-family="'Helvetica Neue', sans-serif"
          font-size="12"
          fill="#555">${count}×</text>
      </g>
    `;
  }).join('');

  container.innerHTML = `
    <svg width="100%" viewBox="0 0 ${width} ${height}" style="display:block;overflow:visible">
      ${rows}
    </svg>
  `;
}

export function drawLengthHistogram(selector, lengthDist) {
  const container = document.querySelector(selector);
  if (!container) return;

  const data = lengthDist.filter(d => d.len <= 50);
  const maxCount = Math.max(...data.map(d => d.count));
  const width = container.clientWidth || 680;
  const height = 160;
  const marginLeft = 44;
  const marginRight = 16;
  const marginTop = 8;
  const marginBottom = 28;
  const chartW = width - marginLeft - marginRight;
  const chartH = height - marginTop - marginBottom;

  const barWidth = chartW / data.length;
  const scaleY = (v) => (v / maxCount) * chartH;

  const bars = data.map((d, i) => {
    const bh = scaleY(d.count);
    const x = marginLeft + i * barWidth;
    const y = marginTop + chartH - bh;
    const isHighlight = d.len === 1 || d.len === 2 || d.len === 45;
    return `<rect x="${x + 0.5}" y="${y}" width="${barWidth - 1}" height="${bh}"
      fill="${isHighlight ? '#8a1a1a' : '#c8b89a'}" rx="1"/>`;
  }).join('');

  // x-axis labels at 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50
  const xLabels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45].map(len => {
    const d = data.find(x => x.len === len);
    if (!d) return '';
    const i = data.indexOf(d);
    const x = marginLeft + (i + 0.5) * barWidth;
    return `<text x="${x}" y="${height - 4}" text-anchor="middle"
      font-family="'Helvetica Neue', sans-serif" font-size="10" fill="#888">${len}</text>`;
  }).join('');

  // y-axis label
  const yLabel = `<text x="6" y="${marginTop + chartH / 2}" text-anchor="middle"
    font-family="'Helvetica Neue', sans-serif" font-size="10" fill="#888"
    transform="rotate(-90, 6, ${marginTop + chartH / 2})">communes</text>`;

  // annotation for Y (len=1) and longest (len=45)
  const yIdx = data.findIndex(d => d.len === 1);
  const longIdx = data.findIndex(d => d.len === 45);

  let annotations = '';
  if (yIdx >= 0) {
    const x = marginLeft + (yIdx + 0.5) * barWidth;
    const bh = scaleY(data[yIdx].count);
    const y = marginTop + chartH - bh;
    annotations += `<text x="${x}" y="${y - 4}" text-anchor="middle"
      font-family="'Helvetica Neue', sans-serif" font-size="9" fill="#8a1a1a" font-weight="600">Y</text>`;
  }
  if (longIdx >= 0) {
    const x = marginLeft + (longIdx + 0.5) * barWidth;
    const bh = scaleY(data[longIdx].count);
    const y = marginTop + chartH - bh;
    annotations += `<text x="${x}" y="${y - 4}" text-anchor="middle"
      font-family="'Helvetica Neue', sans-serif" font-size="9" fill="#8a1a1a" font-weight="600">45</text>`;
  }

  // axis line
  const axisLine = `<line x1="${marginLeft}" y1="${marginTop + chartH}" x2="${marginLeft + chartW}" y2="${marginTop + chartH}"
    stroke="#ccc" stroke-width="1"/>`;

  container.innerHTML = `
    <svg width="100%" viewBox="0 0 ${width} ${height}" style="display:block">
      ${yLabel}
      ${bars}
      ${annotations}
      ${axisLine}
      ${xLabels}
    </svg>
    <p style="font-family:'Helvetica Neue',sans-serif;font-size:11px;color:#888;margin:4px 0 0;text-align:center">
      Name length (characters) — red bars: 1 letter (Y) and 45 letters (Saint-Remy-en-Bouzemont-Saint-Genest-et-Isson)
    </p>
  `;
}
